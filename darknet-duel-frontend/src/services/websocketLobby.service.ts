/**
 * WebSocket Lobby Service
 * 
 * Handles real-time lobby operations via WebSocket connection
 * Used for private lobbies to prevent empty lobby joins
 */

import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Types matching backend
export type LobbyState = 
  | 'waiting'
  | 'active'
  | 'full'
  | 'starting'
  | 'in_game'
  | 'empty'
  | 'closed';

export type PlayerConnectionState = 'connected' | 'disconnected';

export interface LobbyPlayer {
  userId: string;
  username: string;
  socketId: string;
  connectionState: PlayerConnectionState;
  joinedAt: number;
  isReady: boolean;
  isHost: boolean;
  lastHeartbeat: number;
}

export interface GameSettings {
  gameMode: 'standard' | 'blitz' | 'custom';
  initialResources: number;
  maxTurns: number;
}

export interface Lobby {
  lobbyId: string;
  lobbyCode: string;
  name: string;
  visibility: 'public' | 'private';
  maxPlayers: number;
  state: LobbyState;
  players: LobbyPlayer[];
  createdAt: number;
  createdBy: string;
  lastActivity: number;
  gameSettings: GameSettings;
}

export type LobbyErrorReason = 
  | 'LOBBY_CLOSED' 
  | 'GAME_IN_PROGRESS' 
  | 'LOBBY_FULL' 
  | 'ALREADY_IN_LOBBY' 
  | 'LOBBY_EMPTY';

// Event callback types
export type LobbyCreatedCallback = (data: { lobby: Lobby }) => void;
export type LobbyJoinedCallback = (data: { lobby: Lobby }) => void;
export type LobbyJoinErrorCallback = (data: { error: LobbyErrorReason }) => void;
export type LobbyUpdatedCallback = (data: { lobby: Lobby }) => void;
export type LobbyPlayerJoinedCallback = (data: { userId: string; username: string }) => void;
export type LobbyPlayerLeftCallback = (data: { userId: string; username: string }) => void;
export type LobbyLeftCallback = (data: { lobbyId: string }) => void;
export type LobbyGameStartingCallback = (data: { lobbyId: string; matchID: string; lobby: Lobby }) => void;
export type LobbyClosedCallback = (data: { lobbyId: string; reason: string }) => void;
export type LobbyErrorCallback = (data: { error: string }) => void;
export type LobbyInactivityWarningCallback = (data: { lobbyId: string; timeRemaining: number; reason: string; message: string }) => void;
export type LobbyKickedCallback = (data: { lobbyId: string; reason: string }) => void;
export type LobbySwapRequestedCallback = (data: { lobbyId: string; requesterId: string; requesterName: string }) => void;
export type LobbySwapSentCallback = (data: { lobbyId: string }) => void;
export type LobbySwapDeclinedCallback = (data: { lobbyId: string }) => void;

class WebSocketLobbyService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 2000;

  /**
   * Connect to lobby WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('🔌 Already connected to lobby WebSocket');
        resolve();
        return;
      }

      console.log('🔌 Connecting to lobby WebSocket...');

      this.socket = io(`${BACKEND_URL}/lobby`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: this.RECONNECT_DELAY
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to lobby WebSocket');
        this.connected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Lobby WebSocket connection error:', error);
        this.connected = false;
        
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
          reject(new Error('Failed to connect to lobby server'));
        }
        this.reconnectAttempts++;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('📡 Disconnected from lobby WebSocket:', reason);
        this.connected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected to lobby WebSocket (attempt ${attemptNumber})`);
        this.connected = true;
      });
    });
  }

  /**
   * Disconnect from lobby WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting from lobby WebSocket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  /**
   * Create a new lobby
   */
  createLobby(config: {
    name: string;
    visibility: 'public' | 'private';
    maxPlayers: number;
    gameSettings: GameSettings;
  }): Promise<Lobby> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to lobby server'));
        return;
      }

      // Set up one-time listeners
      const onCreated = (data: { lobby: Lobby }) => {
        cleanup();
        resolve(data.lobby);
      };

      const onError = (data: { error: string }) => {
        cleanup();
        reject(new Error(data.error));
      };

      const cleanup = () => {
        this.socket?.off('lobby:created', onCreated);
        this.socket?.off('lobby:error', onError);
      };

      this.socket.once('lobby:created', onCreated);
      this.socket.once('lobby:error', onError);

      // Emit create event
      this.socket.emit('lobby:create', config);

      // Timeout after 10 seconds
      setTimeout(() => {
        cleanup();
        reject(new Error('Create lobby timeout'));
      }, 10000);
    });
  }

  /**
   * Join a lobby by ID
   */
  joinLobby(lobbyId: string): Promise<Lobby> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to lobby server'));
        return;
      }

      const onJoined = (data: { lobby: Lobby }) => {
        cleanup();
        resolve(data.lobby);
      };

      const onJoinError = (data: { error: LobbyErrorReason }) => {
        cleanup();
        reject(new Error(data.error));
      };

      const onError = (data: { error: string }) => {
        cleanup();
        reject(new Error(data.error));
      };

      const cleanup = () => {
        this.socket?.off('lobby:joined', onJoined);
        this.socket?.off('lobby:join:error', onJoinError);
        this.socket?.off('lobby:error', onError);
      };

      this.socket.once('lobby:joined', onJoined);
      this.socket.once('lobby:join:error', onJoinError);
      this.socket.once('lobby:error', onError);

      this.socket.emit('lobby:join', { lobbyId });

      setTimeout(() => {
        cleanup();
        reject(new Error('Join lobby timeout'));
      }, 10000);
    });
  }

  /**
   * Get lobby details
   */
  getLobby(lobbyId: string): void {
    if (!this.socket) {
      console.error('Not connected to lobby server');
      return;
    }

    this.socket.emit('lobby:get', { lobbyId });
  }

  /**
   * Kick a player from lobby (host only)
   */
  kickPlayer(lobbyId: string, userId: string): void {
    if (!this.socket) {
      console.error('Not connected to lobby server');
      return;
    }

    this.socket.emit('lobby:kick', { lobbyId, userId });
  }

  /**
   * Request position swap
   */
  requestSwap(lobbyId: string): void {
    if (!this.socket) {
      console.error('Not connected to lobby server');
      return;
    }

    this.socket.emit('lobby:swap:request', { lobbyId });
  }

  /**
   * Accept position swap
   */
  acceptSwap(lobbyId: string): void {
    if (!this.socket) {
      console.error('Not connected to lobby server');
      return;
    }

    this.socket.emit('lobby:swap:accept', { lobbyId });
  }

  /**
   * Decline position swap
   */
  declineSwap(lobbyId: string): void {
    if (!this.socket) {
      console.error('Not connected to lobby server');
      return;
    }

    this.socket.emit('lobby:swap:decline', { lobbyId });
  }

  /**
   * Leave a lobby
   */
  leaveLobby(lobbyId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to lobby server'));
        return;
      }

      const onLeft = () => {
        cleanup();
        resolve();
      };

      const onError = (data: { error: string }) => {
        cleanup();
        reject(new Error(data.error));
      };

      const cleanup = () => {
        this.socket?.off('lobby:left', onLeft);
        this.socket?.off('lobby:error', onError);
      };

      this.socket.once('lobby:left', onLeft);
      this.socket.once('lobby:error', onError);

      this.socket.emit('lobby:leave', { lobbyId });

      setTimeout(() => {
        cleanup();
        reject(new Error('Leave lobby timeout'));
      }, 10000);
    });
  }

  /**
   * Set ready status
   */
  setReady(lobbyId: string, isReady: boolean): void {
    if (!this.socket) {
      throw new Error('Not connected to lobby server');
    }

    this.socket.emit('lobby:ready', { lobbyId, isReady });
  }

  /**
   * Toggle ready status (convenience method)
   */
  toggleReady(lobbyId: string): void {
    if (!this.socket) {
      throw new Error('Not connected to lobby server');
    }

    this.socket.emit('lobby:ready:toggle', { lobbyId });
  }

  /**
   * Start game (host only)
   */
  startGame(lobbyId: string): void {
    if (!this.socket) {
      throw new Error('Not connected to lobby server');
    }

    this.socket.emit('lobby:start', { lobbyId });
  }

  /**
   * Send heartbeat to keep lobby alive
   */
  sendHeartbeat(lobbyId: string): void {
    if (!this.socket) {
      return; // Silent fail for heartbeat
    }

    this.socket.emit('lobby:heartbeat', { lobbyId });
  }

  /**
   * Register event listeners
   */
  on(event: 'lobby:created', callback: LobbyCreatedCallback): void;
  on(event: 'lobby:joined', callback: LobbyJoinedCallback): void;
  on(event: 'lobby:join:error', callback: LobbyJoinErrorCallback): void;
  on(event: 'lobby:updated', callback: LobbyUpdatedCallback): void;
  on(event: 'lobby:player:joined', callback: LobbyPlayerJoinedCallback): void;
  on(event: 'lobby:player:left', callback: LobbyPlayerLeftCallback): void;
  on(event: 'lobby:left', callback: LobbyLeftCallback): void;
  on(event: 'lobby:game:starting', callback: LobbyGameStartingCallback): void;
  on(event: 'lobby:closed', callback: LobbyClosedCallback): void;
  on(event: 'lobby:error', callback: LobbyErrorCallback): void;
  on(event: 'lobby:inactivity:warning', callback: LobbyInactivityWarningCallback): void;
  on(event: 'lobby:kicked', callback: LobbyKickedCallback): void;
  on(event: 'lobby:swap:requested', callback: LobbySwapRequestedCallback): void;
  on(event: 'lobby:swap:sent', callback: LobbySwapSentCallback): void;
  on(event: 'lobby:swap:declined', callback: LobbySwapDeclinedCallback): void;
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      throw new Error('Not connected to lobby server');
    }

    this.socket.on(event, callback);
  }

  /**
   * Request public lobby list
   */
  requestLobbyList(): void {
    if (!this.socket) {
      throw new Error('Not connected to lobby server');
    }

    this.socket.emit('lobbies:list:request');
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }
}

// Export singleton instance
export const websocketLobbyService = new WebSocketLobbyService();
