# Copilot Instructions for FreemanBot

## Project Overview
- **FreemanBot** is a Minecraft automation bot built with [mineflayer](https://github.com/PrismarineJS/mineflayer) and related plugins.
- The bot automates farming, navigation, and inventory management in a defined field area, responding to in-game chat commands from a designated "boss" user.
- Configuration is loaded from `config/server.yaml` via a singleton config manager in `utils/config.js`.

## Key Components
- `main.js`: Main entry point. Handles bot creation, command parsing, pathfinding, farming logic, and chat interactions.
- `utils/config.js`: Loads and provides access to YAML config. Use `config.get(key)` for nested keys (e.g., `host.host`).
- `config/server.yaml`: All runtime settings (server, bot, pathfinding, debug, field geometry).
- `doc/note.md`: Documents field coordinates and chest locations for farming tasks.

## Developer Workflows
- **Start the bot:** `node main.js` (no build step required)
- **Configuration:** Edit `config/server.yaml` for server/bot settings. Reload bot to apply changes.
- **Dependencies:** Managed via `package.json`. Use `npm install` to set up.
- **Testing:** No formal test suite; use the `test` script to launch the bot for manual testing.

## Project-Specific Patterns
- **Command Handling:**
  - All in-game commands are parsed in `main.js` via the `chat` event.
  - Only the user specified as `bossName` in config can control the bot.
  - Supported commands: `goto`, `collect`, `find`, `care wheat`, `open`, `get`, movement/vehicle controls, and farming tasks (`plow`, `harvestingWheat`, etc.).
- **Field Geometry:**
  - Field and chest coordinates are hardcoded in `main.js` and documented in `doc/note.md`.
  - Farming logic (harvest, plow, plant) iterates over these coordinates.
- **Debugging:**
  - Set `runningLevel: debug` in config for verbose logging.
  - The bot can run a 3D viewer on port 3000 using `prismarine-viewer`.

## Integration & Conventions
- **External Plugins:** Uses `mineflayer-pathfinder` for navigation and `prismarine-viewer` for visualization.
- **Config Access:** Always use the singleton `config` object for settings.
- **No async/await in event handlers** unless necessary; prefer callbacks for mineflayer events.
- **Chinese/English comments**: Some comments and messages are bilingual for clarity.

## Examples
- To move the bot: `/tell <bot> goto -6 63 167`
- To harvest wheat: `/tell <bot> care wheat`
- To open a chest: `/tell <bot> open chest`

## Key Files
- `main.js`, `utils/config.js`, `config/server.yaml`, `doc/note.md`

---
_Keep instructions concise and up-to-date. Update this file if project structure or conventions change._
