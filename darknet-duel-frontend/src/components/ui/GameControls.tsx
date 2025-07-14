import React from 'react';
import './GameControls.css';

interface GameControlsProps {
  onLeaveGame: () => void;
  matchID?: string;
  playerID?: string | null;
  connectionStatus?: string;
}

/**
 * A component that displays game control buttons and debug information
 */
const GameControls: React.FC<GameControlsProps> = ({
  onLeaveGame,
  matchID,
  playerID,
  connectionStatus
}) => {
  return (
    <div className="game-controls-container">
      <div className="game-debug-info">
        <small>
          Game ID: {matchID || 'Unknown'} | Player: {playerID || '?'} 
          {connectionStatus && <> | Status: {connectionStatus}</>}
        </small>
      </div>
      
      <div className="game-controls">
        <button className="leave-game-button" onClick={onLeaveGame}>
          Leave Game
        </button>
      </div>
    </div>
  );
};

export default GameControls;
