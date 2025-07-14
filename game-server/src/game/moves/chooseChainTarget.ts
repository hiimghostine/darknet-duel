import { Ctx } from 'boardgame.io';
import { GameState } from 'shared-types/game.types';
import { resolveChainEffect } from '../actions/chainEffects';

/**
 * Move to resolve a chain effect by choosing a target infrastructure
 * Used for both chain_vulnerability and chain_compromise effects
 * 
 * @param G Current game state
 * @param ctx Boardgame.io context
 * @param playerID ID of the player making the move
 * @param targetInfrastructureId ID of the infrastructure being targeted by the chain effect
 * @returns Updated game state with the chain effect applied
 */
export const chooseChainTargetMove = (
  G: GameState,
  ctx: Ctx,
  playerID: string,
  targetInfrastructureId: string
): GameState => {
  console.log(`Player ${playerID} choosing chain target: ${targetInfrastructureId}`);
  
  // Verify player is the one who triggered the chain effect
  if (!G.pendingChainChoice || G.pendingChainChoice.playerId !== playerID) {
    return {
      ...G,
      message: "You cannot choose a chain target at this time"
    };
  }
  
  // Verify target is in available targets
  if (!G.pendingChainChoice.availableTargets.includes(targetInfrastructureId)) {
    return {
      ...G,
      message: "Invalid target for chain effect"
    };
  }
  
  // Resolve the chain effect on the chosen target
  const updatedState = resolveChainEffect(G, targetInfrastructureId);
  
  return updatedState;
};
