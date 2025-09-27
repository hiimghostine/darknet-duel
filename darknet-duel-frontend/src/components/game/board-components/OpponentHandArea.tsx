import React from 'react';

// Import types
import type { GameComponentProps } from './types';

// Define props interface extending GameComponentProps
export interface OpponentHandAreaProps extends GameComponentProps {
  // Opponent player object
  opponent: any;
}

const OpponentHandArea: React.FC<OpponentHandAreaProps> = ({
  opponent,
  isAttacker
}) => {
  // Render opponent hand (card backs)
  const renderOpponentHand = () => {
    const handSize = opponent?.hand?.length || 0;
    // Color coding logic based on opponent's actual role:
    // If current player is attacker (isAttacker = true), opponent is defender (should be blue)
    // If current player is defender (isAttacker = false), opponent is attacker (should be red)
    const opponentIsDefender = isAttacker; // If I'm attacker, opponent is defender
    const cardColor = opponentIsDefender ? 'border-2 border-blue-500 hover:shadow-blue-500/30' : 'border-2 border-red-500 hover:shadow-red-500/30';
    const textColor = opponentIsDefender ? 'text-blue-500' : 'text-red-500';
    
    const cards = Array.from({ length: handSize }, (_, i) => (
      <div 
        key={i} 
        className={`
          lg:w-16 lg:h-20 w-12 h-16 bg-base-300 ${cardColor} rounded-lg 
          flex items-center justify-center shadow-md
          transition-all duration-300 hover:transform hover:-translate-y-1 hover:z-10
          hover:shadow-lg
          ${i > 0 ? 'lg:-ml-4 -ml-3' : ''}
        `}
        style={{ zIndex: handSize - i }}
      >
        <span className={`${textColor} lg:text-lg text-base font-bold font-mono text-shadow-sm`}>?</span>
      </div>
    ));
    
    return (
      <div className="flex items-end justify-center">
        {cards}
      </div>
    );
  };

  return (
    <div className={`
      flex justify-center items-end gap-4 p-3 rounded-lg relative h-28
      ${isAttacker ? 'defender-area' : 'attacker-area'}
    `}>
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current"></div>
      
      <div className="absolute top-2 left-4 font-bold text-sm font-mono uppercase tracking-wide team-label">
        <div className="flex items-center gap-2">
          <span>{isAttacker ? '🛡️' : '🎯'}</span>
          <span>{opponent?.username || 'OPPONENT'} - {isAttacker ? 'DEFENDER' : 'ATTACKER'}</span>
        </div>
        {/* Opponent AP */}
        <div className="flex items-center gap-1 text-xs mt-1">
          <span className="text-accent">⚡</span>
          <span className="text-accent">
            {(opponent as any)?.actionPoints || 0}/10
          </span>
        </div>
      </div>
      
      {renderOpponentHand()}
    </div>
  );
};

export default React.memo(OpponentHandArea);