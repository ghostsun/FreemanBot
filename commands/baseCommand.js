class Command {
  constructor(name, description, usage, bot) {
    this.name = name;
    this.description = description || 'No description available';
    this.usage = usage || '';
    this.bot = bot;
  }

  async execute(args, username) {
    throw new Error('Execute method must be implemented by subclasses');
  }

  sendUsage(username) {
    if (this.bot) {
      this.bot.chat(`Usage: ${this.name} ${this.usage}`);
    } else {
      console.log(`Usage: ${this.name} ${this.usage}`);
    }
  }
}

module.exports = Command;
