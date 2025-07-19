import { PlayerRole, GameState } from 'shared-types/game.types';

/**
 * Centralized chat message handler
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
 * Handle chat message using mutation style (for boardgame.io)
 * This function can be used across all phases and stages
 */
export function handleChatMessage({ G, playerID }: MoveParams<GameState>, content: string): void {
  console.log('SERVER: Received chat message:', content, 'from player:', playerID);
  
  // Initialize chat if it doesn't exist
  if (!G.chat) {
    G.chat = {
      messages: [],
      lastReadTimestamp: {}
    };
  }
  
  // Determine player role
  // FIXED: Use boardgame.io player IDs for role determination
  let senderRole: PlayerRole = 'attacker';
  if (playerID === '0') {
    senderRole = 'attacker';
  } else if (playerID === '1') {
    senderRole = 'defender';
  }
  
  // Create new message
  const newMessage = {
    id: Date.now().toString(),
    sender: playerID || 'unknown',
    senderRole,
    content,
    timestamp: Date.now(),
    isSystem: false
  };
  
  // Use mutation style - just push to existing array
  G.chat.messages.push(newMessage);
  
  // No return needed for mutation style
}

/**
 * Handle chat message using immutable style (returns new state)
 * Alternative implementation for contexts that require immutable updates
 */
export function handleChatMessageImmutable({ G, playerID }: MoveParams<GameState>, content: string): GameState {
  console.log('SERVER: Received chat message (immutable):', content, 'from player:', playerID);
  
  // Initialize chat if it doesn't exist
  const existingChat = G.chat || {
    messages: [],
    lastReadTimestamp: {}
  };
  
  // Determine player role
  let senderRole: PlayerRole = 'attacker';
  if (playerID === G.attacker?.id) {
    senderRole = 'attacker';
  } else if (playerID === G.defender?.id) {
    senderRole = 'defender';
  }
  
  // Create new message
  const newMessage = {
    id: Date.now().toString(),
    sender: playerID || 'unknown',
    senderRole,
    content,
    timestamp: Date.now(),
    isSystem: false
  };
  
  // Return updated game state with new message
  return {
    ...G,
    chat: {
      ...existingChat,
      messages: [...existingChat.messages, newMessage]
    }
  };
}

/**
 * Add system message to chat
 * Useful for game events, rematch requests, etc.
 */
export function addSystemMessage(G: GameState, content: string): void {
  if (!G.chat) {
    G.chat = {
      messages: [],
      lastReadTimestamp: {}
    };
  }
  
  const systemMessage = {
    id: Date.now().toString(),
    sender: 'system',
    senderRole: 'attacker' as PlayerRole, // Using attacker as default for system
    content,
    timestamp: Date.now(),
    isSystem: true
  };
  
  G.chat.messages.push(systemMessage);
}