const Command = require('../baseCommand');
const { GoalBlock } = require('mineflayer-pathfinder').goals;
const { CONTAINER_TYPES, CONTAINERS, RANGE_GOAL } = require('../../utils/constants');

class GetCommand extends Command {
  constructor() {
    super(
      'get',
      'Get items from a container',
      'get [count] <item> [container] [x] [y] [z]'
    );
  }

  async execute(args, username, bot) {
    // 参数检查
    let itemName;
    let itemCount = 1;
    let containerName;
    let containerBlock;
    let containerPos;
    try {
      // 参数格式，第一个参数为数量，可选；第二个参数为物品名称，必填；第三个参数为容器名称，可选；第四个及以后参数为容器坐标，可选

      // 如果参数数量大于3且小于7，说明指定了容器坐标。截取后三位作为容器坐标。如果指定了容器坐标，则忽略容器名称
      if (args.length > 3 && args.length < 7) {
        containerPos = { x: parseInt(args[args.length - 3]), y: parseInt(args[args.length - 2]), z: parseInt(args[args.length - 1]) };
        args = args.slice(0, args.length - 3);
      }

      // 只有一个参数且不为数字，参数是物品名称，数量默认为1，从最近的容器中拿取
      if (args.length === 1 && !Number.isInteger(parseInt(args[0]))) {
        itemName = args[0];
        itemCount = 1;
        if (!itemName) {
          console.error('No item name provided');
          return;
        }
        if (!containerPos) {
          containerPos = await this.findContainer(bot);
          if (!containerPos) {
            console.error('No container found');
            return;
          }
        }
      } else if (args.length == 2) {
        // 如果第一个参数是数字，则为数量，第二个参数是物品名称
        if (Number.isInteger(parseInt(args[0]))) {
          itemCount = parseInt(args[0]);
          itemName = args[1];
          if (!itemName) {
            console.error('No item name provided');
            return;
          }
          if (!containerPos) {
            containerPos = await this.findContainer(bot);
          }
          // 如果第一个参数不是数字，则第一个参数是物品名称，第二个参数是容器名称。可以从指定的容器中拿取
        } else {
          itemName = args[0];
          itemCount = 1;
          containerName = args[1];
        }
      } else if (args.length === 3) {
        // 如果第一个参数不是数字，则打印错误信息
        if (!Number.isInteger(parseInt(args[0]))) {
          console.error('Usage: get [count] <item> [container] [x] [y] [z]');
          return;
        }
        itemName = args[1];
        itemCount = parseInt(args[0]);
        containerName = args[2];
      }

      if (!containerPos && containerName && CONTAINERS[containerName]) {
        containerPos = CONTAINERS[containerName].position;
      }
      if (!containerPos) {
        console.error('Container not found');
        return;
      }

      const getService = new GetService();
      await getService.getFromContainer(bot, itemCount, itemName, containerPos);

    } catch (error) {
      console.error('Error getting items:', error);
    }
  }
}

module.exports = GetCommand;
