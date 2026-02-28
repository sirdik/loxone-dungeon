import { TILE_SIZE, TILE_META } from '../constants';

/**
 * Renders a 2D tile map. Accepts children rendered as an overlay
 * (position: absolute) inside the same relative container — use this
 * to layer EntityLayer on top of the tiles.
 */
export default function DungeonGrid({ map, children }) {
  const rows = map.length;
  const cols = map[0]?.length ?? 0;

  return (
    <div
      style={{
        position:      'relative',
        width:         cols * TILE_SIZE,
        height:        rows * TILE_SIZE,
        outline:       '2px solid var(--loxone-green)',
        outlineOffset: 2,
      }}
    >
      {map.map((row, y) =>
        row.map((tileType, x) => {
          const meta = TILE_META[tileType];
          return (
            <div
              key={`${x}-${y}`}
              style={{
                position:        'absolute',
                left:            x * TILE_SIZE,
                top:             y * TILE_SIZE,
                width:           TILE_SIZE,
                height:          TILE_SIZE,
                backgroundColor: meta.color,
                border:          `1px solid ${meta.border}`,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontSize:        16,
                fontFamily:      'monospace',
                color:           'var(--text-muted)',
              }}
            >
              {meta.label}
            </div>
          );
        })
      )}
      {children}
    </div>
  );
}
