/**
 * 公共常量模块
 * 可在各处 import/require 使用
 */

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

module.exports = {
  FIELDS,
  PLANT_AND_SEED,
  CAN_BE_OPEN_ITEMS,
  // 兼容 main.js
  fieldPosition,
  fieldChestPosition,
  plantAndSeed
};
