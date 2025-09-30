import React from 'react';
import type { GameState } from '../../../types/game.types';
import PlayerInfo from './PlayerInfo';
import PlayerBoard from './PlayerBoard';
import PowerBar from './PowerBar';

interface GameInfoPanelsProps {
  G: GameState;
  ctx: any;
  playerID: string | null;
  isActive: boolean;
  moves: any;
  isAttacker: boolean;
  currentPlayerObj: any;
  opponent?: any;
  currentPhase: string;
  optimizedInfrastructureData: {
    cards: any[];
    length: number;
    states: any[];
  };
  sendChatMessage?: (content: string) => void;
}

const GameInfoPanels: React.FC<GameInfoPanelsProps> = ({
  G,
  ctx,
  playerID,
  isActive,
  moves,
  isAttacker,
  currentPlayerObj,
  currentPhase,
  optimizedInfrastructureData
}) => {
  // Common props to pass to child components
  const commonProps = {
    G,
    ctx,
    playerID,
    isActive,
    moves,
    isAttacker
  };

  return (
    <>
      {/* Left info panel */}
      <div className="flex flex-col gap-4 lg:w-64 w-full flex-shrink-0 lg:order-1 order-2">
        <div className={`
          rounded-lg p-4 relative backdrop-blur-sm border game-info-panel
          ${isAttacker 
            ? 'bg-red-900/60 border-red-700/40' 
            : 'bg-blue-900/60 border-blue-700/40'
          }
        `}>
          <div className={`
            absolute top-0 left-0 w-3 h-3 border-t border-l
            ${isAttacker ? 'border-red-500' : 'border-blue-500'}
          `}></div>
          <div className={`
            absolute bottom-0 right-0 w-3 h-3 border-b border-r
            ${isAttacker ? 'border-red-500' : 'border-blue-500'}
          `}></div>
          
          <h3 className={`
            font-bold text-sm mb-3 font-mono uppercase tracking-wide
            ${isAttacker ? 'text-red-300' : 'text-blue-300'}
          `}>GAME_INFO</h3>
          <div className="space-y-2 text-sm">
            <div>Round: {G.currentRound || 1}</div>
            <div>Phase: {currentPhase}</div>
            <div className="flex items-center gap-2" data-testid="action-points">
              <span>AP:</span>
              <span className="text-accent font-bold">
                {currentPlayerObj?.actionPoints || 0}/{G?.gameConfig?.maxActionPoints || 10}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
          
          <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">PLAYER_INFO</h3>
          <div className="space-y-3">
            <PlayerInfo
              {...commonProps}
              player={currentPlayerObj}
              isOpponent={false}
            />
          </div>
        </div>
        
        {/* Player Board - Played Cards */}
        {currentPlayerObj?.playedCards && currentPlayerObj.playedCards.length > 0 && (
          <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
            
            <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">PLAYED_CARDS</h3>
            <div className="max-h-40 overflow-y-auto">
              <PlayerBoard
                {...commonProps}
                player={currentPlayerObj}
                isCurrentPlayer={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right info panel */}
      <div className="flex flex-col gap-4 lg:w-64 w-full flex-shrink-0 lg:order-3 order-3">
        <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
          
          <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">BATTLE_STATUS</h3>
          
          <PowerBar
            attackerScore={G?.attackerScore || 0}
            defenderScore={G?.defenderScore || 0}
            totalInfrastructure={optimizedInfrastructureData.length}
          />
        </div>
        
        <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
          
          <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">INFRASTRUCTURE</h3>
          <div className="space-y-2 text-sm">
            <div>Total: {optimizedInfrastructureData.length}</div>
            <div>Compromised: {optimizedInfrastructureData.cards.filter(i => i.state === 'compromised').length}</div>
            <div>Secured: {optimizedInfrastructureData.cards.filter(i => i.state === 'fortified').length}</div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default React.memo(GameInfoPanels);