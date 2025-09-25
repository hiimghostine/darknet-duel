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
    const cards = Array.from({ length: handSize }, (_, i) => (
      <div 
        key={i} 
        className={`
          lg:w-20 lg:h-28 w-16 h-24 bg-base-300 border border-error rounded-lg 
          flex items-center justify-center shadow-lg
          transition-all duration-300 hover:transform hover:-translate-y-2 hover:z-10
          hover:shadow-xl hover:shadow-error/30
          ${i > 0 ? 'lg:-ml-5 -ml-4' : ''}
        `}
        style={{ zIndex: handSize - i }}
      >
        <span className="text-error lg:text-2xl text-xl font-bold font-mono text-shadow-sm">?</span>
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
      flex justify-center items-end gap-4 p-4 rounded-lg relative h-40
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