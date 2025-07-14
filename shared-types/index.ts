/**
 * SHARED TYPES INDEX
 * This file exports all shared types used across the project
 */

// Export card-specific types from card.types.ts
export type { 
  AttackVector, 
  CardType, 
  CardEffect, 
  Card, 
  Vulnerability,
  VulnerabilityArray,
  Shield
} from './card.types';

// Export wildcard utility types and functions
export type { NormalizedWildcardType } from './utils/wildcardTypeUtils';
export { 
  getAvailableCardTypes,
  normalizeWildcardType,
  canPlayWildcardAs,
  getWildcardTypeDisplay
} from './utils/wildcardTypeUtils';

// Export game-specific types from game.types.ts
export type {
  GameState,
  PlayerConnectionState,
  Player,
  TurnStage,
  PendingReaction,
  GameAction,
  PlayerRole,
  InfrastructureCard,
  InfrastructureState,
  InfrastructureCardEffect
} from './game.types';

// Export chat-specific types from chat.types.ts
export type {
  ChatMessage,
  ChatState,
  SystemMessageType
} from './chat.types';

export { QUICK_CHAT_MESSAGES } from './chat.types';
