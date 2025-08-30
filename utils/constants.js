/**
 * 公共常量模块
 * 可在各处 import/require 使用
 */

const RANGE_GOAL = 1;

const FIELDS = {
  'field1': {
    name: 'field1',
    position: { x: -6, y: 63, z: 167 , length: 18, width: 11},
    plant: 'wheat',
    chest: { x: -8, y: 63, z: 178 }
  }
};

const PLANT_AND_SEED = [
  { plant: 'wheat', seed: 'wheat_seeds' },
  { plant: 'potato', seed: 'potato' }
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
  }]
]);

const CONTAINER_TYPES = [
  'chest',
  'barrel'
];

module.exports = {
  FIELDS,
  PLANT_AND_SEED,
  CAN_BE_OPEN_ITEMS,
  CONTAINERS,
  CONTAINER_TYPES,
  RANGE_GOAL,
  // 兼容 main.js
  fieldPosition,
  fieldChestPosition,
  plantAndSeed
};
