import { TILE, TILE_SIZE } from '../constants';

// Tile background styles — visual texture per tile type, no text labels
const TILE_STYLES = {
  [TILE.WALL]: {
    backgroundColor: '#242424',
    backgroundImage: [
      'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
    ].join(','),
    backgroundSize: '12px 6px',
    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.07), inset -1px -1px 0 rgba(0,0,0,0.4)',
  },
  [TILE.FLOOR]: {
    backgroundColor: '#161616',
    backgroundImage: 'radial-gradient(circle, #1d1d1d 1px, transparent 1px)',
    backgroundSize: '8px 8px',
    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
  },
  [TILE.DOOR]: {
    backgroundColor: '#4a2e08',
    backgroundImage: [
      // vertical centre bar — suggests a door jamb
      'linear-gradient(90deg, transparent 46%, rgba(0,0,0,0.5) 46%, rgba(0,0,0,0.5) 54%, transparent 54%)',
      // horizontal handle line
      'linear-gradient(transparent 58%, rgba(200,150,50,0.6) 58%, rgba(200,150,50,0.6) 62%, transparent 62%)',
    ].join(','),
    border: '1px solid #8b5e1a',
    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.6)',
  },
  [TILE.STAIRS_DOWN]: {
    backgroundColor: '#1a2a1a',
    border: '1px solid var(--loxone-green)',
  },
};

/**
 * Renders a 2D tile map as absolute-positioned textured divs inside a
 * relative container. Pass EntityLayer (or any overlay) as children.
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
        row.map((tileType, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              position: 'absolute',
              left:     x * TILE_SIZE,
              top:      y * TILE_SIZE,
              width:    TILE_SIZE,
              height:   TILE_SIZE,
              ...TILE_STYLES[tileType],
            }}
          />
        ))
      )}
      {children}
    </div>
  );
}
