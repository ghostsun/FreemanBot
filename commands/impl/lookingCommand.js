const Command = require('../baseCommand');

class LookingCommand extends Command {
	constructor() {
		super(
			'looking',
			'Change the bot\'s view direction',
			'looking <direction> | looking <yaw> <pitch>'
		);
	}

async execute(args, username, bot) {
		if (args.length === 1) {
			const direction = args[0].toLowerCase();
			console.log('Direction:', direction);
			switch (direction) {
				case 'north':
					bot.look(Math.PI / 2, 0);
					break;
				case 'south':
					bot.look((3 * Math.PI) / 2, 0);
					break;
				case 'east':
					bot.look(0, 0);
					break;
				case 'west':
					bot.look(Math.PI, 0);
					break;
				default:
					if (!isNaN(parseFloat(direction))) {
						bot.look((parseFloat(direction) * Math.PI) / 180, 0);
					} else {
						console.error('Invalid direction');
					}
			}
		} else if (args.length === 2) {
			const [yaw, pitch] = args.map(Number);
			if (!isNaN(yaw) && !isNaN(pitch)) {
				bot.look(
					(yaw * Math.PI) / 180,
					(pitch * Math.PI) / 180
				);
			} else {
				console.error('Yaw or pitch is NaN');
			}
		} else {
			console.error('Invalid arguments');
		}
	}
}

module.exports = LookingCommand;
