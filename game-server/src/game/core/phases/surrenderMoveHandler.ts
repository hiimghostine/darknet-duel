import { PlayerRole } from 'shared-types/game.types';
import type { GameState } from 'shared-types/game.types';
import { addSystemMessage } from './chatMoveHandler';

/**
 * Centralized surrender handler
 * Eliminates code duplication across all phases and stages
 */

type MoveParams<T> = {
  G: T;
  playerID?: string;
  ctx?: any;
  events?: any;
  random?: any;
};

/**
 * Handle player surrender - works for all phases
 * Automatically determines winner and updates game state
 */
export function handleSurrender({ G, ctx, playerID, events }: MoveParams<GameState>): GameState {
  console.log('Player surrendered:', playerID);
  
  if (!playerID) {
    console.error('No playerID provided for surrender');
    return G;
  }
  
  // Determine which player surrendered and set the other as winner
  const winner = playerID === G.attacker?.id ? 'defender' as PlayerRole : 'attacker' as PlayerRole;
  const surrenderer = playerID === G.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
  
  // Create updated game state
  const updatedG: GameState = {
    ...G,
    gamePhase: 'gameOver' as const,
    gameEnded: true,
    winner,
    message: `${surrenderer} has surrendered! ${winner} wins the game!`
  };
  
  // Add system message about surrender (only if not already in gameOver phase)
  if (G.gamePhase !== 'gameOver') {
    addSystemMessage(updatedG, `${surrenderer} has surrendered! ${winner} wins the game!`);
  }
  
  // CRITICAL: Transition to the gameOver phase in boardgame.io
  // This is needed so the chat functionality works properly
  if (events && typeof events.setPhase === 'function') {
    events.setPhase('gameOver');
  }
  
  return updatedG;
}

/**
 * Handle surrender in gameOver phase (different behavior)
 * Just logs the action and adds a chat message
 */
export function handleSurrenderInGameOver({ G, playerID }: MoveParams<GameState>): GameState {
  console.log('SERVER: Player surrendered in gameOverPhase:', playerID);
  
  if (!playerID) {
    return G;
  }
  
  // In case someone tries to surrender in the gameOver phase, just log it
  // The game is already over so no need to change winner
  const playerRole = playerID === G.attacker?.id ? 'Attacker' : 'Defender';
  
  // Add system message about surrender
  const updatedG = { ...G };
  addSystemMessage(updatedG, `${playerRole} has surrendered!`);
  
  return updatedG;
}