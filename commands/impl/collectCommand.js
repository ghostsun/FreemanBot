const Command = require('../baseCommand');

class CollectCommand extends Command {
	constructor() {
		super(
			'collect',
			'Collect a specific block type',
			'collect <blockName>'
		);
	}

async execute(args, username, bot) {
		if (args.length !== 1) {
			this.sendUsage(bot, username);
			return;
		}

		const blockType = bot.registry.blocksByName[args[0]];
		if (!blockType) {
			bot.chat(`I don't know any blocks named ${args[0]}.`);
			return;
		}

		bot.chat(`Collecting the nearest ${blockType.name}`);

		const block = bot.findBlock({
			matching: blockType.id,
			maxDistance: 64
		});

		if (!block) {
			bot.chat(`I don't see any ${blockType.name} nearby.`);
			return;
		}

		try {
			await bot.collectBlock.collect(block);
			bot.chat(`Successfully collected ${blockType.name}`);
		} catch (error) {
			bot.chat(`Failed to collect ${blockType.name}: ${error.message}`);
		}
	}
}

module.exports = CollectCommand;
