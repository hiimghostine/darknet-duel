import React from 'react';
import { Zap, Circle, Database, Shield, Swords, TrendingUp } from 'lucide-react';
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
      <div className="flex flex-col gap-3 lg:w-64 w-full flex-shrink-0 lg:order-1 order-2">
        {/* Consolidated Game State */}
        <div className={`
          rounded-xl p-4 relative backdrop-blur-md border-2 shadow-lg
          bg-gradient-to-br from-base-200/90 to-base-300/80
          border-primary/30
        `}>
          <div className="flex items-center gap-2 mb-4">
            <Circle className="w-4 h-4 text-primary" />
            <h3 className="text-primary font-bold text-xs font-mono uppercase tracking-wider">
              GAME STATE
            </h3>
          </div>
          
          <div className="space-y-3">
            {/* Round */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-base-300/50">
              <span className="text-xs text-base-content/70 font-mono">ROUND</span>
              <span className="text-sm font-bold font-mono text-primary">{G.currentRound || 1}</span>
            </div>
            
            {/* Action Points */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-base-300/50" data-testid="action-points">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-base-content/70 font-mono">ACTION POINTS</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold font-mono text-accent">
                  {currentPlayerObj?.actionPoints || 0}
                </span>
                <span className="text-xs text-base-content/50">/</span>
                <span className="text-xs text-base-content/50">{G?.gameConfig?.maxActionPoints || 10}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Player Info */}
        <div className="bg-gradient-to-br from-base-200/90 to-base-300/80 border-2 border-primary/30 rounded-xl p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-primary font-bold text-xs font-mono uppercase tracking-wider">PLAYER STATS</h3>
          </div>
          <PlayerInfo
            {...commonProps}
            player={currentPlayerObj}
            isOpponent={false}
          />
        </div>
        
        {/* Played Cards - Only show if there are cards */}
        {currentPlayerObj?.playedCards && currentPlayerObj.playedCards.length > 0 && (
          <div className="bg-gradient-to-br from-base-200/90 to-base-300/80 border-2 border-primary/30 rounded-xl p-4 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-primary" />
              <h3 className="text-primary font-bold text-xs font-mono uppercase tracking-wider">PLAYED CARDS</h3>
            </div>
            <div className="max-h-32 overflow-y-auto custom-scrollbar">
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
      <div className="flex flex-col gap-3 lg:w-64 w-full flex-shrink-0 lg:order-3 order-3">
        {/* Network Dominance */}
        <div className="bg-gradient-to-br from-base-200/90 to-base-300/80 border-2 border-primary/30 rounded-xl p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="w-4 h-4 text-primary" />
            <h3 className="text-primary font-bold text-xs font-mono uppercase tracking-wider">
              NETWORK DOMINANCE
            </h3>
          </div>
          
          <PowerBar
            attackerScore={G?.attackerScore || 0}
            defenderScore={G?.defenderScore || 0}
            totalInfrastructure={optimizedInfrastructureData.length}
          />
        </div>
        
        {/* Infrastructure Summary */}
        <div className="bg-gradient-to-br from-base-200/90 to-base-300/80 border-2 border-primary/30 rounded-xl p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-primary font-bold text-xs font-mono uppercase tracking-wider">
              INFRASTRUCTURE
            </h3>
          </div>
          
          <div className="space-y-2">
            {/* Total */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-base-300/50">
              <span className="text-xs text-base-content/70 font-mono">TOTAL NODES</span>
              <span className="text-sm font-bold font-mono text-primary">
                {optimizedInfrastructureData.length}
              </span>
            </div>
            
            {/* Compromised */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-error/5">
              <span className="text-xs text-error/70 font-mono">COMPROMISED</span>
              <span className="text-sm font-bold font-mono text-error">
                {optimizedInfrastructureData.cards.filter(i => i.state === 'compromised').length}
              </span>
            </div>
            
            {/* Fortified */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-success/5">
              <span className="text-xs text-success/70 font-mono">FORTIFIED</span>
              <span className="text-sm font-bold font-mono text-success">
                {optimizedInfrastructureData.cards.filter(i => i.state === 'fortified').length}
              </span>
            </div>
            
            {/* Vulnerable */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-warning/5">
              <span className="text-xs text-warning/70 font-mono">VULNERABLE</span>
              <span className="text-sm font-bold font-mono text-warning">
                {optimizedInfrastructureData.cards.filter(i => i.state === 'vulnerable').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(GameInfoPanels);