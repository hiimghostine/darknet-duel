import { Ctx } from 'boardgame.io';
import { GameState } from 'shared-types/game.types';
import { resolveHandChoice } from '../actions/handDisruption';

/**
 * Move to resolve a hand disruption effect by choosing cards to discard
 * Used for Threat Intelligence effect where opponent chooses cards to discard
 * 
 * @param G Current game state
 * @param ctx Boardgame.io context
 * @param playerID ID of the player making the move (the one viewing the hand)
 * @param cardIds IDs of the cards chosen to be discarded
 * @returns Updated game state with the discarded cards
 */
export const chooseHandDiscardMove = (
  G: GameState,
  ctx: Ctx,
  playerID: string,
  cardIds: string[]
): GameState => {
  // Defensive programming: ensure cardIds is an array
  let cardIdsArray = Array.isArray(cardIds) ? cardIds : [];
  console.log(`Player ${playerID} choosing cards to discard:`, cardIdsArray);
  
  // Verify we have a pending hand choice
  if (!G.pendingHandChoice) {
    return {
      ...G,
      message: "No pending hand choice to resolve"
    };
  }
  
  // Check if this is a self-discard (Honeypot Network tax) or opponent discard (Threat Intelligence)
  const isTargetPlayer = G.pendingHandChoice.targetPlayerId === playerID;
  const isHoneypotTax = G.pendingHandChoice.pendingCardPlay !== undefined;
  
  if (isHoneypotTax) {
    // For Honeypot Network tax: the target player (attacker) chooses their own cards to discard
    if (!isTargetPlayer) {
      return {
        ...G,
        message: "Only the target player can choose their own cards to discard for Honeypot Network tax"
      };
    }
  } else {
    // For Threat Intelligence: the opponent chooses cards from the target player's hand
    if (isTargetPlayer) {
      return {
        ...G,
        message: "You cannot choose cards from your own hand to discard"
      };
    }
  }
  
  // Verify we're not trying to discard more cards than allowed
  const allowedCount = G.pendingHandChoice.count || 1;
  if (cardIdsArray.length > allowedCount) {
    // Just trim the array to the allowed count
    cardIdsArray = cardIdsArray.slice(0, allowedCount);
  }
  
  // Create callback for continuing card play after Honeypot Network tax
  const continueCardPlay = (gameState: any, cardId: string, targetInfrastructureId: string) => {
    // Import throwCardMove here to avoid circular dependency
    const { throwCardMove } = require('../actions/throwCardMove/throwCardMove');
    
    // Use the original context if available, otherwise create a fallback
    const originalCtx = (G.pendingHandChoice?.pendingCardPlay as any)?.originalCtx;
    const contextToUse = originalCtx || {
      phase: 'playing',
      currentPlayer: playerID,
      activePlayers: { [playerID]: 'action' }
    };
    
    console.log(`🍯 Using ${originalCtx ? 'original' : 'fallback'} context for tax continuation`);
    
    // Continue with the original card play now that tax is paid - SKIP TAX CHECK to prevent loop
    return throwCardMove(
      { G: gameState, ctx: contextToUse, playerID: playerID },
      cardId,
      targetInfrastructureId,
      true // skipTaxCheck = true to prevent infinite loop
    );
  };
  
  // Resolve the hand choice
  const updatedState = resolveHandChoice(G, cardIdsArray, continueCardPlay);
  
  return updatedState;
};
