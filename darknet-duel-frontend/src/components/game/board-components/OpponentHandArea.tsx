import React from 'react';
import { Shield, Sword, Zap, User } from 'lucide-react';

// Import types
import type { GameComponentProps } from './types';

// Import hooks
import { useResponsiveGameScaling } from '../../../hooks/useResponsiveGameScaling';

// Define props interface extending GameComponentProps
export interface OpponentHandAreaProps extends GameComponentProps {
  // Opponent player object
  opponent: any;
}

const OpponentHandArea: React.FC<OpponentHandAreaProps> = ({
  opponent,
  isAttacker
}) => {
  // Get responsive scaling configuration
  const scaling = useResponsiveGameScaling();
  
  // Render opponent hand (card backs)
  const renderOpponentHand = () => {
    const handSize = opponent?.hand?.length || 0;
    // Color coding logic based on opponent's actual role:
    // If current player is attacker (isAttacker = true), opponent is defender (should be blue)
    // If current player is defender (isAttacker = false), opponent is attacker (should be red)
    const opponentIsDefender = isAttacker; // If I'm attacker, opponent is defender
    const cardColor = opponentIsDefender 
      ? 'border-2 border-blue-500/50 hover:border-blue-500 hover:shadow-blue-500/30 bg-gradient-to-br from-blue-950/80 to-blue-900/60' 
      : 'border-2 border-red-500/50 hover:border-red-500 hover:shadow-red-500/30 bg-gradient-to-br from-red-950/80 to-red-900/60';
    
    const cards = Array.from({ length: handSize }, (_, i) => {
      // Calculate card dimensions (smaller than player cards)
      const cardWidth = scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl' 
        ? scaling.cardWidthLg * 0.5 
        : scaling.cardWidth * 0.45;
      const cardHeight = scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl'
        ? scaling.cardHeightLg * 0.5
        : scaling.cardHeight * 0.45;
      
      return (
        <div 
          key={i} 
          className={`
            relative ${cardColor} rounded-lg 
            flex flex-col items-center justify-center shadow-md backdrop-blur-sm
            transition-all duration-300 hover:transform hover:-translate-y-2 hover:z-10
            hover:shadow-xl
          `}
          style={{ 
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            zIndex: handSize - i,
            marginLeft: i > 0 ? `-${cardWidth * 0.3}px` : '0'
          }}
        >
        {/* Card back pattern */}
        <div className="absolute inset-0 rounded-lg overflow-hidden opacity-20">
          <div className={`absolute inset-0 ${opponentIsDefender ? 'bg-blue-500' : 'bg-red-500'}`} 
               style={{
                 backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`
               }} 
          />
        </div>
        
        {/* Center icon */}
        <div className={`${opponentIsDefender ? 'text-blue-400' : 'text-red-400'} z-10`}>
          {opponentIsDefender ? <Shield className="w-6 h-6" /> : <Sword className="w-6 h-6" />}
        </div>
        
        {/* Card back glow */}
        <div className={`absolute inset-0 rounded-lg ${opponentIsDefender ? 'bg-blue-500/5' : 'bg-red-500/5'}`} />
      </div>
      );
    });
    
    return (
      <div className="flex items-end justify-center">
        {cards}
      </div>
    );
  };

  return (
    <div 
      className={`
        flex justify-between items-center gap-4 rounded-lg relative
        border backdrop-blur-sm
        ${isAttacker 
          ? 'bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-500/20' 
          : 'bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-500/20'
        }
      `}
      style={{
        height: scaling.opponentHandHeight,
        padding: `${scaling.containerPadding}px`
      }}
    >
      {/* Info panel */}
      <div className="flex items-center gap-3">
        {/* Opponent avatar/icon */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${isAttacker 
            ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30' 
            : 'bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/30'
          }
        `}>
          {isAttacker ? <Shield className="w-6 h-6 text-blue-300" /> : <Sword className="w-6 h-6 text-red-300" />}
        </div>
        
        {/* Opponent info */}
        <div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-base-content/60" />
            <span className="font-bold text-sm font-mono uppercase tracking-wide">
              {opponent?.username || 'OPPONENT'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span className="text-base-content/60">{isAttacker ? 'DEFENDER' : 'ATTACKER'}</span>
            <span className="text-base-content/40">•</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-accent" />
              <span className="text-accent font-bold font-mono">
                {(opponent as any)?.actionPoints || 0}/10 AP
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hand display */}
      <div className="flex-1 flex justify-center">
        {renderOpponentHand()}
      </div>
      
      {/* Hand count badge */}
      <div className={`
        px-3 py-1.5 rounded-lg font-mono text-xs font-bold border
        ${isAttacker 
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
          : 'bg-red-500/10 border-red-500/30 text-red-300'
        }
      `}>
        {opponent?.hand?.length || 0} CARDS
      </div>
    </div>
  );
};

export default React.memo(OpponentHandArea);