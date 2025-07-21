import React from 'react';

// Import types
import type { GameComponentProps } from './types';
import { isReactiveCardObject } from '../../../types/card.types';

// Import hooks
import { useAudioManager } from '../../../hooks/useAudioManager';

// Define props interface extending GameComponentProps
export interface PlayerHandAreaProps extends GameComponentProps {
  // Player state
  currentPlayerObj: any;
  
  // Card action state
  selectedCard: any;
  targetMode: boolean;
  
  // Action handlers
  playCard: (card: any, event: React.MouseEvent) => void;
  cycleCard: (cardId: string) => void;
  selectCardToThrow: (card: any) => void;
  cancelTargeting: () => void;
}

const PlayerHandArea: React.FC<PlayerHandAreaProps> = ({
  G,
  ctx,
  playerID,
  isActive,
  isAttacker,
  currentPlayerObj,
  selectedCard,
  targetMode,
  playCard,
  cycleCard,
  selectCardToThrow,
  cancelTargeting
}) => {
  // Audio manager for sound effects
  const { triggerClick } = useAudioManager();

  // Helper function to get player card classes
  const getPlayerCardClasses = (cardType: string, isAttacker: boolean) => {
    const baseClasses = isAttacker 
      ? 'bg-red-900/30 border-red-600 text-base-content' 
      : 'bg-blue-900/30 border-blue-600 text-base-content';
    
    switch (cardType) {
      case 'attack':
        return `${baseClasses} shadow-red-500/40`;
      case 'exploit':
        return `${baseClasses} shadow-orange-500/40`;
      case 'counter-attack':
      case 'counter':
        return `${baseClasses} shadow-purple-500/40`;
      case 'reaction':
        return `${baseClasses} shadow-cyan-500/40`;
      case 'shield':
      case 'fortify':
        return `${baseClasses} shadow-blue-500/40`;
      case 'wildcard':
        return 'bg-purple-900/30 border-purple-600 text-base-content shadow-purple-500/40';
      default:
        return baseClasses;
    }
  };

  // Render player hand (face-up cards)
  const renderPlayerHand = () => {
    const hand = currentPlayerObj?.hand || [];
    
    return (
      <div className="flex flex-wrap gap-2 justify-center max-w-4xl lg:gap-2 gap-1">
        {hand.map((card: any, index: number) => {
          const isSelected = selectedCard === card.id;
          const cardType = card.type || card.cardType;
          const currentStage = ctx.activePlayers && playerID ? ctx.activePlayers[playerID] : null;
          const isInReactionMode = currentStage === 'reaction';
          const isInActionMode = currentStage === 'action';
          
          // Proper reaction mode filtering - only reactive cards can be played
          let isPlayable = false;
          if (!targetMode && isActive && ctx.phase === 'playing') {
            // Special handling for D307 - can be played in both normal and reaction modes
            const isD307 = card.id?.startsWith('D307') || card.specialEffect === 'emergency_restore_shield';
            
            if (isInReactionMode) {
              // In reaction mode, only reactive cards can be played
              const isReactiveCard = isReactiveCardObject(card, G);
              if (isReactiveCard && card.playable) {
                if (isD307) {
                  // D307 special condition: only playable if there's compromised infrastructure
                  const hasCompromisedInfra = G.infrastructure?.some(infra => infra.state === 'compromised') || false;
                  isPlayable = hasCompromisedInfra;
                } else {
                  isPlayable = true;
                }
              }
            } else if (isInActionMode) {
              // In action mode, all playable cards can be played
              if (isD307) {
                // D307 special condition: only playable if there's compromised infrastructure
                const hasCompromisedInfra = G.infrastructure?.some(infra => infra.state === 'compromised') || false;
                isPlayable = card.playable && hasCompromisedInfra;
              } else {
                isPlayable = card.playable;
              }
            }
          }
          
          // Card type border colors
          const borderColorClass = cardType === 'attacker' ? 'border-l-error' :
                                 cardType === 'defender' ? 'border-l-primary' :
                                 cardType === 'wildcard' ? 'border-l-warning' :
                                 cardType === 'reaction' ? 'border-l-accent' :
                                 cardType === 'counter-attack' ? 'border-l-accent' :
                                 'border-l-accent';
          
          // Special styling for reactive cards in reaction mode
          const isReactiveCard = isReactiveCardObject(card, G);
          const reactionModeClass = isInReactionMode && isReactiveCard ?
            'ring-2 ring-accent animate-pulse bg-accent/10' : '';
          
          return (
            <div
              key={card.id}
              className={`
                group relative lg:w-28 lg:h-40 w-24 h-32 border-2 rounded-xl lg:p-3 p-2
                flex flex-col justify-center items-center transition-all duration-500 cursor-pointer
                font-mono lg:text-sm text-xs overflow-visible
                ${getPlayerCardClasses(cardType, isAttacker)}
                ${borderColorClass} border-l-4
                ${reactionModeClass}
                ${isSelected ? 'border-warning shadow-lg shadow-warning/50 -translate-y-2 scale-105 z-30' : ''}
                ${isPlayable ? 'border-success shadow-md shadow-success/30 hover:scale-125 hover:z-20 hover:shadow-2xl transform-gpu' : ''}
                ${!isPlayable && !targetMode ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              onClick={(event) => {
                if (!isPlayable) {
                  console.log('🚫 Card not playable:', {
                    cardName: card.name,
                    isInReactionMode,
                    isReactive: isReactiveCardObject(card, G),
                    playable: card.playable
                  });
                  return;
                }
                
                // Check if this card needs targeting (let useCardActions decide)
                // This includes: attack, exploit, reaction, counter-attack, shield, fortify, response
                const needsTargeting = cardType === 'attack' || cardType === 'exploit' || 
                                     cardType === 'reaction' || cardType === 'counter-attack' || 
                                     cardType === 'counter' || cardType === 'shield' || 
                                     cardType === 'fortify' || cardType === 'response';
                
                if (needsTargeting) {
                  console.log('🎯 Selecting card for targeting:', card.name, 'type:', cardType);
                  selectCardToThrow(card);
                } else {
                  console.log('🃏 Playing card directly:', card.name, 'type:', cardType);
                  playCard(card, event);
                }
              }}
            >
              {/* Compact Card View */}
              <div className="group-hover:opacity-0 transition-opacity duration-300 flex flex-col justify-between h-full text-center p-1">
                {/* Top section - Cost and Type Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className="lg:w-6 lg:h-6 w-5 h-5 bg-amber-600 text-amber-100 rounded-full flex items-center justify-center lg:text-xs text-[9px] font-bold">
                    {card.cost}
                  </div>
                  <div className="lg:text-xl text-lg">
                    {cardType === 'attack' ? '⚔️' : 
                     cardType === 'exploit' ? '🔓' : 
                     cardType === 'counter-attack' || cardType === 'counter' ? '🛡️' : 
                     cardType === 'reaction' ? '⚡' : 
                     cardType === 'shield' ? '🔒' : 
                     cardType === 'fortify' ? '🏰' : 
                     cardType === 'wildcard' ? '🃏' : '🔧'}
                  </div>
                </div>
                
                {/* Middle section - Card name */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="font-bold lg:text-[11px] text-[9px] leading-tight px-1">
                    {card.name.length > 10 ? card.name.substring(0, 10) + '...' : card.name}
                  </div>
                </div>
                
                {/* Bottom section - Type and Category */}
                <div className="space-y-1">
                  <div className="lg:text-[9px] text-[8px] font-semibold uppercase text-base-content/70">
                    {cardType}
                  </div>
                  {card.metadata?.category && (
                    <div className={`
                      inline-block lg:text-[7px] text-[6px] rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wide
                      ${card.metadata.category === 'network' ? 'bg-blue-500 text-blue-100' :
                        card.metadata.category === 'web' ? 'bg-green-500 text-green-100' :
                        card.metadata.category === 'social' ? 'bg-purple-500 text-purple-100' :
                        card.metadata.category === 'physical' ? 'bg-orange-500 text-orange-100' :
                        card.metadata.category === 'malware' ? 'bg-red-500 text-red-100' :
                        'bg-gray-500 text-gray-100'}
                    `}>
                      {card.metadata.category}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Card View (on hover) - Card-like proportions */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-base-200/95 backdrop-blur-sm rounded-xl border-2 border-base-content/20 z-20 transform scale-125 origin-bottom shadow-2xl w-64 h-96 p-3 flex flex-col pointer-events-none">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-amber-600 text-base-content rounded-full flex items-center justify-center text-xs font-bold">
                      {card.cost}
                    </div>
                    {card.power && (
                      <div className="w-6 h-6 bg-blue-600 text-base-content rounded-full flex items-center justify-center text-xs font-bold">
                        {card.power}
                      </div>
                    )}
                  </div>
                  <div className="text-xl">
                    {cardType === 'attack' ? '⚔️' : 
                     cardType === 'exploit' ? '🔓' : 
                     cardType === 'counter-attack' || cardType === 'counter' ? '🛡️' : 
                     cardType === 'reaction' ? '⚡' : 
                     cardType === 'shield' ? '🔒' : 
                     cardType === 'fortify' ? '🏰' : 
                     cardType === 'wildcard' ? '🃏' : '🔧'}
                  </div>
                </div>

                {/* Card Name and Type */}
                <div className="text-center mb-2 border-b border-current/30 pb-2">
                  <div className="font-bold text-sm text-base-content leading-tight mb-1">
                    {card.name}
                  </div>
                  <div className="text-xs opacity-70 uppercase text-base-content/70 font-semibold">
                    {cardType}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 justify-center">
                    {(card as any).attackVector && (
                      <span className="inline-block bg-orange-600 text-base-content rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                        {(card as any).attackVector}
                      </span>
                    )}
                    {card.metadata?.category && (
                      <span className={`
                        inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-base-content
                        ${card.metadata.category === 'network' ? 'bg-blue-600' :
                          card.metadata.category === 'web' ? 'bg-green-600' :
                          card.metadata.category === 'social' ? 'bg-purple-600' :
                          card.metadata.category === 'physical' ? 'bg-orange-600' :
                          card.metadata.category === 'malware' ? 'bg-red-600' :
                          'bg-gray-600'}
                      `}>
                        {card.metadata.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Description */}
                <div className="flex-1 mb-2">
                  <div className="text-xs text-base-content/70 leading-tight mb-2">
                    {card.description}
                  </div>
                  
                  {/* Effects */}
                  {(card as any).effects && (card as any).effects.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-info mb-1 uppercase">Effects:</div>
                      {(card as any).effects.map((effect: any, idx: number) => (
                        <div key={idx} className="text-[10px] text-info bg-info/10 rounded px-1.5 py-0.5 mb-1">
                          <span className="font-semibold">{effect.type}:</span> {effect.description}
                          {effect.value && <span className="ml-1 text-info font-bold">({effect.value})</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flavor Text */}
                  {card.metadata?.flavor && (
                    <div className="border-t border-current/20 pt-1.5">
                      <div className="text-[10px] italic text-warning leading-tight">
                        "{card.metadata.flavor}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer - Special Properties */}
                <div className="space-y-1">
                  {(card as any).isReactive && (
                    <div className="text-center text-[10px] font-bold bg-info text-base-content py-0.5 px-1.5 rounded">
                      REACTIVE
                    </div>
                  )}
                  
                  {(card as any).preventReaction && (
                    <div className="text-center text-[10px] font-bold bg-error text-base-content py-0.5 px-1.5 rounded">
                      NO REACTIONS
                    </div>
                  )}
                </div>
              </div>

              {/* Special indicators */}
              {isReactiveCard && (
                <div className="absolute top-1 left-1 bg-info/90 text-base-content rounded px-1 text-[6px] font-bold z-60">
                  REACTIVE
                </div>
              )}
              
              {isInReactionMode && isReactiveCard && (
                <div className="absolute -top-1 -right-1 bg-info text-base-content rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold animate-pulse z-60">
                  ⚡
                </div>
              )}
              
              {/* Per-card cycle button */}
              {!targetMode && !isInReactionMode && isActive && (
                <button 
                  className="absolute -top-1 -left-1 bg-warning text-base-content rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold hover:scale-110 transition-transform z-60"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🔄 Cycling card:', card.name);
                    cycleCard(card.id);
                  }}
                  title="Cycle this card"
                >
                  ↻
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`
      flex justify-center items-start gap-4 p-4 rounded-lg relative h-44
      ${isAttacker ? 'attacker-area' : 'defender-area'}
      ${isActive ? 'ring-2 ring-current/50 shadow-lg shadow-current/20' : ''}
    `}>
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current"></div>
      
      <div className="absolute top-2 left-4 font-bold text-sm font-mono uppercase tracking-wide team-label">
        <div className="flex items-center gap-2">
          <span>{isAttacker ? '🎯' : '🛡️'}</span>
          <span>{currentPlayerObj?.username || playerID} - {isAttacker ? 'ATTACKER' : 'DEFENDER'}</span>
        </div>
      </div>
      
      {/* Hand peek indicator */}
      <div className="absolute top-2 right-4 text-xs font-mono uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity team-label">
        TACTICAL_HAND • {currentPlayerObj?.hand?.length || 0} CARDS
      </div>
      
      {renderPlayerHand()}
      
      {/* Action buttons */}
      <div className="absolute bottom-2 right-4 flex gap-2">
        {targetMode && (
          <button 
            className="btn btn-sm bg-base-300/80 border-warning/30 text-warning hover:bg-warning/10 font-mono font-bold uppercase"
            onClick={() => {
              triggerClick(); // Play click sound on button press
              cancelTargeting();
            }}
          >
            CANCEL
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(PlayerHandArea);