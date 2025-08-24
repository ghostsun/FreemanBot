const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

class ConfigManager {
    constructor() {
        this.config = null;
        this.configPath = path.join(__dirname, '../config/server.yaml');
    }

    load() {
        try {
            const fileContents = fs.readFileSync(this.configPath, 'utf8');
            this.config = yaml.load(fileContents);
            
            // Set default values if not specified
            this.config.runningLevel = this.config.runningLevel || 'info';
            
            return this.config;
        } catch (e) {
            console.error('Error loading config file:', e.message);
            process.exit(1);
        }
    }

    get(key) {
        if (!this.config) {
            this.load();
        }
        
        return key.split('.').reduce((obj, k) => 
            (obj && obj[k] !== undefined) ? obj[k] : undefined, this.config);
    }

    // For testing purposes
    setConfigForTesting(config) {
        this.config = config;
    }
}

// Create a singleton instance
const configManager = new ConfigManager();

module.exports = configManager;
