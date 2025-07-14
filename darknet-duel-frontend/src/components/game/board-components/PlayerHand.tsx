import React from 'react';
import type { PlayerHandProps, ExtendedCard } from './types';
import CardDisplay from './CardDisplay';
import { isAttackerCard, isReactiveCardObject } from '../../../types/card.types';

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  onPlayCard,
  onCycleCard,
  onSelectCardToThrow,
  targetMode,
  ctx,
  playerID,
  isActive
}) => {
  // Check if the player is in reaction mode
  const isInReactionMode = ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'reaction';
  
  // Debug logging for card interaction issues
  console.log('PlayerHand rendering with state:', { 
    isActive, 
    playerID, 
    targetMode, 
    isInReactionMode,
    currentPhase: ctx.phase,
    activePlayers: ctx.activePlayers,
    numCards: player?.hand?.length || 0
  });
  
  if (!player || !player.hand || player.hand.length === 0) {
    return <div className="empty-hand">No cards in hand</div>;
  }

  // Handle card click based on game state and card type
  const handleCardClick = (card: ExtendedCard, event?: React.MouseEvent) => {
    console.log('💥 Card clicked:', { 
      cardName: card.name, 
      cardType: card.type, 
      playable: card.playable, 
      disabled: card.disabled,
      isActive,
      targetMode
    });
    
    if (targetMode) {
      console.log('🚫 Card click ignored - in targeting mode');
      return; // Disable card interactions during targeting
    }
    
    // In reaction mode, only reactive cards can be played
    if (isInReactionMode) {
      console.log('👀 In reaction mode with card:', card.name);
      if (isReactiveCardObject(card) && card.playable) {
        console.log('✅ Playing reactive card in reaction mode:', card.name);
        onPlayCard(card, event);
      } else {
        console.log('❌ Card not playable in reaction mode:', { 
          isReactive: isReactiveCardObject(card), 
          playable: card.playable 
        });
      }
      return; // All other card types can't be played in reaction mode
    }
    
    // Normal turn logic
    if (isAttackerCard(card.type) && (card.type === 'attack' || card.type === 'exploit')) {
      console.log('🎯 Selected card for throwing:', card.name);
      onSelectCardToThrow(card);
    } else if (card.playable) {
      console.log('🃏 Playing non-attack card directly:', card.name);
      onPlayCard(card, event);
    } else {
      console.log('⛔ Card not playable:', card.name);
    }
  };

  return (
    <div className="player-hand">
      {player.hand.map((card: ExtendedCard) => {
        // Determine if card is playable based on game state
        const isPlayable = card.playable && isActive && 
          (!isInReactionMode || (isInReactionMode && isReactiveCardObject(card)));
        
        // Add cycle button as an overlay on the card
        const cycleButton = !targetMode && !isInReactionMode && (
          <button 
            className="card-cycle-button"
            onClick={(e) => {
              e.stopPropagation();
              onCycleCard(card.id);
            }}
            title="Cycle this card"
          >
            ↻
          </button>
        );
        
        return (
          <div key={card.id} className="hand-card-container">
            <CardDisplay 
              card={card}
              onClick={handleCardClick}
              isSelectable={!targetMode}
              isDisabled={!isPlayable}
              className="hand-card"
            />
            {cycleButton}
          </div>
        );
      })}
    </div>
  );
};

export default PlayerHand;
