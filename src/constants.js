export const TILE = {
  WALL: 0,
  FLOOR: 1,
  DOOR: 2,
  STAIRS_DOWN: 3,
};

export const TILE_SIZE = 48; // px per tile

export const TILE_META = {
  [TILE.WALL]:        { label: '#', color: 'var(--wall-color)', border: '#3a3a3a' },
  [TILE.FLOOR]:       { label: '.', color: 'var(--floor-color)', border: '#222222' },
  [TILE.DOOR]:        { label: '+', color: '#5a3a10', border: '#8b5e1a' },
  [TILE.STAIRS_DOWN]: { label: '>', color: '#1a2a1a', border: 'var(--loxone-green)' },
};

export const ENTITY_TYPE = {
  MOTION_SENSOR: 'MOTION_SENSOR',
  HAUNTED_BLIND: 'HAUNTED_BLIND',
  THERMOSTAT:    'THERMOSTAT',
};

export const ITEM_TYPE = {
  MINISERVER:  'MINISERVER',
  TOUCH_PURE:  'TOUCH_PURE',
  NFC_KEY_FOB: 'NFC_KEY_FOB',
};
