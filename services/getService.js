/**
 * GetService
 * 负责从容器中获取物品
 */
const { Vec3 } = require('vec3');
const { OPEN_RANGE_GOAL, CONTAINER_TYPES } = require('../utils/constants');
const { GoalNear } = require('mineflayer-pathfinder').goals;
class GetService {
    constructor() {

    }

    // 最后一个参数是一个正则表达式，用于匹配物品名称
    async getFromContainer(bot, count, itemName, containerPosition, isExact = false) {
        let itemToken = 0;
        if (!(bot.entity.position.distanceTo(new Vec3(containerPosition.x, containerPosition.y, containerPosition.z)) < OPEN_RANGE_GOAL)) {
            await bot.pathfinder.goto(new GoalNear(containerPosition.x, containerPosition.y, containerPosition.z, OPEN_RANGE_GOAL)).then(async () => {
                console.log(`Reached chest at ${containerPosition.x}, ${containerPosition.y}, ${containerPosition.z}`);
            }).catch((err) => {
                console.error(`Failed to reach chest at ${containerPosition.x}, ${containerPosition.y}, ${containerPosition.z}: ${err.message}`);
                return;
            });
        }
        const containerBlock = await bot.findBlock({
            matching: (block) => {
                // console.log(block.name);
                return CONTAINER_TYPES.includes(block.name);
            },
            maxDistance: OPEN_RANGE_GOAL
        });
        if (containerBlock) {
            console.log(`Found chest at ${containerBlock.position.x}, ${containerBlock.position.y}, ${containerBlock.position.z}`);
            await bot.openContainer(containerBlock).then(async (openedContainer) => {
                // const chestHoe = openedContainer.items().find((item) => item.name.endsWith('_hoe'));
                for (const item of openedContainer.containerItems()) {
                    let matched = this.matchItemName(itemName, item, isExact);
                    if (matched) {
                        console.log(`Found item: ${item.name} -- ${item.displayName}, x${item.count}, ${item.type}, ${item.metadata}`);
                        const withdrawCount = Math.min(item.count, count - itemToken);
                        await openedContainer.withdraw(item.type, null, withdrawCount);
                        itemToken += withdrawCount;
                        if (itemToken >= count) break;
                    }
                }
                await openedContainer.close();
            }).catch((err) => {
                console.error(err)
                console.error(`Failed to open chest: ${err}`);
            });
        } else {
            console.error('No chest found near ' + containerPosition.x + ', ' + containerPosition.y + ', ' + containerPosition.z);
        }
        return itemToken;
    }

    async matchItemName(itemName, item, isExact = false) {
        let matched = false;
        // if (isExact) {
        //     console.log('exact match', itemName, item.name);
        //     if (item.name === itemName) matched = true;
        // } else {
        // 在itemName中查找包含'_'位置，如果在最前面则匹配endsWith，如果在后面则匹配startsWith，如果前后都有则匹配includes
        const index = itemName.indexOf('_');
        if (index !== -1) {
            if (index === 0) {
                if (itemName.lastIndexOf('_') === itemName.length - 1) {
                    const matchName = itemName.slice(1, itemName.length - 1);
                    if (item.name.includes(matchName)) matched = true;
                } else {
                    const matchName = itemName.slice(1);
                    if (item.name.endsWith(matchName)) matched = true;
                }
            } else if (index === itemName.length - 1) {
                const matchName = itemName.slice(0, itemName.length - 1);
                if (item.name.startsWith(matchName)) matched = true;
            } else {
                if (item.name === itemName) matched = true;
            }
        } else {
            if (item.name === itemName) matched = true;
        }
        return matched;
    }
}

module.exports = GetService;
