class BotService {
  constructor(bot) {
    this.bot = bot;
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
    return `[Bot Status] Health: ${status.health} ❤ | ` +
           `Food: ${status.food} 🍖 | ` +
           `Position: ${status.position.x.toFixed(1)}, ${status.position.y.toFixed(1)}, ${status.position.z.toFixed(1)} | ` +
           `XP: ${status.experience.level} (${status.experience.progress * 100}%) | ` +
           `Hold Item: ${status.holdItem} | ` +
           `Quick Bar Slot: ${status.quickBarSlot} | ` +
           `Mode: ${status.gameMode}`;
  }

  getVersion() {
    return this.version;
  }

  getHelp() {
    return [
      '=== Bot Commands ===',
      '/bot status - Show bot status',
      '/bot version - Show bot version',
      '/bot help - Show this help message'
    ];
  }
}

module.exports = BotService;
