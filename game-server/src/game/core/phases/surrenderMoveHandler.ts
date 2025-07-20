import type { PlayerRole, GameState } from 'shared-types/game.types';
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
  // FIXED: Use boardgame.io player IDs for role determination
  const winner = playerID === '0' ? 'defender' as PlayerRole : 'attacker' as PlayerRole;
  const surrenderer = playerID === '0' ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
  
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
  
  // FIXED: Use boardgame.io player IDs for role determination
  const playerRole = playerID === '0' ? 'Attacker' : 'Defender';
  
  // Create immutable update to avoid Immer violation
  const existingChat = G.chat || {
    messages: [],
    lastReadTimestamp: {}
  };
  
  const systemMessage = {
    id: Date.now().toString(),
    sender: 'system',
    senderRole: 'attacker' as const,
    content: `${playerRole} has surrendered!`,
    timestamp: Date.now(),
    isSystem: true
  };
  
  // Return completely new state object instead of mutating
  return {
    ...G,
    chat: {
      ...existingChat,
      messages: [...existingChat.messages, systemMessage]
    }
  };
}