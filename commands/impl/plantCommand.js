const Command = require('../baseCommand');

class PlantCommand extends Command {
	constructor() {
		super(
			'plant',
			'Plant seeds in the field',
			'plant <seedName>'
		);
	}

async execute(args, username, bot) {
		if (args.length !== 1) {
			this.sendUsage(bot, username);
			return;
		}

		const seedName = args[0].toLowerCase();
    
		// Check if there's already a task running
		if (bot.currentTask) {
			bot.chat(`I can't plant ${seedName} because I'm already doing a task: ${bot.currentTask}`);
			return;
		}

		// Set the current task
		bot.currentTask = `planting ${seedName}`;
    
		try {
			bot.chat(`Starting to plant ${seedName}...`);
      
			// Call the plant service
			// await plantService.plant(seedName);
      
			bot.chat(`Finished planting ${seedName}.`);
		} catch (error) {
			bot.chat(`Error while planting ${seedName}: ${error.message}`);
		} finally {
			// Clear the current task
			bot.currentTask = null;
		}
	}
}

module.exports = PlantCommand;
