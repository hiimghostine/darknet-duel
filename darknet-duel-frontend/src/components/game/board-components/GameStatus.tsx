import React from 'react';
import type { GameStatusProps } from './types';

const GameStatus: React.FC<GameStatusProps> = ({ 
  G, 
  ctx, 
  playerID,
  isAttacker,
  currentPhase = ctx.phase, // Use passed prop with fallback to ctx.phase
}) => {
  const currentTurn = G.currentTurn;
  const currentPlayerName = ctx.currentPlayer === playerID ? 'You' : 'Opponent';
  const playerRole = isAttacker ? 'Attacker' : 'Defender';

  // Helper to get a human-readable phase name
  const getPhaseDisplay = (phase: string) => {
    const phaseMap: Record<string, string> = {
      setup: 'Game Setup',
      play: 'Playing',
      attack: 'Attack Phase',
      defend: 'Defense Phase',
      resolution: 'Resolution Phase',
      gameOver: 'Game Over'
    };

    return phaseMap[phase] || phase;
  };

  const isGameOver = currentPhase === 'gameOver';
  let gameOverMessage = '';

  if (isGameOver && G.winner) {
    gameOverMessage = `Game Over: ${G.winner === playerID ? 'You won!' : 'Opponent won!'}`;
    
    // Add message details if available
    if (G.message) {
      gameOverMessage += ` - ${G.message}`;
    }
  }

  return (
    <div className="game-status">
      <div className="status-item turn-counter">
        <span className="status-label">Turn:</span>
        <span className="status-value">{currentTurn || '0'}</span>
      </div>

      <div className="status-item phase-indicator">
        <span className="status-label">Phase:</span>
        <span className="status-value">{getPhaseDisplay(currentPhase)}</span>
      </div>

      <div className="status-item current-player">
        <span className="status-label">Active:</span>
        <span className="status-value">{currentPlayerName}</span>
      </div>

      <div className="status-item player-role">
        <span className="status-label">Your Role:</span>
        <span className="status-value">{playerRole}</span>
      </div>

      {G.message && (
        <div className="game-message">
          {G.message}
        </div>
      )}

      {gameOverMessage && (
        <div className="game-over-message">
          {gameOverMessage}
        </div>
      )}
    </div>
  );
};

export default GameStatus;
