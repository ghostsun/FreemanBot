## Farmer
### fieldland
农田保证是平坦的坐标，西北角和东南角构成一个方块
* 西南角 -5, 62, 185
* 东南角 -1，62，185
* 西北角 -5，62，167
* 东北角 -1，62，167

农田用品，收获物品存放的箱子位置
* -8, 63, 178

### 1.21.8 农田坐标

#### 小麦田 02w1
* 西北角 -188, 64, -988, length: 13, width: 6
* 东南角 -182, 64, -975
* 小麦田箱子，-178, 64, -991

#### 小麦田 02w2
* 西北角 -208, 63, -964, length: 6, width: 6
* 东南角 -202, 63, -958
* 小麦田箱子，-178, 64, -991

#### 小麦田 02w3
* 西北角 -215, 63, -960, length: 6, width: 6
* 东南角 -209, 63, -954
* 小麦田箱子，-178, 64, -991

#### 小麦田 02w4
* 西北角 -222, 63, -959, length: 7, width: 6
* 东南角 -216, 63, -952
* 小麦田箱子，-178, 64, -991

#### 甜菜田 02b1
* 西北角 -181, 64, -988, length: 20, width: 6
* 东南角 -175, 64, -968
* 甜菜田箱子，-175, 64, -991

#### 胡萝卜 02c1
* 西北角 -188, 64, -974, length: 6, width: 6
* 东南角 -182, 64, -968

#### 土豆 02p1
* 西北角 -188, 65, -966, length: 5, width: 13
* 东南角 -175, 65, -959



## commands
### goto
#### test
goto -5 63 185
goto -5 63 167

### looking
#### test
looking north
looking east

### find
#### test


### care
#### test
care field1


### put
#### test
put 64 wheat fieldChest
put 64 wheat -8 63 178


### inventory
#### test
inventory items
inventory find wood 10
inventory equip wood
inventory unequip

### dig
#### test
dig 10 _log woodChest

dig 10 _log -8 63 173

#### birch_log
name birch_log
chest 0020
dig 10 birch_log 0020


### care
#### 02w1
care 02w1


### sleep
#### test
sleep list
sleep go smcb
sleep on smcb
sleep off

### compost
#### test
compost add smcb wheat_seeds 64
compost add smcb beetroot_seeds

