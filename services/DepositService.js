const { GoalBlock } = require('mineflayer-pathfinder').goals;
const { CONTAINER_TYPES, CAN_BE_OPEN_ITEMS } = require('../utils/constants');

class DepositService {
  /**
   * Deposit items from bot's inventory to a container
   * @param {object} bot - The bot instance
   * @param {string} itemName - Name of the item to deposit
   * @param {number} count - Number of items to deposit
   * @param {object} container - The container block to deposit into
   * @returns {Promise<boolean>} - True if deposit was successful
   */
  async deposit(bot, itemName, count, container) {
    try {
      // Find the item in bot's inventory
      const item = this.findItemInInventory(bot, itemName);
      if (!item) {
        bot.chat(`I don't have any ${itemName} in my inventory.`);
        return false;
      }

      // Make sure we don't try to deposit more than we have
      const depositCount = Math.min(count || item.count, item.count);
      
      // Go to the container
      await this.goToContainer(bot, container);
      
      // Open the container
      const containerWindow = await this.openContainer(bot, container);
      if (!containerWindow) {
        bot.chat(`I can't open the ${container.name} at ${container.position.x}, ${container.position.y}, ${container.position.z}`);
        return false;
      }

      // Deposit the items
      const success = await this.depositItems(bot, containerWindow, item.type, depositCount);
      
      // Close the container
      await bot.closeWindow(containerWindow);
      
      if (success) {
        bot.chat(`Deposited ${depositCount} ${itemName} into ${container.name}.`);
      } else {
        bot.chat(`Failed to deposit ${itemName} into ${container.name}.`);
      }
      
      return success;
    } catch (error) {
      console.error('Error in deposit service:', error);
      bot.chat(`Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Find item in bot's inventory
   * @private
   */
  findItemInInventory(bot, itemName) {
    const items = bot.inventory.items();
    const item = items.find(i => i.name === itemName);
    return item || null;
  }

  /**
   * Make bot go to the container
   * @private
   */
  async goToContainer(bot, container) {
    const goal = new GoalBlock(
      container.position.x,
      container.position.y,
      container.position.z
    );
    
    await bot.pathfinder.goto(goal);
  }

  /**
   * Open the container
   * @private
   */
  async openContainer(bot, container) {
    const containerBlock = bot.blockAt(
      new bot.registry.Vec3(
        container.position.x,
        container.position.y,
        container.position.z
      )
    );
    
    if (!containerBlock || !CAN_BE_OPEN_ITEMS.includes(containerBlock.name)) {
      return null;
    }
    
    return await bot.openContainer(containerBlock);
  }

  /**
   * Deposit items into the container
   * @private
   */
  async depositItems(bot, containerWindow, itemType, count) {
    try {
      const item = bot.inventory.items().find(i => i.type === itemType);
      if (!item) return false;

      // Calculate how many slots we need to deposit
      const itemsToDeposit = Math.min(count, item.count);
      
      // Deposit the items
      await bot.transfer({
        window: containerWindow,
        itemType: itemType,
        metadata: null,
        count: itemsToDeposit
      });
      
      return true;
    } catch (error) {
      console.error('Error depositing items:', error);
      return false;
    }
  }
}

module.exports = DepositService;
