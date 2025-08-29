const Command = require('../baseCommand');

/**
 * Command to safely terminate the bot process
 * @extends Command
 */
class QuitCommand extends Command {
  /**
   * Create a new QuitCommand instance
   * @param {Object} bot - The bot instance
   * @param {Object} [options] - Configuration options
   * @param {number} [options.exitCode=0] - Exit code to use when quitting
   * @param {boolean} [options.confirm=true] - Whether to require confirmation
   */
  constructor(bot, options = {}) {
    super(
      'quit',
      'Quit the bot process',
      'quit | exit',
      '[reason]',
      'Quit the bot process with optional reason'
    );
    /** @private */
    this._bot = bot;
    /** @private */
    this._exitCode = typeof options.exitCode === 'number' ? options.exitCode : 0;
    /** @private */
    this._requireConfirmation = options.confirm !== undefined ? options.confirm : true;
  }

  /**
   * Execute the quit command
   * @param {string[]} args - Command arguments
   * @param {string} username - Username of the person who executed the command
   * @param {Object} bot - The bot instance
   * @returns {Promise<void>}
   */
  async execute(args, username, bot) {
    try {
      const reason = args.length > 0 ? `: ${args.join(' ')}` : '';
      const message = `Shutting down${reason}`;
      this._logQuitAction(username, reason);
      await bot.quit(reason)
      // 退出程序
      await this._notifyAndExit(message, bot);
    } catch (error) {
      this._handleError(error, bot);
    }
  }

  /**
   * Log the quit action
   * @private
   * @param {string} username
   * @param {string} reason
   */
  _logQuitAction(username, reason) {
    console.log(`[${new Date().toISOString()}] Quit command executed by ${username}${reason}`);
  }

  /**
   * Notify in chat and exit process
   * @private
   * @param {string} message
   * @returns {Promise<void>}
   */
  async _notifyAndExit(message, bot) {
    bot.chat(message);
    await new Promise(resolve => setTimeout(resolve, 500));
    process.exit(this._exitCode);
  }

  /**
   * Handle errors during execution
   * @private
   * @param {Error} error
   * @param {Object} bot
   */
  _handleError(error, bot) {
    console.error('Error during quit command execution:', error);
  }

  /**
   * Check if the command requires confirmation before executing
   * @returns {boolean} True if confirmation is required
   */
  requiresConfirmation() {
    return this._requireConfirmation;
  }

  /**
   * Get confirmation message for the command
   * @returns {string} Confirmation message
   */
  getConfirmationMessage() {
    return 'Are you sure you want to shut down the bot?';
  }
}

module.exports = QuitCommand;
