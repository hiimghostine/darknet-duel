import React from 'react';
import PlayerInfo from './PlayerInfo';
import PlayerBoard from './PlayerBoard';
import InfrastructureArea from './InfrastructureArea';
import type { GameState } from '../../../types/game.types';

interface GameBoardLayoutProps {
  commonProps: {
    G: GameState;
    ctx: any;
    playerID: string | null;
    isActive: boolean;
    moves: any;
    isAttacker: boolean;
  };
  currentPlayerObj: any;
  opponent: any;
  infrastructureCards: any[];
  targetMode: boolean;
  targetedInfraId: string | null;
  animatingThrow: boolean;
  handleInfrastructureTarget: (infraId: string, event?: React.MouseEvent) => void;
}

/**
 * Main game layout containing player areas and infrastructure
 * Extracted from main component for better modularity
 */
const GameBoardLayout: React.FC<GameBoardLayoutProps> = ({
  commonProps,
  currentPlayerObj,
  opponent,
  infrastructureCards,
  targetMode,
  targetedInfraId,
  animatingThrow,
  handleInfrastructureTarget
}) => {
  return (
    <div className="game-layout">
      {/* Opponent area */}
      <div className="opponent-area">
        <PlayerInfo
          {...commonProps}
          player={opponent}
          isOpponent={true}
        />
        
        <PlayerBoard
          {...commonProps}
          player={opponent}
          isCurrentPlayer={false}
        />
      </div>
      
      {/* Infrastructure area - middle of the board */}
      <InfrastructureArea
        {...commonProps}
        infrastructureCards={infrastructureCards}
        targetMode={targetMode}
        targetedInfraId={targetedInfraId}
        animatingThrow={animatingThrow}
        onTargetInfrastructure={handleInfrastructureTarget}
      />
      
      {/* Player area */}
      <div className="player-area">
        <PlayerInfo
          {...commonProps}
          player={currentPlayerObj}
          isOpponent={false}
        />
        
        <PlayerBoard
          {...commonProps}
          player={currentPlayerObj}
          isCurrentPlayer={true}
        />
      </div>
    </div>
  );
};

export default React.memo(GameBoardLayout);