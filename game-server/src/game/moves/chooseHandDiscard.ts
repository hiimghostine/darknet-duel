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
  console.log(`Player ${playerID} choosing cards to discard: ${cardIds.join(', ')}`);
  
  // Verify we have a pending hand choice
  if (!G.pendingHandChoice) {
    return {
      ...G,
      message: "No pending hand choice to resolve"
    };
  }
  
  // Verify the player making the choice is NOT the target player
  const isTargetPlayer = G.pendingHandChoice.targetPlayerId === playerID;
  if (isTargetPlayer) {
    return {
      ...G,
      message: "You cannot choose cards from your own hand to discard"
    };
  }
  
  // Verify we're not trying to discard more cards than allowed
  const allowedCount = G.pendingHandChoice.count || 1;
  if (cardIds.length > allowedCount) {
    // Just trim the array to the allowed count
    cardIds = cardIds.slice(0, allowedCount);
  }
  
  // Resolve the hand choice
  const updatedState = resolveHandChoice(G, cardIds);
  
  return updatedState;
};
