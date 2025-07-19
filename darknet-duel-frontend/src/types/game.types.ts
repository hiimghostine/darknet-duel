// This is to avoid issues with importing from shared-types module

// Import card types - these should be the only imports from shared-types
import type { Card, CardType } from 'shared-types/card.types';

// Define AttackVector locally to avoid import issues
export type AttackVector = 'malware' | 'phishing' | 'vulnerability' | 'social' | 'physical';

// Base types
export type PlayerRole = 'attacker' | 'defender';
export type GamePhase = 'setup' | 'playing' | 'gameOver';
export type InfrastructureState = 
  | 'secure'
  | 'vulnerable'
  | 'compromised'
  | 'shielded'
  | 'fortified'
  | 'fortified_weaken';
export type PlayerConnectionState = 'connected' | 'disconnected';
export type TurnStage = 'action' | 'reaction' | 'end' | null;

// Core interfaces
export interface LobbyConfig {
  password?: string;
  join?: string | boolean;
  create?: string | boolean;
  invitation?: string;
  players?: Record<string, {
    id?: string;
    name?: string;
    credentials?: string;
    [key: string]: unknown;
  }>;
}

export interface PendingReaction {
  cardId: string;
  targetId?: string;
  reactingPlayerId?: string;
  card?: Card;
  source?: string;
  target?: string;
}

export interface GameAction {
  playerRole: PlayerRole;
  actionType: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

export interface InfrastructureCardEffect {
  type: string;
  duration: number;
  source?: string;
}

/**
 * PendingWildcardChoice - represents a pending wildcard type choice from a player
 * This is for Phase 2 of the Wildcard System implementation
 */
export interface PendingWildcardChoice {
  cardId: string;
  playerId: string;
  availableTypes: CardType[];
  targetInfrastructure?: string;
  timestamp: number;
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
 * Infrastructure card - represents the central objectives in the game
 */
export interface InfrastructureCard {
  id: string;
  name: string;
  type: 'network' | 'web' | 'data' | 'user' | 'critical';
  description: string;
  flavor: string;
  vulnerableVectors?: AttackVector[];
  vulnerabilities: Vulnerability[] | string[];
  img: string;
  healthPoints?: number; // Added during gameplay
  damaged?: boolean;     // Track if card has been damaged
  state: InfrastructureState;
  effects?: InfrastructureCardEffect[];
  critical?: boolean;    // Whether this is a critical infrastructure
  shields?: Shield[];
}

// Placeholder types for compilation
export interface Vulnerability {
  type: string;
  description?: string;
  severity?: number;
  vector?: AttackVector;
  [key: string]: unknown;
}

export interface Shield {
  type: string;
  strength?: number;
  description?: string;
  [key: string]: unknown;
}

export interface ChainEffect {
  type: 'chain_vulnerability' | 'chain_compromise' | 'chain_security';
  sourceCardId: string;
  playerId: string;
  availableTargets: string[];
  // Additional UI-specific properties
  sourceCard?: Card;
  selectedTarget?: string;
}

/**
 * Frontend-specific HandDisruptionChoice type for Phase 3
 */
export interface HandDisruptionChoice {
  type: 'discard_from_hand';
  targetPlayerId: string;
  revealedHand: Card[];
  count?: number;
  // Additional UI-specific properties
  selectedCardId?: string;
  playerHand?: Card[];
  mustDiscard?: number; // Alias for count to maintain consistency with existing code
}

/**
 * Frontend-specific extension to InfrastructureCard
 * Extends the shared type with UI-specific properties
 */
export interface FrontendInfrastructureCard extends InfrastructureCard {
  isTargetable?: boolean;
  isSelected?: boolean;
  showDetails?: boolean;
  className?: string;
  isHighlighted?: boolean;     // Whether the card is highlighted
  animatingAttack?: boolean;   // Whether the card is animating an attack
  isImmune?: boolean;          // Whether the card is immune to certain effects
  vulnerabilityInfo?: Vulnerability[];   // Additional vulnerability info for the UI
  shieldsInfo?: Shield[];         // Additional shield info for the UI
  isNew?: boolean;             // Whether the card is newly added to the game
  canBeTargeted?: boolean;     // Whether the card can be targeted by the player
  healthPoints?: number;       // Added during gameplay (UI-specific)
  damaged?: boolean;           // Track if card has been damaged (UI-specific)
}

/**
 * Frontend-specific extension to Player
 * Extends the shared type with UI-specific properties
 */
export interface FrontendPlayer extends Player {
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
  uiState?: Record<string, unknown>; // State of the UI components
  message?: string; // Game message to display to player
  playerRole?: 'attacker' | 'defender' | 'spectator'; // Role of the current player viewing the game
  isAttacker?: boolean; // Whether the current player is the attacker
  isDefender?: boolean; // Whether the current player is the defender
  playerID?: string; // ID of the current player viewing the game
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
  gamePhase: GamePhase;
  
  // Game state
  winner?: PlayerRole | 'abandoned';
  actions: GameAction[];
  
  // Score tracking
  attackerScore: number;
  defenderScore: number;
  message?: string;
  messageColor?: string;
  messageTo?: string;
  messageTag?: string;
  
  // Pending player choices
  pendingWildcardChoice?: PendingWildcardChoice; // Phase 2
  
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
  
  // Phase 2: Wildcard choice system is now handled by the pendingWildcardChoice property defined above
  
  // PHASE 3: Chain effect system (lateral movement)
  pendingChainChoice?: ChainEffect;
  
  // PHASE 3: Hand disruption system
  pendingHandChoice?: HandDisruptionChoice;
  
  // Card choice system (for deck selection, etc.)
  pendingCardChoice?: {
    playerId: string;
    availableCards: Card[];
    choiceType: 'deck_selection' | 'hand_selection' | 'discard_selection';
    sourceCardId: string;
    timestamp: number;
  };
  
  // NEW: Temporary effects for wildcard specials
  temporaryEffects?: {
    type: 'prevent_reactions' | 'prevent_restore' | 'cost_reduction' | 'chain_vulnerability' |
          'restrict_targeting' | 'quantum_protection' | 'honeypot';
    targetId?: string;
    playerId?: string;
    duration: number;
    sourceCardId: string;
    metadata?: Record<string, unknown>;
  }[];
  
  // NEW: Persistent conditional effects (watch for state changes)
  persistentEffects?: {
    type: 'on_compromise' | 'on_vulnerability' | 'on_restore' | 'on_shield' | 'on_fortify';
    targetId: string;           // Infrastructure being watched
    playerId: string;           // Player who gets the benefit
    sourceCardId: string;       // Card that created this effect
    condition: {
      fromState?: InfrastructureState | 'any';
      toState: InfrastructureState;
    };
    reward: {
      effect: 'gain_ap' | 'draw_card' | 'gain_resource';
      amount: number;
    };
    autoRemove: boolean;        // Remove after triggering once
    triggered: boolean;         // Whether this effect has been triggered
  }[];
  
  // Game configuration
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

  // Frontend-specific extensions
  infrastructureMatrix?: InfrastructureCard[][];
  selectedRow?: number | null;
  selectedCol?: number | null;
  selectedCardId?: string | null;
  hoveringCard?: { cardId: string; x: number; y: number } | null;
  
  // Infrastructure attack/defense related
  availableAttackTargets?: InfrastructureCard[];
  defendableInfrastructures?: InfrastructureCard[];
  
  // UI state management
  activeTab?: 'hand' | 'field' | 'discard';
  activeOpponentTab?: 'field' | 'discard';
  isPlayerHandExpanded?: boolean;
  isHandCardDetailVisible?: boolean;
  selectedHandCard?: Card | null;
  selectedFieldCard?: Card | null;
  isGameInfoVisible?: boolean;
  isPlayerResourcesExpanded?: boolean;
  isOpponentResourcesExpanded?: boolean;
  isEndTurnModalVisible?: boolean;

  // Card drag/drop state
  isDragging?: boolean;
  draggedCardId?: string | null;
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

export interface GameHistoryItem {
  gameId: string;
  gameMode: string;
  startTime: string;
  endTime: string;
  turnCount: number;
  isWinner: boolean;
  playerRole: string;
  ratingChange: number | null;
  ratingBefore: number | null;
  ratingAfter: number | null;
  opponent: {
    id: string;
    username: string;
    role: string;
  } | null;
  abandonReason: string | null;
}

export interface GameHistoryResponse {
  games: GameHistoryItem[];
  total: number;
  hasMore: boolean;
}

export interface GameDetails {
  gameId: string;
  gameMode: string;
  startTime: string;
  endTime: string;
  turnCount: number;
  winnerId: string | null;
  winnerRole: string | null;
  abandonReason: string | null;
  players: {
    accountId: string;
    username: string;
    playerRole: string;
    isWinner: boolean;
    ratingBefore: number | null;
    ratingAfter: number | null;
    ratingChange: number | null;
  }[];
}
