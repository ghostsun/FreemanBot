const { GoalBlock } = require('mineflayer-pathfinder').goals;
const { CONTAINER_TYPES, CAN_BE_OPEN_ITEMS, OPEN_RANGE_GOAL } = require('../utils/constants');
const MoveService = require('./moveService');
const { Vec3 } = require('vec3')

class DepositService {
  moveService = new MoveService();
  
  /**
   * Deposit items from bot's inventory to a container
   * @param {object} bot - The bot instance
   * @param {string} itemName - Name of the item to deposit
   * @param {number} count - Number of items to deposit
   * @param {number} x - X coordinate of the container
   * @param {number} y - Y coordinate of the container
   * @param {number} z - Z coordinate of the container
   * @returns {Promise<boolean>} - True if deposit was successful
   */
  async deposit(bot, itemName, count, x, y, z) {
    try {
      // Find the item in bot's inventory
      const itemsCount = await this.findItemCount(bot, itemName);
      
      if (itemsCount < 1) {
        console.error(`I don't have any ${itemName} in my inventory.`);
        return false;
      }

      console.log(`I have ${itemsCount} ${itemName} in my inventory.`);

      // 判断是否在容器附近
      if (!(bot.entity.position.distanceTo(new Vec3(x, y, z)) < OPEN_RANGE_GOAL)) {
        await this.moveService.moveTo(bot, x, y, z, true, OPEN_RANGE_GOAL);
      }

      // Make sure we don't try to deposit more than we have
      const depositCount = Math.min(count || itemsCount, itemsCount);
      
      const container = { position: { x, y, z } };
      const containerWindow = await this.openContainer(bot, container);
      if (!containerWindow) {
        console.error(`I can't open the container at ${container.position.x}, ${container.position.y}, ${container.position.z}`);
        return false;
      }

      // Deposit the items
      const success = await this.depositItems(bot, containerWindow, itemName, depositCount);
      
      // Close the container
      await bot.closeWindow(containerWindow);
      return success;
    } catch (error) {
      console.error('Error in deposit service:', error);
      return false;
    }
  }

  /**
   * Open the container
   * @private
   */
  async openContainer(bot, container) {
    const containerBlock = bot.blockAt(
      new Vec3(
        container.position.x,
        container.position.y,
        container.position.z
      )
    );
    
    if (!containerBlock || !CAN_BE_OPEN_ITEMS.includes(containerBlock.name)) {
      console.error(`Container block not found or not openable: ${containerBlock?.name}`);
      return null;
    }
    
    return await bot.openContainer(containerBlock);
  }

  /**
   * Deposit items into the container
   * @private
   */
  async depositItems(bot, containerWindow, itemName, count) {
    try {
      // Find all items of the same type in bot's inventory
      const items = bot.inventory.items();
      let deposited = 0;
      // 遍历items，放入容器指定数量的type等于 itemName 的物品
      for (const item of items) {
        if (item.name === itemName) {
          const itemsToDeposit = Math.min(count, item.count);
          console.log(`Depositing ${itemsToDeposit} ${item.name} into container`);
          await containerWindow.deposit(item.type, null, itemsToDeposit).then(() => {
            deposited += itemsToDeposit;
            count -= itemsToDeposit;
          }).catch((error) => {
            console.error(`Failed to deposit ${item.name}: ${error}`);
          });
          if (count <= 0) break;
        }
      }
      console.log(`Deposited ${deposited} ${itemName} into container`);
      if (count > 0){ 
        console.error(`Not enough ${itemName} to deposit`);
        return false; 
      }
      return true;
    } catch (error) {
      console.error('Error depositing items:', error);
      return false;
    }
  }

  /**
   * Find count of an item in bot's inventory
   * @private
   */
  async findItemCount(bot, itemName) {
    const items = bot.inventory.items();
    return items.filter(item => item.name === itemName).reduce((acc, item) => acc + item.count, 0);
  }
}

module.exports = DepositService;
