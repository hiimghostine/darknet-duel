/**
 * Types for the chat system in Darknet Duel
 */

import { PlayerRole } from './game.types';

/**
 * Represents a single chat message
 */
export interface ChatMessage {
  id: string;         // Unique ID for the message
  sender: string;     // Player ID who sent the message
  senderRole: PlayerRole; // Role of the player who sent the message
  content: string;    // Content of the message
  timestamp: number;  // When the message was sent
  isSystem?: boolean; // Whether this is a system message
}

/**
 * Lobby Chat Message - for lobby/pre-game chat
 */
export interface LobbyChatMessage {
  id: string;
  chatId: string;
  senderUuid: string;
  messageContent: string;
  messageType: 'user' | 'system' | 'admin';
  createdAt: Date;
  metadata?: {
    username?: string;
    avatar?: string;
    [key: string]: any;
  };
}

/**
 * Socket events for lobby chat
 */
export interface LobbychatSocketEvents {
  // Client to Server
  join_chat: (data: { chatId: string }) => void;
  leave_chat: (data: { chatId: string }) => void;
  send_message: (data: { chatId: string; message: string }) => void;
  
  // Server to Client
  chat_history: (data: { messages: LobbyChatMessage[] }) => void;
  new_message: (message: LobbyChatMessage) => void;
  user_joined: (data: { userId: string; username: string }) => void;
  user_left: (data: { userId: string; username: string }) => void;
  chat_error: (data: { message: string }) => void;
}

/**
 * System message types that can be automatically generated
 */
export enum SystemMessageType {
  GAME_START = 'GAME_START',
  GAME_END = 'GAME_END',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  REMATCH_REQUESTED = 'REMATCH_REQUESTED',
}

/**
 * Predefined quick chat messages that players can select
 */
export const QUICK_CHAT_MESSAGES = {
  GG: 'Good game!',
  WP: 'Well played!',
  REMATCH: 'Want a rematch?',
  LUCKY: 'You got lucky there!',
  STRATEGY: 'Nice strategy!',
  THANKS: 'Thanks for the game!',
};

/**
 * Chat state containing all messages for a game
 */
export interface ChatState {
  messages: ChatMessage[];
  lastReadTimestamp?: Record<string, number>; // Map of player ID to last read timestamp
}
