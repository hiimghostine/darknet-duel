import { InfrastructureCard, GameState } from 'shared-types/game.types';
import { AttackVector, Card, CardType } from 'shared-types/card.types';
import { exploitEffect } from './exploitEffect';
import { attackEffect } from './attackEffect';
import { shieldEffect } from './shieldEffect';
import { fortifyEffect } from './fortifyEffect';
import { responseEffect } from './responseEffect';
import { reactionEffect } from './reactionEffect';
import { counterEffect } from './counterEffect';
import { WildcardResolver, WildcardPlayContext } from '../../wildcardResolver';

/**
 * Apply card effect based on card type
 * Returns updated infrastructure array or special result
 */
function handleWildcardEffect(
  card: Card,
  currentInfra: InfrastructureCard,
  infraIndex: number,
  allInfrastructure: InfrastructureCard[],
  gameState?: GameState,
  playerID?: string,
  chosenType?: CardType
): InfrastructureCard[] | null | { victory: true } | { pendingChoice: true } {
  // If no gameState, we can't handle wildcards properly
  if (!gameState) {
    console.warn('Missing gameState in handleWildcardEffect, falling back to default behavior');
    return allInfrastructure;
  }

  // If no player choice and we need one, set up pending choice
  if (!chosenType && card.wildcardType) {
    // Determine player role based on ID
    const isAttacker = gameState.attacker?.id === playerID;
    const playerRole = isAttacker ? 'attacker' : 'defender';
    
    // Create context for wildcard resolution
    const context: WildcardPlayContext = {
      gameState,
      playerRole,
      playerID,
      card,
      targetInfrastructure: currentInfra
    };
    
    // Get available types for this wildcard in this context
    const availableTypes = WildcardResolver.getAvailableTypes(card, context);
    
    // If exactly one type available, use it automatically
    if (availableTypes.length === 1) {
      chosenType = availableTypes[0];
    } else if (availableTypes.length > 1) {
      // Multiple options - need player choice
      // Update game state to indicate we need a choice from player
      gameState.pendingWildcardChoice = {
        cardId: card.id,
        playerId: playerID || '',
        availableTypes,
        targetInfrastructure: currentInfra.id,
        timestamp: Date.now()
      };
      
      // Return a special indicator that we need a player choice
      return { pendingChoice: true };
    } else {
      // No valid types - this should not happen but gracefully handle
      console.warn('No valid types for wildcard card');
      return allInfrastructure; // Just return unchanged infrastructure
    }
  }
  
  // At this point we have a chosen type, either from player or auto-selected
  // Apply any special wildcard effects
  if (gameState) {
    // Determine player role based on ID
    const isAttacker = gameState.attacker?.id === playerID;
    const playerRole = isAttacker ? 'attacker' : 'defender';
    
    const context: WildcardPlayContext = {
      gameState,
      playerRole,
      playerID,
      card,
      targetInfrastructure: currentInfra,
      chosenType
    };
      
    // Apply wildcard-specific effects
    WildcardResolver.applyWildcardEffects(card, context);
  }
  
  // Now route to the appropriate effect handler based on resolved type
  return applyCardEffect(
    chosenType as string,
    currentInfra,
    infraIndex,
    allInfrastructure,
    card,
    undefined,
    playerID,
    gameState
  );
}

/**
 * Apply card effect based on card type
 * Returns updated infrastructure array or special result
 */
export function applyCardEffect(
  cardType: string,
  currentInfra: InfrastructureCard,
  infraIndex: number,
  allInfrastructure: InfrastructureCard[],
  card: Card,
  attackVector?: AttackVector,
  playerID?: string,
  gameState?: GameState,
  chosenType?: CardType
): InfrastructureCard[] | null | { victory: true } | { pendingChoice: true } {
  if (cardType === 'wildcard') {
    return handleWildcardEffect(card, currentInfra, infraIndex, allInfrastructure, gameState, playerID, chosenType);
  }

  switch (cardType) {
    case 'exploit':
      return exploitEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
      
    case 'attack':
      return attackEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
      
    case 'shield':
      return shieldEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
      
    case 'fortify':
      return fortifyEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    case 'response':
      return responseEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    case 'reaction':
      return reactionEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    case 'counter-attack':
    case 'counter':
      return counterEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    default:
      return allInfrastructure; // No change
  }
}

// Re-export all effect handlers for direct access
export {
  exploitEffect,
  attackEffect,
  shieldEffect,
  fortifyEffect,
  responseEffect,
  reactionEffect,
  counterEffect
};
