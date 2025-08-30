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
    const blockType = args[0]
    if (!blockType) {
      console.error('No block type specified');
      return;
    }

    const blockTypeObj = bot.registry.blocksByName[blockType];
    if (!blockTypeObj) {
      console.error(`I don't know any blocks named ${blockType}.`);
      return;
    }

    // Try and find that block type in the world
    const block = await bot.findBlock({
      matching: blockTypeObj.id,
      maxDistance: 64
    });

    if (!block) {
      console.error(`No blocks of type ${blockType} found nearby`);
      return;
    }

    console.log(`Found ${blockTypeObj.name} at x: ${block.position.x}, y: ${block.position.y}, z: ${block.position.z}`);
    return block
  }
}

module.exports = FindCommand;
