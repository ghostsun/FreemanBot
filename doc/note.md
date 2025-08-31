## Farmer
### fieldland
农田保证是平坦的坐标，西北角和东南角构成一个方块
* 西南角 -5, 62, 185
* 东南角 -1，62，185
* 西北角 -5，62，167
* 东北角 -1，62，167

农田用品，收获物品存放的箱子位置
* -8, 63, 178

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

