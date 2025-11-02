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
  
  // Handle cancellation - empty string means skip/cancel the chain effect
  if (!targetInfrastructureId || targetInfrastructureId === '') {
    console.log(`🔗 Chain effect cancelled by player ${playerID}`);
    
    // Still need to trigger reactions for the original card play
    // Attack/exploit cards trigger reactions from defenders
    // Shield/fortify cards trigger reactions from attackers (counter-attacks)
    const shouldTriggerReaction = G.pendingChainChoice.originalCardType === 'exploit' || 
                                  G.pendingChainChoice.originalCardType === 'attack' ||
                                  G.pendingChainChoice.originalCardType === 'shield' ||
                                  G.pendingChainChoice.originalCardType === 'fortify';
    
    let pendingReactions = G.pendingReactions || [];
    if (shouldTriggerReaction && G.pendingChainChoice.originalCard) {
      const isAttacker = playerID === G.attacker?.id;
      pendingReactions = [
        ...pendingReactions,
        {
          cardId: G.pendingChainChoice.originalCard.id,
          card: G.pendingChainChoice.originalCard,
          source: playerID,
          target: isAttacker ? (G.defender?.id || '') : (G.attacker?.id || '')
        }
      ];
      console.log(`🔗 Chain cancelled - triggering reaction for original ${G.pendingChainChoice.originalCardType} card`);
    }
    
    return {
      ...G,
      pendingChainChoice: undefined,
      pendingReactions,
      message: "Chain effect skipped - no additional targets selected"
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
  
  // After chain resolves, trigger reactions for the original card play
  // Attack/exploit cards trigger reactions from defenders
  // Shield/fortify cards trigger reactions from attackers (counter-attacks)
  const shouldTriggerReaction = G.pendingChainChoice.originalCardType === 'exploit' || 
                                G.pendingChainChoice.originalCardType === 'attack' ||
                                G.pendingChainChoice.originalCardType === 'shield' ||
                                G.pendingChainChoice.originalCardType === 'fortify';
  
  if (shouldTriggerReaction && G.pendingChainChoice.originalCard) {
    const isAttacker = playerID === G.attacker?.id;
    const pendingReactions = [
      ...(updatedState.pendingReactions || []),
      {
        cardId: G.pendingChainChoice.originalCard.id,
        card: G.pendingChainChoice.originalCard,
        source: playerID,
        target: isAttacker ? (G.defender?.id || '') : (G.attacker?.id || '')
      }
    ];
    
    console.log(`🔗 Chain resolved - triggering reaction for original ${G.pendingChainChoice.originalCardType} card`);
    
    return {
      ...updatedState,
      pendingReactions
    };
  }
  
  return updatedState;
};
