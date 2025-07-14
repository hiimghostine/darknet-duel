import { GameState, GameAction, PlayerRole } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Interface representing a chain effect that allows lateral movement across infrastructure
 */
export interface ChainEffect {
  type: 'chain_vulnerability' | 'chain_compromise';
  sourceCardId: string;
  playerId: string;
  availableTargets: string[];
}

/**
 * Handles chain vulnerability effect, which allows an attacker to mark additional
 * infrastructure as vulnerable after a successful exploitation
 * 
 * @param gameState Current game state
 * @param sourceCard Card that triggered the chain effect
 * @param playerId Player who played the card
 * @returns Updated game state with pending chain choice
 */
export function handleChainVulnerability(
  gameState: GameState,
  sourceCard: Card,
  playerId: string
): GameState {
  const availableTargets = gameState.infrastructure?.filter(
    infra => infra.state === 'secure'
  ) || [];
  
  if (availableTargets.length === 0) {
    return gameState;
  }
  
  // Add pending chain choice to game state
  return {
    ...gameState,
    pendingChainChoice: {
      type: 'chain_vulnerability',
      sourceCardId: sourceCard.id,
      playerId,
      availableTargets: availableTargets.map(t => t.id)
    }
  };
}

/**
 * Handles chain compromise effect, which allows an attacker to automatically
 * compromise an additional infrastructure after successfully compromising one
 * 
 * @param gameState Current game state
 * @param sourceCard Card that triggered the chain effect
 * @param playerId Player who played the card
 * @returns Updated game state with pending chain choice
 */
export function handleChainCompromise(
  gameState: GameState,
  sourceCard: Card,
  playerId: string
): GameState {
  // Only secure or vulnerable infrastructure can be compromised through chain effects
  const availableTargets = gameState.infrastructure?.filter(
    infra => infra.state === 'vulnerable' || infra.state === 'secure'
  ) || [];
  
  if (availableTargets.length === 0) {
    return gameState;
  }
  
  // Add pending chain choice to game state
  return {
    ...gameState,
    pendingChainChoice: {
      type: 'chain_compromise',
      sourceCardId: sourceCard.id,
      playerId,
      availableTargets: availableTargets.map(t => t.id)
    }
  };
}

/**
 * Resolves a chain effect choice, applying the selected effect to the target infrastructure
 * 
 * @param gameState Current game state
 * @param targetInfraId ID of the target infrastructure
 * @returns Updated game state with the chain effect applied
 */
export function resolveChainEffect(
  gameState: GameState,
  targetInfraId: string
): GameState {
  if (!gameState.pendingChainChoice) {
    return gameState;
  }
  
  const { type } = gameState.pendingChainChoice;
  const updatedInfra = [...(gameState.infrastructure || [])];
  const targetIndex = updatedInfra.findIndex(infra => infra.id === targetInfraId);
  
  if (targetIndex === -1) {
    return gameState;
  }
  
  // Clone target infrastructure to avoid mutation
  const targetInfra = { ...updatedInfra[targetIndex] };
  
  // Apply the appropriate effect based on chain type
  if (type === 'chain_vulnerability') {
    // Mark the target infrastructure as vulnerable
    targetInfra.state = 'vulnerable';
    // Add a game action to record this chain effect
    const newAction: GameAction = {
      playerRole: gameState.pendingChainChoice.playerId === gameState.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole,
      actionType: 'chainEffect',
      timestamp: Date.now(),
      payload: { 
        sourceCardId: gameState.pendingChainChoice.sourceCardId,
        targetInfrastructureId: targetInfraId,
        effectType: 'chain_vulnerability'
      }
    };
    
    updatedInfra[targetIndex] = targetInfra;
    
    // Return updated game state without the pending choice
    return {
      ...gameState,
      infrastructure: updatedInfra,
      actions: [...gameState.actions, newAction],
      pendingChainChoice: undefined,
      message: `Chain effect: Infrastructure ${targetInfra.name} is now vulnerable!`
    };
  } 
  else if (type === 'chain_compromise') {
    // Mark the target infrastructure as compromised
    targetInfra.state = 'compromised';
    // Add a game action to record this chain effect
    const newAction: GameAction = {
      playerRole: gameState.pendingChainChoice.playerId === gameState.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole,
      actionType: 'chainEffect',
      timestamp: Date.now(),
      payload: { 
        sourceCardId: gameState.pendingChainChoice.sourceCardId,
        targetInfrastructureId: targetInfraId,
        effectType: 'chain_compromise'
      }
    };
    
    updatedInfra[targetIndex] = targetInfra;
    
    // Check for win condition - all critical infrastructure compromised
    const criticalInfraCompromised = updatedInfra.filter(
      infra => infra.critical && infra.state === 'compromised'
    ).length > 0;
    
    if (criticalInfraCompromised) {
      return {
        ...gameState,
        infrastructure: updatedInfra,
        actions: [...gameState.actions, newAction],
        pendingChainChoice: undefined,
        message: 'Game over! Attacker wins by compromising critical infrastructure!',
        gamePhase: 'gameOver',
        winner: 'attacker'
      };
    }
    
    // Return updated game state without the pending choice
    return {
      ...gameState,
      infrastructure: updatedInfra,
      actions: [...gameState.actions, newAction],
      pendingChainChoice: undefined,
      message: `Chain effect: Infrastructure ${targetInfra.name} has been compromised!`
    };
  }
  
  return gameState;
}
