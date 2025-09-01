class BotService {
  constructor() {
    this.version = '1.0.0';
  }

  getStatus(bot) {
    return {
      health: bot.health,
      food: bot.food,
      position: bot.entity.position,
      experience: bot.experience,
      holdItem: bot.heldItem,
      quickBarSlot: bot.quickBarSlot,
      gameMode: bot.game.gameMode
    };
  }

  formatStatus(status) {
    // Log status to console using consoleManager
    const statusText = [
      '=== Bot Status ===',
      `Health: ${status.health}`,
      `Food: ${status.food}`,
      `Position: ${status.position.x.toFixed(2)}, ${status.position.y.toFixed(2)}, ${status.position.z.toFixed(2)}`,
      `Experience: Level ${status.experience.level} (${status.experience.progress * 100}%)`,
      `Hold Item: ${status.holdItem}`,
      `Quick Bar Slot: ${status.quickBarSlot}`,
      `Game Mode: ${status.gameMode}`,
      `Bot Version: ${this.version}`
    ].join('\n');

    consoleManager.log(statusText);
    return statusText;
  }

  getVersion() {
    return this.version;
  }

  getHelp() {
    const commands = [
      { name: 'status', description: 'Show bot status' },
      { name: 'version', description: 'Show bot version' },
      { name: 'help', description: 'Show this help message' }
    ];

    // Format help text
    const helpText = [
      '=== Available Commands ===',
      ...commands.map(cmd => `  ${cmd.name.padEnd(10)} - ${cmd.description}`),
      '\nType help <command> for more information about a command.'
    ].join('\n');

    consoleManager.log(helpText);
    return { commands };
  }
}

module.exports = BotService;
