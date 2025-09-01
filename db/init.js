const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/freeman_bot.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);

// Create tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    position_z REAL NOT NULL,
    length INTEGER NOT NULL,
    width INTEGER NOT NULL,
    plant TEXT NOT NULL,
    chest_x REAL NOT NULL,
    chest_y REAL NOT NULL,
    chest_z REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Create trigger to update updated_at timestamp
db.prepare(`
  CREATE TRIGGER IF NOT EXISTS update_field_timestamp
  AFTER UPDATE ON fields
  BEGIN
    UPDATE fields SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`).run();

// Close the database connection
// db.close();

module.exports = db;
