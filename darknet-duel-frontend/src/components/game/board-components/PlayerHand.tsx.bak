import React from 'react';
import type { PlayerHandProps, ExtendedCard } from './types';
import CardDisplay from './CardDisplay';
import { isAttackerCard, isReactiveCardObject } from '../../../types/card.types';
import { getAvailableCardTypes } from '../../../utils/wildcardTypeUtils';

const PlayerHand: React.FC<PlayerHandProps> = ({
  G,
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
      wildcardType: card.wildcardType,
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
      if (isReactiveCardObject(card, G) && card.playable) {
        console.log('✅ Playing reactive card in reaction mode:', card.name);
        onPlayCard(card, event);
      } else {
        console.log('❌ Card not playable in reaction mode:', {
          isReactive: isReactiveCardObject(card, G),
          playable: card.playable
        });
      }
      return; // All other card types can't be played in reaction mode
    }
    
    // Handle wildcard cards - they need special treatment
    if (card.type === 'wildcard' && card.wildcardType) {
      console.log('🎴 Wildcard card clicked:', card.name, 'wildcardType:', card.wildcardType);
      
      // Get available types for this wildcard
      const availableTypes = getAvailableCardTypes(card.wildcardType);
      console.log('Available wildcard types:', availableTypes);
      
      // Check if any of the available types are targeting cards
      const hasTargetingTypes = availableTypes.some(type => 
        type === 'attack' || type === 'exploit' || type === 'counter-attack' || 
        type === 'shield' || type === 'fortify' || type === 'response' || type === 'reaction'
      );
      
      if (hasTargetingTypes) {
        console.log('🎯 Wildcard has targeting types - selecting for throw');
        onSelectCardToThrow(card);
      } else {
        console.log('🃏 Wildcard has no targeting types - playing directly');
        onPlayCard(card, event);
      }
      return;
    }

    // Normal turn logic for non-wildcard cards
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
          (!isInReactionMode || (isInReactionMode && isReactiveCardObject(card, G)));
        
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
