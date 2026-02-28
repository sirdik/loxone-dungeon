import { useReducer, useEffect, useCallback } from 'react';
import DungeonGrid from './components/DungeonGrid';
import EntityLayer from './components/EntityLayer';
import { createInitialState, gameReducer } from './gameState';
import './App.css';

const KEY_MAP = {
  ArrowUp:    { dx:  0, dy: -1 },
  ArrowDown:  { dx:  0, dy:  1 },
  ArrowLeft:  { dx: -1, dy:  0 },
  ArrowRight: { dx:  1, dy:  0 },
  w:          { dx:  0, dy: -1 },
  s:          { dx:  0, dy:  1 },
  a:          { dx: -1, dy:  0 },
  d:          { dx:  1, dy:  0 },
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const { player, entities, projectiles, items, log, map, floor, gameOver } = state;

  const handleKeyDown = useCallback((e) => {
    const move = KEY_MAP[e.key];
    if (!move) return;
    e.preventDefault();
    dispatch({ type: 'MOVE_PLAYER', ...move });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const hpPct   = Math.max(0, player.hp) / player.maxHp;
  const hpColor = hpPct > 0.5 ? 'var(--loxone-green)' : hpPct > 0.25 ? '#ff8800' : '#ff3333';

  return (
    <div className="game-wrapper">
      <header className="game-header">
        <span className="game-title">LOXONE DUNGEON</span>
        <span className="game-subtitle">Smart Home Crawler v0.1</span>
      </header>

      <DungeonGrid map={map}>
        <EntityLayer player={player} entities={entities} projectiles={projectiles} items={items} />
      </DungeonGrid>

      {/* Player status bar */}
      <div className="status-bar" style={{ width: map[0].length * 48 }}>
        <div className="status-item">
          <span className="status-label">HP</span>
          <div className="hp-track">
            <div className="hp-fill" style={{ width: `${hpPct * 100}%`, background: hpColor }} />
          </div>
          <span className="status-value">{Math.max(0, player.hp)}/{player.maxHp}</span>
        </div>
        <div className="status-item">
          <span className="status-label">ATK</span>
          <span className="status-value">{player.attack}</span>
        </div>
        <div className="status-item">
          <span className="status-label">ENEMIES</span>
          <span className="status-value">{entities.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">FLOOR</span>
          <span className="status-value">{floor}</span>
        </div>
        {player.inventory.touchPure > 0 && (
          <div className="status-item">
            <span className="status-label" style={{ color: '#66aaff' }}>TOUCH PURE</span>
            <span className="status-value" style={{ color: '#66aaff' }}>×{player.inventory.touchPure}</span>
          </div>
        )}
        <div className="status-item status-item--right">
          <span className="status-label">MOVE</span>
          <span className="status-value">WASD / ↑↓←→</span>
        </div>
      </div>

      {/* Combat log */}
      <div className="game-log" style={{ width: map[0].length * 48 }}>
        {log.map((msg, i) => (
          <div
            key={i}
            className={`log-entry${i === log.length - 1 ? ' log-entry--latest' : ''}`}
          >
            {msg}
          </div>
        ))}
      </div>

      {/* Game-over overlay */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-panel">
            <div className="game-over-title">SYSTEM FAILURE</div>
            <div className="game-over-subtitle">Connection lost. Technician offline.</div>
            <button
              className="game-over-btn"
              onClick={() => dispatch({ type: 'RESET' })}
            >
              RECONNECT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
