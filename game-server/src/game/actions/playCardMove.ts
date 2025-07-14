import { Ctx } from 'boardgame.io';
import { GameState, GameAction } from 'shared-types/game.types';
import { Card, CardType } from 'shared-types/card.types';
import { hasCardFeatures } from './utils/typeGuards';
import { isCardPlayable } from '../utils/cardUtils';
import { applySpecialEffect } from './utils/effectHandling';
import { getEffectiveCardType } from '../utils/wildcardUtils';
import { TemporaryEffectsManager } from './temporaryEffectsManager';

/**
 * Action to play a card from hand onto the field
 * This handles general card playing and effects
 */
export const playCardMove = ({ G, ctx, playerID }: { G: GameState; ctx: Ctx; playerID: string }, cardId: string, targetId?: string): GameState => {
  const isAttacker = playerID === G.attacker?.id;
  const player = isAttacker ? G.attacker : G.defender;
  
  if (!player) return G;
  
  // Find the card in player's hand
  const cardIndex = player.hand.findIndex(card => card.id === cardId);
  if (cardIndex === -1) return G; // Card not found
  
  const card = player.hand[cardIndex];
  
  // Handle wildcards - they can be played as other types using our utility function
  const extendedCard = hasCardFeatures(card) ? card : card;
  let effectiveCardType = getEffectiveCardType(card.type, extendedCard.wildcardType);
  
  // Calculate effective card cost, applying any cost reductions
  let effectiveCost = card.cost;
  
  // Handle Living Off The Land cost reduction (A302)
  if (card.id === 'A302') {
    // Check if there's a user infrastructure to target
    const hasUserInfrastructure = G.infrastructure?.some(infra => infra.type === 'user');
    if (hasUserInfrastructure) {
      effectiveCost = Math.max(0, card.cost - 1);
      console.log(`Living Off The Land: Cost reduced from ${card.cost} to ${effectiveCost}`);
    }
  }
  
  // Check if player has global cost reduction effects
  const playerHasCostReduction = TemporaryEffectsManager.hasEffect(G, 'cost_reduction', playerID);
  if (playerHasCostReduction) {
    const reduction = 1; // Default reduction amount
    effectiveCost = Math.max(0, effectiveCost - reduction);
    console.log(`Cost reduction effect applied: Cost reduced to ${effectiveCost}`);
  }
  
  // Check if player has enough action points for the effective cost
  if (player.actionPoints < effectiveCost) {
    return {
      ...G,
      message: "Not enough action points to play this card"
    };
  }
  
  // For non-immediate effect cards like counter-attack,
  // check if it's the appropriate time to play them
  if ((effectiveCardType === 'counter-attack' || effectiveCardType === 'counter') 
      && !isCardPlayable(G, ctx, playerID, card, player)) {
    return {
      ...G,
      message: "Cannot play this card type at this time"
    };
  }
  
  // For non-immediate effect cards like counter-attack,
  // simply add them to player's active cards
  const isImmediateEffect = effectiveCardType !== 'counter-attack' && 
                           effectiveCardType !== 'counter' && 
                           effectiveCardType !== 'reaction';
  
  if (!isImmediateEffect) {
    // Create a deep copy of the card
    const cardCopy = JSON.parse(JSON.stringify(card));
    
    // Add to active cards for later use
    // Cast player to any to handle activeCards property
    // This matches the behavior of the original code
    const playerAny = player as any;
    const activeCards = playerAny.activeCards ? [...playerAny.activeCards] : [];
    
    const updatedPlayer = {
      ...player,
      activeCards: [...activeCards, cardCopy],
      hand: player.hand.filter((_, idx) => idx !== cardIndex),
      actionPoints: player.actionPoints - effectiveCost // Use effective cost with reductions
    };
    
    // Record action
    const newAction: GameAction = {
      playerRole: isAttacker ? 'attacker' : 'defender',
      actionType: 'playCard',
      timestamp: Date.now(),
      payload: { cardId, cardType: card.type }
    };
    
    return {
      ...G,
      attacker: isAttacker ? updatedPlayer : G.attacker,
      defender: !isAttacker ? updatedPlayer : G.defender,
      actions: [...G.actions, newAction],
      message: `${player.name} played ${card.name}`
    };
  }
  
  // For immediate effect cards, apply the effect and discard the card
  let updatedGameState = G;
  
  // Apply any special effects from the card
  if (extendedCard.specialEffect) {
    updatedGameState = applySpecialEffect(G, extendedCard.specialEffect, playerID);
  }
  
  // Handle drawing cards if the card has a draw effect
  let updatedPlayer = { ...player };
  
  if (extendedCard.draw && extendedCard.draw > 0) {
    // Let player draw the specified number of cards
    for (let i = 0; i < extendedCard.draw; i++) {
      // This is a placeholder - the actual draw function would be in playerManager
      // updatedPlayer = drawCard(updatedPlayer);
      console.log(`Player ${playerID} draws a card from ${card.name}'s effect`);
    }
  }
  
  // Remove card from hand
  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  
  // Create a deep copy of the card to ensure all properties are preserved
  const cardCopy = JSON.parse(JSON.stringify(card));
  
  // Update player with new hand, discard, and reduced action points
  updatedPlayer = {
    ...updatedPlayer,
    hand: newHand,
    discard: [...updatedPlayer.discard, cardCopy],
    actionPoints: updatedPlayer.actionPoints - effectiveCost // Use effective cost with reductions
  };
  
  // Record action
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType: 'playCard',
    timestamp: Date.now(),
    payload: { cardId, cardType: card.type }
  };
  
  // Return updated game state
  return {
    ...updatedGameState,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    actions: [...G.actions, newAction],
    message: `${player.name} played ${card.name}`
  };
};
