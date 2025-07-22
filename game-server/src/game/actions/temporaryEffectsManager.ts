import { GameState, InfrastructureState } from 'shared-types/game.types';

/**
 * Interface defining a temporary effect in the game
 */
export interface TemporaryEffect {
  type: 'prevent_reactions' | 'prevent_restore' | 'cost_reduction' | 'chain_vulnerability' |
        'restrict_targeting' | 'quantum_protection' | 'honeypot' | 'temporary_tax' | 'prevent_exploits' | 'maintenance_cost';
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
                        'chain_vulnerability' | 'restrict_targeting' | 'quantum_protection' | 'honeypot' | 'temporary_tax' | 'prevent_exploits' | 'maintenance_cost',
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
      console.log(`🎯 Processing ${triggeredEffects.length} triggered effects`);
      
      // FIXED: First mark effects as triggered, then filter out auto-remove effects
      const updatedPersistentEffects = gameState.persistentEffects.map(effect => {
        if (triggeredEffects.includes(effect.sourceCardId)) {
          console.log(`✅ Marking effect from ${effect.sourceCardId} as triggered (autoRemove: ${effect.autoRemove})`);
          return { ...effect, triggered: true };
        }
        return effect;
      }).filter(effect => {
        const shouldRemove = effect.triggered && effect.autoRemove;
        if (shouldRemove) {
          console.log(`🗑️ Removing auto-remove effect from ${effect.sourceCardId} (type: ${effect.type})`);
        }
        return !shouldRemove;
      });

      updatedGameState = {
        ...updatedGameState,
        persistentEffects: updatedPersistentEffects
      };

      console.log(`🧹 Updated persistent effects. Before: ${gameState.persistentEffects.length}, After: ${updatedPersistentEffects.length}`);
    }

    return updatedGameState;
  }

  /**
   * Apply the reward from a persistent effect
   */
  private static applyPersistentReward(gameState: GameState, effect: PersistentEffect): GameState {
    console.log(`🔍 DEBUG REWARD: effect.playerId="${effect.playerId}"`);
    console.log(`🔍 DEBUG REWARD: gameState.attacker.id="${gameState.attacker?.id}"`);
    console.log(`🔍 DEBUG REWARD: gameState.defender.id="${gameState.defender?.id}"`);
    
    // FIXED: Handle both BoardGame.io player IDs ('0', '1') and game player IDs
    let isAttacker: boolean;
    let currentPlayer: any;
    
    // First try exact match with game player IDs
    if (effect.playerId === gameState.attacker?.id) {
      isAttacker = true;
      currentPlayer = gameState.attacker;
    } else if (effect.playerId === gameState.defender?.id) {
      isAttacker = false;
      currentPlayer = gameState.defender;
    } else {
      // Fallback: try BoardGame.io player IDs ('0' = attacker, '1' = defender)
      isAttacker = effect.playerId === '0';
      currentPlayer = isAttacker ? gameState.attacker : gameState.defender;
    }
    
    console.log(`🔍 DEBUG REWARD: isAttacker=${isAttacker}, currentPlayer.name="${currentPlayer?.name}"`);

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

  /**
   * Clean up persistent effects when infrastructure state changes away from the watched state
   * This prevents Multi-Stage Malware effects from persisting when infrastructure is restored
   */
  static cleanupPersistentEffectsOnStateChange(
    gameState: GameState,
    infrastructureId: string,
    oldState: string,
    newState: string
  ): GameState {
    if (!gameState.persistentEffects || gameState.persistentEffects.length === 0) {
      return gameState;
    }

    console.log(`🔄 PERSISTENT EFFECT CLEANUP: Infrastructure ${infrastructureId} state changed: ${oldState} → ${newState}`);

    const beforeCount = gameState.persistentEffects.length;
    let filteredEffects = [...gameState.persistentEffects];

    // Clean up effects when infrastructure changes away from the state they're watching
    // For example: Multi-Stage Malware watches vulnerable→compromised, so if it goes vulnerable→secure, clean up
    for (const effect of gameState.persistentEffects) {
      if (effect.targetId === infrastructureId) {
        // Check if the state change invalidates this persistent effect
        let shouldRemove = false;

        if (effect.type === 'on_compromise') {
          // If infrastructure was vulnerable and goes to secure (reaction card), remove the effect
          if (oldState === 'vulnerable' && newState === 'secure') {
            shouldRemove = true;
            console.log(`🗑️ Removing Multi-Stage Malware effect: infrastructure restored from vulnerable to secure`);
          }
          // If infrastructure was compromised and goes to secure (response card), remove the effect
          else if (oldState === 'compromised' && newState === 'secure') {
            shouldRemove = true;
            console.log(`🗑️ Removing Multi-Stage Malware effect: infrastructure restored from compromised to secure`);
          }
        }

        if (shouldRemove) {
          filteredEffects = filteredEffects.filter(e => e !== effect);
          console.log(`🧹 Removed persistent effect ${effect.type} from ${effect.sourceCardId} targeting ${infrastructureId}`);
        }
      }
    }

    const afterCount = filteredEffects.length;
    if (beforeCount !== afterCount) {
      console.log(`🔄 CLEANUP RESULT: Removed ${beforeCount - afterCount} persistent effects due to state change`);
      return {
        ...gameState,
        persistentEffects: filteredEffects
      };
    }

    return gameState;
  }

  /**
   * Calculate and apply maintenance costs at turn start
   * New balanced mechanic:
   * - 3 shielded/vulnerable = 1 AP cost
   * - 4 shielded/vulnerable = 2 AP cost
   * - 5 shielded/vulnerable = 3 AP cost
   * - If can't pay: randomly remove 1 infrastructure with that state next round
   */
  static processMaintenanceCosts(gameState: GameState): GameState {
    if (!gameState.infrastructure || !gameState.attacker || !gameState.defender) {
      return gameState;
    }

    let updatedGameState = { ...gameState };
    const vulnerableCount = gameState.infrastructure.filter(infra => infra.state === 'vulnerable').length;
    const shieldedCount = gameState.infrastructure.filter(infra => infra.state === 'shielded').length;
    
    let messages: string[] = [];

    // Calculate maintenance cost based on count (3=1, 4=2, 5=3)
    const calculateMaintenanceCost = (count: number): number => {
      if (count < 3) return 0;
      return count - 2; // 3->1, 4->2, 5->3
    };

    // Attacker maintenance cost for vulnerable infrastructure
    if (vulnerableCount >= 3) {
      const maintenanceCost = calculateMaintenanceCost(vulnerableCount);
      const attacker = updatedGameState.attacker!;
      
      if (attacker.actionPoints >= maintenanceCost) {
        const newActionPoints = attacker.actionPoints - maintenanceCost;
        
        updatedGameState.attacker = {
          ...attacker,
          actionPoints: newActionPoints
        };
        
        // Check if payment leaves player with 0 AP (consider as failed payment)
        if (newActionPoints === 0) {
          messages.push(`💥 Attacker pays ${maintenanceCost} AP maintenance but has 0 AP left! Next turn: random vulnerable infrastructure will be lost!`);
          
          // Mark for random removal next turn even though they paid
          updatedGameState = this.addEffect(updatedGameState, {
            type: 'maintenance_cost',
            playerId: attacker.id,
            duration: 2, // Will trigger next turn
            sourceCardId: 'maintenance_system',
            metadata: {
              costType: 'vulnerable',
              count: vulnerableCount,
              cost: maintenanceCost,
              canPay: true,
              leftWithZeroAP: true,
              pendingRemoval: true
            }
          });
        } else {
          messages.push(`⚠️ Attacker pays ${maintenanceCost} AP maintenance for ${vulnerableCount} vulnerable infrastructure`);
          
          // Add a temporary effect to show maintenance cost is active
          updatedGameState = this.addEffect(updatedGameState, {
            type: 'maintenance_cost',
            playerId: attacker.id,
            duration: 1, // Just for this turn
            sourceCardId: 'maintenance_system',
            metadata: {
              costType: 'vulnerable',
              count: vulnerableCount,
              cost: maintenanceCost,
              canPay: true
            }
          });
        }
      } else {
        messages.push(`💥 Attacker cannot pay ${maintenanceCost} AP maintenance! Next turn: random vulnerable infrastructure will be lost!`);
        
        // Mark for random removal next turn
        updatedGameState = this.addEffect(updatedGameState, {
          type: 'maintenance_cost',
          playerId: attacker.id,
          duration: 2, // Will trigger next turn
          sourceCardId: 'maintenance_system',
          metadata: {
            costType: 'vulnerable',
            count: vulnerableCount,
            cost: maintenanceCost,
            canPay: false,
            pendingRemoval: true
          }
        });
      }
    }

    // Defender maintenance cost for shielded infrastructure
    if (shieldedCount >= 3) {
      const maintenanceCost = calculateMaintenanceCost(shieldedCount);
      const defender = updatedGameState.defender!;
      
      if (defender.actionPoints >= maintenanceCost) {
        const newActionPoints = defender.actionPoints - maintenanceCost;
        
        updatedGameState.defender = {
          ...defender,
          actionPoints: newActionPoints
        };
        
        // Check if payment leaves player with 0 AP (consider as failed payment)
        if (newActionPoints === 0) {
          messages.push(`💥 Defender pays ${maintenanceCost} AP maintenance but has 0 AP left! Next turn: random shielded infrastructure will be lost!`);
          
          // Mark for random removal next turn even though they paid
          updatedGameState = this.addEffect(updatedGameState, {
            type: 'maintenance_cost',
            playerId: defender.id,
            duration: 2, // Will trigger next turn
            sourceCardId: 'maintenance_system',
            metadata: {
              costType: 'shielded',
              count: shieldedCount,
              cost: maintenanceCost,
              canPay: true,
              leftWithZeroAP: true,
              pendingRemoval: true
            }
          });
        } else {
          messages.push(`🛡️ Defender pays ${maintenanceCost} AP maintenance for ${shieldedCount} shielded infrastructure`);
          
          // Add a temporary effect to show maintenance cost is active
          updatedGameState = this.addEffect(updatedGameState, {
            type: 'maintenance_cost',
            playerId: defender.id,
            duration: 1, // Just for this turn
            sourceCardId: 'maintenance_system',
            metadata: {
              costType: 'shielded',
              count: shieldedCount,
              cost: maintenanceCost,
              canPay: true
            }
          });
        }
      } else {
        messages.push(`💥 Defender cannot pay ${maintenanceCost} AP maintenance! Next turn: random shielded infrastructure will be lost!`);
        
        // Mark for random removal next turn
        updatedGameState = this.addEffect(updatedGameState, {
          type: 'maintenance_cost',
          playerId: defender.id,
          duration: 2, // Will trigger next turn
          sourceCardId: 'maintenance_system',
          metadata: {
            costType: 'shielded',
            count: shieldedCount,
            cost: maintenanceCost,
            canPay: false,
            pendingRemoval: true
          }
        });
      }
    }

    // Process pending removals from previous turn
    updatedGameState = this.processPendingMaintenanceRemovals(updatedGameState, messages);

    // Update game message if there were maintenance costs
    if (messages.length > 0) {
      updatedGameState.message = messages.join(' | ');
    }

    return updatedGameState;
  }

  /**
   * Process pending maintenance removals (random infrastructure removal)
   */
  static processPendingMaintenanceRemovals(gameState: GameState, messages: string[]): GameState {
    let updatedGameState = { ...gameState };
    
    // Find pending removal effects
    const pendingRemovals = gameState.temporaryEffects?.filter(effect =>
      effect.type === 'maintenance_cost' &&
      effect.metadata?.pendingRemoval === true &&
      effect.duration === 1 // Ready to execute
    ) || [];

    for (const removalEffect of pendingRemovals) {
      const costType = removalEffect.metadata?.costType;
      
      if (costType === 'vulnerable') {
        // Remove random vulnerable infrastructure
        const vulnerableInfra = updatedGameState.infrastructure?.filter(infra => infra.state === 'vulnerable') || [];
        if (vulnerableInfra.length > 0) {
          const randomIndex = Math.floor(Math.random() * vulnerableInfra.length);
          const targetInfra = vulnerableInfra[randomIndex];
          
          // Reset infrastructure to secure state (remove vulnerabilities)
          updatedGameState.infrastructure = updatedGameState.infrastructure?.map(infra =>
            infra.id === targetInfra.id
              ? { ...infra, state: 'secure' as const, vulnerabilities: [] }
              : infra
          ) || [];
          
          messages.push(`💥 Maintenance failure: ${targetInfra.name} vulnerability removed due to unpaid maintenance!`);
        }
      } else if (costType === 'shielded') {
        // Remove random shielded infrastructure
        const shieldedInfra = updatedGameState.infrastructure?.filter(infra => infra.state === 'shielded') || [];
        if (shieldedInfra.length > 0) {
          const randomIndex = Math.floor(Math.random() * shieldedInfra.length);
          const targetInfra = shieldedInfra[randomIndex];
          
          // Reset infrastructure to secure state (remove shields)
          updatedGameState.infrastructure = updatedGameState.infrastructure?.map(infra =>
            infra.id === targetInfra.id
              ? { ...infra, state: 'secure' as const, shields: [] }
              : infra
          ) || [];
          
          messages.push(`💥 Maintenance failure: ${targetInfra.name} shield removed due to unpaid maintenance!`);
        }
      }
    }

    return updatedGameState;
  }

  /**
   * Check if maintenance costs are currently active for a player
   */
  static hasMaintenanceCosts(gameState: GameState, playerId?: string): {
    vulnerable: number;
    shielded: number;
    attackerCost: number;
    defenderCost: number;
  } {
    if (!gameState.infrastructure) {
      return { vulnerable: 0, shielded: 0, attackerCost: 0, defenderCost: 0 };
    }

    const vulnerableCount = gameState.infrastructure.filter(infra => infra.state === 'vulnerable').length;
    const shieldedCount = gameState.infrastructure.filter(infra => infra.state === 'shielded').length;
    
    // Calculate maintenance cost based on new formula (3=1, 4=2, 5=3)
    const calculateMaintenanceCost = (count: number): number => {
      if (count < 3) return 0;
      return count - 2; // 3->1, 4->2, 5->3
    };
    
    return {
      vulnerable: vulnerableCount,
      shielded: shieldedCount,
      attackerCost: calculateMaintenanceCost(vulnerableCount),
      defenderCost: calculateMaintenanceCost(shieldedCount)
    };
  }
}
