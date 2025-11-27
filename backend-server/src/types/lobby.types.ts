/**
 * Lobby System Type Definitions
 * 
 * Defines all types for the WebSocket-based lobby system
 */

/**
 * Lobby lifecycle states
 */
export enum LobbyState {
  WAITING = 'waiting',      // Created, waiting for players
  ACTIVE = 'active',        // Has 1+ players, accepting joins
  FULL = 'full',            // Max players reached
  STARTING = 'starting',    // Game initialization in progress
  IN_GAME = 'in_game',      // Game started (handed off to boardgame.io)
  EMPTY = 'empty',          // All players left (grace period)
  CLOSED = 'closed'         // Permanently closed (cleanup pending)
}

/**
 * Player connection state
 */
export enum PlayerConnectionState {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

/**
 * Lobby visibility
 */
export enum LobbyVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

/**
 * Individual player in a lobby
 */
export interface LobbyPlayer {
  userId: string;              // Real user UUID from auth
  username: string;            // Display name
  socketId: string;            // Current socket connection ID
  connectionState: PlayerConnectionState;
  joinedAt: number;            // Timestamp
  isReady: boolean;            // Ready to start game
  isHost: boolean;             // First player is host
  lastHeartbeat: number;       // For disconnect detection
}

/**
 * Game settings for boardgame.io handoff
 */
export interface GameSettings {
  gameMode: 'standard' | 'blitz' | 'custom';
  initialResources: number;
  maxTurns: number;
}

/**
 * Complete lobby state
 */
export interface Lobby {
  // Identity
  lobbyId: string;             // Unique ID (crypto.randomBytes)
  lobbyCode: string;           // Human-readable code (6 chars, uppercase)
  
  // Configuration
  name: string;                // Display name
  visibility: LobbyVisibility;
  maxPlayers: number;          // Default: 2
  
  // State
  state: LobbyState;
  players: Map<string, LobbyPlayer>;
  
  // Metadata
  createdAt: number;
  createdBy: string;           // Host userId
  lastActivity: number;        // For cleanup
  
  // Game settings (preserved for boardgame.io handoff)
  gameSettings: GameSettings;
  
  // Lifecycle
  emptyGraceTimer?: NodeJS.Timeout;
}

/**
 * Lobby creation configuration
 */
export interface CreateLobbyConfig {
  name: string;
  visibility: LobbyVisibility;
  maxPlayers: number;
  createdBy: string;
  gameSettings: GameSettings;
}

/**
 * Result of join attempt
 */
export interface JoinResult {
  allowed: boolean;
  reason?: 'LOBBY_CLOSED' | 'GAME_IN_PROGRESS' | 'LOBBY_FULL' | 'ALREADY_IN_LOBBY' | 'LOBBY_EMPTY';
  lobby?: Lobby;
}

/**
 * Serializable lobby (for sending over WebSocket)
 */
export interface SerializableLobby {
  lobbyId: string;
  lobbyCode: string;
  name: string;
  visibility: LobbyVisibility;
  maxPlayers: number;
  state: LobbyState;
  players: Array<LobbyPlayer>;
  createdAt: number;
  createdBy: string;
  lastActivity: number;
  gameSettings: GameSettings;
}
