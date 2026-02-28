import { TILE, ITEM_TYPE } from './constants';
import { ENTITY_META } from './entities';
import { ITEM_META } from './items';
import { tickEntities } from './ai';
import { generateFloor } from './mapgen';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export function createInitialState() {
  const floor     = 1;
  const generated = generateFloor(floor);
  return {
    map:         generated.map,
    player:      { x: generated.playerStart.x, y: generated.playerStart.y, hp: 25, maxHp: 25, attack: 5, inventory: { touchPure: 0 } },
    entities:    generated.entities,
    items:       generated.items,
    projectiles: [],
    log:         ['Floor 1 — rogue devices detected. Proceed with caution.'],
    floor,
    gameOver:    false,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isWall(map, x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return true;
  return map[y][x] === TILE.WALL; // DOOR handled separately in reducer
}

function entityAt(entities, x, y) {
  return entities.find(e => e.hp > 0 && e.x === x && e.y === y);
}

// Replace one tile in the map immutably
function replaceTile(map, x, y, tile) {
  return map.map((row, r) =>
    r === y ? row.map((t, c) => c === x ? tile : t) : row
  );
}

function descend(state) {
  const nextFloor = state.floor + 1;
  const generated = generateFloor(nextFloor);
  const healAmt   = Math.min(5, state.player.maxHp - state.player.hp);
  return {
    map:         generated.map,
    player: {
      ...state.player,
      x:      generated.playerStart.x,
      y:      generated.playerStart.y,
      hp:     state.player.hp + healAmt,
      attack: state.player.attack + 2, // Miniserver connected: +2 ATK per floor
    },
    entities:    generated.entities,
    items:       generated.items,
    projectiles: [],
    log:         [`Floor ${nextFloor} — Miniserver linked. Signal strength increasing...`],
    floor:       nextFloor,
    gameOver:    false,
  };
}

function gameOver(state) {
  return {
    ...state,
    gameOver: true,
    log: [...state.log, 'SYSTEM FAILURE — you have been decommissioned.'].slice(-8),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state, action) {
  if (action.type === 'RESET') return createInitialState();
  if (state.gameOver) return state;

  if (action.type === 'MOVE_PLAYER') {
    const { dx, dy } = action;
    const { player, map, entities, items } = state;
    const nx = player.x + dx;
    const ny = player.y + dy;

    // ── 1. True walls — blocked ──────────────────────────────────────────
    if (isWall(map, nx, ny)) return state;

    // ── 2. Door — needs Touch Pure ───────────────────────────────────────
    if (map[ny][nx] === TILE.DOOR) {
      if (player.inventory.touchPure > 0) {
        const newMap    = replaceTile(map, nx, ny, TILE.FLOOR);
        const newPlayer = {
          ...player, x: nx, y: ny,
          inventory: { ...player.inventory, touchPure: player.inventory.touchPure - 1 },
        };
        const unlocked  = {
          ...state, map: newMap, player: newPlayer,
          log: [...state.log, 'Touch Pure used — smart lock disengaged!'].slice(-8),
        };
        const afterTick = tickEntities(unlocked);
        return afterTick.player.hp <= 0 ? gameOver(afterTick) : afterTick;
      }
      // No Touch Pure — blocked, but doesn't cost a turn
      return {
        ...state,
        log: [...state.log, 'Locked! You need a Touch Pure to open this door.'].slice(-8),
      };
    }

    // ── 3. Enemy — bump attack ───────────────────────────────────────────
    const target = entityAt(entities, nx, ny);
    if (target) {
      const newHp  = target.hp - player.attack;
      const meta   = ENTITY_META[target.type];
      const killed = newHp <= 0;
      const msg    = killed
        ? `You destroy the ${meta.label}!`
        : `You strike the ${meta.label} for ${player.attack} (${newHp} HP left).`;

      const afterBump = {
        ...state,
        entities: entities
          .map(e => e.id === target.id ? { ...e, hp: newHp } : e)
          .filter(e => e.hp > 0),
        log: [...state.log, msg].slice(-8),
      };
      const afterTick = tickEntities(afterBump);
      return afterTick.player.hp <= 0 ? gameOver(afterTick) : afterTick;
    }

    // ── 4. Item pickup ───────────────────────────────────────────────────
    const item = items.find(i => i.x === nx && i.y === ny);
    if (item) {
      const remainingItems = items.filter(i => i.id !== item.id);
      const movedPlayer    = { ...player, x: nx, y: ny };

      switch (item.type) {
        case ITEM_TYPE.MINISERVER: {
          // Floor goal — descend immediately (triggers next floor + ATK boost)
          return descend({ ...state, player: movedPlayer, items: remainingItems });
        }
        case ITEM_TYPE.TOUCH_PURE: {
          const newPlayer  = { ...movedPlayer, inventory: { ...movedPlayer.inventory, touchPure: movedPlayer.inventory.touchPure + 1 } };
          const afterPickup = {
            ...state, player: newPlayer, items: remainingItems,
            log: [...state.log, `Touch Pure acquired (×${newPlayer.inventory.touchPure}) — use it on locked doors.`].slice(-8),
          };
          const afterTick  = tickEntities(afterPickup);
          return afterTick.player.hp <= 0 ? gameOver(afterTick) : afterTick;
        }
        case ITEM_TYPE.NFC_KEY_FOB: {
          const newMaxHp   = movedPlayer.maxHp + 5;
          const newHp      = Math.min(movedPlayer.hp + 5, newMaxHp);
          const newPlayer  = { ...movedPlayer, hp: newHp, maxHp: newMaxHp };
          const afterPickup = {
            ...state, player: newPlayer, items: remainingItems,
            log: [...state.log, `NFC Key Fob — system clearance expanded! Max HP +5 (${newHp}/${newMaxHp}).`].slice(-8),
          };
          const afterTick  = tickEntities(afterPickup);
          return afterTick.player.hp <= 0 ? gameOver(afterTick) : afterTick;
        }
        default:
          break;
      }
    }

    // ── 5. Normal move ───────────────────────────────────────────────────
    const moved     = { ...state, player: { ...player, x: nx, y: ny } };
    const afterTick = tickEntities(moved);
    return afterTick.player.hp <= 0 ? gameOver(afterTick) : afterTick;
  }

  return state;
}
