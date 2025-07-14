import { GameState } from 'shared-types/game.types';
import { Ctx } from 'boardgame.io';
import { Card } from 'shared-types/card.types';

/**
 * Checks if a card is playable in the current game state
 */
export function isCardPlayable(
  G: GameState, 
  ctx: Ctx, 
  playerID: string, 
  card: Card,
  player: any
): boolean {
  // This is a placeholder for the actual implementation
  // The original code doesn't appear to define this function in playerActions.ts
  
  // Counter-attack cards are only playable in reaction to specific events
  if (card.type === 'counter-attack' || card.type === 'counter') {
    // Check if there's a pending reaction that this player can respond to
    return (G.pendingReactions && 
           G.pendingReactions.some(reaction => reaction.target === playerID)) || false;
  }
  
  // For other card types, they're generally playable during your turn
  return true;
}
