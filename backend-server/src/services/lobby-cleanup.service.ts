/**
 * Lobby Cleanup Service
 * 
 * Periodically cleans up stale lobbies (empty, waiting too long, etc.)
 */

import { LobbyManager } from './lobby-manager.service';
import { LobbyState } from '../types/lobby.types';
import { Server as SocketIOServer } from 'socket.io';

export class LobbyCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60000; // 60 seconds
  private readonly WAITING_TIMEOUT_MS = 600000; // 10 minutes
  private readonly WARNING_BEFORE_CLOSE_MS = 30000; // 30 seconds warning
  private warningsSent: Set<string> = new Set(); // Track which lobbies have been warned
  
  constructor(
    private lobbyManager: LobbyManager,
    private io?: SocketIOServer
  ) {}

  /**
   * Start the cleanup service
   */
  start(): void {
    if (this.cleanupInterval) {
      console.log('⚠️  Lobby cleanup service already running');
      return;
    }
    
    console.log(`🧹 Starting lobby cleanup service (interval: ${this.CLEANUP_INTERVAL_MS / 1000}s)`);
    
    // Run cleanup immediately
    this.cleanup();
    
    // Then run periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Stop the cleanup service
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Lobby cleanup service stopped');
    }
  }

  /**
   * Run cleanup logic
   */
  private cleanup(): void {
    const now = Date.now();
    const lobbies = this.lobbyManager.getAllLobbies();
    let closedCount = 0;
    let warningCount = 0;
    
    for (const lobby of lobbies) {
      let shouldClose = false;
      let shouldWarn = false;
      let reason = '';
      let timeRemaining = 0;
      
      // Rule 1: EMPTY lobbies past grace period
      if (lobby.state === LobbyState.EMPTY) {
        const emptyDuration = now - lobby.lastActivity;
        if (emptyDuration > 60000) { // 60 seconds
          shouldClose = true;
          reason = 'Lobby has been empty for too long';
        } else if (emptyDuration > (60000 - this.WARNING_BEFORE_CLOSE_MS)) {
          shouldWarn = true;
          timeRemaining = Math.round((60000 - emptyDuration) / 1000);
          reason = 'inactivity';
        }
      }
      
      // Rule 2: WAITING lobbies with no activity for too long
      if (lobby.state === LobbyState.WAITING) {
        const waitingDuration = now - lobby.lastActivity;
        if (waitingDuration > this.WAITING_TIMEOUT_MS) {
          shouldClose = true;
          reason = 'Lobby has been inactive for too long';
        } else if (waitingDuration > (this.WAITING_TIMEOUT_MS - this.WARNING_BEFORE_CLOSE_MS)) {
          shouldWarn = true;
          timeRemaining = Math.round((this.WAITING_TIMEOUT_MS - waitingDuration) / 1000);
          reason = 'inactivity';
        }
      }
      
      // Rule 3: CLOSED state (shouldn't happen, but cleanup anyway)
      if (lobby.state === LobbyState.CLOSED) {
        shouldClose = true;
        reason = 'Lobby is already closed';
      }
      
      // Send warning if needed
      if (shouldWarn && !this.warningsSent.has(lobby.lobbyId) && this.io) {
        this.sendInactivityWarning(lobby.lobbyId, timeRemaining, reason);
        this.warningsSent.add(lobby.lobbyId);
        warningCount++;
      }
      
      // Close lobby if needed
      if (shouldClose) {
        this.lobbyManager.closeLobby(lobby.lobbyId, reason);
        this.warningsSent.delete(lobby.lobbyId); // Clean up warning tracking
        closedCount++;
      }
    }
    
    if (closedCount > 0 || warningCount > 0) {
      console.log(`🧹 Cleanup: Warned ${warningCount} lobbies, closed ${closedCount} lobbies`);
    }
  }

  /**
   * Send inactivity warning to lobby members
   */
  private sendInactivityWarning(lobbyId: string, timeRemaining: number, reason: string): void {
    if (!this.io) return;
    
    const lobbyNamespace = this.io.of('/lobby');
    lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:inactivity:warning', {
      lobbyId,
      timeRemaining,
      reason,
      message: `This lobby will be closed in ${timeRemaining} seconds due to ${reason}`
    });
    
    console.log(`⚠️  Sent inactivity warning to lobby ${lobbyId} (${timeRemaining}s remaining)`);
  }
}
