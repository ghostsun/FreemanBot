const Command = require('../baseCommand');
const { FIELDS, PLANT_AND_SEED } = require('../../utils/constants');
const CareService = require('../../services/CareService');

class CareCommand extends Command {
  constructor() {
    super(
      'care',
      'Care for a specific crop (e.g. wheat)',
      'care <fieldName>'
    );
	
	this.careService = new CareService();
  }

  async execute(args, username, bot) {
    if (args.length !== 1) {
      console.error('Invalid number of arguments');
      return;
    }
	// args[0] should be the field name
	const fieldName = args[0].toLowerCase();
	// Validate field name
	const field = FIELDS[fieldName];
	if (!field) {
		console.error(`Unknown field name: ${fieldName}`);
		return;
	}
    const cropType = field.plant;
	const seedType = PLANT_AND_SEED.find(ps => ps.plant === cropType)?.seed;

	console.log(`Field: ${fieldName}, Crop: ${cropType}, Seed: ${seedType}`);

    // Only wheat is supported in this example
    if (cropType !== 'wheat') {
      console.error(`Unsupported crop type: ${cropType}`);
      return;
    }

    // Check if already doing a task
    if (bot.currentTask) {
      console.error(`Already doing a task: ${bot.currentTask}`);
      return;
    }

    bot.currentTask = `care:${cropType}`;
    try {
      console.log(`Starting to care for ${fieldName} with ${cropType}...`);
    	await this.careService.harvest(bot, field);
      console.log(`Finished caring for ${cropType}.`);
    } catch (error) {
      console.error(`Error while caring for ${cropType}: ${error.message}`);
    } finally {
      bot.currentTask = null;
    }
  }
}

module.exports = CareCommand;
