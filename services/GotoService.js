const { GoalBlock, GoalNear, GoalXZ, GoalY, GoalNearXZ } = require('mineflayer-pathfinder').goals;

class GotoService {
  static RANGE_GOAL = 1;
  static DEFAULT_PRIORITY = 0;
  static DEFAULT_RANGE = 1;
  static DEFAULT_TIMEOUT = 30000; // 30 seconds

  constructor(bot) {
    this.bot = bot;
    this.movements = this.bot.pathfinder.getMovements();
    this.currentGoal = null;
    this.timeout = null;
  }

  /**
   * Move to a specific block coordinate
   * @param {number} x - Target X coordinate
   * @param {number} y - Target Y coordinate
   * @param {number} z - Target Z coordinate
   * @param {Object} [options] - Additional options
   * @param {number} [options.range=1] - Range to consider as reached
   * @param {number} [options.timeout=30000] - Timeout in ms
   * @param {boolean} [options.lookAtTarget=true] - Whether to look at the target after moving
   * @returns {Promise<boolean>} - Whether the movement was successful
   */
  async goToBlock(x, y, z, { range, timeout, lookAtTarget = true } = {}) {
    try {
      if (timeout) this._setTimeout(timeout);
      if (x && y && z && range) {
        const goal = new GoalNear(x, y, z, range);
        await this.bot.pathfinder.goto(goal, true).then(() => {
          console.log(`I have arrived at the target at ${x}, ${y}, ${z}`);
          return true;
        }).catch((err) => {
          console.error(`Error moving to target: ${err}`);
          return false;
        });
      } else if (x && y && z) {
        const goal = new GoalBlock(x, y, z);
        await this.bot.pathfinder.goto(goal, true).then(() => {
          console.log(`I have arrived at the target at ${x}, ${y}, ${z}`);
          return true;
        }).catch((err) => {
          console.error(`Error moving to target: ${err}`);
          return false;
        });
      } else if (x && z) {
        const goal = new GoalXZ(x, z);
        await this.bot.pathfinder.goto(goal, true).then(() => {
          console.log(`I have arrived at the target at ${x}, ${z}`);
          return true;
        }).catch((err) => {
          console.error(`Error moving to target: ${err}`);
          return false;
        });
      } else if (y) {
        const goal = new GoalY(y);
        await this.bot.pathfinder.goto(goal, true).then(() => {
          console.log(`I have arrived at the target at y: ${y}`);
          return true;
        }).catch((err) => {
          console.error(`Error moving to target: ${err}`);
          return false;
        });
      } else {
        console.error('Invalid move parameters');
        return false;
      }
      
      if (lookAtTarget && (x && y && z)) {
        await this.bot.lookAt(new this.bot.vec3(x, y, z));
      }
      
      if (timeout) this._clearTimeout();
      return true;
    } catch (error) {
      this._clearTimeout();
      console.error('Error moving to block:', error);
      return false;
    }
  }

  /**
   * Move to a specific XZ coordinate
   * @param {number} x - Target X coordinate
   * @param {number} z - Target Z coordinate
   * @param {Object} [options] - Additional options
   * @param {number} [options.range=1] - Range to consider as reached
   * @param {number} [options.timeout=30000] - Timeout in ms
   * @param {boolean} [options.lookAtTarget=true] - Whether to look at the target after moving
   * @returns {Promise<boolean>} - Whether the movement was successful
   */
  async goToXZ(x, z, { range = GotoService.DEFAULT_RANGE, timeout = GotoService.DEFAULT_TIMEOUT, lookAtTarget = true } = {}) {
    try {
      if (timeout) this._setTimeout(timeout);
      const goal = new GoalNearXZ(x, z, range);
      this.currentGoal = goal;
      
      await this.bot.pathfinder.goto(goal, true);
      if (lookAtTarget) await this.bot.lookAt(new this.bot.vec3(x, this.bot.entity.position.y, z));
      if (timeout) this._clearTimeout();
      return true;
    } catch (error) {
      this._clearTimeout();
      console.error('Error moving to XZ:', error);
      return false;
    }
  }

  /**
   * Move to a specific Y level
   * @param {number} y - Target Y coordinate
   * @param {Object} [options] - Additional options
   * @param {number} [options.timeout=30000] - Timeout in ms
   * @returns {Promise<boolean>} - Whether the movement was successful
   */
  async goToY(y, { timeout = GotoService.DEFAULT_TIMEOUT } = {}) {
    try {
      this._setTimeout(timeout);
      const goal = new GoalY(y, true); // true = check if the block is safe
      this.currentGoal = goal;
      
      await this.bot.pathfinder.goto(goal, true);
      this._clearTimeout();
      return true;
    } catch (error) {
      this._clearTimeout();
      console.error('Error moving to Y level:', error);
      return false;
    }
  }

  /**
   * Stop the current movement
   */
  stop() {
    this.bot.pathfinder.stop();
    this._clearTimeout();
  }

  /**
   * Check if the bot is currently moving
   * @returns {boolean} - Whether the bot is moving
   */
  isMoving() {
    return this.bot.pathfinder.isMoving();
  }

  /**
   * Set movement options
   * @param {Object} options - Movement options
   * @param {boolean} [options.canDig] - Whether the bot can dig blocks
   * @param {boolean} [options.canOpenDoors] - Whether the bot can open doors
   * @param {boolean} [options.allowParkour] - Whether the bot can perform parkour
   * @param {boolean} [options.allowSprinting] - Whether the bot can sprint
   */
  setMovementOptions({ canDig, canOpenDoors, allowParkour, allowSprinting }) {
    if (canDig !== undefined) this.movements.canDig = canDig;
    if (canOpenDoors !== undefined) this.movements.canOpenDoors = canOpenDoors;
    if (allowParkour !== undefined) this.movements.allowParkour = allowParkour;
    if (allowSprinting !== undefined) this.movements.allowSprinting = allowSprinting;
  }

  /**
   * Set a timeout for the current movement
   * @private
   * @param {number} timeout - Timeout in ms
   */
  _setTimeout(timeout) {
    this._clearTimeout();
    this.timeout = setTimeout(() => {
      this.stop();
      console.error('Movement timed out');
    }, timeout);
  }

  /**
   * Clear the current timeout
   * @private
   */
  _clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

module.exports = GotoService;
