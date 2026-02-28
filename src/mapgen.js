import { TILE, ENTITY_TYPE, ITEM_TYPE } from './constants';
import { createEntity } from './entities';
import { createItem } from './items';

export const MAP_W = 24;
export const MAP_H = 14;

// ---------------------------------------------------------------------------
// Seeded RNG — mulberry32
// ---------------------------------------------------------------------------
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ri(min, max, rand) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Room helpers
// ---------------------------------------------------------------------------

function center(room) {
  return {
    x: Math.floor(room.x + room.w / 2),
    y: Math.floor(room.y + room.h / 2),
  };
}

function overlaps(a, b) {
  return !(
    a.x + a.w + 1 < b.x ||
    b.x + b.w + 1 < a.x ||
    a.y + a.h + 1 < b.y ||
    b.y + b.h + 1 < a.y
  );
}

function isInAnyRoom(rooms, x, y) {
  return rooms.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
}

function carveRoom(map, { x, y, w, h }) {
  for (let row = y; row < y + h; row++)
    for (let col = x; col < x + w; col++)
      map[row][col] = TILE.FLOOR;
}

// L-shaped corridor; returns the bend tile (good door candidate)
function carveCorridor(map, x1, y1, x2, y2, rand) {
  let bend;
  if (rand() < 0.5) {
    bend = { x: x2, y: y1 };
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) map[y1][x] = TILE.FLOOR;
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) map[y][x2] = TILE.FLOOR;
  } else {
    bend = { x: x1, y: y2 };
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) map[y][x1] = TILE.FLOOR;
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) map[y2][x] = TILE.FLOOR;
  }
  return bend;
}

function randomFloorTile(room, rand, occupied) {
  for (let i = 0; i < 30; i++) {
    const x = ri(room.x, room.x + room.w - 1, rand);
    const y = ri(room.y, room.y + room.h - 1, rand);
    if (!occupied.some(p => p.x === x && p.y === y)) return { x, y };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Enemy pools — scale with floor depth
// ---------------------------------------------------------------------------

const POOL_EASY = [ENTITY_TYPE.MOTION_SENSOR, ENTITY_TYPE.HAUNTED_BLIND];
const POOL_HARD = [ENTITY_TYPE.MOTION_SENSOR, ENTITY_TYPE.HAUNTED_BLIND, ENTITY_TYPE.THERMOSTAT];

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate a dungeon floor.
 * @param {number} floor  — 1-indexed floor number (affects enemy/item scaling)
 * @param {number} seed   — RNG seed; defaults to Date.now() for a random floor
 * @returns {{ map, playerStart, entities, items }}
 */
export function generateFloor(floor = 1, seed = Date.now()) {
  const rand = makeRng(seed);

  // 1. Fill with walls
  const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(TILE.WALL));

  // 2. Place rooms with overlap rejection
  const rooms = [];
  const target = ri(4, 7, rand);
  for (let tries = 0; tries < 200 && rooms.length < target; tries++) {
    const w    = ri(3, 7, rand);
    const h    = ri(3, 5, rand);
    const x    = ri(1, MAP_W - w - 1, rand);
    const y    = ri(1, MAP_H - h - 1, rand);
    const room = { x, y, w, h };
    if (!rooms.some(r => overlaps(r, room))) rooms.push(room);
  }

  // Fallback: guarantee at least 2 rooms
  if (rooms.length < 2) {
    rooms.length = 0;
    rooms.push({ x: 1,         y: 1,         w: 5, h: 4 });
    rooms.push({ x: MAP_W - 7, y: MAP_H - 6, w: 5, h: 4 });
  }

  // 3. Carve rooms
  for (const room of rooms) carveRoom(map, room);

  // 4. Sort left-to-right, connect with corridors; collect bend points for doors
  rooms.sort((a, b) => center(a).x - center(b).x);
  const bendPoints = [];
  for (let i = 1; i < rooms.length; i++) {
    const c1   = center(rooms[i - 1]);
    const c2   = center(rooms[i]);
    const bend = carveCorridor(map, c1.x, c1.y, c2.x, c2.y, rand);
    // Only use bend as door candidate if it's not inside any room
    if (!isInAnyRoom(rooms, bend.x, bend.y)) bendPoints.push(bend);
  }

  // 5. Place 1–2 locked doors at randomly chosen bend points
  const doorCandidates = [...bendPoints];
  const numDoors = Math.min(2, Math.floor(doorCandidates.length / 2));
  for (let i = 0; i < numDoors && doorCandidates.length > 0; i++) {
    const idx = Math.floor(rand() * doorCandidates.length);
    const d   = doorCandidates.splice(idx, 1)[0];
    if (map[d.y][d.x] === TILE.FLOOR) map[d.y][d.x] = TILE.DOOR;
  }

  // 6. Player starts in the first room
  const playerStart = center(rooms[0]);

  // 7. Miniserver (floor goal) sits at the centre of the last room
  const miniserverPos = center(rooms[rooms.length - 1]);

  // 8. Enemies — 1 per non-starting room; last room always gets Thermostat
  const entities = [];
  for (let i = 1; i < rooms.length; i++) {
    const room     = rooms[i];
    // Keep Miniserver tile clear of enemies
    const reserved = i === rooms.length - 1 ? [miniserverPos] : [];
    const occupied = [playerStart, ...reserved, ...entities.map(e => ({ x: e.x, y: e.y }))];
    const pos      = randomFloorTile(room, rand, occupied);
    if (!pos) continue;

    const pool = i === rooms.length - 1
      ? [ENTITY_TYPE.THERMOSTAT]
      : (floor >= 3 ? POOL_HARD : POOL_EASY);

    const type = pool[Math.floor(rand() * pool.length)];
    entities.push(createEntity(type, pos.x, pos.y));
  }

  // 9. Items
  const items = [];
  const itemOccupied = () => [playerStart, miniserverPos, ...entities.map(e => ({ x: e.x, y: e.y })), ...items.map(i => ({ x: i.x, y: i.y }))];

  // Miniserver — always in last room (the floor goal)
  items.push(createItem(ITEM_TYPE.MINISERVER, miniserverPos.x, miniserverPos.y));

  // Touch Pure — guaranteed in room 1 (player must pass through to find it)
  if (rooms.length >= 2) {
    const pos = randomFloorTile(rooms[1], rand, itemOccupied());
    if (pos) items.push(createItem(ITEM_TYPE.TOUCH_PURE, pos.x, pos.y));
  }

  // NFC Key Fob — 50% chance, random middle room
  if (rooms.length >= 3 && rand() < 0.5) {
    const roomIdx = 1 + Math.floor(rand() * (rooms.length - 2));
    const pos     = randomFloorTile(rooms[roomIdx], rand, itemOccupied());
    if (pos) items.push(createItem(ITEM_TYPE.NFC_KEY_FOB, pos.x, pos.y));
  }

  return { map, playerStart, entities, items };
}
