const readline = require('readline');

class ConsoleManager {
  constructor() {
    try {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'bot> '
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ConsoleManager:', error);
      this.initialized = false;
    }
  }

  setPrompt(promptText) {
    this.promptText = promptText;
    this.rl.setPrompt(promptText);
  }

  log(message) {
    // Clear the current line
    readline.clearLine(process.stdout, 0);
    // Move cursor to the start of the line
    readline.cursorTo(process.stdout, 0);
    // Print the message
    console.log(message);
    // Show the prompt again if initialized
    if (this.initialized) {
      this.rl.prompt(true);
    } else {
      process.stdout.write('bot> ');
    }
  }

  error(message) {
    this.log(`[ERROR] ${message}`);
  }

  debug(message) {
    if (process.env.DEBUG === 'true') {
      this.log(`[DEBUG] ${message}`);
    }
  }

  prompt() {
    if (this.initialized) {
      this.rl.prompt();
    } else {
      process.stdout.write('bot> ');
    }
  }

  onLine(callback) {
    this.rl.on('line', (line) => {
      callback(line);
      this.prompt();
    });
  }

  onClose(callback) {
    this.rl.on('close', callback);
  }
}

// Create a singleton instance
const consoleManager = new ConsoleManager();

// Export the instance
module.exports = consoleManager;
