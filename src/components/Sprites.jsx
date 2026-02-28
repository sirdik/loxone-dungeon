/**
 * Pixel art sprites — 8×8 grid, each pixel = 6 px (renders at 48×48).
 * Color index 0 is always transparent.
 */
import { TILE_SIZE, ENTITY_TYPE, ITEM_TYPE } from '../constants';

const PX = TILE_SIZE / 8; // 6 px per pixel

function PixelSprite({ pixels, colors }) {
  return (
    <svg
      width={TILE_SIZE}
      height={TILE_SIZE}
      style={{ display: 'block', shapeRendering: 'crispEdges' }}
    >
      {pixels.flatMap((row, y) =>
        row.map((c, x) =>
          c === 0 ? null : (
            <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX} height={PX} fill={colors[c]} />
          )
        )
      )}
    </svg>
  );
}

// ── Player ────────────────────────────────────────────────────────────────────
// Loxone technician: green hard hat, skin tone face, blue work shirt, dark pants
const P_C = ['', '#69BE28', '#c8845a', '#3a5fa5', '#111827'];
//                   hat       skin       shirt      pants
const P_D = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 0, 2, 4, 4, 2, 0, 0],  // eyes
  [0, 3, 3, 3, 3, 3, 3, 0],
  [3, 3, 0, 3, 3, 0, 3, 3],  // arms
  [0, 0, 4, 0, 0, 4, 0, 0],
  [0, 0, 4, 0, 0, 4, 0, 0],
];
export const PlayerSprite = () => <PixelSprite pixels={P_D} colors={P_C} />;

// ── Motion Sensor ─────────────────────────────────────────────────────────────
// Rogue security camera: red iris, white sclera, dark pupil, mounting stem
const MS_C = ['', '#ff4444', '#cc2222', '#ffffff', '#111111'];
const MS_D = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 2, 2, 1, 1, 0],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 2, 3, 3, 4, 3, 2, 1],  // pupil
  [1, 2, 3, 3, 3, 3, 2, 1],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],  // mount
];
export const MotionSensorSprite = () => <PixelSprite pixels={MS_D} colors={MS_C} />;

// ── Haunted Blind ─────────────────────────────────────────────────────────────
// Floating venetian slats with glowing yellow eyes
const HB_C = ['', '#bb44ff', '#8822cc', '#ffee55'];
const HB_D = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 3, 0, 0, 0, 3, 0, 0],  // glowing eyes
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
export const HauntedBlindSprite = () => <PixelSprite pixels={HB_D} colors={HB_C} />;

// ── Thermostat ────────────────────────────────────────────────────────────────
// Overheating circular dial with red temperature needle
const TS_C = ['', '#ff8800', '#cc6600', '#f5f5f5', '#ff2200'];
const TS_D = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 1, 1, 2, 1, 0],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 1, 3, 4, 4, 3, 1, 1],  // red hot needle
  [1, 2, 3, 3, 3, 3, 2, 1],
  [0, 1, 2, 1, 1, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],  // mount
];
export const ThermostatSprite = () => <PixelSprite pixels={TS_D} colors={TS_C} />;

// ── Miniserver ────────────────────────────────────────────────────────────────
// Loxone server rack: green chassis, LED indicators, data ports
const MN_C = ['', '#69BE28', '#4a8a1c', '#aaffaa', '#1a1a1a'];
//                  chassis     dark grn    LED         port
const MN_D = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [2, 3, 2, 4, 2, 3, 2, 2],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 4, 2, 4, 2, 2, 2],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [2, 3, 2, 4, 2, 3, 2, 2],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
export const MiniserverSprite = () => <PixelSprite pixels={MN_D} colors={MN_C} />;

// ── Touch Pure ────────────────────────────────────────────────────────────────
// Touch control panel: blue border, white buttons, capacitive glow
const TP_C = ['', '#66aaff', '#4488dd', '#ffffff', '#aaddff'];
const TP_D = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 3, 3, 2, 2, 1],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 2, 4, 4, 4, 4, 2, 1],  // active touch glow
  [1, 2, 4, 3, 3, 4, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];
export const TouchPureSprite = () => <PixelSprite pixels={TP_D} colors={TP_C} />;

// ── NFC Key Fob ───────────────────────────────────────────────────────────────
// Smart card with NFC wave symbol
const NF_C = ['', '#ffdd44', '#cc9900', '#888888', '#ffffaa'];
const NF_D = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 3, 2, 3, 3, 2, 1],  // NFC arcs
  [1, 2, 2, 3, 3, 2, 2, 1],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 2, 2, 3, 3, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];
export const NFCKeyFobSprite = () => <PixelSprite pixels={NF_D} colors={NF_C} />;

// ── Fireball ──────────────────────────────────────────────────────────────────
// Thermostat projectile: orange outer, yellow core, red hotspot
const FB_C = ['', '#ff6600', '#ffcc00', '#ff2200'];
const FB_D = [
  [0, 0, 1, 1, 1, 0, 0, 0],
  [0, 1, 2, 2, 1, 1, 0, 0],
  [1, 2, 2, 3, 2, 2, 1, 0],
  [1, 2, 3, 3, 3, 2, 1, 0],
  [1, 2, 2, 3, 2, 2, 1, 0],
  [0, 1, 2, 2, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0, 0],  // spark
];
export const FireballSprite = () => <PixelSprite pixels={FB_D} colors={FB_C} />;

// ── Lookup maps ───────────────────────────────────────────────────────────────

export const ENTITY_SPRITES = {
  [ENTITY_TYPE.MOTION_SENSOR]: MotionSensorSprite,
  [ENTITY_TYPE.HAUNTED_BLIND]: HauntedBlindSprite,
  [ENTITY_TYPE.THERMOSTAT]:    ThermostatSprite,
};

export const ENTITY_CLASSES = {
  [ENTITY_TYPE.MOTION_SENSOR]: 'sprite-motion-sensor',
  [ENTITY_TYPE.HAUNTED_BLIND]: 'sprite-haunted-blind',
  [ENTITY_TYPE.THERMOSTAT]:    'sprite-thermostat',
};

export const ITEM_SPRITES = {
  [ITEM_TYPE.MINISERVER]:  MiniserverSprite,
  [ITEM_TYPE.TOUCH_PURE]:  TouchPureSprite,
  [ITEM_TYPE.NFC_KEY_FOB]: NFCKeyFobSprite,
};
