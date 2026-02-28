import { TILE, ENTITY_TYPE } from './constants';
import { ENTITY_META } from './entities';

let _projId = 10000;

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

function isWall(map, x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return true;
  const t = map[y][x];
  return t === TILE.WALL || t === TILE.DOOR; // entities cannot open doors
}

function canMoveTo(map, entities, x, y, selfId) {
  if (isWall(map, x, y)) return false;
  if (entities.find(e => e.id !== selfId && e.hp > 0 && e.x === x && e.y === y)) return false;
  return true;
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Return the adjacent tile (N/S/E/W) that minimises distance to target.
function stepToward(entity, target, map, entities) {
  const candidates = [
    { x: entity.x + 1, y: entity.y },
    { x: entity.x - 1, y: entity.y },
    { x: entity.x,     y: entity.y + 1 },
    { x: entity.x,     y: entity.y - 1 },
  ].filter(c => canMoveTo(map, entities, c.x, c.y, entity.id));

  if (!candidates.length) return null;
  candidates.sort((a, b) => manhattan(a, target) - manhattan(b, target));
  return candidates[0];
}

// Return the adjacent tile that maximises distance from target.
function stepAway(entity, target, map, entities) {
  const candidates = [
    { x: entity.x + 1, y: entity.y },
    { x: entity.x - 1, y: entity.y },
    { x: entity.x,     y: entity.y + 1 },
    { x: entity.x,     y: entity.y - 1 },
  ].filter(c => canMoveTo(map, entities, c.x, c.y, entity.id));

  if (!candidates.length) return null;
  candidates.sort((a, b) => manhattan(b, target) - manhattan(a, target));
  return candidates[0];
}

// ---------------------------------------------------------------------------
// Main tick — called once per player action
// ---------------------------------------------------------------------------

export function tickEntities(state) {
  const { map } = state;
  let player = { ...state.player };
  let entities = state.entities.map(e => ({ ...e }));
  const log = [...state.log];
  const newProjectiles = []; // created this tick (don't move until next tick)

  // 1. Move existing projectiles first
  const movedProjectiles = [];
  for (const proj of state.projectiles) {
    const nx = proj.x + proj.dx;
    const ny = proj.y + proj.dy;

    if (isWall(map, nx, ny)) continue; // absorbed by wall

    if (nx === player.x && ny === player.y) {
      player = { ...player, hp: player.hp - proj.damage };
      log.push(`Fireball scorches you for ${proj.damage} damage!`);
      continue;
    }

    const hitIdx = entities.findIndex(e => e.hp > 0 && e.x === nx && e.y === ny);
    if (hitIdx !== -1) {
      // Fireballs can hurt other enemies (friendly fire — chaotic rogue devices)
      entities[hitIdx] = { ...entities[hitIdx], hp: entities[hitIdx].hp - proj.damage };
      continue;
    }

    movedProjectiles.push({ ...proj, x: nx, y: ny });
  }

  // 2. Entity AI turns (in order; earlier movers block later movers)
  for (let i = 0; i < entities.length; i++) {
    const e = entities[i];
    if (e.hp <= 0) continue;

    const meta = ENTITY_META[e.type];
    const d = manhattan(e, player);

    // Haunted Blind stays dormant beyond its activation range
    if (d > meta.activationRange) continue;

    // ── Motion Sensor: always chases, melee ──────────────────────────────
    if (e.type === ENTITY_TYPE.MOTION_SENSOR) {
      if (d === 1) {
        player = { ...player, hp: player.hp - meta.attack };
        log.push(`Motion Sensor zaps you for ${meta.attack} damage!`);
      } else {
        const next = stepToward(e, player, map, entities);
        if (next) entities[i] = { ...e, x: next.x, y: next.y };
      }
    }

    // ── Haunted Blind: lurks, then ambushes ──────────────────────────────
    else if (e.type === ENTITY_TYPE.HAUNTED_BLIND) {
      if (d === 1) {
        player = { ...player, hp: player.hp - meta.attack };
        log.push(`Haunted Blind ensnares you for ${meta.attack} damage!`);
      } else {
        const next = stepToward(e, player, map, entities);
        if (next) entities[i] = { ...e, x: next.x, y: next.y };
      }
    }

    // ── Thermostat: ranged, kites at preferred distance ──────────────────
    else if (e.type === ENTITY_TYPE.THERMOSTAT) {
      if (d <= meta.range) {
        // Shoot in the dominant axis toward player
        const distX = Math.abs(player.x - e.x);
        const distY = Math.abs(player.y - e.y);
        const fireDir = distX >= distY
          ? { dx: Math.sign(player.x - e.x), dy: 0 }
          : { dx: 0,                          dy: Math.sign(player.y - e.y) };

        newProjectiles.push({
          id:     _projId++,
          x:      e.x + fireDir.dx,
          y:      e.y + fireDir.dy,
          dx:     fireDir.dx,
          dy:     fireDir.dy,
          damage: meta.projectileDamage,
          fromId: e.id,
        });
        log.push(`Thermostat fires a fireball!`);

        // Kite: retreat if player is too close
        if (d < 4) {
          const next = stepAway(e, player, map, entities);
          if (next) entities[i] = { ...e, x: next.x, y: next.y };
        }
      } else {
        // Out of range — close in
        const next = stepToward(e, player, map, entities);
        if (next) entities[i] = { ...e, x: next.x, y: next.y };
      }
    }
  }

  return {
    ...state,
    player,
    entities:    entities.filter(e => e.hp > 0),
    projectiles: [...movedProjectiles, ...newProjectiles],
    log:         log.slice(-8),
  };
}
