const { TOOLS, CONTAINER_TYPES, OPEN_RANGE_GOAL, RANGE_GOAL } = require('../utils/constants');
const { Vec3 } = require('vec3');
const InventoryService = require('./inventoryService');
const DepositService = require('./depositService');
const MoveService = require('./moveService');

const { GoalXZ } = require('mineflayer-pathfinder').goals;

class DigService {
  constructor() {
    this.inventoryService = new InventoryService();
    this.depositService = new DepositService();
    this.moveService = new MoveService();
  }

  async dig(bot, itemName, count, x, y, z) {
    // 检查身上是否有采集所需工具
    // 根据itemName找到对应的工具
    const tool = TOOLS[itemName];
    let dug = 0;
    if (!tool) {
      console.error(`No tool found for ${itemName}`);
      return;
    }

    const chestToOpen = await bot.blockAt(new Vec3(x, y, z));
    if (!chestToOpen || !CONTAINER_TYPES.includes(chestToOpen.name)) {
      console.error(`Chest not found at ${x}, ${y}, ${z}`);
      return;
    }

    // 检查身上是否有工具
    if (!(await this.hasTool(bot, tool))) {
      // 如果没有，去箱子中拿取工具
      console.error(`I don't have ${tool} in my inventory`);
      await this.withdrawTool(bot, tool, x, y, z);
    }

    // 再次检查身上是否有工具
    if (!(await this.hasTool(bot, tool))) {
      console.error(`I still don't have ${tool} in my inventory`);
      return;
    }

    // 装备工具到hand上
    const toolInInventory = await bot.inventory.items().find(item => item.name === tool || item.displayName.includes(tool) || item.name.includes(tool));
    if (!toolInInventory) {
      console.error(`I don't have ${tool} in my inventory`);
      return;
    }
    console.log(`${toolInInventory}`)
    console.log(`I have found ${toolInInventory.name} in my inventory`);
    await bot.equip(toolInInventory, 'hand').then(() => {
      console.log(`I have equipped ${toolInInventory.name} in my inventory`);
    }).catch((error) => {
      console.error(`I can't equip ${toolInInventory.name} in my inventory, because ${error}`);
    });

    while (dug < count) {
      // 收集物品
      const collected = await this.collect(bot, itemName, count - dug);
      dug += collected;
      console.log(`I have collected ${collected} ${itemName}, total ${dug}`);
      // const items = bot.inventory.items();
      // let tempCount = 0
      // for (const item of items) {
      //   if (item.name === itemName || item.displayName.includes(itemName) || item.name.includes(itemName)) {
      //     tempCount += item.count;
      //   }
      // }
      // dug = tempCount;

    }

    console.log(`I have dug ${dug} ${itemName}`);
  }

  async hasTool(bot, itemName) {
    const items = bot.inventory.items();
    return items.some(item => item && (item.name === TOOLS[itemName] || item.displayName.includes(itemName) || item.name.includes(itemName)));
  }

  async withdrawTool(bot, itemName, x, y, z) {
    await this.moveService.moveTo(bot, x, y, z, true, OPEN_RANGE_GOAL);
    const count = 1;
    const openToContainer = bot.blockAt(new Vec3(x, y, z));
    if (!openToContainer || !CONTAINER_TYPES.includes(openToContainer.name)) {
      console.error(`Chest not found at ${x}, ${y}, ${z}`);
      return;
    }
    const openedContainer = await bot.openContainer(openToContainer);
    if (!openedContainer) {
      console.error(`Failed to open chest at ${x}, ${y}, ${z}`);
      return;
    }

    // 检查箱子中是否有工具
    const toolItem = openedContainer.containerItems().find(item => item.name === TOOLS[itemName] || item.displayName.includes(itemName) || item.name.includes(itemName));
    if (!toolItem) {
      console.error(`No ${TOOLS[itemName]} found in chest at ${x}, ${y}, ${z}`);
      return;
    }
    await openedContainer.withdraw(toolItem.type, null, count).then(() => {
      console.log(`I have taken a ${toolItem.name} from the chest`);
    }).catch((error) => {
      console.error(`I can't take a ${toolItem.name} from the chest, because ${error}`);
    });
    await openedContainer.close();
  }

  async collectItem(bot, itemName) {
    // 查找3格范围内的物品
    const blocks = await bot.findBlocks({ matching: (block) => block.name === itemName || block.displayName.includes(itemName) || block.name.includes(itemName), maxDistance: 3 });
    if (blocks){
      await bot.collectBlock.collect(blocks);
    }
  }

  async collect(bot, itemName, count) {
    // 查找64格范围内的物品
    let blocks = await bot.findBlocks({ matching: (block) => block.name === itemName || block.displayName.includes(itemName) || block.name.includes(itemName), maxDistance: 64, count: count });
    let distance = 64;
    
    if (!blocks || blocks.length < 1) {
      console.error(`No ${itemName} found within 64 blocks`);
      // 如果64格内没有找到物品，尝试128格范围内找
      blocks = await bot.findBlocks({ matching: (block) => block.name === itemName || block.displayName.includes(itemName) || block.name.includes(itemName), maxDistance: 128, count: count });
      if (!blocks || blocks.length < 1) {
        console.error(`No ${itemName} found within 128 blocks`);
        // 如果128格内没有找到物品，尝试在256格范围内找
        blocks = await bot.findBlocks({ matching: (block) => block.name === itemName || block.displayName.includes(itemName) || block.name.includes(itemName), maxDistance: 256, count: count });
        if (!blocks || blocks.length < 1) {
          console.error(`No ${itemName} found within 256 blocks`);
          // 如果256格内没有找到物品，尝试在512格范围内找
          blocks = await bot.findBlocks({ matching: (block) => block.name === itemName || block.displayName.includes(itemName) || block.name.includes(itemName), maxDistance: 512, count: count });
          if (!blocks || blocks.length < 1) {
            console.error(`No ${itemName} found within 512 blocks`);
            return;
          } else {
            distance = 512;
          }
        } else {
          distance = 256;
        }
      } else {
        distance = 128;
      }
    } else {
      distance = 64;
    }
    let blocksToCollect = [];
    console.log(`Found ${blocks.length} ${itemName} within ${distance} blocks`);
    for (const block of blocks) {
      console.log(`${itemName} at ${block.x}, ${block.y}, ${block.z}`);
      blocksToCollect.push(bot.blockAt(new Vec3(block.x, block.y, block.z)));
    }

    // 收集物品
    await bot.collectBlock.collect(blocksToCollect).then(() => {
      console.log(`I have collected ${blocksToCollect.length} ${itemName}`);
    }).catch((error) => {
      console.error(`I can't collect ${blocksToCollect.length} ${itemName}, because ${error}`);
      return 0;
    });
    return blocksToCollect.length;
  }
}

module.exports = DigService;
