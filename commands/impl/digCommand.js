const Command = require('../baseCommand');
const { CONTAINERS } = require('../../utils/constants');
const DigService = require('../../services/digService');

class DigCommand extends Command {
  constructor() {
    super('dig', 'Dig a block', 'dig [count] <item> [container] [x] [y] [z]');
    this.digService = new DigService();
  }
  async execute(args, username, bot) {
    try {
      let itemName;
      let itemCount = 1;
      let containerName;
      let containerPos;

      console.log(args);
      if (args.length > 3 && args.length < 7) {
        containerPos = { x: parseInt(args[args.length - 3]), y: parseInt(args[args.length - 2]), z: parseInt(args[args.length - 1]) };
        args = args.slice(0, args.length - 3);
      }

      if (args.length === 2) {
        itemName = args[0];
        containerName = args[1];
        if (!itemName || !containerName) {
          console.error('Please specify the item name and container name');
          return;
        }
      } else if (args.length === 3) {
        itemCount = parseInt(args[0]);
        itemName = args[1];
        containerName = args[2];
        if (!Number.isInteger(itemCount) || !itemName || !containerName) {
          console.error('Please specify the item count, item name and container name');
          return;
        }
      }

      if (!containerPos) {
        if (!containerName || !CONTAINERS.has(containerName)) {
          console.error('Please specify the container name or position');
          return;
        } else {
          containerPos = CONTAINERS.get(containerName).position;
        }
      }

      if (!containerPos) {
        console.error('Container position not found');
        return;
      }

      await this.digService.dig(bot, itemName, itemCount, containerPos.x, containerPos.y, containerPos.z);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = DigCommand;
