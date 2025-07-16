import { Ctx } from 'boardgame.io';
import { GameState, GameAction } from 'shared-types/game.types';
import { CardType, Card } from 'shared-types/card.types';
import { applyCardEffect } from '../actions/throwCardMove/cardEffects';
// Fix import path for calculateScores - it's in actions/utils/scoring
import { calculateScores } from '../actions/utils/scoring';
import { TemporaryEffectsManager } from '../actions/temporaryEffectsManager';
import { WildcardResolver } from '../actions/wildcardResolver';

/**
 * Move for players to choose a type when playing a wildcard card
 * This continues the card effect that was started in throwCardMove
 */
export const chooseWildcardTypeMove = ({ G, ctx, playerID }: { G: GameState; ctx: Ctx; playerID: string }, chosenType: CardType): GameState => {
  // Verify that there's a pending wildcard choice
  if (!G.pendingWildcardChoice) {
    return {
      ...G,
      message: "No wildcard choice pending"
    };
  }
  
  // Verify this is the player who needs to make the choice
  if (G.pendingWildcardChoice.playerId !== playerID) {
    return {
      ...G,
      message: "Not your wildcard to choose for"
    };
  }
  
  // Verify the chosen type is one of the available options
  if (!G.pendingWildcardChoice.availableTypes.includes(chosenType)) {
    return {
      ...G,
      message: `Invalid choice: ${chosenType} is not a valid option`
    };
  }
  
  // Get card and infrastructure details
  const { cardId, targetInfrastructure } = G.pendingWildcardChoice;
  
  // Find the card from player's hand or field
  const isAttacker = G.attacker?.id === playerID;
  const player = isAttacker ? G.attacker : G.defender;
  
  if (!player) {
    return {
      ...G,
      message: "Player not found"
    };
  }
  
  // Find the infrastructure target
  const infrastructureIndex = G.infrastructure?.findIndex(infra => infra.id === targetInfrastructure);
  if (infrastructureIndex === undefined || infrastructureIndex < 0 || !G.infrastructure) {
    return {
      ...G,
      message: "Target infrastructure not found"
    };
  }
  const targetInfrastructureObj = G.infrastructure[infrastructureIndex];

  // Find the card that was played - might be in field, hand or discard
  const card = player.field?.find((c: Card) => c.id === cardId) || 
               player.hand?.find((c: Card) => c.id === cardId) || 
               player.discard?.find((c: Card) => c.id === cardId);
  
  if (!card) {
    return {
      ...G,
      message: "Card not found"
    };
  }
  
  // Now apply the card effect with the chosen type
  const effectResult = applyCardEffect(
    chosenType,
    targetInfrastructureObj,
    infrastructureIndex,
    G.infrastructure,
    card,
    undefined, // attackVector, not needed here as it's in the card
    playerID,
    G,
    chosenType // Explicitly provide the chosenType
  );
  
  // Handle result like in throwCardMove but simplified since we already validated
  if (!effectResult || 'pendingChoice' in effectResult) {
    // This shouldn't happen, but handle gracefully
    return {
      ...G,
      message: "Error applying wildcard effect",
      pendingWildcardChoice: undefined // Clear the pending choice
    };
  }
  
  if ('victory' in effectResult) {
    // Attacker has won
    return {
      ...G,
      infrastructure: G.infrastructure,
      message: `Game over! Attacker wins by compromising infrastructure!`,
      gamePhase: 'gameOver',
      winner: 'attacker',
      pendingWildcardChoice: undefined
    } as GameState;
  }
  
  // Normal case - card effect applied successfully
  const newInfrastructure = effectResult;
  
  // Apply any wildcard-specific effects now that we know the chosen type
  let updatedGameState: GameState = {
    ...G,
    infrastructure: newInfrastructure, // We know this is defined because we checked earlier
    pendingWildcardChoice: undefined // Clear the pending choice
  };
  
  // Use the already defined isAttacker to determine player role
  const playerRole = isAttacker ? 'attacker' : 'defender';
  
  // Apply any special effects from this wildcard based on its ID
  updatedGameState = WildcardResolver.applyWildcardEffects(card, {
    gameState: updatedGameState,
    playerID,
    playerRole,
    targetInfrastructure: targetInfrastructureObj,
    card, // Pass the card itself
    chosenType
  });
  
  // Check if reactions are prevented by temporary effects
  const reactionsBlocked = TemporaryEffectsManager.hasEffect(
    updatedGameState, 
    'prevent_reactions', 
    targetInfrastructureObj.id
  );
  
  // Check if this card should trigger reaction phase (like in throwCardMove)
  const shouldTriggerReaction = !reactionsBlocked && 
                             !card.preventReaction && 
                             (chosenType === 'attack' || chosenType === 'exploit');
  
  // Calculate scores based on infrastructure states
  const { attackerScore, defenderScore } = calculateScores(newInfrastructure);
  
  // Update game state
  const updatedState: GameState = {
    ...updatedGameState,
    attackerScore,
    defenderScore,
    // Use the message from wildcard resolver if it exists, otherwise use default
    message: updatedGameState.message || `Wildcard played as ${chosenType}`
  };
  
  // Add reaction stage if needed
  if (shouldTriggerReaction) {
    const nonActivePlayerID = isAttacker ? G.defender?.id : G.attacker?.id;
    if (nonActivePlayerID) {
      // We can't directly call setActivePlayers here as that's handled at the game level
      // Instead, set a state flag that the game can use to determine the next stage
      updatedState.pendingReactions = [
        {
          target: nonActivePlayerID,
          cardId: card.id
        }
      ];
      updatedState.message += " - Waiting for reaction";
    }
  }
  
  return updatedState;
};
