import React from 'react';
import PlayerHand from './PlayerHand';
import type { GameState } from '../../../types/game.types';

interface GameBoardHandProps {
  commonProps: {
    G: GameState;
    ctx: any;
    playerID: string | null;
    isActive: boolean;
    moves: any;
    isAttacker: boolean;
  };
  currentPlayerObj: any;
  playCard: (card: any, event?: React.MouseEvent) => void;
  cycleCard: (cardId: string) => void;
  selectCardToThrow: (card: any) => void;
  targetMode: boolean;
}

/**
 * Player hand section component
 * Extracted from main component for better modularity
 */
const GameBoardHand: React.FC<GameBoardHandProps> = ({
  commonProps,
  currentPlayerObj,
  playCard,
  cycleCard,
  selectCardToThrow,
  targetMode
}) => {
  return (
    <div className="player-hand-container">
      <div className="hand-peek">Your Hand (Hover to reveal)</div>
      <PlayerHand
        {...commonProps}
        player={currentPlayerObj}
        onPlayCard={playCard}
        onCycleCard={cycleCard}
        onSelectCardToThrow={selectCardToThrow}
        targetMode={targetMode}
      />
    </div>
  );
};

export default React.memo(GameBoardHand);