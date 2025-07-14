// IMPORTANT: We now use shared types directly as a single source of truth
// Instead of redefining types, we extend shared types with frontend-specific properties

// Import all shared types directly from the main shared-types module
import type {
  PlayerRole,
  GamePhase,
  InfrastructureState,
  PlayerConnectionState,
  PendingReaction,
  GameAction,
  Player as SharedPlayer,
  InfrastructureCard as SharedInfrastructureCard,
  GameState as SharedGameState,
  InfrastructureCardEffect,
  // Also import card-related types from the same import
  Card,
  AttackVector
} from 'shared-types';

// Re-export the base shared types directly
// With verbatimModuleSyntax enabled, we need to use 'export type'
export type { 
  PlayerRole,
  GamePhase, 
  InfrastructureState,
  PlayerConnectionState,
  PendingReaction,
  GameAction,
  Card,
  AttackVector,
  InfrastructureCardEffect
};

/**
 * Frontend-specific extension to InfrastructureCard
 * Extends the shared type with UI-specific properties
 */
export interface InfrastructureCard extends SharedInfrastructureCard {
  // UI-specific properties
  isTargeted?: boolean;        // Whether the card is currently targeted
  isHighlighted?: boolean;     // Whether the card is highlighted
  animatingAttack?: boolean;   // Whether the card is animating an attack
  isImmune?: boolean;          // Whether the card is immune to certain effects
  vulnerabilityInfo?: any[];   // Additional vulnerability info for the UI
  shieldsInfo?: any[];         // Additional shield info for the UI
  isNew?: boolean;             // Whether the card is newly added to the game
  canBeTargeted?: boolean;     // Whether the card can be targeted by the player
  healthPoints?: number;       // Added during gameplay (UI-specific)
  damaged?: boolean;           // Track if card has been damaged (UI-specific)
}

/**
 * Frontend-specific extension to Player
 * Extends the shared type with UI-specific properties
 */
export interface Player extends SharedPlayer {
  // UI-specific properties
  isActive?: boolean;           // Whether it's this player's turn
  lastAction?: string;          // The last action performed by this player
  deckSize?: number;            // Cache of deck.length for the UI
  score?: number;               // Player score
  lastCardPlayed?: Card;        // The last card played by this player
  selectedCardId?: string;      // ID of the selected card
  targetedCardId?: string;      // ID of the currently targeted card
  handVisible?: boolean;        // Whether the player's hand is visible
  statsVisible?: boolean;       // Whether the player's stats are visible
  isConnected?: boolean;        // Player connection status
  avatarUrl?: string;           // URL to player avatar image
  resources: number;
  actionPoints: number;
  freeCardCyclesUsed: number;
  hand: Card[];
  playedCards?: Card[];
  field: Card[];
  deck: Card[];
  discard: Card[];
}

/**
 * Frontend UI-specific GameState
 * Since we can't properly extend the SharedGameState due to incompatible gameConfig,
 * we'll use a UI-specific interface that includes only UI properties
 * while using the shared GameState as the core game state
 */
export interface FrontendUIState {
  // UI-specific properties only
  lastMove?: string;             // Description of the last move
  roundTime?: number;            // Time left in the current round
  spectators?: number;           // Number of spectators watching
  isRevealed?: boolean;          // Whether the game has been revealed
  boardAnimation?: string;       // Current animation playing on the board
  selectedCardId?: string;       // Currently selected card
  highlightedCell?: string;      // Currently highlighted cell
  tutorialStep?: number;         // Current tutorial step (if in tutorial)
  uiState?: Record<string, any>; // State of the UI components
  message?: string; // Game message to display to player
  playerRole?: 'attacker' | 'defender' | 'spectator'; // Role of the current player viewing the game
  isAttacker?: boolean; // Whether the current player is the attacker
  isDefender?: boolean; // Whether the current player is the defender
  playerID?: string; // ID of the current player viewing the game
}

/**
 * Instead of extending SharedGameState which has incompatible properties,
 * we'll use the shared type directly and add a uiState property
 * that contains all our UI-specific state
 */
export interface GameState extends Omit<SharedGameState, 'gameConfig'> {
  // UI state in a separate property
  ui?: FrontendUIState;
  // Include gameConfig with the correct structure
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
  };
}

export interface LobbyConfig {
  gameMode: 'standard' | 'blitz' | 'custom';
  timeLimit?: number;
  initialResources: number;
  maxTurns: number;
  roles: {
    attackerPlayerId?: string;
    defenderPlayerId?: string;
  };
}

export interface GameResult {
  gameId: string;
  winner: {
    id: string;
    role: PlayerRole;
  };
  loser: {
    id: string;
    role: PlayerRole;
  };
  turns: number;
  duration: number;
  timestamp: number;
}
