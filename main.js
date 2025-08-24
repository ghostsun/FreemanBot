const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow, GoalBreakBlock } = require('mineflayer-pathfinder').goals
const config = require('./utils/config')

// Load configuration
config.load()

// Configuration
const bossName = config.get('bossName') // Change this to your Minecraft username
const RANGE_GOAL = config.get('rangeGoal') // 1 block away from the player
// 当前任务
let currentTask = null
let currentStep = 0

// Fieldland 是一块方形农田，西北角坐标 + 长度 + 宽度
// (-6, 63, 167) (5, 63, 185)
const fieldPosition = {
    x: -6,
    y: 63,
    z: 167,
    length: 18,    // z方向的长度
    width: 11       // x方向的宽度
}

const fieldChestPosition = {
    x: -8,
    y: 63,
    z: 178
}

// Debug logging helper
function debugLog(message) {
  if (config.get('runningLevel') === 'debug') {
    console.log(`[DEBUG] ${message}`)
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

console.log('FreemanBot has joined the server!')

const welcome = () => {
    bot.chat('Hi, I am ' + bot.username + ' and I am here to help you!')
  }
  
bot.once('spawn', welcome)

bot.once('spawn', () => {
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
      bot.chat(`I have arrived at ${bot.entity.position}`)
    })

    bot.on('path_reset', (reason) => {
        console.log(`Path was reset for reason: ${reason}`)
    })

    // bot.pathfinder.setMovements(defaultMove)
    // bot.pathfinder.setGoal(targetPosition)
    // console.log('I am on my way to the target !')

    // defaultMove.allowEntityDetection = true
    // defaultMove.canDig = true
    // defaultMove.allowSneak = true
    // defaultMove.allowSprinting = true
    // defaultMove.allowJump = true

    bot.on('chat', (username, message) => {
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

      console.log(`My boss ${bossName} is talking to me!`)
      console.log("Command: " + command)
      // goto x y z
      if (command.startsWith('goto')) {
        const cmd =command.split(' ')
        if(cmd.length === 4) {
          const x = parseInt(cmd[1])
          const y = parseInt(cmd[2])
          const z = parseInt(cmd[3]) 
          moveTo(x, y, z, defaultMove)
        // goto x z
        } else if (cmd.length === 3) {
          const x = parseInt(cmd[1])
          const z = parseInt(cmd[2])    
          moveTo(x, null, z, defaultMove)
        // goto y
        } else if (cmd.length === 2) {
          const y = parseInt(cmd[1])
          moveTo(null, y, null, defaultMove)
        } else {
          bot.chat("/tell " + username + " I don't understand you !")
          return
        }
      } else if (command.startsWith('collect')) {
        const cmd = command.split(' ')
        if(cmd.length === 2) {
          // Get the correct block type
          const blockType = bot.registry.blocksByName[cmd[1]]
          if (!blockType) {
            bot.chat(`I don't know any blocks with name ${cmd[1]}.`)
            return
          }

          bot.chat(`Collecting the nearest ${blockType.name}`)

          // Try and find that block type in the world
          const block = bot.findBlock({
            matching: blockType.id,
            maxDistance: 64
          })

          if (!block) {
            bot.chat(`I don't see that block nearby.`)
            return
          }

          // Collect the block if we found one
          bot.collectBlock.collect(block, err => {
            if (err) bot.chat(err.message)
          })
        } else {
          bot.chat(`/tell ${username} What's mean ${message} ?`)
          return
        }
      } else if (command.startsWith('looking')) {
        const cmd = command.split(' ')
        if(cmd.length === 2) {
          const direction = cmd[1]
          if(direction === 'north') {
            // 第一个参数是90度的弧度，派的1/2
            // 将角度转化为弧度 Math.PI / 180
            bot.look(Math.PI / 2, 0)
            return
          } else if (direction === 'south') {
            bot.look(Math.PI * 3 / 2, 0)
            return
          } else if (direction === 'east') {
            bot.look(0, 0)
            return
          } else if (direction === 'west') {
            bot.look(Math.PI, 0)
            return
          // } else if (direction == 'up') {
          //   bot.look(0, 90)
          // } else if (direction == 'down') {
          //   bot.look(0, -90)
          // 判断direction 是否为数字
          } else if (!isNaN(parseFloat(direction)) && isFinite(direction)) {
            bot.look(direction * Math.PI / 180, 0)
            return
          } else {
            bot.chat(`/tell ${username} What's mean ${message} ?`)
            return
          }
        } else if (cmd.length === 3) {
          const yaw = cmd[1]
          const pitch = cmd[2]
          // 判断yaw 和 pitch 是否为数字
          if(!isNaN(parseFloat(yaw)) && isFinite(yaw) && !isNaN(parseFloat(pitch)) && isFinite(pitch)) {
            bot.look(yaw * Math.PI / 180, pitch * Math.PI / 180)
          }
          return
        } else {
          bot.chat(`/tell ${username} What's mean ${message} ?`)
          return
        }
      } else if (command.startsWith('find')) {
        const cmd = command.split(' ')
        if(cmd.length === 2) {
          const blockType = bot.registry.blocksByName[cmd[1]]
          if (!blockType) {
            bot.chat(`I don't know any blocks with name ${cmd[1]}.`)
            return
          }

          bot.chat(`Finding the nearest ${blockType.name}`)

          // Try and find that block type in the world
          const block = bot.findBlock({
            matching: blockType.id,
            maxDistance: 64
          })

          if (!block) {
            bot.chat(`I don't see that block nearby.`)
            return
          }

          console.log(`Found ${blockType.name} at ${block.position}`)
          bot.chat(`Found ${blockType.name} at ${block.position}`)
          return

          // // Collect the block if we found one
          // bot.collectBlock.collect(block, err => {
          //   if (err) bot.chat(err.message)
          // })
        } else {
          bot.chat(`/tell ${username} What's mean ${message} ?`)
          return
        }
      } else if (command.startsWith('care')) {
        const cmd = command.split(' ')
        if(cmd.length === 2 && cmd[1] == 'wheat') {
          if(!startTask(command)){
            console.error(`I can't do ${command} because I am already doing a task: ${currentTask}`)
            bot.chat(`${username} I can't do ${command} because I am already doing a task: ${currentTask}`)
            return
          }
          console.log(`I will do ${command}`)
          bot.chat(`I will do ${command}`)
          harvestingWheat()
          // 第一步，到箱子位置，拿取小麦种子和犁
          // moveTo(fieldChestPosition.x, null, fieldChestPosition.z)
          // bot.pathfinder.setMovements(defaultMove)
          // bot.pathfinder.setGoal(new GoalXZ(fieldChestPosition.x, fieldChestPosition.z))
          // bot.pathfinder.setGoal(new GoalXZ(fieldPosition.x, fieldPosition.z))
          
          // 收获小麦
          

          // 当bot到达农田西北角，goal_reached事件触发
          
          // 等待bot到达农田西北角向东一格
          // waitForBotAtPosition(fieldPosition.x, fieldPosition.y, fieldPosition.z)
          // console.log(`I have arrived at ${bot.entity.position}`)

          // 开始收获小麦
          // console.log('Starting to harvest the entire field!')
          // bot.chat('Starting to harvest the entire field!')
          // harvestingWheat()

          // console.log('Finished harvesting the entire field!')
          // bot.chat('Finished harvesting the entire field!')

          // endTask(command)
          return
        } else {
          bot.chat(`/tell ${username} What's mean ${message} ?`)
          return
        }
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
          bot.setControlState('forward', false)
          break
        case 'back':
        case 's':
        case 'S':
          bot.setControlState('back', true)
          bot.setControlState('back', false)
          break
        case 'left':
        case 'a':
        case 'A':
          bot.setControlState('left', true)
          bot.setControlState('left', false)
          break
        case 'right':
        case 'd':
        case 'D':
          bot.setControlState('right', true)
          bot.setControlState('right', false)
          break
        case 'stop controls':
          bot.clearControlStates()
          break
        case 'jump':
        case ' ':
          bot.setControlState('jump', true)
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

function moveTo(x, y, z, defaultMove) {
    bot.pathfinder.setMovements(defaultMove)
    if (x && y && z) {
      bot.pathfinder.setGoal(new GoalBlock(x, y, z))
      console.log(`I will go to x: ${x}, y: ${y}, z: ${z}`)
    } else if (x && z) {
        bot.pathfinder.setGoal(new GoalXZ(x, z))
        console.log(`I will go to x: ${x}, z: ${z}`)
    }
}

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
function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function sayItems(items) {
    const output = items.map(itemToString).join(`, `)
    if(output) {
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

        const startX = fieldPosition.x
        const startZ = fieldPosition.z
        
        // console.log(`I will go to x: ${startX}, z: ${startZ}`)
        // bot.pathfinder.setGoal(new GoalXZ(startX, startZ))
        // if (!await waitForBotAtPosition(x = startX, y=null, z = startZ)) {
        //   console.log(`I can't go to x: ${startX}, z: ${startZ}`)
        //   stopTask()
        //   return
        // }

        // 循环从农田西北角开始遍历农田每一格，并收获每一格上的小麦
        let x = startX
        let z = startZ
        while( true ) {
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
          x++
          if (x > startX + fieldPosition.width) {
            x = startX
            z++
            if (z > startZ + fieldPosition.length) {
              break
            }
            console.log(`Goto next position: ${x}, ${z}`)
          }
          await bot.waitForTicks(10)
        }
        // for (let z = startZ; z < startZ + fieldPosition.length; z++) {
        //   for (let x = startX; x < startX + fieldPosition.width; x++) {
        //     bot.pathfinder.setGoal(new GoalXZ(x, z))
        //     if (!await waitForBotAtPosition(x = startX, y=null, z = startZ)) {
        //       console.log(`I can't go to x: ${startX}, z: ${startZ}`)
        //       stopTask()
        //       return
        //     }
        //     const wheat = await bot.findBlock({
        //       maxDistance: 1,
        //       matching: (block) => {
        //         return block && block.type === bot.registry.blocksByName.wheat.id && block.metadata === 7
        //       }
        //     })
        //     if (wheat) {
        //       console.log(`Harvesting wheat at ${wheat}`)
        //       await bot.dig(wheat)
        //     }
        //   }
        // }
        
        
        
        // Start from the northwest corner of the field
        // let currentX = fieldPosition.x + 1; // Start one block in from the edge
        // let currentZ = fieldPosition.z + 1; // Start one block in from the edge
        // const endX = fieldPosition.x + fieldPosition.length - 1;
        // const endZ = fieldPosition.z + fieldPosition.width - 1;
        // let movingEast = true;
        // console.log(`I will harvest the entire field! My position is ${bot.entity.position}`)
        // bot.chat(`I will harvest the entire field! My position is ${bot.entity.position}`)

        // // Move to the starting position
        // const defaultMove = new Movements(bot)
        // await moveTo(currentX, fieldPosition.y, currentZ, defaultMove);
        // await waitForBotAtPosition(currentX, fieldPosition.y, currentZ);
        // console.log(`I have arrived at start position ${bot.entity.position}`)
        // bot.chat(`I have arrived at start position ${bot.entity.position}`)

        // console.log(`I will harvest the entire field!`)
        // await harvestAround(currentX, currentZ);
        

        // Harvest in a snake pattern
        // while (currentZ <= endZ) {
        //     // Harvest current position and surrounding blocks
        //     console.log(`Harvesting around x: ${currentX}, z: ${currentZ}`)
        //     await harvestAround(currentX, currentZ);
            
        //     // Move to next position in the row
        //     if (movingEast) {
        //         if (currentX < endX) {
        //             currentX++;
        //             await moveTo(currentX, fieldPosition.y, currentZ, defaultMove);
        //         } else {
        //             movingEast = false;
        //             currentZ++;
        //             if (currentZ <= endZ) {
        //                 await moveTo(currentX, fieldPosition.y, currentZ, defaultMove);
        //             }
        //         }
        //     } else {
        //         if (currentX > fieldPosition.x + 1) {
        //             currentX--;
        //             await moveTo(currentX, fieldPosition.y, currentZ, defaultMove);
        //         } else {
        //             movingEast = true;
        //             currentZ++;
        //             if (currentZ <= endZ) {
        //                 await moveTo(currentX, fieldPosition.y, currentZ, defaultMove);
        //             }
        //         }
        //     }
        //     // Small delay to prevent server overload
        //     await bot.waitForTicks(5);
        // }
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

// 等待bot到达指定位置
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


        