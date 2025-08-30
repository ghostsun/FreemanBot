const Command = require('../baseCommand');
const InventoryService = require('../../services/InventoryService');

class InventoryCommand extends Command {
  constructor() {
    super(
      'inventory',
      'Manage bot inventory',
      'inventory <command> [args]\n' +
      '  items - List all items in inventory\n' +
      '  find <itemName> [count] - Find items by name\n' +
      '  equip <itemName> - Equip an item\n' +
      '  unequip - Unequip current item'
    );
    
    this.inventoryService = new InventoryService();
  }

  async execute(args, username, bot) {
    if (args.length === 0) {
      console.log(this.usage);
      return;
    }

    const subCommand = args[0].toLowerCase();
    const subArgs = args.slice(1);

    try {
      switch (subCommand) {
        case 'items':
          await this.handleItems(bot);
          break;
        case 'find':
          await this.handleFind(subArgs, bot);
          break;
        case 'equip':
          await this.handleEquip(subArgs, bot);
          break;
        case 'unequip':
          await this.handleUnequip(bot);
          break;
        default:
          console.log(`Unknown subcommand: ${subCommand}\n${this.usage}`);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  async handleItems(bot) {
    const items = this.inventoryService.listItems(bot);
    if (items.length === 0) {
      console.log('Inventory is empty');
      return;
    }
    
    console.log('Inventory items:');
    items.forEach(item => {
      console.log(`- ${item.name} -- ${item.displayName} x${item.count} (Slot: ${item.slot})`);
    });
  }

  async handleFind(args, bot) {
    if (args.length === 0) {
      console.log('Usage: inventory find <itemName> [count]');
      return;
    }

    const itemName = args[0];
    const count = args[1] ? parseInt(args[1]) : 1;

    if (isNaN(count) || count < 1) {
      console.log('Count must be a positive number');
      return;
    }

    const items = this.inventoryService.findItems(bot, itemName, count);
    if (items.length === 0) {
      console.log(`No items found matching: ${itemName}`);
      return;
    }

    console.log(`Found ${items.length} item(s) matching "${itemName}":`);
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.displayName || item.name} x${item.count}`);
    });
  }

  async handleEquip(args, bot) {
    if (args.length === 0) {
      console.log('Usage: inventory equip <itemName>');
      return;
    }

    const itemName = args.join(' ');
    try {
      const item = await this.inventoryService.equipItem(bot, itemName);
      console.log(`Equipped: ${item.displayName || item.name}`);
    } catch (error) {
      console.error(`Failed to equip item: ${error.message}`);
    }
  }

  async handleUnequip(bot) {
    try {
      const item = await this.inventoryService.unequipItem(bot);
      console.log(`Unequipped: ${item.displayName || item.name}`);
    } catch (error) {
      console.error(`Failed to unequip item: ${error.message}`);
    }
  }
}

module.exports = InventoryCommand;
