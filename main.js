const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const collectBlock = require('mineflayer-collectblock').plugin
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow, GoalBreakBlock } = require('mineflayer-pathfinder').goals
const config = require('./utils/config')
const { Vec3 } = require('vec3')
const CommandHandler = require('./commands/commandHandler')
const { FIELDS, PLANT_AND_SEED, CAN_BE_OPEN_ITEMS, plantAndSeed } = require('./utils/constants');
const consoleManager = require('./utils/console');

let commandHandler;

// Global variables
let fields = FIELDS;
const fieldsMap = FIELDS;
const fieldPosition = FIELDS['field1'].position;
const fieldChestPosition = FIELDS['field1'].chest;

// Initialize application
async function initialize() {
  try {
    // Load configuration
    config.load();

    return true;
  } catch (error) {
    console.error('Error initializing application:', error);
    process.exit(1);
  }
}
// Initialize the application and start the bot
initialize()
  .then(() => {
    try {
      // Start the bot after initialization is complete
      startBot();

      // Show initial prompt if console is available
      if (process.stdin.isTTY && consoleManager && typeof consoleManager.prompt === 'function') {
        consoleManager.prompt();
      }
    } catch (error) {
      console.error('Error starting bot:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error(`Failed to initialize application: ${err}`);
    process.exit(1);
  });

function startBot() {
  // Bot configuration
  const options = {
    host: config.get('host.host'),
    port: config.get('host.port'),
    username: config.get('auth.username'),
    // version: config.get('version'),
    auth: 'offline'
  };

  // Create bot instance
  const bot = mineflayer.createBot(options);

  // Load plugins
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(collectBlock);

  // Initialize command handler
  commandHandler = new CommandHandler();

  // Other bot setup code...
}

async function handleCommand(username, command, bot) {
  if (username === 'console') {
    consoleManager.debug(`Executing command: ${command} from ${username}`);
    if (command.startsWith('goto')) {

    }
    commandHandler.handleCommand(username, command, bot);
    return;
  }

  if (command === 'help') {
    const helpText = [
      'Available commands:',
      '  goto [x] <y> [z] [range] - Move to coordinates, range default to 1',
      '  looking <direction> - Look in a direction (north, south, east, west)',
      '  collect <block> - Collect the nearest block of type',
      '  help - Show this help',
      '  exit/quit - Exit the bot'
    ].join('\n');
    consoleManager.log(helpText);
  } else {
    bot.emit('chat', username, command);
  }
}

// Handle command line input if running in TTY
if (process.stdin.isTTY) {
  consoleManager.onLine(async (line) => {
    const command = line.trim();
    if (command) {
      await handleCommand('console', command, bot);
    }
  });

  consoleManager.onClose(() => {
    consoleManager.log('Goodbye!');
    process.exit(0);
  });
}


// Configuration
const bossName = config.get('bossName') // Change this to your Minecraft username
const RANGE_GOAL = config.get('rangeGoal') // 1 block away from the player
// 当前任务
let currentTask = null
let currentStep = 0

// 可以被open的物品数组
const canBeOpenItems = ['chest', 'barrel']


// Debug logging helper
function debugLog(message) {
  if (config.get('runningLevel') === 'debug') {
    consoleManager.debug(message);
  }
}

const options = {
  host: config.get('host.host'), // Change this to the ip you want.
  // host: '192.168.1.88',
  port: config.get('host.port'), // Change this to the port you want.
  username: config.get('bot.username'), // Change this to the username you want.
  auth: config.get('host.auth'), // Change this to the auth you want.
}

const bot = mineflayer.createBot(options)

consoleManager.log('FreemanBot has joined the server!')

const welcome = () => {
  bot.chat('Hi, I am ' + bot.username + ' and I am here to help you!')
}
// Display welcome message and prompt
consoleManager.log('Bot console started. Type "help" for available commands.');

bot.once('spawn', welcome)

bot.once('spawn', () => {
  if (!commandHandler) commandHandler = new CommandHandler();
  mineflayerViewer(bot, { firstPerson: true, port: 3000 }) // Start the viewing server on port 3000

  // Draw the path followed by the bot
  const path = [bot.entity.position.clone()]
  bot.on('move', () => {
    if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
      path.push(bot.entity.position.clone())
      bot.viewer.drawLine('path', path)
      debugLog('bot path update: ' + path[path.length - 1])
    }
  })
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

bot.once('spawn', () => {
  const defaultMove = new Movements(bot)
  defaultMove.allowSprinting = false
  defaultMove.allowParkour = false

  bot.on('path_update', (r) => {
    // console.log(`path update: ${r.path}`)
    const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
    // console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${r.visitedNodes} nodes, ${nodesPerTick} nodes/tick)`)
  })

  bot.on('goal_reached', () => {
    console.log(`I have arrived at ${bot.entity.position}`)
    // bot.chat(`I have arrived at ${bot.entity.position}`)
  })

  bot.on('path_reset', (reason) => {
    console.log(`Path was reset for reason: ${reason}`)
  })


  bot.on('chat', async (username, message) => {
    debugLog(`Message from ${username}: ${message}`)
    const defaultMove = new Movements(bot)
    defaultMove.allowSprinting = false
    defaultMove.allowParkour = false
    bot.pathfinder.setMovements(defaultMove)
    const command = message
    if (username == bot.username || username != bossName) return
    if (config.get('runningLevel') != 'debug') {
      command = message.slice(bot.username.length).trim()
    }

    const target = bot.players[username] ? bot.players[username].entity : null

    consoleManager.log(`My boss ${bossName} is talking to me!`)
    consoleManager.debug(`Command: ${command}`)
    // goto x y z
    if (command.startsWith('goto')
      || command.startsWith('looking')
      || command.startsWith('find')
      || command.startsWith('care')
      || command.startsWith('put')
      || command.startsWith('dig')
      || command.startsWith('bot')) {
      // 调用CommandHandler
      commandHandler.handleCommand(username, command, bot);
    } else if (command.startsWith('open')) {
      const cmd = command.split(' ')
      if (cmd.length === 2) {
        // 判断第二个参数是否在canBeOpenItems中
        if (!canBeOpenItems.includes(cmd[1])) {
          bot.chat(`I don't know any blocks with name ${cmd[1]}.`)
          return
        }
        console.log(`I am going to open the nearest ${cmd[1]}`)
        let openItemPosition = bot.findBlock({
          matching: bot.registry.blocksByName[cmd[1]].id,
          maxDistance: 64
        })
        if (!openItemPosition) {
          bot.chat(`I don't see any ${cmd[1]} nearby.`)
          return
        }
        console.log(`I have found the nearest ${cmd[1]}, my position is ${openItemPosition.position}`)
        // bot.pathfinder.setMovements(defaultMove)
        // bot.pathfinder.setGoal(new GoalNear(openItemPosition.position.x, openItemPosition.position.y, openItemPosition.position.z, RANGE_GOAL))
        bot.pathfinder.goto(new GoalNear(openItemPosition.position.x, openItemPosition.position.y, openItemPosition.position.z, RANGE_GOAL)).then(() => {
          console.log(`I have closed the nearest ${cmd[1]}, my position is ${bot.entity.position}`)
          bot.waitForTicks(10)
          console.log(`Opening the nearest ${cmd[1]}`)
          bot.chat(`Opening the nearest ${cmd[1]}`)
          bot.openContainer(openItemPosition).then((openItem) => {
            items = openItem.containerItems()
            sayItems(items)
            openItem.close()
            console.log(`I have closed the nearest ${cmd[1]}`)
          }).catch((err) => {
            console.error(err)
            bot.chat(`I can't open the nearest ${cmd[1]}`)
          })
        }).catch((err) => {
          console.error(err)
          bot.chat(`I can't go to the nearest ${cmd[1]}`)
        })
        return
      } else {
        bot.chat(`/tell ${username} What's mean ${message} ?`)
        return
      }
    } else if (command.startsWith('get')) {
      commandHandler.handleCommand(username, command, bot)
    } else if (command.startsWith('plant')) {
      const cmd = command.split(' ')
      if (cmd.length === 2) {
        const seedName = cmd[1]
        plant(seedName)
      } else {
        bot.chat(`/tell ${username} What's mean ${message} ?`)
      }
      return
    }

    switch (command) {
      case 'come':
        if (!target) {
          bot.chat(" I don't see you !")
          return
        }

        const p = target.position

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, RANGE_GOAL))
        console.log("Starting to go to your position !")
        break
      case 'stop':
        bot.pathfinder.stop()
        bot.clearControlStates()
        console.log("Stopping !")
        break
      case 'go home':
        bot.quit()
        console.log("Goodbye !")
        process.exit(0)
      case 'forward':
      case 'w':
      case 'W':
        bot.setControlState('forward', true)
        await bot.waitForTicks(2)
        bot.setControlState('forward', false)
        break
      case 'back':
      case 's':
      case 'S':
        bot.setControlState('back', true)
        await bot.waitForTicks(2)
        bot.setControlState('back', false)
        break
      case 'left':
      case 'a':
      case 'A':
        bot.setControlState('left', true)
        await bot.waitForTicks(2)
        bot.setControlState('left', false)
        break
      case 'right':
      case 'd':
      case 'D':
        bot.setControlState('right', true)
        await bot.waitForTicks(2)
        bot.setControlState('right', false)
        break
      case 'stop controls':
        bot.clearControlStates()
        break
      case 'jump':
      case ' ':
        bot.setControlState('jump', true)
        await bot.waitForTicks(2)
        bot.setControlState('jump', false)
        break
      case 'attack':
        entity = bot.nearestEntity()
        if (entity) {
          bot.attack(entity, true)
        } else {
          bot.chat('no nearby entities')
        }
        break
      case 'lookme':
        bot.lookAt(target.position.offset(0, target.height, 0))
        break
      case 'mount':
        entity = bot.nearestEntity((entity) => { return entity.name === 'minecart' })
        if (entity) {
          bot.mount(entity)
        } else {
          bot.chat('no nearby objects')
        }
        break
      case 'dismount':
        bot.dismount()
        break
      case 'move vehicle forward':
        bot.moveVehicle(0.0, 1.0)
        break
      case 'move vehicle backward':
        bot.moveVehicle(0.0, -1.0)
        break
      case 'move vehicle left':
        bot.moveVehicle(1.0, 0.0)
        break
      case 'move vehicle right':
        bot.moveVehicle(-1.0, 0.0)
        break
      case 'tp':
        bot.entity.position.y += 10
        break
      case 'pos':
        bot.chat(bot.entity.position.toString())
        break
      case 'yp':
        bot.chat(`Yaw ${bot.entity.yaw}, pitch: ${bot.entity.pitch}`)
        break
      case 'stopTask':
        stopTask()
        break
      case 'getTask':
        bot.chat(getTask())
        break
      case 'sayItems':
        items = bot.inventory.items()
        sayItems(items)
        break
      case 'watchChest':
        bot.pathfinder.goto(new GoalNear(fieldChestPosition.x, fieldChestPosition.y, fieldChestPosition.z, RANGE_GOAL)).then(async () => {
          console.log(`I have arrived at ${bot.entity.position}`)
          let chestToOpen = bot.findBlock({
            matching: bot.registry.blocksByName['chest'].id,
            maxDistance: 6
          })
          if (!chestToOpen) {
            console.log(`I can't find the chest`)
            bot.chat(`I can't find the chest`)
            return
          }
          console.log(`Opening chest at ${chestToOpen.position}`)
          bot.chat(`Opening chest at ${chestToOpen.position}`)
          const chest = await bot.openContainer(chestToOpen)

          items = chest.containerItems()
          sayItems(items)

          chest.on('updateSlot', (slot, oldItem, newItem) => {
            console.log(`Slot ${slot} updated: ${oldItem} -> ${newItem}`)
          })
          chest.on('close', () => {
            console.log('Chest closed')
          })
          chest.on('open', () => {
            console.log('Chest opened')
          })
        })
        break
      case 'plow':
        plowField()
        break
      default:
        bot.chat('I don\'t understand you !')
        break
    }
    // bot.once('spawn', () => {
    //   // keep your eyes on the target, so creepy!
    //   setInterval(watchTarget, 50)

    //   function watchTarget () {
    //     if (!target) return
    //     bot.lookAt(target.position.offset(0, target.height, 0))
    //   }
    // })

    // const { x: playerX, y: playerY, z: playerZ } = target.position
    // console.log("Player position: " + playerX + ", " + playerY + ", " + playerZ)

    // bot.pathfinder.setMovements(defaultMove)
    // bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
    // console.log("Starting to follow you !")
  })
})

function startTask(task, step = 0) {
  if (currentTask || currentStep !== step) {
    bot.chat(`I am already doing a task: ${currentTask}, step: ${currentStep}`)
    return false
  }
  currentTask = task
  currentStep = step
  return true
}

function stopTask() {
  currentTask = null
  currentStep = 0
  bot.pathfinder.stop()
  bot.clearControlStates()
  return true
}

function getTask() {
  return currentTask
}

function endTask(task) {
  currentTask = null
  currentStep = 0
  return true
}

// 将物品转换为字符串
function itemToString(item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function itemByName(items, name) {
  let item
  let i
  for (i = 0; i < items.length; ++i) {
    item = items[i]
    if (item && item.name === name) return item
  }
  return null
}

function sayItems(items) {
  const output = items.map(itemToString).join(`, `)
  if (output) {
    console.log(output)
    bot.chat(output)
  } else {
    console.log('No items found')
    bot.chat('No items found')
  }
}

// 收获小麦
async function harvestingWheat() {
  try {
    // 先移动到农田西北角
    const defaultMove = new Movements(bot)
    defaultMove.allowSprinting = false
    defaultMove.allowParkour = false
    bot.pathfinder.setMovements(defaultMove)

    // 循环从农田西北角开始遍历农田每一格，并收获每一格上的小麦
    let x = fieldPosition.x
    let z = fieldPosition.z
    while (true) {
      await bot.pathfinder.goto(new GoalXZ(x, z)).then(() => {
        console.log(`I have arrived at ${bot.entity.position}`)
        const wheat = bot.findBlock({
          maxDistance: 1,
          matching: (block) => {
            return block && block.type === bot.registry.blocksByName.wheat.id && block.metadata === 7
          }
        })
        if (wheat) {
          console.log(`Harvesting wheat at ${wheat.position}`)
          bot.dig(wheat).then(() => {
            console.log(`I have harvested wheat at ${bot.entity.position}`)
          })
        }
      })
      const nextPosition = nextFieldBlockPosition(x, z)
      if (!nextPosition) {
        break
      }
      x = nextPosition.x
      z = nextPosition.z
      await bot.waitForTicks(10)
    }
    console.log('Finished harvesting the entire field!');
    bot.chat('Finished harvesting the entire field!')
    stopTask()
    return true;
  } catch (error) {
    console.error('Error during harvesting:', error);
    stopTask()
    return false;
  }
}

// 犁地
function plowField() {
  // 检查随身物品中是否有stone hoe 或者 wooden hoe 或者 iron hoe 或者 diamond hoe 或者 gold hoe
  const items = bot.inventory.items()
  sayItems(items)
  const hoe = items.find(item => {
    return item && (item.type === bot.registry.itemsByName['stone_hoe'].id
      || item.type === bot.registry.itemsByName['wooden_hoe'].id
      || item.type === bot.registry.itemsByName['iron_hoe'].id
      || item.type === bot.registry.itemsByName['diamond_hoe'].id
      || item.type === bot.registry.itemsByName['golden_hoe'].id)
  })
  if (!hoe) {
    console.log(`I don't have a hoe`)
    bot.chat(`I don't have a hoe`)
    return
  }
  // 将hoe装备到手上
  bot.equip(hoe, 'hand').then(() => {
    console.log(`I have equipped a hoe`)
    bot.chat(`I have equipped a hoe`)
  }).catch((error) => {
    console.log(`I can't equip a hoe`)
    bot.chat(`I can't equip a hoe`)
    return
  })
  bot.waitForTicks(10)
  // 先移动到农田西北角
  bot.pathfinder.goto(new GoalXZ(fieldPosition.x, fieldPosition.z)).then(async () => {
    console.log(`I have arrived at ${bot.entity.position}`)
    bot.waitForTicks(10)
    console.log(`Plowing the field`)
    bot.chat(`Plowing the field`)
    // 逐格检查农田每一格土地是否是farmland,如果不是farmland,则犁地
    let x = fieldPosition.x
    let z = fieldPosition.z
    while (true) {
      let landBlockPositions = bot.findBlocks({
        maxDistance: 1,
        matching: (block) => {
          return block && (block.type === bot.registry.blocksByName.grass_block.id
            || block.type === bot.registry.blocksByName.granite.id
            || block.type === bot.registry.blocksByName.dirt.id
            || block.type === bot.registry.blocksByName.dirt_path.id
            || block.type === bot.registry.blocksByName.rooted_dirt.id)
            && block.type !== bot.registry.blocksByName.farmland.id
        }
      })

      // 如果在周边发现了土地，则判断是否为农田，如果不是农田，则犁地
      if (landBlockPositions && landBlockPositions.length > 0) {
        console.log(`I have found needed plow land blocks, my position is ${bot.entity.position}`)
        // 遍历输出landBlocks的坐标
        for (let i = 0; i < landBlockPositions.length; i++) {
          let landBlockPosition = landBlockPositions[i]
          console.log(`Before filter land block ${bot.blockAt(landBlockPosition).name} at ${landBlockPosition}`)
        }

        // 剔除坐标向下取整后，landBlocks Y轴坐标不相同的 和 距离不在一格范围内的 block, 并且block的位置不在farmland范围内
        landBlockPositions = landBlockPositions.filter(block => block.y === (fieldPosition.y - 1)
          && (block.x === Math.floor(bot.entity.position.x) && block.z === Math.floor(bot.entity.position.z)))

        // 遍历输出landBlocks的坐标
        for (let i = 0; i < landBlockPositions.length; i++) {
          let landBlockPosition = landBlockPositions[i]
          console.log(`After filter land block ${bot.blockAt(landBlockPosition).name} at ${landBlockPosition}`)
        }

        // 遍历landBlocks， 对每一格块进行犁地操作
        for (let i = 0; i < landBlockPositions.length; i++) {
          await bot.lookAt(landBlockPositions[i]).then(async () => {
            console.log(`I am facing the land block ${bot.blockAt(landBlockPositions[i]).name} at ${landBlockPositions[i]}`)
            await bot.activateBlock(bot.blockAt(landBlockPositions[i])).then(() => {
              bot.waitForTicks(10)
              console.log(`I have plowed the land ${bot.blockAt(landBlockPositions[i]).name} at ${landBlockPositions[i]}`)
            }).catch(err => {
              console.log(`I can't plow the land, because ${err}`)
              bot.chat(`I can't plow the land, because ${err}`)
              return
            })
            // await bot.useOn(bot.blockAt(landBlockPositions[i]))
            // await bot.waitForTicks(10)
            // console.log(`I have plowed the land ${bot.blockAt(landBlockPositions[i]).name} at ${landBlockPositions[i]}`)
          }).catch((error) => {
            console.log(`I can't face to the land, because ${error}`)
            bot.chat(`I can't face to the land, because ${error}`)
            return
          })
        }
      }
      const nextPosition = nextFieldBlockPosition(x, z)
      if (!nextPosition) {
        break
      }
      x = nextPosition.x
      z = nextPosition.z
      console.log(`Goto next position: ${x}, ${z}`)
      await bot.pathfinder.goto(new GoalXZ(x, z)).then(() => {
        console.log(`I have arrived at ${bot.entity.position}`)
      }).catch((error) => {
        console.log(`I can't go to ${x}, ${z}, because ${error}`)
        return
      })
      await bot.waitForTicks(10)

    }
    console.log('Finished plowing the entire field!');
    bot.chat('Finished plowing the entire field!')
    stopTask()
    return true;

  })
}

// 播种
function plant(seedName) {
  // 首先判断身上有没有农田方格数量的种子，如果没有，去最近的chest中拿取
  const items = bot.inventory.items()
  sayItems(items)
  let seedCount = 0
  items.forEach(item => {
    if (item && item.type === bot.registry.itemsByName[seedName].id) {
      seedCount += item.count
    }
  })
  if (seedCount < fieldPosition.width * fieldPosition.length) {
    console.log(`I don't have enough ${seedName}`)
    getThingsFromContainer(seedName, fieldPosition.width * fieldPosition.length, 'chest')
    bot.waitForTicks(10)
  }

  // 装备种子到hand上
  const seedItem = items.find(item => {
    return item && item.type === bot.registry.itemsByName[seedName].id
  })
  bot.equip(seedItem, 'hand').then(() => {
    console.log(`I have equipped a ${seedName}`)
  }).catch((error) => {
    console.log(`I can't equip a ${seedName}, because ${error}`)
    return
  })

  // 去农田西北角
  let x = fieldPosition.x
  let z = fieldPosition.z
  bot.pathfinder.goto(new GoalXZ(x, z)).then(async () => {
    console.log(`I have arrived at ${bot.entity.position}`)
    // await bot.waitForTicks(10)
    // 遍历农田每一个块，进行播种操作
    while (true) {
      // await bot.lookAt(new Vec3(x, fieldPosition.y - 1, z))
      // await bot.waitForTicks(10)
      const landBlock = await bot.blockAt(new Vec3(x, fieldPosition.y - 1, z))
      console.log(`landBlock is ${landBlock.name} at ${landBlock.position}`)
      const blockAbove = await bot.blockAt(new Vec3(x, fieldPosition.y, z))
      console.log(`blockAbove is ${blockAbove.name} at ${blockAbove.position}`)
      // 如果blockAbove不存在或者blockAbove是空气，那么播种
      if (!blockAbove || blockAbove.type === 0) {
        if (!bot.heldItem || bot.heldItem.type !== bot.registry.itemsByName[seedName].id) {
          console.log(`I don't have a ${seedName}`)
          //装备seedName到hand上
          const theSeed = await bot.inventory.items().find(item => {
            return item && item.type === bot.registry.itemsByName[seedName].id
          })
          if (!theSeed) {
            console.error(`I can't find a ${seedName}`)
            return
          }
          await bot.equip(theSeed, 'hand').then(() => {
            console.log(`I have equipped a ${seedName}`)
          }).catch((error) => {
            console.error(`I can't equip a ${seedName}, because ${error}`)
            return
          })
        }
        await bot.placeBlock(landBlock, new Vec3(0, 1, 0)).then(async () => {
          // await bot.activateBlock(bot.blockAt(bot.entity.position.offset(0, -1, 0))).then(async () => {
          console.log(`I have planted a ${seedName}`)
          await bot.waitForTicks(10)
        }).catch((error) => {
          console.log(`I can't plant a ${seedName}, because ${error}`)
        })
        // await bot.useOn(bot.blockAt(bot.entity.position.offset(0, -1, 0)))
        // await bot.waitForTicks(10)

      }
      const nextPosition = nextFieldBlockPosition(x, z)
      if (!nextPosition) {
        break
      }
      x = nextPosition.x
      z = nextPosition.z
      await bot.pathfinder.goto(new GoalXZ(x, z)).then(() => {
        console.log(`I have arrived at ${bot.entity.position}`)
      }).catch((error) => {
        console.log(`I can't go to ${x}, ${z}, because ${error}`)
        return
      })
      await bot.waitForTicks(5)

    }
    console.log('Finished planting the entire field!');
    bot.chat('Finished planting the entire field!')
    stopTask()
    return true;

  })
}

// 从容器中拿取指定物品，并指定数量，数量默认是1，容器可以是canBeOpenItems中的任何一种
async function getThingsFromContainer(itemName, count = 1, containerName) {
  // 检查item和container是否都存在, 并且container是否在canBeOpenItems中，并且数量不能超过64
  if (!itemName || !containerName || !canBeOpenItems.includes(containerName) || count > 64) {
    console.log(`I don't know any blocks with name ${itemName} or container ${containerName}`)
    bot.chat(`I don't know any blocks with name ${itemName} or container ${containerName}`)
    return
  }
  console.log(`I will get ${count} ${itemName} from ${containerName}`)
  // 找到最近的容器
  const containerBlock = bot.findBlock({
    maxDistance: 64,
    matching: (block) => {
      return block && block.type === bot.registry.blocksByName[containerName].id
    }
  })
  if (!containerBlock) {
    console.log(`I don't see any ${containerName} nearby.`)
    bot.chat(`I don't see any ${containerName} nearby.`)
    return
  }
  console.log(`I have found the nearest ${containerName}, my position is ${containerBlock.position}`)
  // 移动到容器位置
  bot.pathfinder.goto(new GoalNear(containerBlock.position.x, containerBlock.position.y, containerBlock.position.z, RANGE_GOAL)).then(() => {
    console.log(`I have arrived at ${bot.entity.position}`)
    bot.chat(`I have arrived at ${bot.entity.position}`)
    bot.waitForTicks(10)
    // 打开容器
    bot.openContainer(containerBlock).then((container) => {
      console.log(`I have opened ${containerName} nearby.`)
      bot.chat(`I have opened ${containerName} nearby.`)
      // 检查容器中是否有指定物品, 并且数量是否足够
      const items = container.containerItems()
      if (!items) {
        console.log(`I don't see any items in ${containerName}`)
        bot.chat(`I don't see any items in ${containerName}`)
        container.close()
        return
      }
      sayItems(items)
      const item = itemByName(items, itemName)
      if (!item || item.count < count) {
        console.log(`I don't have enough ${itemName} in ${containerName}`)
        bot.chat(`I don't have enough ${itemName} in ${containerName}`)
        container.close()
        return
      }
      // 从容器中拿取指定物品
      container.withdraw(item.type, null, count).then(() => {
        console.log(`I have taken ${count} ${itemName} from ${containerName}`)
        bot.chat(`I have taken ${count} ${itemName} from ${containerName}`)
        container.close()
      }).catch((err) => {
        console.log(`I can't take ${count} ${itemName} from ${containerName}, because ${err}`)
        bot.chat(`I can't take ${count} ${itemName} from ${containerName}, because ${err}`)
        container.close()
      })
    }).catch((err) => {
      console.log(`I can't open ${containerName} nearby, because ${err}`)
      bot.chat(`I can't open ${containerName} nearby, because ${err}`)
      return
    })

  }).catch((err) => {
    console.log(`I can't go to ${containerBlock.position} because ${err}`)
    bot.chat(`I can't go to ${containerBlock.position} because ${err}`)
    return
  })
}

// 等待bot到达指定位置(废弃)
async function waitForBotAtPosition(x, y, z, timeout = 60 * 20) {
  console.log(`Waiting for bot to go to x: ${x}, y: ${y}, z: ${z}, timeout: ${timeout / 20} seconds`)
  // 循环检查bot是否到达指定位置
  let ticks = 0
  while (true) {
    // 对坐标进行向下取整
    const botX = Math.floor(bot.entity.position.x)
    const botY = Math.floor(bot.entity.position.y)
    const botZ = Math.floor(bot.entity.position.z)
    if (botX === x && (y === null || botY === y) && botZ === z) {
      console.log(`I have arrived at ${bot.entity.position}`)
      return true
    }
    // 等待1秒
    await bot.waitForTicks(20)
    console.log(`I am at x: ${botX}, y: ${botY}, z: ${botZ}, I have wait for ${ticks / 20} seconds`)
    ticks += 20
    if (ticks > timeout) {
      console.log(`Timeout! I can't go to x: ${x}, y: ${y}, z: ${z}`)
      return
    }
  }
}

// 获取农田下一个方格的位置
function nextFieldBlockPosition(x, z) {
  let nextPosition = { x, z }
  nextPosition.x++
  // nextPosition.z++
  if (nextPosition.x > fieldPosition.x + fieldPosition.width) {
    console.log(`I have arrived at the end of row x: ${nextPosition.x}, z: ${nextPosition.z}`)
    if (nextPosition.z >= fieldPosition.z + fieldPosition.length) {
      console.log(`I have arrived at the end of the field`)
      return null
    }
    nextPosition.x = fieldPosition.x
    nextPosition.z++
  }
  console.log(`The next position is x: ${nextPosition.x}, z: ${nextPosition.z}`)
  // 判断下一个位置是否是water, 如果是water, 则跳过
  const nextBlock = bot.blockAt(new Vec3(nextPosition.x, fieldPosition.y - 1, nextPosition.z))
  if (nextBlock && nextBlock.type === bot.registry.blocksByName.water.id) {
    console.log(`The next position is water, I can't go there. I will go to the next position`)
    return nextFieldBlockPosition(nextPosition.x, nextPosition.z)
  }
  return nextPosition
}

// 移动到指定位置
function goto(x, y, z, range) {
  if (x !== null && y !== null && z !== null && range) {
    bot.pathfinder.goto(new GoalXYZ(x, y, z, range)).then(() => {
      console.log(`I have arrived at ${bot.entity.position}`)
    }).catch((err) => {
      console.log(`I can't go to ${x}, ${y}, ${z}, because ${err}`)
    })
    return
  } else if (x !== null && y !== null && z !== null) {
    bot.pathfinder.goto(new GoalXYZ(x, y, z)).then(() => {
      console.log(`I have arrived at ${bot.entity.position}`)
    }).catch((err) => {
      console.log(`I can't go to ${x}, ${y}, ${z}, because ${err}`)
    })
    return
  } else if (x !== null && z !== null) {
    bot.pathfinder.goto(new GoalXZ(x, z)).then(() => {
      console.log(`I have arrived at ${bot.entity.position}`)
    }).catch((err) => {
      console.log(`I can't go to ${x}, ${z}, because ${err}`)
    })
    return
  } else if (y !== null) {
    bot.pathfinder.goto(new GoalY(y)).then(() => {
      console.log(`I have arrived at ${bot.entity.position}`)
    }).catch((err) => {
      console.log(`I can't go to ${y}, because ${err}`)
    })
    return
  } else {
    console.log(`I can't go to ${x}, ${y}, ${z}, because the parameters are invalid`)
    return
  }
}
