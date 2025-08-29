class MoveService {
  static RANGE_GOAL = 1

  constructor(bot) {
    this.bot = bot
    this.defaultMove = new Movements(bot)
    this.defaultMove.allowSprinting = false
    this.defaultMove.allowParkour = false
    this.bot.pathfinder.setMovements(this.defaultMove)
  }

  async moveTo(x, y, z, near = false, range = MoveService.RANGE_GOAL) {
    if (x && y && z && !near) {
        await this.bot.pathfinder.goto(new GoalBlock(x, y, z)).then(() => {
            console.log(`I have arrived at the target at ${x}, ${y}, ${z}`)
        }).catch((err) => {
            console.error(`Error moving to target: ${err}`)
        })
    } else if (x && y && z && near) {
        await this.bot.pathfinder.goto(new GoalNear(x, y, z, range)).then(() => {
            console.log(`I have arrived at the target near ${x}, ${y}, ${z}`)
        }).catch((err) => {
            console.error(`Error moving to target near: ${err}`)
        })
    } else if (x && z) {
        await this.bot.pathfinder.goto(new GoalXZ(x, z)).then(() => {
            console.log(`I have arrived at the target at ${x}, ${z}`)
        }).catch((err) => {
            console.error(`Error moving to target: ${err}`)
        })
    } else if (y) {
        await this.bot.pathfinder.goto(new GoalY(y)).then(() => {
            console.log(`I have arrived at the target at y: ${y}`)
        }).catch((err) => {
            console.error(`Error moving to target: ${err}`)
        })
    } else {
        console.error('Invalid move parameters')
    }
  }
}

module.exports = MoveService