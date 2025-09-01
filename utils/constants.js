/**
 * 公共常量模块
 * 可在各处 import/require 使用
 */

const RANGE_GOAL = 1;
const OPEN_RANGE_GOAL = 3;

const FIELDS = {
  'field1': {
    name: 'field1',
    position: { x: -6, y: 63, z: 167 , length: 18, width: 11},
    plant: 'wheat',
    chest: { x: -9, y: 63, z: 178 }
  },
  'field2': {
    name: 'field2',
    position: { x: 30, y: 102, z: 4 , length: 8, width: 8},
    plant: 'carrot',
    chest: { x: 37, y: 102, z: 1 }
  }
};

const CHESTS = {
  'fieldChest': { x: -9, y: 63, z: 178 },
  'field2Chest': { x: 37, y: 102, z: 1 },
  'woodChest': { x: -9, y: 63, z: 173 }
}

const TOOLS = {
  'wood': '_axe',
  '_log': '_axe',
  'dirt': '_shovel',
  'grass_block': '_shovel'
}

const PLANT_AND_SEED = [
  { plant: 'wheat', seed: 'wheat_seeds' },
  { plant: 'potato', seed: 'potato' },
  { plant: 'carrot', seed: 'carrot' }
];

const CAN_BE_OPEN_ITEMS = ['chest', 'barrel'];

// 兼容 main.js 的常量导出（老代码可直接引用）
const fieldPosition = FIELDS['field1'].position;
const fieldChestPosition = FIELDS['field1'].chest;
const plantAndSeed = PLANT_AND_SEED;

const CONTAINERS = new Map([
  ['fieldChest', {
    name: 'fieldChest',
    position: { x: -9, y: 63, z: 178 },
    type: 'chest'
  }],
  ['field2Chest', {
    name: 'field2Chest',
    position: { x: 37, y: 102, z: 1 },
    type: 'chest'
  }],
  ['woodChest', {
    name: 'woodChest',
    position: { x: -9, y: 63, z: 173 },
    type: 'chest'
  }]
]);

const CONTAINER_TYPES = CAN_BE_OPEN_ITEMS;

module.exports = {
  PLANT_AND_SEED,
  CAN_BE_OPEN_ITEMS,
  CONTAINERS,
  CONTAINER_TYPES,
  RANGE_GOAL,
  OPEN_RANGE_GOAL,
  plantAndSeed,
  TOOLS,
  FIELDS,
  CHESTS
};
