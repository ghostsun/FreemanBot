const Command = require('../baseCommand');
const BotService = require('../../services/botService');

class BotCommand extends Command {
  constructor() {
    super('bot', 'Manage bot settings and information', '[status|help|version]');
    this.botService = new BotService();
  }

  async execute(args, username, bot) {
    const [subCommand] = args;

    switch (subCommand) {
      case 'status':
        return this.showStatus(bot, username);
      case 'version':
        return this.showVersion(bot, username);
      case 'help':
      default:
        return this.showHelp(bot, username);
    }
  }

  showStatus(bot, username) {
    const status = this.botService.getStatus(bot);
    console.log(this.botService.formatStatus(status));
  }

  showVersion(bot, username) {
    console.log(`[Bot] Current version: ${this.botService.getVersion()}`);
  }

  showHelp(bot, username) {
    this.botService.getHelp().forEach(line => console.log(line));
  }
}

module.exports = BotCommand;
