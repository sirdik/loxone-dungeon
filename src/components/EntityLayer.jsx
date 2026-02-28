import { TILE_SIZE, ITEM_TYPE } from '../constants';
import {
  ENTITY_SPRITES,
  ENTITY_CLASSES,
  ITEM_SPRITES,
  PlayerSprite,
  FireballSprite,
} from './Sprites';

function HpBar({ hp, maxHp }) {
  const pct   = Math.max(0, hp / maxHp);
  const color = pct > 0.5 ? 'var(--loxone-green)' : pct > 0.25 ? '#ff8800' : '#ff3333';
  return (
    <div style={{
      position: 'absolute', bottom: 2, left: 2, right: 2,
      height: 3, background: '#1a1a1a', borderRadius: 2,
    }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
    </div>
  );
}

// Absolute tile-aligned wrapper
function Tile({ x, y, zIndex = 5, children }) {
  return (
    <div style={{
      position:      'absolute',
      left:          x * TILE_SIZE,
      top:           y * TILE_SIZE,
      width:         TILE_SIZE,
      height:        TILE_SIZE,
      pointerEvents: 'none',
      zIndex,
    }}>
      {children}
    </div>
  );
}

/**
 * Renders (bottom → top): floor items → enemies → projectiles → player.
 * All sprites sit inside DungeonGrid's relative container as absolute children.
 */
export default function EntityLayer({ player, entities, projectiles, items }) {
  return (
    <>
      {/* ── Floor items ────────────────────────────────────────────────── */}
      {items.map(item => {
        const SpriteComp = ITEM_SPRITES[item.type];
        const className  = item.type === ITEM_TYPE.MINISERVER ? 'sprite-miniserver' : '';
        return (
          <Tile key={item.id} x={item.x} y={item.y} zIndex={1}>
            <div className={className}>
              <SpriteComp />
            </div>
          </Tile>
        );
      })}

      {/* ── Enemies ────────────────────────────────────────────────────── */}
      {entities.map(entity => {
        const SpriteComp = ENTITY_SPRITES[entity.type];
        const className  = ENTITY_CLASSES[entity.type] ?? '';
        return (
          <Tile key={entity.id} x={entity.x} y={entity.y} zIndex={5}>
            <div className={className}>
              <SpriteComp />
            </div>
            <HpBar hp={entity.hp} maxHp={entity.maxHp} />
          </Tile>
        );
      })}

      {/* ── Projectiles ────────────────────────────────────────────────── */}
      {projectiles.map(proj => (
        <Tile key={proj.id} x={proj.x} y={proj.y} zIndex={6}>
          <div className="sprite-fireball">
            <FireballSprite />
          </div>
        </Tile>
      ))}

      {/* ── Player ─────────────────────────────────────────────────────── */}
      <Tile x={player.x} y={player.y} zIndex={10}>
        <PlayerSprite />
      </Tile>
    </>
  );
}
