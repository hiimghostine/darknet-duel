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
import { handleChainVulnerability } from '../../chainEffects';

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
    
    // Always show the choice UI for wildcard cards, even if only one option
    // This ensures consistent UX and proper game state transitions
    if (availableTypes.length >= 1) {
      console.log(`Showing wildcard choice UI for ${card.name} with options:`, availableTypes);
      
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
 * Handle special effect cards (chain effects, lateral movement, etc.)
 */
function handleSpecialEffect(
  card: Card,
  currentInfra: InfrastructureCard,
  infraIndex: number,
  allInfrastructure: InfrastructureCard[],
  gameState?: GameState,
  playerID?: string,
  attackVector?: AttackVector
): InfrastructureCard[] | null | { victory: true } | { pendingChoice: true } {
  console.log(`Handling special effect for card: ${card.name} (${card.id})`);
  
  // Handle specific special cards by name/ID
  if (card.name === 'Lateral Movement' || card.id === 'lateral-movement') {
    console.log('Lateral Movement card - triggering chain vulnerability effect');
    
    if (!gameState || !playerID) {
      console.warn('Missing gameState or playerID for Lateral Movement effect');
      return allInfrastructure;
    }
    
    // First, apply the initial exploit effect to the targeted infrastructure
    const updatedInfra = exploitEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
    
    // Then trigger chain vulnerability effect
    const updatedGameState = handleChainVulnerability(
      { ...gameState, infrastructure: updatedInfra },
      card,
      playerID
    );
    
    // Update the game state with the pending chain choice
    if (updatedGameState.pendingChainChoice) {
      // Modify the game state reference to include the pending choice
      if (gameState) {
        gameState.pendingChainChoice = updatedGameState.pendingChainChoice;
        gameState.message = `${card.name} played! Choose another infrastructure to make vulnerable.`;
      }
    }
    
    return updatedInfra;
  }
  
  // Default behavior for other special cards
  console.log(`Unknown special card: ${card.name}, applying default exploit effect`);
  return exploitEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
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
      
    case 'special':
      // Handle special effect cards (chain effects, lateral movement, etc.)
      return handleSpecialEffect(card, currentInfra, infraIndex, allInfrastructure, gameState, playerID, attackVector);
      
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
