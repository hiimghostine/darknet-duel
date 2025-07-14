import { Ctx } from 'boardgame.io';
import { GameState } from 'shared-types/game.types';

/**
 * Action to manually end the player's turn
 */
export const endTurnMove = ({ G, ctx, events }: { G: GameState; ctx: Ctx; events: any }): GameState => {
  // End the player's turn
  events.endTurn();
  
  // Reset free card cycles used counter for next turn
  return {
    ...G,
    attacker: G.attacker ? { ...G.attacker, freeCardCyclesUsed: 0 } : undefined,
    defender: G.defender ? { ...G.defender, freeCardCyclesUsed: 0 } : undefined
  };
};
