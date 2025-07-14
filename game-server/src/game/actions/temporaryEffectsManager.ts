import { GameState } from 'shared-types/game.types';

/**
 * Interface defining a temporary effect in the game
 */
export interface TemporaryEffect {
  type: 'prevent_reactions' | 'prevent_restore' | 'cost_reduction' | 'chain_vulnerability';
  targetId?: string;
  playerId?: string;
  duration: number;
  sourceCardId: string;
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
    
    const activeEffects = gameState.temporaryEffects.filter(effect => {
      effect.duration--;
      return effect.duration > 0;
    });
    
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
  static hasEffect(gameState: GameState, type: string, targetId?: string): boolean {
    return gameState.temporaryEffects?.some(effect => 
      effect.type === type && (!targetId || effect.targetId === targetId)
    ) || false;
  }
}
