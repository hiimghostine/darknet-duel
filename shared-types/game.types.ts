/**
 * SHARED GAME TYPES
 * This file contains the definitive source of truth for game-related types
 * used by both frontend and backend.
 */

import type { Card, AttackVector, Shield, Vulnerability } from './card.types';

/**
 * Player role in the game
 */
export type PlayerRole = 'attacker' | 'defender';

/**
 * Game phase in the state machine
 */
export type GamePhase = 'setup' | 'playing' | 'gameOver';

/**
 * Infrastructure card states
 * 
 * These states represent the linear progression of infrastructure card states:
 * 
 * Defender path (increasing protection):
 * secure → shielded → fortified → fortified_weaken → secure (cycles back)
 * 
 * Attacker path (increasing compromise):
 * secure → vulnerable → compromised
 *
 * - secure: Default/initial secure state
 * - shielded: Protected with a shield card
 * - fortified: Fully fortified and protected
 * - fortified_weaken: Weakened fortification (will return to secure)
 * - vulnerable: Has vulnerabilities but not yet compromised
 * - compromised: Successfully attacked and compromised by opponent
 */
export type InfrastructureState = 
  | 'secure'      // Default/initial state
  | 'vulnerable'  // Attacker path: step 1 
  | 'compromised' // Attacker path: step 2 (final)
  | 'shielded'    // Defender path: step 1
  | 'fortified'   // Defender path: step 2
  | 'fortified_weaken'; // Defender path: step 3 (returns to secure)

/**
 * Effect that can be applied to infrastructure cards
 */
export interface InfrastructureCardEffect {
  type: string;
  duration: number;
  source?: string;
}

/**
 * Infrastructure card - represents the central objectives in the game
 */
export interface InfrastructureCard {
  id: string;
  name: string;
  type: 'network' | 'web' | 'data' | 'user' | 'critical';
  description: string;
  flavor: string;
  vulnerableVectors?: AttackVector[]; // Attack vectors this infrastructure is naturally susceptible to
  vulnerabilities: Vulnerability[] | string[];
  img: string;
  healthPoints?: number; // Added during gameplay
  damaged?: boolean;     // Track if card has been damaged
  state: InfrastructureState;
  effects?: InfrastructureCardEffect[];
  // For backend compatibility
  shields?: Shield[];
}

/**
 * Player metadata - used for player identification
 */
export interface PlayerMetadata {
  id: string;
  name: string;
  credentials?: string;
  role?: PlayerRole;
}

/**
 * Player - represents a player in the game
 */
export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  resources: number;
  actionPoints: number;
  freeCardCyclesUsed: number; // Track how many free card cycles used this turn
  deck: Card[];
  hand: Card[];
  field: Card[];
  discard: Card[];
}

/**
 * Game action - represents an action performed by a player
 */
export interface GameAction {
  playerRole: PlayerRole;
  actionType: string;
  timestamp: number;
  payload?: any;
}

/**
 * Player connection state tracking
 */
export type PlayerConnectionState = 'connected' | 'disconnected';

/**
 * Turn stage types
 */
export type TurnStage = 'action' | 'reaction' | 'end' | null;

/**
 * Pending reaction type - used for tracking reactions in play
 */
export interface PendingReaction {
  cardId: string;
  targetId?: string;
  reactingPlayerId?: string;
  // For backend compatibility
  card?: Card;
  source?: string; // Player ID of the card player
  target?: string; // Player ID of the reaction target
}

/**
 * Core game state - represents the state of the game
 */
export interface GameState {
  // Players
  attacker?: Player;
  defender?: Player;
  
  // Infrastructure
  infrastructure?: InfrastructureCard[];  // Infrastructure cards in play
  infrastructureDeck?: InfrastructureCard[]; // Available infrastructure cards
  
  // Turn and round management
  currentTurn: PlayerRole;
  turnNumber: number;
  currentRound: number;
  gamePhase: 'setup' | 'playing' | 'gameOver';
  
  // Game state
  winner?: PlayerRole | 'abandoned';
  actions: GameAction[];
  
  // Score tracking
  attackerScore: number;
  defenderScore: number;
  message?: string; // Game message to display to players
  
  // Connection tracking
  playerConnections: Record<string, PlayerConnectionState>;
  disconnectTime?: number; // Timestamp when a player disconnected
  
  // Turn stage management
  currentStage?: TurnStage;
  pendingReactions?: PendingReaction[];
  reactionComplete?: boolean;
  currentActionPlayer?: string;
  gameEnded?: boolean;
  
  // Player view properties (used by frontend and backend)
  playerRole?: PlayerRole | 'spectator';
  isAttacker?: boolean;
  isDefender?: boolean;
  playerID?: string;
  
  // Player UUID mapping (maps boardgame.io numeric IDs to real backend UUIDs)
  playerUuidMap?: Record<string, string>;
  
  // Post-game and chat functionality
  chat?: {
    messages: {
      id: string;         // Unique message ID
      sender: string;     // Player ID
      senderRole: PlayerRole; // Player role
      content: string;    // Message content
      timestamp: number;  // Timestamp
      isSystem?: boolean; // Whether this is a system message
    }[];
    lastReadTimestamp?: Record<string, number>; // Map of player ID to last read timestamp
  };
  
  // Post-game interactions
  rematchRequested?: string[]; // Player IDs who requested a rematch
  gameStats?: {
    gameDuration: number;      // Duration in milliseconds
    cardsPlayed: number;       // Total cards played
    infrastructureChanged: number; // How many times infra cards changed state
    winReason: string;         // Reason for winning
  };
  
  // Game configuration (required by backend)
  gameConfig: {
    initialResources: number;
    maxTurns: number;
    startingHandSize: number;
    infrastructureCount: number;
    initialActionPoints: number;
    attackerActionPointsPerTurn: number;
    defenderActionPointsPerTurn: number;
    maxActionPoints: number;
    freeCardCyclesPerTurn: number;
    maxHandSize: number;        // Maximum number of cards a player can hold
    cardsDrawnPerTurn: number;  // Number of cards drawn at end of each turn
  };
  
  // Optional debug information
  debug?: Record<string, any>;
}
