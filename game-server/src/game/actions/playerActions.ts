/**
 * Player Actions Module
 * 
 * This file serves as the main entry point for all player actions in the game.
 * It re-exports functionality from specialized modules while maintaining the
 * same API for backward compatibility.
 */

// Re-export from specialized modules
export { cycleCardMove } from './cycleCardMove';
export { playCardMove } from './playCardMove';
export { throwCardMove } from './throwCardMove';
export { endTurnMove } from './turnManagement';

// Re-export utility functions that might be used elsewhere
export { applySpecialEffect } from './utils/effectHandling';
export { hasCardFeatures } from './utils/typeGuards';
export { validateCardTargeting } from './utils/validators';
export { calculateScores, checkAttackerVictory } from './utils/scoring';
export { updatePlayerStateAfterCardPlay } from './utils/stateUpdates';
export { isCardPlayable } from '../utils/cardUtils';
