import { GameState, InfrastructureState } from 'shared-types/game.types';

/**
 * Interface defining a temporary effect in the game
 */
export interface TemporaryEffect {
  type: 'prevent_reactions' | 'prevent_restore' | 'cost_reduction' | 'chain_vulnerability' |
        'restrict_targeting' | 'quantum_protection' | 'honeypot' | 'temporary_tax' | 'prevent_exploits';
  targetId?: string;
  playerId?: string;
  duration: number;
  sourceCardId: string;
  // Optional metadata for effects that need additional information
  metadata?: {
    restrictedTargets?: string[];
    restrictedTypes?: string[];
    vulnerabilityType?: string;
    revealHandTo?: string;
    [key: string]: any; // Allow any other metadata properties
  };
}

/**
 * Interface defining a persistent effect in the game
 */
export interface PersistentEffect {
  type: 'on_compromise' | 'on_vulnerability' | 'on_restore' | 'on_shield' | 'on_fortify';
  targetId: string;           // Infrastructure being watched
  playerId: string;           // Player who gets the benefit
  sourceCardId: string;       // Card that created this effect
  condition: {
    fromState?: InfrastructureState | 'any';
    toState: InfrastructureState;
  };
  reward: {
    effect: 'gain_ap' | 'draw_card' | 'gain_resource';
    amount: number;
  };
  autoRemove: boolean;        // Remove after triggering once
  triggered: boolean;         // Whether this effect has been triggered
}

/**
 * Manages temporary effects in the game
 * Handles creating, processing, and checking effects
 */
export class TemporaryEffectsManager {
  /**
   * Process effects at the start of a turn
   * Decrements duration and removes expired effects
   */
  static processTurnStart(gameState: GameState): GameState {
    if (!gameState.temporaryEffects) return gameState;
    
    const activeEffects = gameState.temporaryEffects
      .map(effect => ({
        ...effect,
        duration: effect.duration - 1
      }))
      .filter(effect => effect.duration > 0);
    
    return {
      ...gameState,
      temporaryEffects: activeEffects
    };
  }
  
  /**
   * Add a new temporary effect to the game state
   */
  static addEffect(gameState: GameState, effect: TemporaryEffect): GameState {
    return {
      ...gameState,
      temporaryEffects: [...(gameState.temporaryEffects || []), effect]
    };
  }
  
  /**
   * Check if an effect of specified type exists, optionally for a specific target
   */
  static hasEffect(gameState: GameState,
                   type: 'prevent_reactions' | 'prevent_restore' | 'cost_reduction' |
                        'chain_vulnerability' | 'restrict_targeting' | 'quantum_protection' | 'honeypot' | 'temporary_tax' | 'prevent_exploits',
                   targetId?: string): boolean {
    return gameState.temporaryEffects?.some(effect =>
      effect.type === type && (!targetId || effect.targetId === targetId)
    ) || false;
  }

  /**
   * Add a new persistent effect to the game state
   */
  static addPersistentEffect(gameState: GameState, effect: PersistentEffect): GameState {
    console.log(`🎯 Adding persistent effect: ${effect.type} for player ${effect.playerId} on infrastructure ${effect.targetId}`);
    return {
      ...gameState,
      persistentEffects: [...(gameState.persistentEffects || []), effect]
    };
  }

  /**
   * Check for persistent effect triggers when infrastructure state changes
   */
  static processPersistentEffects(
    gameState: GameState,
    infrastructureId: string,
    oldState: InfrastructureState,
    newState: InfrastructureState
  ): GameState {
    if (!gameState.persistentEffects || gameState.persistentEffects.length === 0) {
      return gameState;
    }

    console.log(`🔍 Checking persistent effects for ${infrastructureId}: ${oldState} → ${newState}`);

    let updatedGameState = { ...gameState };
    const triggeredEffects: string[] = [];

    // Check each persistent effect for triggers
    for (const effect of gameState.persistentEffects) {
      // Skip if already triggered and should auto-remove
      if (effect.triggered && effect.autoRemove) {
        continue;
      }

      // Check if this effect applies to this infrastructure
      if (effect.targetId !== infrastructureId) {
        continue;
      }

      // Check if the state transition matches the condition
      const matchesCondition =
        effect.condition.toState === newState &&
        (effect.condition.fromState === 'any' || effect.condition.fromState === oldState || !effect.condition.fromState);

      if (matchesCondition) {
        console.log(`🎉 Triggering persistent effect: ${effect.type} for player ${effect.playerId}`);
        
        // Apply the reward
        updatedGameState = this.applyPersistentReward(updatedGameState, effect);
        
        // Mark effect as triggered
        triggeredEffects.push(effect.sourceCardId);
      }
    }

    // Update triggered effects and remove auto-remove effects
    if (triggeredEffects.length > 0) {
      const updatedPersistentEffects = gameState.persistentEffects.map(effect => {
        if (triggeredEffects.includes(effect.sourceCardId)) {
          return { ...effect, triggered: true };
        }
        return effect;
      }).filter(effect => !(effect.triggered && effect.autoRemove));

      updatedGameState = {
        ...updatedGameState,
        persistentEffects: updatedPersistentEffects
      };

      console.log(`🧹 Updated persistent effects. Remaining: ${updatedPersistentEffects.length}`);
    }

    return updatedGameState;
  }

  /**
   * Apply the reward from a persistent effect
   */
  private static applyPersistentReward(gameState: GameState, effect: PersistentEffect): GameState {
    const isAttacker = effect.playerId === gameState.attacker?.id;
    const currentPlayer = isAttacker ? gameState.attacker : gameState.defender;

    if (!currentPlayer) {
      console.error(`❌ Could not find player ${effect.playerId} for persistent effect reward`);
      return gameState;
    }

    let updatedPlayer = { ...currentPlayer };
    let message = '';

    switch (effect.reward.effect) {
      case 'gain_ap':
        updatedPlayer.actionPoints += effect.reward.amount;
        message = `${currentPlayer.name} gains ${effect.reward.amount} AP from Multi-Stage Malware!`;
        console.log(`💰 Player ${effect.playerId} gains ${effect.reward.amount} AP (${currentPlayer.actionPoints} → ${updatedPlayer.actionPoints})`);
        break;
      
      case 'draw_card':
        // Draw cards from deck to hand
        const cardsToDraw = Math.min(effect.reward.amount, updatedPlayer.deck.length);
        const drawnCards = updatedPlayer.deck.slice(0, cardsToDraw);
        updatedPlayer.deck = updatedPlayer.deck.slice(cardsToDraw);
        updatedPlayer.hand = [...updatedPlayer.hand, ...drawnCards];
        message = `${currentPlayer.name} draws ${cardsToDraw} card(s)!`;
        console.log(`🃏 Player ${effect.playerId} draws ${cardsToDraw} cards`);
        break;
      
      case 'gain_resource':
        updatedPlayer.resources += effect.reward.amount;
        message = `${currentPlayer.name} gains ${effect.reward.amount} resource(s)!`;
        console.log(`🔗 Player ${effect.playerId} gains ${effect.reward.amount} resources`);
        break;
    }

    return {
      ...gameState,
      attacker: isAttacker ? updatedPlayer : gameState.attacker,
      defender: !isAttacker ? updatedPlayer : gameState.defender,
      message: message
    };
  }

  /**
   * Clean up persistent effects when infrastructure is removed or game ends
   */
  static cleanupPersistentEffects(gameState: GameState, infrastructureId?: string): GameState {
    if (!gameState.persistentEffects) {
      return gameState;
    }

    let filteredEffects = gameState.persistentEffects;

    if (infrastructureId) {
      // Remove effects targeting specific infrastructure
      filteredEffects = filteredEffects.filter(effect => effect.targetId !== infrastructureId);
      console.log(`🧹 Cleaned up persistent effects for infrastructure ${infrastructureId}`);
    } else {
      // Remove all persistent effects (game end)
      filteredEffects = [];
      console.log(`🧹 Cleaned up all persistent effects`);
    }

    return {
      ...gameState,
      persistentEffects: filteredEffects
    };
  }

  /**
   * Check if a persistent effect exists for a specific condition
   */
  static hasPersistentEffect(gameState: GameState,
                           type: 'on_compromise' | 'on_vulnerability' | 'on_restore' | 'on_shield' | 'on_fortify',
                           targetId?: string): boolean {
    return gameState.persistentEffects?.some(effect =>
      effect.type === type && (!targetId || effect.targetId === targetId)
    ) || false;
  }
}
