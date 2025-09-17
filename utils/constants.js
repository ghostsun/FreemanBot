/**
 * 公共常量模块
 * 可在各处 import/require 使用
 */

const RANGE_GOAL = 1;
const OPEN_RANGE_GOAL = 3;

// 床铺信息映射
const BED_MAP = {
  'smcb': {
    name: '沙漠城堡床',
    id: 'purple_bed',
    position: { x: -169, y: 65, z: -976 },
    color: 'purple',
  }
};

// 堆肥桶信息映射
const COMPOST_MAP = {
  'smcb': {
    name: '沙漠城堡堆肥桶',
    position: { x: -171, y: 65, z: -980 },  // 需要根据实际位置更新
    id:'composter',
    seed_chests: [{ x: -178, y: 64, z: -991 }, 
                  { x: -175, y: 64, z: -991 },
                  { x: -173, y: 64, z: -969 },
                  { x: -173, y: 65, z: -971 }
                ],
    level: 0,  // 当前堆肥等级 (0-7)
    maxLevel: 7  // 最大堆肥等级
  },
  // 'field_composter': {
  //   name: '农田堆肥桶',
  //   position: { x: 0, y: 0, z: 0 },  // 需要根据实际位置更新
  //   level: 0,
  //   maxLevel: 7
  // }
};

// 基地编号，两位数字，从00开始，依次递增
// 00代表出生点，01代表主基地，02代表沙漠城堡


/**
 * 农田编号，前两位为基地编号，后两位为农田编号，
 * 后两位第一位为字母，w代表小麦，d代表甜菜，c代表胡萝卜，p代表土豆
 * 第二位为数字，代表农田编号，从1开始
 * 
 * 农田坐标，x轴对应width，z轴对应length
 */
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
    plant: 'carrots',
    chest: { x: 37, y: 102, z: 1 }
  },
  '02w1': {
    name: '02w1',
    position: { x: -188, y: 64, z: -988, length: 13, width: 6 },
    plant: 'wheat',
    chest: { x: -178, y: 64, z: -991 }
  },
  '02w2': {
    name: '02w2',
    position: { x: -208, y: 63, z: -964, length: 6, width: 6 },
    plant: 'wheat',
    chest: { x: -178, y: 64, z: -991 }
  },
  '02w3': {
    name: '02w3',
    position: { x: -215, y: 63, z: -960, length: 6, width: 6 },
    plant: 'wheat',
    chest: { x: -178, y: 64, z: -991 }
  },
  '02w4': {
    name: '02w4',
    position: { x: -222, y: 63, z: -959, length: 7, width: 6 },
    plant: 'wheat',
    chest: { x: -178, y: 64, z: -991 }
  },
  '02b1': {
    name: '02b1',
    position: { x: -181, y: 64, z: -988, length: 20, width: 6 },
    plant: 'beetroots',
    chest: { x: -175, y: 64, z: -991 }
  },
  '02p1': {
    name: '02p1',
    position: { x: -188, y: 65, z: -966, length: 7, width: 13 },
    
    plant: 'potatoes',
    chest: { x: -173, y: 64, z: -969 }
  },
  '02c1': {
    name: '02c1',
    position: { x: -188, y: 64, z: -974, length: 6, width: 6 },
    plant: 'carrots',
    chest: { x: -173, y: 65, z: -971 }
  },
};

const CHESTS = {
  'fieldChest': { x: -9, y: 63, z: 178 },
  'field2Chest': { x: 37, y: 102, z: 1 },
  'woodChest': { x: -9, y: 63, z: 173 },
  '02w1Chest': { x: -178, y: 64, z: -991 },
  '02b1Chest': { x: -175, y: 64, z: -991 },
  '02p1Chest': { x: -173, y: 64, z: -969 },
  '02c1Chest': { x: -173, y: 65, z: -971 }
}

const TOOLS = {
  'wood': '_axe',
  '_log': '_axe',
  'dirt': '_shovel',
  'grass_block': '_shovel'
}

const PLANT_INFO = [
  { plant: 'wheat', item: 'wheat', block: 'wheat', seed: 'wheat_seeds', metadata: 7 },
  { plant: 'potatoes', item: 'potato', block: 'potatoes', seed: 'potato', metadata: 7 },
  { plant: 'carrots', item: 'carrot', block: 'carrots', seed: 'carrot', metadata: 7 },
  { plant: 'beetroots', item: 'beetroot', block: 'beetroots', seed: 'beetroot_seeds', metadata: 3 },
];

const PLANT_INFO_MAP = new Map(PLANT_INFO.map(pi => [pi.plant, pi]));

const PLANT_AND_SEED = PLANT_INFO

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
  PLANT_INFO,
  PLANT_INFO_MAP,
  TOOLS,
  FIELDS,
  CHESTS,
  BED_MAP,
  COMPOST_MAP
};
