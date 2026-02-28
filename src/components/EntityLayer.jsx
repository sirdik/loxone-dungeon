import { TILE_SIZE } from '../constants';
import { ENTITY_META } from '../entities';
import { ITEM_META } from '../items';

function HpBar({ hp, maxHp }) {
  const pct   = Math.max(0, hp / maxHp);
  const color = pct > 0.5 ? 'var(--loxone-green)' : pct > 0.25 ? '#ff8800' : '#ff3333';
  return (
    <div style={{ position: 'absolute', bottom: 3, left: 4, right: 4, height: 3, background: '#333', borderRadius: 2 }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
    </div>
  );
}

function Sprite({ left, top, color, glow, fontSize, children, style = {} }) {
  return (
    <div
      style={{
        position:       'absolute',
        left:           left * TILE_SIZE,
        top:            top  * TILE_SIZE,
        width:          TILE_SIZE,
        height:         TILE_SIZE,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize,
        color,
        textShadow:     glow ? `0 0 8px ${glow}` : undefined,
        pointerEvents:  'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Renders (bottom to top): floor items → enemies → projectiles → player.
 * All children are absolute-positioned inside DungeonGrid's relative container.
 */
export default function EntityLayer({ player, entities, projectiles, items }) {
  return (
    <>
      {/* Floor items — rendered first so entities appear on top */}
      {items.map(item => {
        const meta = ITEM_META[item.type];
        return (
          <Sprite
            key={item.id}
            left={item.x}
            top={item.y}
            color={meta.color}
            glow={meta.glow}
            fontSize={20}
            style={{ zIndex: 1 }}
          >
            {meta.glyph}
          </Sprite>
        );
      })}

      {/* Enemies */}
      {entities.map(entity => {
        const meta = ENTITY_META[entity.type];
        return (
          <Sprite
            key={entity.id}
            left={entity.x}
            top={entity.y}
            color={meta.color}
            fontSize={20}
            style={{ zIndex: 5 }}
          >
            {meta.glyph}
            <HpBar hp={entity.hp} maxHp={entity.maxHp} />
          </Sprite>
        );
      })}

      {/* Projectiles */}
      {projectiles.map(proj => (
        <Sprite
          key={proj.id}
          left={proj.x}
          top={proj.y}
          color="#ff6600"
          glow="rgba(255,102,0,0.9)"
          fontSize={18}
          style={{ zIndex: 6 }}
        >
          *
        </Sprite>
      ))}

      {/* Player — always on top */}
      <Sprite
        left={player.x}
        top={player.y}
        color="var(--loxone-green)"
        glow="rgba(105,190,40,0.8)"
        fontSize={22}
        style={{ zIndex: 10 }}
      >
        @
      </Sprite>
    </>
  );
}
