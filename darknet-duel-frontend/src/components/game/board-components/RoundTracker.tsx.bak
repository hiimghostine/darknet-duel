import React from 'react';
import type { GameState } from 'shared-types/game.types';
import '../../../styles/round-tracker.css';

interface RoundTrackerProps {
  gameState: GameState;
}

/**
 * RoundTracker component displays the current round and progress toward the 15-round limit
 */
const RoundTracker: React.FC<RoundTrackerProps> = ({ gameState }) => {
  const { currentRound = 1 } = gameState;
  const maxRounds = 15;
  const progress = (currentRound / maxRounds) * 100;
  
  // Determine color based on how far through the rounds we are
  const getColorClass = () => {
    if (currentRound <= 5) return 'round-early';
    if (currentRound <= 10) return 'round-middle';
    if (currentRound <= 13) return 'round-late';
    return 'round-final';
  };

  // Calculate remaining rounds
  const remainingRounds = maxRounds - currentRound + 1;
  
  return (
    <div className="round-tracker">
      <div className="round-info">
        <div className="round-number">Round {currentRound} of {maxRounds}</div>
        {remainingRounds <= 3 && (
          <div className="round-warning">
            {remainingRounds === 1 ? 'Final Round!' : `${remainingRounds} Rounds Left!`}
          </div>
        )}
      </div>
      
      <div className="round-progress-container">
        <div 
          className={`round-progress-bar ${getColorClass()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RoundTracker;
