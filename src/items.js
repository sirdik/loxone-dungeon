import { ITEM_TYPE } from './constants';

export const ITEM_META = {
  [ITEM_TYPE.MINISERVER]: {
    glyph: 'S',
    color: 'var(--loxone-green)',
    glow:  'rgba(105,190,40,0.9)',
    label: 'Miniserver',
  },
  [ITEM_TYPE.TOUCH_PURE]: {
    glyph: 'P',
    color: '#66aaff',
    glow:  null,
    label: 'Touch Pure',
  },
  [ITEM_TYPE.NFC_KEY_FOB]: {
    glyph: 'K',
    color: '#ffdd44',
    glow:  'rgba(255,221,68,0.6)',
    label: 'NFC Key Fob',
  },
};

let _id = 8000;

export function createItem(type, x, y) {
  return { id: _id++, type, x, y };
}
