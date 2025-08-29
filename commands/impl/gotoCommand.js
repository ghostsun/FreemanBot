const Command = require('../baseCommand');
const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow, GoalBreakBlock } = require('mineflayer-pathfinder').goals

class GotoCommand extends Command {
	constructor() {
		super(
			'goto',
			'Move to specified coordinates',
			'goto <x> [y] [z] | goto <direction>'
		);
	}

   async execute(args, username, bot) {
	       if (args.length === 1) {
		       // goto y
		       const y = parseInt(args[0]);
		       if (isNaN(y)) {
					console.error('y is NaN');
					return
			   }
			   await bot.pathfinder.goto(new GoalY(y)).then(() => {
					console.log(`Arrived at ${bot.entity.position}`);
				})
				return
	       } else if (args.length === 2) {
		       // goto x z
		       const x = parseInt(args[0]);
		       const z = parseInt(args[1]);
		       if (isNaN(x) || isNaN(z)) {
			       console.error('x or z is NaN');
			       return;
		       }
		       await bot.pathfinder.goto(new GoalXZ(x, z)).then(() => {
					console.log(`Arrived at ${bot.entity.position}`);
				})
				return
	       } else if (args.length === 3) {
		       // goto x y z
		       const x = parseInt(args[0]);
		       const y = parseInt(args[1]);
		       const z = parseInt(args[2]);
		       if (isNaN(x) || isNaN(y) || isNaN(z)) {
			       console.error('x, y, or z is NaN');
			       return;
		       }
		       await bot.pathfinder.goto(new GoalBlock(x, y, z)).then(() => {
					console.log(`Arrived at ${bot.entity.position}`);
			   })
			   return
	       } else if (args.length === 4) {
		       // goto x y z range
		       const x = parseInt(args[0]);
		       const y = parseInt(args[1]);
		       const z = parseInt(args[2]);
		       const range = parseInt(args[3]);
		       if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(range)) {
			       console.error('x, y, z, or range is NaN');
			       return;
		       }
		       await bot.pathfinder.goto(new GoalNear(x, y, z, range)).then(() => {
					console.log(`Arrived at ${bot.entity.position}`);
			   })
			   return
	       } else {
		       console.error(`Invalid arguments. Usage: goto <x> [y] [z] | goto <direction>`);
	       }
       }
}

module.exports = GotoCommand;
