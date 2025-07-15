import type { GameState, TurnStage } from 'shared-types/game.types';
import type { Ctx } from 'boardgame.io';

/**
 * Common utilities and helper functions for game phases
 * Centralizes utility logic used across multiple phases
 */

// Type for move parameter context
export type MoveParams<T> = {
  G: T;
  playerID?: string;
  ctx?: Ctx;
  events?: any;
  random?: any;
};

/**
 * Debugging function with consistent formatting
 */
export function debugLog(message: string): void {
  console.log(`[GAME_PHASE] ${message}`);
}

/**
 * Helper function to check if the turn should end due to end conditions
 * - Player has no action points left
 * - Player has no cards left in hand
 * - Player explicitly ends their turn
 */
export function checkEndConditions(G: GameState, ctx: Ctx, events: any): GameState {
  // Get current player
  const isAttacker = G.currentTurn === 'attacker';
  const player = isAttacker ? G.attacker : G.defender;
  
  if (!player) return G;
  
  // Check if player has no action points or no cards
  if (player.actionPoints <= 0 || player.hand.length === 0) {
    debugLog(`End conditions met: AP=${player.actionPoints}, hand size=${player.hand.length}`);
    // End the turn automatically
    events.endTurn();
  }
  
  return G;
}

/**
 * Helper to determine if both players are properly initialized
 */
export function areBothPlayersInitialized(G: GameState): boolean {
  return Boolean(G.attacker && G.defender);
}

/**
 * Helper to determine if both players are connected
 */
export function areBothPlayersConnected(ctx: Ctx): boolean {
  return ctx.playOrder.length === 2;
}

/**
 * Helper to check if game can start (both players initialized and connected)
 */
export function canGameStart(G: GameState, ctx: Ctx): boolean {
  return areBothPlayersInitialized(G) && areBothPlayersConnected(ctx);
}

/**
 * Helper to get opponent player ID
 */
export function getOpponentId(G: GameState, playerID: string): string | undefined {
  if (playerID === G.attacker?.id) {
    return G.defender?.id;
  } else if (playerID === G.defender?.id) {
    return G.attacker?.id;
  }
  return undefined;
}

/**
 * Helper to switch active players to a specific stage
 */
export function switchToStage(events: any, playerId: string, stage: string): void {
  if (events && typeof events.setActivePlayers === 'function') {
    events.setActivePlayers({ value: { [playerId]: stage } });
  }
}

/**
 * Helper to switch current player to a stage
 */
export function switchCurrentPlayerToStage(events: any, stage: string): void {
  if (events && typeof events.setActivePlayers === 'function') {
    events.setActivePlayers({ currentPlayer: stage });
  }
}

/**
 * Helper to check if a card type is eligible for reactions
 */
export function isReactionEligible(cardType: string): boolean {
  return ['attack', 'virus', 'exploit', 'hack'].includes(cardType);
}

/**
 * Helper to calculate game win conditions
 */
export function checkWinConditions(G: GameState): { hasWinner: boolean; winner?: string; reason?: string } {
  // Check if we've reached the round limit (15 rounds)
  if (G.currentRound > 15) {
    if (G.attackerScore > G.defenderScore) {
      return { hasWinner: true, winner: 'attacker', reason: 'Maximum rounds reached - attacker wins by score' };
    } else if (G.defenderScore > G.attackerScore) {
      return { hasWinner: true, winner: 'defender', reason: 'Maximum rounds reached - defender wins by score' };
    } else {
      return { hasWinner: true, reason: 'Maximum rounds reached - draw' };
    }
  }

  // Check infrastructure control
  let attackerControlled = 0;
  let defenderControlled = 0;
  
  G.infrastructure?.forEach(infra => {
    if (infra.state === 'compromised') {
      attackerControlled++;
    } else if (infra.state === 'fortified' || infra.state === 'fortified_weaken') {
      defenderControlled++;
    }
  });
  
  const infrastructureThreshold = Math.ceil((G.infrastructure?.length || 0) / 2) + 1;
  
  if (attackerControlled >= infrastructureThreshold) {
    return { 
      hasWinner: true, 
      winner: 'attacker', 
      reason: `Attacker controlled ${attackerControlled} infrastructure cards` 
    };
  } else if (defenderControlled >= infrastructureThreshold) {
    return { 
      hasWinner: true, 
      winner: 'defender', 
      reason: `Defender fortified ${defenderControlled} infrastructure cards` 
    };
  }

  return { hasWinner: false };
}

/**
 * Helper to create turn transition message
 */
export function createTurnMessage(nextTurn: 'attacker' | 'defender', currentRound: number): string {
  const turnMsg = `${nextTurn.charAt(0).toUpperCase() + nextTurn.slice(1)}'s turn`;
  const roundMsg = `Round ${currentRound}${currentRound >= 13 ? ' (Final rounds!)' : ''}`;
  return `${roundMsg} - ${turnMsg}`;
}

/**
 * Helper to clean game state for turn transitions
 */
export function cleanStateForTurnTransition(G: GameState, nextTurn: 'attacker' | 'defender'): Partial<GameState> {
  return {
    currentTurn: nextTurn,
    turnNumber: nextTurn === 'attacker' ? G.turnNumber + 1 : G.turnNumber,
    currentStage: null as TurnStage,
    pendingReactions: [],
    reactionComplete: false,
    currentActionPlayer: undefined
  };
}