class InventoryService {
  constructor() {
    this.equippedItem = null;
  }

  // List all items in the bot's inventory
  listItems(bot, itemName, exactMatch = false) {
    const items = [];
    for (let solt = 0; solt < bot.inventory.slots.length; solt++) {
      const item = bot.inventory.slots[solt];
      if (item) {
        if (itemName && (exactMatch ? item.name === itemName : item.name.includes(itemName) || item.displayName.includes(itemName))) {
          items.push({
            slot: solt,
            name: item.name,
            displayName: item.displayName,
            count: item.count,
            type: item.type,
            metadata: item.metadata
          });
          console.log(`${item.name} -- ${item.displayName}, x${item.count}, ${item.type}, ${item.metadata} (Slot: ${solt})`);
        } else if (!itemName) {
          items.push({ slot: solt, name: item.name, displayName: item.displayName, count: item.count, type: item.type, metadata: item.metadata });
          console.log(`${item.name} -- ${item.displayName}, x${item.count}, ${item.type}, ${item.metadata} (Slot: ${solt})`);
        }
      }
    }
    return items;
  }

  async findItem(bot, itemName, exactMatch = false) {
      console.log(`Looking for item: ${itemName} ${exactMatch ? 'with exact match' : 'with partial match'}`);
      const items = bot.inventory.items();
      for (const item of items) {
        console.log(`${item.name} -- ${item.displayName}, x${item.count}, ${item.type}, ${item.metadata}`);
        if (exactMatch ? item.name === itemName : item.name.includes(itemName) || item.displayName.includes(itemName)) {
          console.log(`Found item: ${item.name} -- ${item.displayName}, x${item.count}, ${item.type}, ${item.metadata}`);
          return item;
        }
      }
      return null;
    }

  // Equip an item by name
  async equipItem(bot, itemName) {
      const item = this.findItem(bot, itemName, true);
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

  async hasItem(bot, itemName, count = 1) {
      const items = bot.inventory.items();
      let itemCount = 0;
      for (const item of items) {
        if (item.name === itemName) {
          itemCount += item.count;
        }
      }
      return itemCount >= count;
    }

  async itemCount(bot, itemName) {
      const items = bot.inventory.items();
      let itemCount = 0;
      for (const item of items) {
        if (item.name === itemName) {
          itemCount += item.count;
        }
      }
      return itemCount
    }
  }

module.exports = InventoryService;
