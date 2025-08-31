/**
 * CareService
 * 负责农田相关的服务，包括收获和种植
 */
// const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow, GoalBreakBlock } = require('mineflayer-pathfinder').goals
const { FIELDS, PLANT_AND_SEED, CAN_BE_OPEN_ITEMS } = require('../utils/constants');
const { Vec3 } = require('vec3')
const DepositService = require('./depositService');
class CareService {
	depositService = new DepositService();
	/**
	 * 收获农作物
	 * @param {object} bot - 机器人实例
	 * @param {object} field - 农田信息，包含 position 属性
	 */
	async harvest(bot, field) {
		try {
			const fieldPosition = field.position;
			let x = fieldPosition.x;
			let y = fieldPosition.y - 1;
			let z = fieldPosition.z;
			let direction = 1; // 1表示向东，-1表示向西
			const chestPosition = field.chest;
			const seedName = PLANT_AND_SEED.find(ps => ps.plant === field.plant)?.seed;
			if (!seedName) {
				console.error(`No seed type found for crop ${field.plant}, can't plant or harvest`);
			}

			// 检查bot身上是否有hoe和seed，如果没有则到chest里取一把hoe和农田块数量的seed
			const hoeItem = bot.inventory.items().find((item) => item.name.endsWith('_hoe'));
			if (!hoeItem) {
				console.log('No hoe found in inventory, need to get one from chest');
				await bot.pathfinder.goto(new GoalNear(chestPosition.x, chestPosition.y, chestPosition.z, 1)).then(async () => {
					const chestBlock = bot.findBlock({
						matching: (block) => {
							return block && block.type === bot.registry.blocksByName.chest.id;
						},
						maxDistance: 2
					});
					if (chestBlock) {
						bot.openContainer(chestBlock).then(async (chest) => {
							const chestHoe = chest.items().find((item) => item.name.endsWith('_hoe'));
							if (chestHoe) {
								await chest.withdraw(chestHoe.type, null, 1).then(() => {
									console.log(`I have taken a ${chestHoe.name} from the chest`);
								}).catch((error) => {
									console.error(`I can't take a ${chestHoe.name} from the chest, because ${error}`);
								});
							} else {
								console.error('No hoe found in chest');
							}
							// 取种子
							// 检查身上是否带有足够的种子，遍历身上物品将seedName的数量加起来
							if (seedName) {
								const seedCountInInventory = bot.inventory.items().filter((item) => item.name === seedName).reduce((acc, item) => acc + item.count, 0);
								const fieldBlockCount = fieldPosition.width * fieldPosition.length;
								if (seedCountInInventory < fieldBlockCount) {
									const seedNeeded = fieldBlockCount - seedCountInInventory;
									// 遍历chest物品，找到seedName的物品便取出，直到取够seedNeeded数量或者遍历完chest中的物品
									let seedTaken = 0;
									for (const item of chest.items()) {
										if (item.name === seedName) {
											const takeCount = Math.min(item.count, seedNeeded - seedTaken);
											await chest.withdraw(item.type, null, takeCount).then(() => {
												seedTaken += takeCount;
												console.log(`I have taken ${takeCount} ${seedName} from the chest`);
											}).catch((error) => {
												console.error(`I can't take ${takeCount} ${seedName} from the chest, because ${error}`);
											});
											if (seedTaken >= seedNeeded) {
												break;
											}
										}
									}
								} else {
									console.log(`I have enough ${seedName} in my inventory`);
								}
							}
							await chest.close();
						}).catch((error) => {
							console.error(`I can't open the chest, because ${error}`);
						});
					} else {
						console.error('No chest found near the chest position');
					}
				}).catch((err) => {
					console.error(`Failed to reach chest at ${chestPosition.x}, ${chestPosition.y}, ${chestPosition.z}: ${err.message}`);
					return;
				});
			}

			// 开始收获和种植
			// 遍历农田的每一个方格，收获并种植
			while (true) {
				await bot.pathfinder.goto(new GoalXZ(x, z)).then(async () => {
					console.log(`I have arrived at ${bot.entity.position}`);
					// 查找附近1格内的成熟小麦（metadata 7表示成熟）
					const wheat = await bot.findBlock({
						maxDistance: 1,
						matching: (block) => {
							return block && block.type === bot.registry.blocksByName.wheat.id && block.metadata === 7;
						}
					});
					if (wheat) {
						console.log(`Harvesting ${field.plant} at ${wheat.position}`);
						await bot.dig(wheat);
						console.log(`I have harvested ${field.plant} at ${bot.entity.position}`);
					} else {
						console.log(`No mature ${field.plant} to harvest at ${bot.entity.position}`);
					}

					// 获取farmland块
					let farmland = await bot.blockAt(new Vec3(x, y, z));
					// 如果不是农田则犁地
					if (
						farmland &&
						farmland.type !== bot.registry.blocksByName.farmland.id
						&& (farmland.type === bot.registry.blocksByName.grass_block.id ||
							farmland.type === bot.registry.blocksByName.granite.id ||
							farmland.type === bot.registry.blocksByName.dirt.id ||
							farmland.type === bot.registry.blocksByName.dirt_path.id ||
							farmland.type === bot.registry.blocksByName.rooted_dirt.id)
					) {
						const hoeItem = bot.inventory.items().find((item) => item.name.endsWith('_hoe'));
						if (hoeItem) {
							await bot.equip(hoeItem, 'hand').then(async () => {
								console.log(`I have equipped a ${hoeItem.name} to till the land`);
								await bot.activateBlock(farmland).then(async () => {
									console.log(`I have tilled the land at x: ${x}, y: ${y}, z: ${z}`);
									await bot.waitForTicks(10);
								}).catch((error) => {
									console.error(`I can't till the land, because ${error}`)
								});
							}).catch((error) => {
								console.error(`I can't equip a ${hoeItem.name} to till the land, because ${error}`)
							});
							
						} else {
							console.error('No hoe found in inventory to till the land');
						}
					} else {
						console.log(`The block below is already farmland at x: ${x}, y: ${y}, z: ${z}`);
					}
					``
					// 再次确认下面是农田，如果是农田则种植
					farmland = await bot.blockAt(new Vec3(x, y, z));
					if (farmland && farmland.type === bot.registry.blocksByName.farmland.id) {
						console.log(`The block below is confirmed as farmland at x: ${x}, y: ${y}, z: ${z}, ready to plant`);
						const blockAbove = await bot.blockAt(new Vec3(x, fieldPosition.y, z))
						// 如果blockAbove不存在或者blockAbove是空气，那么播种
						if (!blockAbove || blockAbove.type === 0) {
							if (seedName) {
								if (!bot.heldItem || bot.heldItem.type !== bot.registry.itemsByName[seedName].id) {
									console.log(`I don't have a ${seedName}`)
									//装备seedName到hand上
									const theSeed = await bot.inventory.items().find(item => {
										return item && item.type === bot.registry.itemsByName[seedName].id
									})
									if (theSeed) {
										console.log(`I have a ${seedName} in my inventory`)
										await bot.equip(theSeed, 'hand').then(async () => {
											console.log(`I have equipped a ${seedName}`)
										}).catch((error) => {
											console.error(`I can't equip a ${seedName}, because ${error}`)
										})
									} else {
										console.error(`I don't have a ${seedName} in my inventory, can't plant`)
									}
									if (bot.heldItem && bot.heldItem.type === bot.registry.itemsByName[seedName].id) {
										await bot.activateBlock(farmland).then(() => {
											console.log(`I have planted a ${field.plant} at x: ${x}, y: ${y}, z: ${z}`)
										}).catch((error) => {
											console.error(`I can't plant a ${field.plant}, because ${error}`)
										})
									} else {
										console.error(`I can't plant a ${field.plant}, because I can't equip a ${seedName}`)
									}
								} else {
									console.log(`I have a ${seedName} in my hand`)
									console.log(`farmland at ${farmland.position}`)
									console.log(`above block at ${blockAbove.position}`)
									await bot.activateBlock(farmland).then(() => {
										console.log(`I have planted a ${field.plant} at x: ${x}, y: ${y}, z: ${z}`)
									}).catch((error) => {
										console.error(`I can't plant a ${field.plant}, because ${error}`)
									})
								}
							} else {
								console.error(`No seed type found for crop ${field.plant}, can't plant`)
							}


						}
					}
				}).catch((err) => {
					console.error(err)
					console.error(`Failed to reach ${x}, ${z}: ${err.message}`);
					return;
				});

				// 移动到下一格
				const nextPosition = await this.nextFieldBlockPosition(bot, x, z, direction, fieldPosition);
				if (!nextPosition) {
					console.log(`I have finished harvesting ${field.plant} in ${field.name}`);
					break;
				}
				x = nextPosition.x;
				z = nextPosition.z;
				direction = nextPosition.direction;
			}

			// 收获完成后将作物送到箱子, 将收获的农作物全部放到箱子中，身上留下128个种子。
			// 查看身上种子和农作物的数量
			const seedCount = bot.inventory.items().filter(item => item.name === seedName).reduce((acc, item) => acc + item.count, 0);
			const cropCount = bot.inventory.items().filter(item => item.name === field.plant).reduce((acc, item) => acc + item.count, 0);
			const countToDepositSeed = seedCount <= 128 ? 0 : seedCount - 128;
			const countToDepositCrop = cropCount;
			console.log(`I have ${seedCount} ${seedName} and ${cropCount} ${field.plant}, deposit ${countToDepositSeed} ${seedName} and ${countToDepositCrop} ${field.plant} to chest`);
			await this.depositService.deposit(bot, seedName, countToDepositSeed, chestPosition.x, chestPosition.y, chestPosition.z);
			// 如果农作物和种子不同，则所有农作物都送到箱子中
			if (seedName !== field.plant) {
				await this.depositService.deposit(bot, field.plant, countToDepositCrop, chestPosition.x, chestPosition.y, chestPosition.z);
			}
			console.log(`Finished care of ${field.name} with ${field.plant}`);
		} catch (error) {
			console.error(error)
			console.error(`Error in harvest: ${error.message}`);
		}
	}

	/**
	 * 获取农田下一个方格的位置
	 * @param {number} x
	 * @param {number} z
	 * @param {number} direction
	 * @param {object} fieldPosition
	 * @returns {object|null}
	 */
	async nextFieldBlockPosition(bot, x, z, direction, fieldPosition) {
		let nextX = x + direction;
		let nextZ = z;
		if (nextX > fieldPosition.x + fieldPosition.width || nextX < fieldPosition.x) {
			direction = -direction;
			nextX += direction;
			nextZ = z + 1;
			if (nextZ > fieldPosition.z + fieldPosition.length) {
				return null;
			}
		}
		// 判断NextX, nextZ 是否是水
		const block = bot.blockAt(new Vec3(nextX, fieldPosition.y - 1, nextZ));
		if (block && block.type === bot.registry.blocksByName.water.id) {
			// 如果是水则跳过
			return await this.nextFieldBlockPosition(bot, nextX, nextZ, direction, fieldPosition);
		}
		return { x: nextX, z: nextZ, direction };
	}
}

module.exports = CareService;
