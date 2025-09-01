const { EventEmitter } = require('events');
const path = require('path');

class CommandHandler extends EventEmitter {
  constructor() {
    super();
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    // Instantiate all command modules without bot
    const CommandModules = {
      'goto': require('./impl/gotoCommand'),
      'collect': require('./impl/collectCommand'),
      'looking': require('./impl/lookingCommand'),
      'care': require('./impl/careCommand'),
      'plant': require('./impl/plantCommand'),
      'find': require('./impl/findCommand'),
      'get': require('./impl/getCommand'),
      'deposit': require('./impl/depositCommand'),
      'put': require('./impl/depositCommand'),
      'quit': require('./impl/quitCommand'),
      'exit': require('./impl/quitCommand'),
      'inventory': require('./impl/inventoryCommand'),
      'inv': require('./impl/inventoryCommand'),
      'dig': require('./impl/digCommand'),
      'bot': require('./impl/botCommand')
    };
    for (const [name, CommandClass] of Object.entries(CommandModules)) {
      this.registerCommand(name, new CommandClass());
    }
  }

  registerCommand(name, command) {
    this.commands.set(name, command);
  }

  async handleCommand(username, command, bot) {
    if (username === (bot && bot.username)) return;

    const args = command.trim().split(' ');
    if (args.length < 1) return;
    const commandName = args.shift().toLowerCase();
    
    if (!this.commands.has(commandName)) {
      this.emit('unknownCommand', { username, command: commandName });
      return;
    }

    try {
      await this.commands.get(commandName).execute(args, username, bot);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      this.emit('commandError', { 
        username, 
        command: commandName, 
        error: error.message 
      });
    }
  }
}

module.exports = CommandHandler;
