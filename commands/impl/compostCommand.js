const BaseCommand = require('../baseCommand');
const CompostService = require('../../services/CompostService');

class CompostCommand extends BaseCommand {
    constructor() {
        super();
        this.name = 'compost';
        this.aliases = ['comp', 'c'];
        this.description = '管理堆肥桶和堆肥操作';
        this.usage = [
            'compost list - 查看所有堆肥桶状态',
            'compost go <堆肥桶ID> - 前往指定堆肥桶',
            'compost add <堆肥桶ID> <物品名称> - 添加物品到堆肥桶',
            'compost collect <堆肥桶ID> - 从堆肥桶收集骨粉'
        ];
        this.compostService = new CompostService();
    }

    async execute(args, username, bot) {
        if (args.length === 0) {
            return this.sendUsage();
        }

        const subCommand = args[0].toLowerCase();
        const composterId = args[1];
        const itemName = args[2];

        try {
            switch (subCommand) {
                case 'list':
                    return await this.handleListComposters(bot);
                case 'go':
                    if (!composterId) return this.sendUsage();
                    return await this.handleGoToComposter(bot, composterId);
                case 'add':
                    if (!composterId || !itemName) return this.sendUsage();
                    return await this.handleAddToComposter(bot, composterId, itemName);
                case 'collect':
                    if (!composterId) return this.sendUsage();
                    return await this.handleCollectBoneMeal(bot, composterId);
                default:
                    return this.sendUsage();
            }
        } catch (error) {
            console.error('执行堆肥命令时出错:', error);
            return `错误: ${error.message}`;
        }
    }

    /**
     * 处理列出所有堆肥桶状态的命令
     */
    async handleListComposters(bot) {
        const composters = this.compostService.getComposterStatus();
        if (composters.length === 0) {
            return '没有可用的堆肥桶';
        }

        const composterList = composters.map(composter => 
            `${composter.id} - ${composter.name} - 等级: ${composter.level}/${composter.maxLevel} ` +
            `- 状态: ${composter.isFull ? '已满' : '未满'} - 位置: ${composter.position.x},${composter.position.y},${composter.position.z}`
        ).join('\n');

        return `可用堆肥桶列表:\n${composterList}`;
    }

    /**
     * 处理前往堆肥桶的命令
     */
    async handleGoToComposter(bot, composterId) {
        try {
            const success = await this.compostService.goToComposter(bot, composterId);
            if (success) {
                return `已到达堆肥桶 ${composterId}`;
            } else {
                return `前往堆肥桶 ${composterId} 失败`;
            }
        } catch (error) {
            return `前往堆肥桶时出错: ${error.message}`;
        }
    }

    /**
     * 处理添加物品到堆肥桶的命令
     */
    async handleAddToComposter(bot, composterId, itemName) {
        try {
            const result = await this.compostService.addToComposter(bot, composterId, itemName);
            return result.message;
        } catch (error) {
            return `添加物品到堆肥桶时出错: ${error.message}`;
        }
    }

    /**
     * 处理收集骨粉的命令
     */
    async handleCollectBoneMeal(bot, composterId) {
        try {
            const result = await this.compostService.collectBoneMeal(bot, composterId);
            return result.message;
        } catch (error) {
            return `收集骨粉时出错: ${error.message}`;
        }
    }
}

module.exports = CompostCommand;
