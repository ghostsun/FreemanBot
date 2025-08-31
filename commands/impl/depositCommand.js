const Command = require('../baseCommand');
const DepositService = require('../../services/DepositService');
const { CONTAINERS, CONTAINER_TYPES, RANGE_GOAL } = require('../../utils/constants');
const { Vec3 } = require('vec3')
const { GoalNear } = require('mineflayer-pathfinder').goals

class DepositCommand extends Command {
  constructor() {
    super(
      'deposit',
      'Deposit items to a container',
      'deposit [count] <item> [container] [x] [y] [z]'
    );
    this.depositService = new DepositService();
  }

  async execute(args, username, bot) {
    try {
      // console.log(args);
      let itemName;
      let itemCount = 1;
      let containerName;
      let containerPos;

      if (args.length > 3 && args.length < 7) {
        containerPos = {
          x: parseInt(args[args.length - 3]),
          y: parseInt(args[args.length - 2]),
          z: parseInt(args[args.length - 1])
        };
        args = args.slice(0, args.length - 3);
      }

      console.log(`containerPos: ${JSON.stringify(containerPos)}, args: ${JSON.stringify(args)}`);

      if (args.length === 2) {
        itemName = args[0];
        containerName = args[1];
        if (!itemName || !containerName) {
          bot.chat('Please specify the item name and container name');
          return
        }
      } else if (args.length === 3) {
        itemCount = parseInt(args[0]);
        itemName = args[1];
        containerName = args[2];
        if (!Number.isInteger(itemCount) || !itemName || !containerName) {
          bot.chat('Please specify a valid number for count, item name, and container name');
          return
        }
      }

      if (!containerPos) {
        // 如果没有指定箱子名称，或指定的箱子名称不在 CONTAINERS 中，则打印错误信息并返回
        if (!containerName || !CONTAINERS.has(containerName)) {
          console.log('Please specify the container name or position');
          return
        } else {
          containerPos = CONTAINERS.get(containerName).position;
        }
      }

      if (!containerPos) {
        console.log('Container position not found');
        return
      }

      const containerBlock = await bot.blockAt(new Vec3(containerPos.x, containerPos.y, containerPos.z));
      if (!containerBlock) {
        console.log('Container block not found');
        return
      }

      if (!CONTAINER_TYPES.includes(containerBlock.name)) {
        console.log('Container block is not a valid container type');
        return
      }

      // 移动到箱子附近
      await bot.pathfinder.goto(new GoalNear(containerPos.x, containerPos.y, containerPos.z, RANGE_GOAL)).then(async () => {
        console.log(`I have arrived at the container at ${containerPos.x}, ${containerPos.y}, ${containerPos.z}`)
        // 遍历箱子中的物品，直到取出指定数量的指定物品，或者箱子中的物品遍历完
        const opened = await bot.openContainer(containerBlock)
        console.log('Container opened');
        let itemTaken = 0;
        for (const item of opened.items()) {
          if (item.name === itemName) {
            const takeCount = Math.min(itemCount - itemTaken, item.count);
            await opened.deposit(item.type, null, takeCount).then(() => {
              itemTaken += takeCount;
              console.log(`Deposited ${takeCount} ${itemName}, total ${itemTaken}`);
            }).catch((error) => {
              console.error(`Failed to deposit ${itemName}: ${error}`);
            });
            if (itemTaken >= itemCount) {
              console.log(`Deposited enough ${itemName}`);
              break;
            }
          }
        }
        if (itemTaken < itemCount) {
          console.error(`Not enough ${itemName}, only deposited ${itemTaken}`);
        } else {
          console.log(`Deposited ${itemTaken} ${itemName}`);
        }
        opened.close();
      }).catch((err) => {
        console.error(`Error moving to container: ${err}`)
      });


    } catch (error) {
      console.error('Error in deposit command:', error);
      bot.chat(`An error occurred: ${error.message}`);
      return false;
    }
  }

  async findContainer(bot, containerName, position) {
    if (position) {
      const block = bot.blockAt(new bot.registry.Vec3(position.x, position.y, position.z));
      if (block && CONTAINERS.includes(block.name)) {
        return {
          name: block.displayName || block.name,
          position: position,
          block: block
        };
      }
      return null;
    }

    const containerBlock = containerName
      ? bot.findBlock({
        matching: block => CONTAINERS.includes(block.name) &&
          block.name.includes(containerName),
        maxDistance: 32
      })
      : bot.findBlock({
        matching: block => CONTAINERS.includes(block.name),
        maxDistance: 32,
        count: 1
      });

    if (containerBlock) {
      return {
        name: containerBlock.displayName || containerBlock.name,
        position: containerBlock.position,
        block: containerBlock
      };
    }

    return null;
  }
}

module.exports = DepositCommand;
