const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow, GoalBreakBlock } = require('mineflayer-pathfinder').goals

const bossName = 'Annie'

const options = {
  host: 'localhost', // Change this to the ip you want.
  // host: '192.168.1.88',
  port: 25565, // Change this to the port you want.
  username: 'FreemanBot', // Change this to the username you want.
  auth: 'offline', // Change this to the auth you want.
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
        console.log('bot path update: ' + path[path.length - 1])
      }
    })
})

const RANGE_GOAL = 1
// const targetPosition = new GoalBlock(-36, 154, 30)
bot.loadPlugin(pathfinder)

bot.once('spawn', () => {
    const defaultMove = new Movements(bot)

    bot.on('path_update', (r) => {
        // console.log(`path update: ${r.path}`)
        const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
        // console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${r.visitedNodes} nodes, ${nodesPerTick} nodes/tick)`)
    })

    bot.on('goal_reached', () => {
        console.log('Here I am!')
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
      console.log("Message from " + username + ": " + message)
      if (username == bot.username || username != bossName) return

      const target = bot.players[username] ? bot.players[username].entity : null

      if (message.startsWith(bot.username)) {
        console.log(`My boss ${bossName} is talking to me!`)
        const command = message.slice(bot.username.length).trim()
        console.log("Command: " + command)
        // goto x y z
        if (command.startsWith('goto')) {
          const cmd =command.split(' ')
          if(cmd.length === 4) {
            const x = parseInt(cmd[1])
            const y = parseInt(cmd[2])
            const z = parseInt(cmd[3]) 
            
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalBlock(x, y, z))
            console.log(`I will go to x: ${x}, y: ${y}, z: ${z}`)
          
          // goto x z
          } else if (cmd.length === 3) {
            const x = parseInt(cmd[1])
            const z = parseInt(cmd[2])    

            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalXZ(x, z))
            console.log(`I will go to x: ${x}, z: ${z}`)
          
          // goto y
          } else if (cmd.length === 2) {
            const y = parseInt(cmd[1])

            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalY(y))
            console.log(`I will go to y: ${y}`)
          } else {
            bot.chat("/tell " + username + " I don't understand you !")
            return
          }
        
        // come
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
            console.log("Stopping !")
            break
          case 'go home':
            bot.quit()
            return
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