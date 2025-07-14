import { Ctx } from 'boardgame.io';
import { GameState, GameAction } from 'shared-types/game.types';
import { Card, CardType, AttackVector } from 'shared-types/card.types';
import { hasCardFeatures } from '../utils/typeGuards';
import { getEffectiveCardType } from '../../utils/wildcardUtils';
import { applyCardEffect } from './cardEffects';
import { validateCardTargeting } from '../utils/validators';
import { calculateScores } from '../utils/scoring';
import { TemporaryEffectsManager } from '../temporaryEffectsManager';

/**
 * Action to throw a card at an infrastructure target
 * This deducts AP and applies card effects to target infrastructure
 */
export const throwCardMove = ({ G, ctx, playerID }: { G: GameState; ctx: Ctx; playerID: string }, cardId: string, targetInfrastructureId: string): GameState => {
  // Verify it's the player's turn or a valid reaction
  const isCurrentPlayerTurn = (G.currentTurn === 'attacker' && playerID === G.attacker?.id) || 
                             (G.currentTurn === 'defender' && playerID === G.defender?.id);
  
  // Check if player is in reaction mode - important for counter-attack cards
  const isInReactionMode = ctx.activePlayers && 
                       playerID in ctx.activePlayers && 
                       ctx.activePlayers[playerID] === 'reaction';
  
  // In reaction mode, the non-active player can play counter-attack and reaction cards
  if (!isCurrentPlayerTurn && !isInReactionMode) {
    // Not this player's turn and not in reaction mode
    return {
      ...G,
      message: "Cannot throw cards when it's not your turn"
    };
  }
  
  const isAttacker = playerID === G.attacker?.id;
  const player = isAttacker ? G.attacker : G.defender;
  
  if (!player) return G;
  
  // Find the card in player's hand
  const cardIndex = player.hand.findIndex(card => card.id === cardId);
  if (cardIndex === -1) return G; // Card not found
  
  const card = player.hand[cardIndex];
  // Use our type guard to handle the Card interface properties
  const extendedCard = hasCardFeatures(card) ? card : card;
  
  // Find the target infrastructure
  const targetInfrastructure = G.infrastructure?.find(infra => infra.id === targetInfrastructureId);
  if (!targetInfrastructure) {
    return { 
      ...G,
      message: "Target infrastructure not found"
    };
  }
  
  // Calculate effective card cost, applying any cost reductions
  let effectiveCost = card.cost;
  
  // Handle Living Off The Land cost reduction (A302)
  if (card.id === 'A302' && targetInfrastructure.type === 'user') {
    effectiveCost = Math.max(0, card.cost - 1);
    console.log(`Living Off The Land: Cost reduced from ${card.cost} to ${effectiveCost}`);
  }
  
  // Check for cost_reduction temporary effects
  if (TemporaryEffectsManager.hasEffect(G, 'cost_reduction', targetInfrastructure.id)) {
    const reduction = 1; // Default reduction amount
    effectiveCost = Math.max(0, effectiveCost - reduction);
    console.log(`Cost reduction effect applied: Cost reduced to ${effectiveCost}`);
  }
  
  // Check if player has enough action points for effective cost
  if (player.actionPoints < effectiveCost) {
    return { 
      ...G,
      message: "Not enough action points to throw this card"
    };
  }
  
  // Record action - moved here so it's available throughout the function
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType: 'throwCard',
    timestamp: Date.now(),
    payload: { cardId, targetInfrastructureId, cardType: card.type }
  };

  // Handle card type-specific targeting validation
  // For wildcard cards, determine the effective card type using our utility function
  // This ensures consistent handling across the codebase
  let effectiveCardType = getEffectiveCardType(card.type, extendedCard.wildcardType);
  
  // Get attack vector if available, or fall back to metadata.category
  let attackVector = extendedCard.attackVector as AttackVector | undefined;
  
  // If no explicit attackVector, try to get it from metadata.category
  if (!attackVector && extendedCard.metadata && extendedCard.metadata.category && 
      extendedCard.metadata.category !== 'any') {
    // Cast the category to AttackVector if it's one of our known values
    const category = extendedCard.metadata.category;
    
    // Check if the category is a valid AttackVector
    const validAttackVectors = ['exploit', 'ddos', 'attack', 'network', 'web', 'social', 'malware'];
    if (validAttackVectors.includes(category)) {
      attackVector = category as AttackVector;
      console.log(`Using metadata.category as attack vector: ${attackVector}`);
    }
  }
  
  console.log(`Card ${card.name} (${card.id}) has attack vector: ${attackVector || 'NONE'}`);
    
  // Validate targeting based on card type
  const targetValidation = validateCardTargeting(effectiveCardType, targetInfrastructure, attackVector);
  if (!targetValidation.valid) {
    return {
      ...G,
      message: targetValidation.message || "Invalid target for this card type"
    };
  }
  
  // Remove card from hand
  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  
  // Create a deep copy of the card to ensure all properties are preserved during serialization
  const cardCopy = JSON.parse(JSON.stringify(card));
  
  // Add card to discard pile
  const updatedPlayer = {
    ...player,
    hand: newHand,
    discard: [...player.discard, cardCopy],
    actionPoints: player.actionPoints - effectiveCost // Use effective action points with reductions applied
  };
  
  // Log the card removal for debugging
  console.log(`CARD REMOVED: ${card.name} (${card.id}) from ${isAttacker ? 'attacker' : 'defender'}'s hand. Hand size: ${player.hand.length} -> ${newHand.length}`);
  
  // Handle infrastructure state changes - clone everything first
  const updatedInfrastructure = G.infrastructure ? [...G.infrastructure] : [];
  const infraIndex = updatedInfrastructure.findIndex(infra => infra.id === targetInfrastructureId);
  
  // Only proceed if we found the target infrastructure
  if (infraIndex === -1) {
    return G; // Should not happen as we checked earlier
  }
  
  // Clone the target infrastructure object to avoid direct mutation
  const currentInfra = {
    ...updatedInfrastructure[infraIndex]
  };
  
  // Apply card effects based on the effective card type
  // Note: For wildcard cards, we now need to pass the gameState for proper handling
  const effectResult = applyCardEffect(
    effectiveCardType, 
    targetInfrastructure, 
    infraIndex, 
    updatedInfrastructure, 
    extendedCard,
    attackVector,
    playerID,
    G // Pass the current game state for wildcard resolution
  );
  
  // Handle the various possible outcomes from applying the card effect
  if (effectResult === null) {
    // Attack was not possible for some reason
    return {
      ...G,
      message: `This infrastructure is not vulnerable to ${attackVector} attacks`
    };
  } else if ('victory' in effectResult) {
    // Attacker has won
    return {
      ...G,
      attacker: isAttacker ? updatedPlayer : G.attacker,
      defender: !isAttacker ? updatedPlayer : G.defender,
      infrastructure: updatedInfrastructure,
      actions: [...G.actions, newAction],
      message: `Game over! Attacker wins by compromising infrastructure!`,
      gamePhase: 'gameOver' as const,
      winner: 'attacker'
    } as GameState;
  } else if ('pendingChoice' in effectResult) {
    // Wildcard card needs player choice
    return {
      ...G,
      attacker: isAttacker ? updatedPlayer : G.attacker,
      defender: !isAttacker ? updatedPlayer : G.defender,
      // Don't update infrastructure yet - will be updated after choice
      actions: [...G.actions], // We'll add the action after the choice is made
      message: `Select a type to play this wildcard as`,
      // pendingWildcardChoice was added to GameState in the wildcard resolver
    };
  }
  
  // Normal case - card effect applied successfully
  const newInfrastructure = effectResult;
  
  // Check if this card should trigger reaction phase
  const shouldTriggerReaction = !extendedCard.preventReaction && 
                              (effectiveCardType === 'attack' || effectiveCardType === 'exploit');
  
  // Calculate scores based on infrastructure states
  const { attackerScore, defenderScore } = calculateScores(newInfrastructure);
  
  console.log(`Updated scores - Attacker: ${attackerScore}, Defender: ${defenderScore}`);
  
  // Update game state
  return {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    infrastructure: newInfrastructure,
    actions: [...G.actions, newAction],
    message: `${card.name} thrown at ${targetInfrastructure.name}`,
    attackerScore,
    defenderScore,
    // Add pending reaction if needed
    pendingReactions: shouldTriggerReaction ? [
      ...(G.pendingReactions || []),
      { 
        card: cardCopy, 
        source: playerID,
        target: isAttacker ? G.defender?.id || '' : G.attacker?.id || ''
      }
    ] : G.pendingReactions
  } as GameState; // Type assertion to fix type mismatch
};
