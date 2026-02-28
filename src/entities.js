import { ENTITY_TYPE } from './constants';

export const ENTITY_META = {
  [ENTITY_TYPE.MOTION_SENSOR]: {
    glyph:           'M',
    color:           '#ff4444',
    label:           'Motion Sensor',
    hp:              8,
    attack:          2,        // 3 → 2
    activationRange: Infinity, // always chases
    range:           0,
    projectileDamage: 0,
  },
  [ENTITY_TYPE.HAUNTED_BLIND]: {
    glyph:           'B',
    color:           '#bb44ff',
    label:           'Haunted Blind',
    hp:              10,       // 14 → 10 (2 hits to kill)
    attack:          2,
    activationRange: 4,        // 5 → 4 (shorter lurk range)
    range:           0,
    projectileDamage: 0,
  },
  [ENTITY_TYPE.THERMOSTAT]: {
    glyph:           'T',
    color:           '#ff8800',
    label:           'Thermostat',
    hp:              6,
    attack:          0,
    activationRange: Infinity,
    range:           5,        // 7 → 5 (shorter firing range)
    projectileDamage: 3,       // 4 → 3
  },
};

let _id = 1;

export function createEntity(type, x, y) {
  const meta = ENTITY_META[type];
  return { id: _id++, type, x, y, hp: meta.hp, maxHp: meta.hp };
}
