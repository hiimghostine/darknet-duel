/**
 * Lobby Manager Service
 * 
 * Manages lobby lifecycle, player management, and enforces business rules.
 * Implements mutex locks for atomic operations.
 */

import crypto from 'crypto';
import {
  Lobby,
  LobbyState,
  LobbyPlayer,
  PlayerConnectionState,
  LobbyVisibility,
  CreateLobbyConfig,
  JoinResult,
  SerializableLobby
} from '../types/lobby.types';

export class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private locks: Map<string, Promise<void>> = new Map();
  private lockReleases: Map<string, () => void> = new Map(); // Store release functions
  private userLobbies: Map<string, Set<string>> = new Map(); // userId -> Set<lobbyId>
  
  // Characters for lobby code generation (excludes ambiguous: 0, O, I, 1, L)
  private readonly SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  private readonly EMPTY_GRACE_PERIOD_MS = 60000; // 60 seconds

  /**
   * Create a new lobby
   */
  async createLobby(config: CreateLobbyConfig): Promise<Lobby> {
    const lobbyId = crypto.randomBytes(16).toString('hex');
    const lobbyCode = this.generateLobbyCode();
    
    const lobby: Lobby = {
      lobbyId,
      lobbyCode,
      name: config.name,
      visibility: config.visibility,
      maxPlayers: config.maxPlayers,
      state: LobbyState.WAITING,
      players: new Map(),
      createdAt: Date.now(),
      createdBy: config.createdBy,
      lastActivity: Date.now(),
      gameSettings: config.gameSettings
    };
    
    this.lobbies.set(lobbyId, lobby);
    
    console.log(`✅ Lobby created: ${lobbyId} (${lobbyCode}) by ${config.createdBy}`);
    
    return lobby;
  }

  /**
   * Join a lobby
   */
  async joinLobby(lobbyId: string, userId: string, username: string, socketId: string): Promise<JoinResult> {
    await this.acquireLock(lobbyId);
    
    try {
      const lobby = this.lobbies.get(lobbyId);
      
      if (!lobby) {
        return { allowed: false, reason: 'LOBBY_CLOSED' };
      }
      
      // Check if join is allowed
      const canJoin = this.canJoinLobby(lobby, userId);
      if (!canJoin.allowed) {
        return canJoin;
      }
      
      // Determine if user is host
      const isHost = lobby.players.size === 0;
      
      // Create player
      const player: LobbyPlayer = {
        userId,
        username,
        socketId,
        connectionState: PlayerConnectionState.CONNECTED,
        joinedAt: Date.now(),
        isReady: false,
        isHost,
        lastHeartbeat: Date.now()
      };
      
      // Add player to lobby
      lobby.players.set(userId, player);
      lobby.lastActivity = Date.now();
      
      // Update lobby state
      if (lobby.state === LobbyState.WAITING || lobby.state === LobbyState.EMPTY) {
        this.transitionState(lobby, LobbyState.ACTIVE);
      }
      
      if (lobby.players.size === lobby.maxPlayers) {
        this.transitionState(lobby, LobbyState.FULL);
      }
      
      // Clear empty grace timer if it exists
      if (lobby.emptyGraceTimer) {
        clearTimeout(lobby.emptyGraceTimer);
        delete lobby.emptyGraceTimer;
      }
      
      // Track user's lobbies
      if (!this.userLobbies.has(userId)) {
        this.userLobbies.set(userId, new Set());
      }
      this.userLobbies.get(userId)!.add(lobbyId);
      
      console.log(`✅ Player ${username} (${userId}) joined lobby ${lobbyId}`);
      
      return { allowed: true, lobby };
    } finally {
      this.releaseLock(lobbyId);
    }
  }

  /**
   * Leave a lobby
   */
  async leaveLobby(lobbyId: string, userId: string): Promise<boolean> {
    await this.acquireLock(lobbyId);
    
    try {
      const lobby = this.lobbies.get(lobbyId);
      
      if (!lobby) {
        return false;
      }
      
      const player = lobby.players.get(userId);
      if (!player) {
        return false;
      }
      
      // Remove player
      lobby.players.delete(userId);
      lobby.lastActivity = Date.now();
      
      // Update user lobbies tracking
      this.userLobbies.get(userId)?.delete(lobbyId);
      if (this.userLobbies.get(userId)?.size === 0) {
        this.userLobbies.delete(userId);
      }
      
      console.log(`🚪 Player ${player.username} (${userId}) left lobby ${lobbyId}`);
      
      // Check if lobby is now empty
      if (lobby.players.size === 0) {
        this.transitionState(lobby, LobbyState.EMPTY);
        
        // Start empty grace timer
        lobby.emptyGraceTimer = setTimeout(() => {
          this.closeLobby(lobbyId, 'Empty grace period expired');
        }, this.EMPTY_GRACE_PERIOD_MS);
        
        console.log(`⏱️  Lobby ${lobbyId} is empty, starting ${this.EMPTY_GRACE_PERIOD_MS / 1000}s grace period`);
      } else if (lobby.state === LobbyState.FULL) {
        // If lobby was full, transition back to active
        this.transitionState(lobby, LobbyState.ACTIVE);
      }
      
      return true;
    } finally {
      this.releaseLock(lobbyId);
    }
  }

  /**
   * Update player ready status
   */
  async updateReadyStatus(lobbyId: string, userId: string, isReady: boolean): Promise<boolean> {
    await this.acquireLock(lobbyId);
    
    try {
      const lobby = this.lobbies.get(lobbyId);
      
      if (!lobby) {
        return false;
      }
      
      const player = lobby.players.get(userId);
      if (!player) {
        return false;
      }
      
      player.isReady = isReady;
      lobby.lastActivity = Date.now();
      
      console.log(`${isReady ? '✅' : '❌'} Player ${player.username} ready status: ${isReady}`);
      
      return true;
    } finally {
      this.releaseLock(lobbyId);
    }
  }

  /**
   * Start game (host only)
   */
  async startGame(lobbyId: string, userId: string): Promise<boolean> {
    await this.acquireLock(lobbyId);
    
    try {
      const lobby = this.lobbies.get(lobbyId);
      
      if (!lobby) {
        return false;
      }
      
      // Verify user is host
      if (lobby.createdBy !== userId) {
        console.log(`❌ User ${userId} is not host of lobby ${lobbyId}`);
        return false;
      }
      
      // Verify all non-host players are ready (host doesn't need to be ready)
      const players = Array.from(lobby.players.values());
      const nonHostPlayers = players.filter(p => p.userId !== lobby.createdBy);
      const allNonHostReady = nonHostPlayers.every(p => p.isReady);
      
      if (!allNonHostReady) {
        const readyCount = nonHostPlayers.filter(p => p.isReady).length;
        console.log(`❌ Not all non-host players are ready in lobby ${lobbyId} (${readyCount}/${nonHostPlayers.length})`);
        return false;
      }
      
      // Also check minimum player count
      if (players.length < 2) {
        console.log(`❌ Not enough players in lobby ${lobbyId} (${players.length}/2 minimum)`);
        return false;
      }
      
      this.transitionState(lobby, LobbyState.STARTING);
      lobby.lastActivity = Date.now();
      
      console.log(`🎮 Game starting in lobby ${lobbyId}`);
      
      return true;
    } finally {
      this.releaseLock(lobbyId);
    }
  }

  /**
   * Mark lobby as in-game (called after boardgame.io match created)
   */
  async markInGame(lobbyId: string): Promise<void> {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      this.transitionState(lobby, LobbyState.IN_GAME);
    }
  }

  /**
   * Close a lobby
   */
  closeLobby(lobbyId: string, reason: string): void {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return;
    }
    
    // Clear timers
    if (lobby.emptyGraceTimer) {
      clearTimeout(lobby.emptyGraceTimer);
    }
    
    // Remove from user tracking
    for (const player of lobby.players.values()) {
      this.userLobbies.get(player.userId)?.delete(lobbyId);
      if (this.userLobbies.get(player.userId)?.size === 0) {
        this.userLobbies.delete(player.userId);
      }
    }
    
    // Delete lobby
    this.lobbies.delete(lobbyId);
    
    console.log(`🗑️  Lobby ${lobbyId} closed: ${reason}`);
  }

  /**
   * Get lobby by ID
   */
  getLobby(lobbyId: string): Lobby | null {
    return this.lobbies.get(lobbyId) || null;
  }

  /**
   * Get lobby by code
   */
  getLobbyByCode(lobbyCode: string): Lobby | null {
    for (const lobby of this.lobbies.values()) {
      if (lobby.lobbyCode === lobbyCode) {
        return lobby;
      }
    }
    return null;
  }

  /**
   * Get all lobbies a user is in
   */
  getUserLobbies(userId: string): Lobby[] {
    const lobbyIds = this.userLobbies.get(userId);
    if (!lobbyIds) {
      return [];
    }
    
    const lobbies: Lobby[] = [];
    for (const lobbyId of lobbyIds) {
      const lobby = this.lobbies.get(lobbyId);
      if (lobby) {
        lobbies.push(lobby);
      }
    }
    
    return lobbies;
  }

  /**
   * Get all lobbies
   */
  getAllLobbies(): Lobby[] {
    return Array.from(this.lobbies.values());
  }

  /**
   * Convert lobby to serializable format
   */
  serializeLobby(lobby: Lobby): SerializableLobby {
    return {
      lobbyId: lobby.lobbyId,
      lobbyCode: lobby.lobbyCode,
      name: lobby.name,
      visibility: lobby.visibility,
      maxPlayers: lobby.maxPlayers,
      state: lobby.state,
      players: Array.from(lobby.players.values()),
      createdAt: lobby.createdAt,
      createdBy: lobby.createdBy,
      lastActivity: lobby.lastActivity,
      gameSettings: lobby.gameSettings
    };
  }

  /**
   * Get all public lobbies
   */
  getPublicLobbies(): Lobby[] {
    return Array.from(this.lobbies.values())
      .filter(lobby => 
        lobby.visibility === LobbyVisibility.PUBLIC &&
        lobby.state !== LobbyState.CLOSED &&
        lobby.state !== LobbyState.IN_GAME
      );
  }

  /**
   * Check if user can join lobby (CORE EMPTY LOBBY ENFORCEMENT)
   */
  private canJoinLobby(lobby: Lobby, userId: string): JoinResult {
    // Check 1: Lobby must not be closed
    if (lobby.state === LobbyState.CLOSED) {
      return { allowed: false, reason: 'LOBBY_CLOSED' };
    }
    
    // Check 2: Lobby must not be in game
    if (lobby.state === LobbyState.IN_GAME) {
      return { allowed: false, reason: 'GAME_IN_PROGRESS' };
    }
    
    // Check 3: Lobby must not be full
    if (lobby.players.size >= lobby.maxPlayers) {
      return { allowed: false, reason: 'LOBBY_FULL' };
    }
    
    // Check 4: User must not already be in lobby
    if (lobby.players.has(userId)) {
      return { allowed: false, reason: 'ALREADY_IN_LOBBY' };
    }
    
    // Check 5: CRITICAL - Private lobbies must have active players
    // Exception: The lobby creator can always join their own empty lobby
    if (lobby.visibility === LobbyVisibility.PRIVATE) {
      const activeCount = Array.from(lobby.players.values())
        .filter(p => p.connectionState === PlayerConnectionState.CONNECTED)
        .length;
      
      const isCreator = userId === lobby.createdBy;
      
      if (activeCount === 0 && !isCreator) {
        console.log(`❌ Cannot join empty private lobby ${lobby.lobbyId}`);
        return { allowed: false, reason: 'LOBBY_EMPTY' };
      }
    }
    
    return { allowed: true };
  }

  /**
   * Transition lobby state
   */
  private transitionState(lobby: Lobby, newState: LobbyState): void {
    const oldState = lobby.state;
    lobby.state = newState;
    console.log(`🔄 Lobby ${lobby.lobbyId} state: ${oldState} → ${newState}`);
  }

  /**
   * Generate unique lobby code
   */
  private generateLobbyCode(): string {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const bytes = crypto.randomBytes(6);
      let code = '';
      
      for (let i = 0; i < 6; i++) {
        code += this.SAFE_CHARS[bytes[i] % this.SAFE_CHARS.length];
      }
      
      // Check for collision
      if (!this.getLobbyByCode(code)) {
        return code;
      }
      
      attempts++;
    }
    
    // Fallback: add timestamp suffix
    const bytes = crypto.randomBytes(4);
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += this.SAFE_CHARS[bytes[i] % this.SAFE_CHARS.length];
    }
    code += Date.now().toString(36).slice(-2).toUpperCase();
    
    return code;
  }

  /**
   * Acquire lock for lobby
   */
  private async acquireLock(lobbyId: string): Promise<void> {
    while (this.locks.has(lobbyId)) {
      await this.locks.get(lobbyId);
    }
    
    let releaseLock: () => void;
    const lockPromise = new Promise<void>(resolve => {
      releaseLock = resolve;
    });
    
    this.locks.set(lobbyId, lockPromise);
    this.lockReleases.set(lobbyId, releaseLock!);
  }

  /**
   * Release lock for lobby
   */
  private releaseLock(lobbyId: string): void {
    const release = this.lockReleases.get(lobbyId);
    if (release) {
      release();
      this.lockReleases.delete(lobbyId);
    }
    this.locks.delete(lobbyId);
  }
}
