/**
 * CompostService
 * 负责处理与堆肥桶相关的功能，包括添加物品到堆肥桶和收集骨粉
 */
const { COMPOST_MAP, OPEN_RANGE_GOAL } = require('../utils/constants');
const { Goal } = require('mineflayer-pathfinder').goals;
const { Vec3 } = require('vec3');
const GetService = require('./getService');

class CompostService {

    getService = new GetService();

    /**
     * 前往指定的堆肥桶
     * @param {object} bot - 机器人实例
     * @param {string} composterName - 堆肥桶名称
     * @returns {Promise<boolean>} 是否成功到达堆肥桶
     */
    async goToComposter(bot, composterName) {
        const composter = COMPOST_MAP[composterName];
        if (!composter) {
            throw new Error(`未找到名为 ${composterName} 的堆肥桶`);
        }

        // const composterPos = new Vec3(
        //     composter.position.x,
        //     composter.position.y,
        //     composter.position.z
        // );

        // 设置目标位置为堆肥桶上方
        const goal = new Goal(
            composter.position.x,
            composter.position.y + 1,
            composter.position.z,
        );

        try {
            await bot.pathfinder.goto(goal).then(async () => {
                console.log(`I have arrived at the target at ${composter.position.x}, ${composter.position.y}, ${composter.position.z}`);
                return true;
            }).catch((err) => {
                console.error(`Error moving to target: ${err}`);
                return false;
            });
        } catch (err) {
            console.error('前往堆肥桶失败:', err);
            return false;
        }
    }

    /**
     * 添加物品到堆肥桶
     * @param {object} bot - 机器人实例
     * @param {string} composterName - 堆肥桶名称
     * @param {string} itemName - 物品名称
     * @returns {Promise<object>} 操作结果 {success: boolean, message: string, newLevel: number}
     */
    async addToComposter(bot, composterName, itemName, maxCount = 64 * 9) {
        try {
            console.log(`I am going to add ${itemName} to the composter ${composterName}`);
            const reserved = 128;
            const composter = COMPOST_MAP[composterName];
            if (!composter) {
                console.error(`未找到名为 ${composterName} 的堆肥桶`);
            }

            // 查看背包中itemName物品的数量和空闲空间的数量
            const itemCount = bot.inventory.items().filter(i => i.name === itemName).reduce((acc, i) => acc + i.count, 0);
            const freeSpace = bot.inventory.slots.filter(i => i === null).length;
            // 如果背包中itemName物品的数量大于等于maxCount + reserved，则不用再去拿取itemName物品，直接去堆肥

            if (itemCount >= maxCount + reserved) {
                console.log(`背包中 ${itemName} 物品数量大于 ${maxCount + reserved}`);
            } else {
                // 否则，遍历箱子列表，如果箱子中的itemName物品数量大于reserved,则拿取，
                // 直到背包中的itemName物品数量大于等于maxCount + reserved
                // 背包空闲空间 * 64 和 maxCount + reserved - itemCount 的最小值
                const maxItemCanTake = Math.min(freeSpace * 64, maxCount + reserved - itemCount);
                let itemToken = 0;

                
                for (const chest of composter.seed_chests) {
                    console.log(`I am going to take ${itemName} from the chest ${chest.x}, ${chest.y}, ${chest.z}`);
                    const takeItemCount = await this.getService.getFromContainer(bot, maxItemCanTake - itemToken, itemName, { x: chest.x, y: chest.y, z: chest.z });
                    itemToken += takeItemCount;
                    console.log(`I have taken ${takeItemCount} ${itemName} from the chest ${chest.x}, ${chest.y}, ${chest.z}.\n
                        Now I have ${itemToken} ${itemName} in my inventory.`);
                    if (itemToken >= maxItemCanTake || itemToken >= maxCount + reserved) break;
                    /**
                    const chestBlock = await bot.blockAt(new Vec3(chest.x, chest.y, chest.z));
                    // 判断是否为箱子
                    if (!chestBlock) {
                        console.log(`箱子 ${chest.x}, ${chest.y}, ${chest.z} 未找到`);
                        continue;
                    }
                    // 判断与箱子的距离是否大于OPEN_RANGE_GOAL
                    // if (bot.entity.position.distanceTo(new Vec3(chest.x, chest.y, chest.z)) > OPEN_RANGE_GOAL) {
                    //     console.log(`I am going to the chest ${chest.x}, ${chest.y}, ${chest.z}`);
                    //     await bot.pathfinder.goto(new GoalNear(chest.x, chest.y, chest.z, OPEN_RANGE_GOAL)).then(async () => {
                    //         console.log(`Reached chest at ${chest.x}, ${chest.y}, ${chest.z}`);
                    //     }).catch((err) => {
                    //         console.error(`Failed to reach chest at ${chest.x}, ${chest.y}, ${chest.z}: ${err.message}`);
                    //         return;
                    //     });
                    // }
                    console.log(`I am going to open the chest ${chest.x}, ${chest.y}, ${chest.z}`);
                    await bot.pathfinder.goto(new GoalNear(chest.x, chest.y, chest.z, OPEN_RANGE_GOAL)).then(async () => {
                        await bot.openContainer(chestBlock).then(async (openedContainer) => {
                            // 遍历箱子中的物品，找到 itemName 物品
                            console.log(`I am going to open the chest ${chest.x}, ${chest.y}, ${chest.z}`);
                            
                            for (const item of openedContainer.containerItems()) {
                                const matched = await this.getService.matchItemName(itemName, item, true);
                                if (matched) {
                                    console.log(`Found item: ${item.name} -- ${item.displayName}, x${item.count}, ${item.type}, ${item.metadata}`);
                                    const withdrawCount = Math.min(item.count, maxCount + reserved - itemToken);
                                    await openedContainer.withdraw(item.type, null, withdrawCount);
                                    itemToken += withdrawCount;
                                    if (itemToken >= maxCount + reserved || itemToken >= maxItemCanTake) {
                                        break;
                                    }
                                }
                            }
                        }).catch((err) => {
                            console.error(`Failed to open chest at ${chest.x}, ${chest.y}, ${chest.z}: ${err.message}`);
                        });
                    }).catch((err) => {
                        console.error(`Failed to reach chest at ${chest.x}, ${chest.y}, ${chest.z}: ${err.message}`);
                    });
                                    */  
                }

            }

            // 等待半分钟
            await bot.waitForTicks(10);

            // 前往堆肥桶
            console.log(`I am going to the composter ${composterName}`);
            await this.goToComposter(bot, composterName);

            // 开始堆肥
            let itemCountToken = 0;
            while (itemCountToken < 10) {
                itemCountToken++;
                // 检查背包中itemName物品的数量，如果物品数量小于reserved，则报错返回
                const itemCountInInventory = bot.inventory.items().filter(i => i.name === itemName).reduce((acc, i) => acc + i.count, 0);
                if (itemCountInInventory < reserved) {
                    console.error(`背包中 ${itemName} 物品数量小于 ${reserved}`);
                    return
                }

                // 可以用来堆肥的物品数量
                let itemCount = itemCountInInventory - reserved;

                // 查找物品
                const item = bot.inventory.items().find(i => i.name === itemName);
                if (!item) {
                    return { success: false, message: `背包中没有找到 ${itemName}` };
                }

                // 查找堆肥桶方块
                const composterPos = new Vec3(
                    composter.position.x,
                    composter.position.y,
                    composter.position.z
                );
                const composterBlock = bot.blockAt(composterPos);

                if (!composterBlock || composterBlock.name !== 'composter') {
                    console.error('在指定位置未找到堆肥桶');
                    return
                }

                // 装备物品
                await bot.equip(item, 'hand').then(async () => {
                    console.log(`I have equipped a ${item.name} to add to the composter`);
                    for (let i = 0; i < item.count; i++) {
                        await bot.activateBlock(composterBlock).then(async () => {
                            console.log(`I have added a ${item.name} to the composter`);
                            itemCount--;
                        }).catch((error) => {
                            console.error(`I can't add a ${item.name} to the composter, because ${error}`)
                        });
                        if (itemCount <= 0) {
                            break;
                        }
                        await bot.waitForTicks(1);
                    }
                }).catch((error) => {
                    console.error(`I can't equip a ${item.name} to add to the composter, because ${error}`)
                });
            }
        } catch (err) {
            console.error('添加物品到堆肥桶时出错:', err);
        }
    }

    /**
     * 从堆肥桶收集骨粉
     * @param {object} bot - 机器人实例
     * @param {string} composterName - 堆肥桶名称
     * @returns {Promise<object>} 操作结果 {success: boolean, message: string, boneMealCount: number}
     */
    async collectBoneMeal(bot, composterName) {
        const composter = COMPOST_MAP[composterName];
        if (!composter) {
            return { success: false, message: `未找到名为 ${composterName} 的堆肥桶` };
        }

        try {
            // 前往堆肥桶
            await this.goToComposter(bot, composterName);

            // 查找堆肥桶方块
            const composterPos = new Vec3(
                composter.position.x,
                composter.position.y,
                composter.position.z
            );
            const composterBlock = bot.blockAt(composterPos);

            if (!composterBlock || composterBlock.name !== 'composter') {
                return { success: false, message: '在指定位置未找到堆肥桶' };
            }

            // 获取当前堆肥等级
            const currentLevel = composterBlock.getProperties().level;

            // 如果堆肥桶未满，无法收集
            if (currentLevel < composter.maxLevel) {
                return {
                    success: false,
                    message: `堆肥桶未满，当前等级: ${currentLevel}/${composter.maxLevel}`,
                    currentLevel
                };
            }

            // 右键点击堆肥桶收集骨粉
            await bot.activateBlock(composterBlock);

            // 更新堆肥桶等级
            composter.level = 0;

            return {
                success: true,
                message: `成功从 ${composter.name} 收集骨粉`,
                boneMealCount: 1,
                currentLevel: 0
            };

        } catch (err) {
            console.error('收集骨粉时出错:', err);
            return {
                success: false,
                message: `收集骨粉时出错: ${err.message}`
            };
        }
    }

    /**
     * 获取所有堆肥桶状态
     * @returns {Array} 堆肥桶状态列表
     */
    getComposterStatus() {
        return Object.entries(COMPOST_MAP).map(([id, composter]) => ({
            id,
            name: composter.name,
            level: composter.level,
            maxLevel: composter.maxLevel,
            position: composter.position,
            isFull: composter.level >= composter.maxLevel
        }));
    }
}

module.exports = CompostService;
