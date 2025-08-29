const Command = require('../baseCommand');

class FindCommand extends Command {
  constructor() {
    super(
      'find',
      'Find the nearest block of a given type',
      'find <blockName>'
    );
  }

  async execute(args, username, bot) {
    if (args.length !== 1) {
      console.error('Invalid number of arguments');
      return;
    }
    const blockType = bot.registry.blocksByName[args[0]];
    if (!blockType) {
      console.error(`Unknown block type: ${args[0]}`);
      return;
    }

    // Try and find that block type in the world
    const block = bot.findBlock({
      matching: blockType.id,
      maxDistance: 64
    });

    if (!block) {
      console.error(`No blocks of type ${blockType.name} found nearby`);
      return;
    }

    console.log(`Found ${blockType.name} at ${block.position}`);
  }
}

module.exports = FindCommand;
