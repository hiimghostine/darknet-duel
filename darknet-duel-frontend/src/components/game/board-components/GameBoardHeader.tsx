import React from 'react';
import GameStatus from './GameStatus';
import GameControls from './GameControls';
import type { GameState } from '../../../types/game.types';

interface GameBoardHeaderProps {
  commonProps: {
    G: GameState;
    ctx: any;
    playerID: string | null;
    isActive: boolean;
    moves: any;
    isAttacker: boolean;
  };
  memoizedG: GameState;
  currentPhase: string;
  targetMode: boolean;
  selectedCard: any;
  handleEndTurn: () => void;
  cycleCard: (cardId: string) => void;
  cancelTargeting: () => void;
  handleSkipReaction: () => void;
  surrender: () => void;
}

/**
 * Game board header containing status and controls
 * Extracted from main component for better modularity
 */
const GameBoardHeader: React.FC<GameBoardHeaderProps> = ({
  commonProps,
  memoizedG,
  currentPhase,
  targetMode,
  selectedCard,
  handleEndTurn,
  cycleCard,
  cancelTargeting,
  handleSkipReaction,
  surrender
}) => {
  return (
    <div className="game-status-bar">
      <GameStatus 
        {...commonProps}
        message={memoizedG.message}
        currentPhase={currentPhase}
      />
      
      <GameControls
        {...commonProps}
        targetMode={targetMode}
        selectedCard={selectedCard}
        onEndTurn={handleEndTurn}
        onCycleCard={cycleCard}
        onCancelThrow={cancelTargeting}
        onSkipReaction={handleSkipReaction}
        onSurrender={surrender}
      />
    </div>
  );
};

export default React.memo(GameBoardHeader);