import { GameState, GameAction, PlayerRole } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Interface representing a chain effect that allows lateral movement across infrastructure
 */
export interface ChainEffect {
  type: 'chain_vulnerability' | 'chain_compromise' | 'chain_security';
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
 * @param chosenType The card type chosen for the wildcard (exploit or attack)
 * @param targetInfraId The original infrastructure targeted by the card
 * @returns Updated game state with pending chain choice
 */
export function handleChainVulnerability(
  gameState: GameState,
  sourceCard: Card,
  playerId: string,
  chosenType?: string,
  targetInfraId?: string
): GameState {
  // Only secure infrastructure can be targeted through chain effects
  // Exclude the originally targeted infrastructure (which is now vulnerable)
  const availableTargets = gameState.infrastructure?.filter(
    infra => infra.state === 'secure' && infra.id !== targetInfraId
  ) || [];
  
  // If no targets available, skip chain effect but still trigger reactions
  if (availableTargets.length === 0) {
    console.log(`🔗 No additional secure infrastructure available for chain vulnerability effect`);
    
    // Check if we should trigger reactions for attack/exploit cards
    const shouldTriggerReaction = chosenType === 'exploit' || chosenType === 'attack';
    
    if (shouldTriggerReaction && sourceCard) {
      const isAttacker = playerId === gameState.attacker?.id;
      const pendingReactions = [
        ...(gameState.pendingReactions || []),
        {
          cardId: sourceCard.id,
          card: sourceCard,
          source: playerId,
          target: isAttacker ? (gameState.defender?.id || '') : (gameState.attacker?.id || '')
        }
      ];
      
      console.log(`🔗 No chain targets available - triggering reaction for original ${chosenType} card`);
      
      return {
        ...gameState,
        pendingReactions,
        message: `${sourceCard.name} played successfully, but no additional infrastructure available to target.`
      };
    }
    
    return {
      ...gameState,
      message: `${sourceCard.name} played successfully, but no additional infrastructure available to target.`
    };
  }
  
  console.log(`🔗 Chain vulnerability: ${availableTargets.length} secure infrastructure available for targeting`);
  
  // Add pending chain choice to game state with original card info for reaction triggering
  return {
    ...gameState,
    pendingChainChoice: {
      type: 'chain_vulnerability',
      sourceCardId: sourceCard.id,
      playerId,
      availableTargets: availableTargets.map(t => t.id),
      // Store original card info to trigger reactions after chain resolves
      originalCard: sourceCard,
      originalCardType: chosenType as any,
      originalTargetId: targetInfraId
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
 * Handles chain security effect, which allows a defender to mark additional
 * infrastructure as shielded after successfully shielding/fortifying one
 *
 * @param gameState Current game state
 * @param sourceCard Card that triggered the chain effect
 * @param playerId Player who played the card
 * @param chosenType The card type chosen for the wildcard (shield or fortify)
 * @param targetInfraId The original infrastructure targeted by the card
 * @returns Updated game state with pending chain choice
 */
export function handleChainSecurity(
  gameState: GameState,
  sourceCard: Card,
  playerId: string,
  chosenType?: string,
  targetInfraId?: string
): GameState {
  // Only secure infrastructure can be shielded through chain effects
  // Exclude the originally targeted infrastructure (which is now shielded)
  const availableTargets = gameState.infrastructure?.filter(
    infra => infra.state === 'secure' && infra.id !== targetInfraId
  ) || [];
  
  // If no targets available, skip chain effect but still trigger reactions
  if (availableTargets.length === 0) {
    console.log(`🔗 No additional secure infrastructure available for chain security effect`);
    
    // Check if we should trigger reactions for shield/fortify cards
    const shouldTriggerReaction = chosenType === 'shield' || chosenType === 'fortify';
    
    if (shouldTriggerReaction && sourceCard) {
      const isAttacker = playerId === gameState.attacker?.id;
      const pendingReactions = [
        ...(gameState.pendingReactions || []),
        {
          cardId: sourceCard.id,
          card: sourceCard,
          source: playerId,
          target: isAttacker ? (gameState.defender?.id || '') : (gameState.attacker?.id || '')
        }
      ];
      
      console.log(`🔗 No chain targets available - triggering reaction for original ${chosenType} card`);
      
      return {
        ...gameState,
        pendingReactions,
        message: `${sourceCard.name} played successfully, but no additional infrastructure available to shield.`
      };
    }
    
    return {
      ...gameState,
      message: `${sourceCard.name} played successfully, but no additional infrastructure available to shield.`
    };
  }
  
  // Add pending chain choice to game state with original card info for reaction triggering
  return {
    ...gameState,
    pendingChainChoice: {
      type: 'chain_security',
      sourceCardId: sourceCard.id,
      playerId,
      availableTargets: availableTargets.map(t => t.id),
      // Store original card info to trigger reactions after chain resolves
      originalCard: sourceCard,
      originalCardType: chosenType as any,
      originalTargetId: targetInfraId
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
  else if (type === 'chain_security') {
    // Mark the target infrastructure as shielded
    targetInfra.state = 'shielded';
    // Add a game action to record this chain effect
    const newAction: GameAction = {
      playerRole: gameState.pendingChainChoice.playerId === gameState.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole,
      actionType: 'chainEffect',
      timestamp: Date.now(),
      payload: {
        sourceCardId: gameState.pendingChainChoice.sourceCardId,
        targetInfrastructureId: targetInfraId,
        effectType: 'chain_security'
      }
    };
    
    updatedInfra[targetIndex] = targetInfra;
    
    // Return updated game state without the pending choice
    return {
      ...gameState,
      infrastructure: updatedInfra,
      actions: [...gameState.actions, newAction],
      pendingChainChoice: undefined,
      message: `Chain effect: Infrastructure ${targetInfra.name} is now shielded!`
    };
  }
  
  return gameState;
}
