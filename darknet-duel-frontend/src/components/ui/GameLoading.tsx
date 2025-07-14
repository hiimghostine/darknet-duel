import React from 'react';
import './GameLoading.css';

interface GameLoadingProps {
  message?: string;
}

/**
 * A reusable loading component for game-related loading states
 */
const GameLoading: React.FC<GameLoadingProps> = ({ message = 'Loading game...' }) => {
  return (
    <div className="game-loading">
      <div className="loading-spinner"></div>
      <div className="loading-message">{message}</div>
    </div>
  );
};

export default GameLoading;
