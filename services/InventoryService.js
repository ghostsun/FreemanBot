class InventoryService {
  constructor() {
    this.equippedItem = null;
  }

  // List all items in the bot's inventory
  listItems(bot) {
    const items = [];
    for (let solt = 0; solt < bot.inventory.slots.length; solt++) {
      const item = bot.inventory.slots[solt];
      if (item) {
        items.push({
          slot: solt,
          name: item.name,
          displayName: item.displayName,
          count: item.count,
          type: item.type,
          metadata: item.metadata
        });
      }
    }
    return items;
  }

  // Find items by name in the bot's inventory
  findItems(bot, itemName, count = 1) {
    const foundItems = [];
    
    for (const item of bot.inventory.items()) {
      if (item.name.includes(itemName) || 
          item.displayName.includes(itemName)) {
        foundItems.push({
          name: item.name,
          displayName: item.displayName,
          count: item.count,
          type: item.type,
          metadata: item.metadata
        });
        
        if (foundItems.length >= count) {
          break;
        }
      }
    }
    
    return foundItems.slice(0, count);
  }

  // Equip an item by name
  async equipItem(bot, itemName) {
    const item = this.findItems(bot, itemName, 1)[0];
    if (!item) {
      throw new Error(`Item not found: ${itemName}`);
    }

    // Find the item in the inventory
    const inventoryItem = bot.inventory.items().find(i => 
      i.name === item.name && i.metadata === item.metadata
    );

    if (!inventoryItem) {
      throw new Error(`Could not find item in inventory: ${itemName}`);
    }

    // Equip the item
    await bot.equip(inventoryItem, 'hand');
    this.equippedItem = item;
    return item;
  }

  // Unequip currently equipped item
  async unequipItem(bot) {
    if (!this.equippedItem) {
      throw new Error('No item is currently equipped');
    }
    
    await bot.unequip('hand');
    const unequipped = this.equippedItem;
    this.equippedItem = null;
    return unequipped;
  }

  // Get currently equipped item
  getEquippedItem() {
    return this.equippedItem;
  }
}

module.exports = InventoryService;
