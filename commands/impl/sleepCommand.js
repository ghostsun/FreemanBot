const BaseCommand = require('../baseCommand');
const SleepService = require('../../services/SleepService');

class SleepCommand extends BaseCommand {
    constructor() {
        super();
        this.name = 'sleep';
        this.aliases = ['bed', 's'];
        this.description = '控制机器人睡觉和起床';
        this.usage = [
            'sleep list - 查看所有床铺状态\n',
            'sleep go <床铺ID> - 前往指定床铺\n',
            'sleep on <床铺ID> - 在指定床铺睡觉\n',
            'sleep off <床铺ID> - 从指定床铺起床\n'
        ];
        this.sleepService = new SleepService();
    }

    async execute(args, username, bot) {
        if (args.length === 0) {
            return this.sendUsage();
        }

        const subCommand = args[0].toLowerCase();
        const bedId = args[1];

        try {
            switch (subCommand) {
                case 'list':
                    return await this.handleListBeds(bot);
                case 'go':
                    if (!bedId) return this.sendUsage();
                    return await this.handleGoToBed(bot, bedId);
                case 'on':
                    if (!bedId) return this.sendUsage();
                    return await this.handleSleep(bot, bedId);
                case 'off':
                    return await this.handleWakeUp(bot);
                default:
                    return this.sendUsage();
            }
        } catch (error) {
            console.error('执行睡觉命令时出错:', error);
            return `错误: ${error.message}`;
        }
    }

    /**
     * 处理列出所有床铺状态的命令
     */
    async handleListBeds(bot) {
        const beds = this.sleepService.getBedStatus();
        if (beds.length === 0) {
            return '没有可用的床铺';
        }

        const bedList = beds.map(bed => 
            `${bed.id} - ${bed.name} (${bed.color}) - 状态: ${bed.isOccupied ? '占用中' : '空闲'} - 位置: ${bed.position.x},${bed.position.y},${bed.position.z}`
        ).join('\n');

        return `可用床铺列表:\n${bedList}`;
    }

    /**
     * 处理前往床铺的命令
     */
    async handleGoToBed(bot, bedId) {
        const success = await this.sleepService.goToBed(bot, bedId);
        if (success) {
            return `已到达床铺 ${bedId}`;
        } else {
            return `前往床铺 ${bedId} 失败`;
        }
    }

    /**
     * 处理睡觉命令
     */
    async handleSleep(bot, bedId) {
        const success = await this.sleepService.sleep(bot, bedId);
        if (success) {
            return `正在 ${bedId} 睡觉...`;
        } else {
            return `在 ${bedId} 睡觉失败`;
        }
    }

    /**
     * 处理起床命令
     */
    async handleWakeUp(bot) {
        const success = await this.sleepService.wakeUp(bot);
        if (success) {
            return `已从床铺起床`;
        } else {
            return `起床失败`;
        }
    }
}

module.exports = SleepCommand;
