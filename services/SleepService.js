/**
 * SleepService
 * 负责处理与床铺相关的功能，包括睡觉和起床
 */
const { BED_MAP } = require('../utils/constants');
const { GoalNear } = require('mineflayer-pathfinder').goals;
const { Vec3 } = require('vec3');

class SleepService {
    /**
     * 前往指定的床铺
     * @param {object} bot - 机器人实例
     * @param {string} bedName - 床铺名称
     * @returns {Promise<boolean>} 是否成功到达床铺
     */
    async goToBed(bot, bedName) {
        const bed = BED_MAP[bedName];
        if (!bed) {
            throw new Error(`未找到名为 ${bedName} 的床铺`);
        }

        const bedPosition = new Vec3(bed.position.x, bed.position.y, bed.position.z);
        
        // 设置目标位置为床铺旁边
        const goal = new GoalNear(
            bedPosition.x,
            bedPosition.y,
            bedPosition.z,
            1  // 1格范围内
        );

        try {
            await bot.pathfinder.goto(goal);
            return true;
        } catch (err) {
            console.error('前往床铺失败:', err);
            return false;
        }
    }

    /**
     * 睡觉
     * @param {object} bot - 机器人实例
     * @param {string} bedName - 床铺名称
     * @returns {Promise<boolean>} 是否成功睡觉
     */
    async sleep(bot, bedName) {
        try {
            const bed = BED_MAP[bedName];
            if (!bed) {
                throw new Error(`未找到名为 ${bedName} 的床铺`);
            }

            const bedPosition = new Vec3(bed.position.x, bed.position.y, bed.position.z);
            // 计算bot当前位置与床的距离
            const distance = bot.entity.position.distanceTo(bedPosition);
            // 如果距离大于1，则前往床铺
            if (distance > 1) {
                await this.goToBed(bot, bedName);
            }

            const bedBlock = await bot.blockAt(bedPosition);

            // if (!bedBlock || bot.isABed(bedBlock)) {
            //     throw new Error('未在指定位置找到床');
            // }
            if (!bedBlock || !bedBlock.type == BED_MAP[bedName].id) {
                throw new Error('未在指定位置找到床');
            }

            // 尝试睡觉
            try {
                await bot.sleep(bedBlock).then(async () => {
                    console.log('I am sleeping');
                    return true;
                }).catch((err) => {
                    console.error('睡觉时出错:', err);
                    return false;
                });
            } catch (err) {
                console.error('睡觉时出错:', err);
                return false;
            }
        } catch (err) {
            console.error('睡觉时出错:', err);
            return false;
        }
    }

    /**
     * 起床
     * @param {object} bot - 机器人实例
     * @returns {Promise<boolean>} 是否成功起床
     */
    async wakeUp(bot) {
        try {
            if (!bot.isSleeping) {
                console.log('当前没有在睡觉');
                return true;
            }

            await bot.wake().then(async () => {
                console.log('I am awake');
                return true;
            }).catch((err) => {
                console.error('起床时出错:', err);
                return false;
            });
        } catch (err) {
            console.error('起床时出错:', err);
            return false;
        }
    }

    /**
     * 获取所有床铺状态
     * @returns {Array} 床铺状态列表
     */
    getBedStatus() {
        return Object.entries(BED_MAP).map(([id, bed]) => ({
            id,
            name: bed.name,
            color: bed.color,
            isOccupied: bed.isOccupied,
            position: bed.position
        }));
    }
}

module.exports = SleepService;
