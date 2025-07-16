import { Ctx } from 'boardgame.io';
import { GameState } from 'shared-types/game.types';
import { TemporaryEffectsManager } from './temporaryEffectsManager';

/**
 * Action to manually end the player's turn
 */
export const endTurnMove = ({ G, ctx, events }: { G: GameState; ctx: Ctx; events: any }): GameState => {
  // Process temporary effects at turn start
  let updatedG = TemporaryEffectsManager.processTurnStart(G);
  
  // End the player's turn
  events.endTurn();
  
  // Reset free card cycles used counter for next turn
  return {
    ...updatedG,
    attacker: updatedG.attacker ? { ...updatedG.attacker, freeCardCyclesUsed: 0 } : undefined,
    defender: updatedG.defender ? { ...updatedG.defender, freeCardCyclesUsed: 0 } : undefined
  };
};
