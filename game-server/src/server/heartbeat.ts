import type { Server } from 'boardgame.io/server';

export interface PlayerHeartbeat {
  playerID: string;
  timestamp: number;
  lastHeartbeat: number;
  isConnected: boolean;
  latency: number;
  reconnectAttempts: number;
}

export interface GameHeartbeatData {
  [matchID: string]: {
    [playerID: string]: PlayerHeartbeat;
  };
}

export class HeartbeatManager {
  private gameHeartbeats: GameHeartbeatData = {};
  private server: any;
  private heartbeatTimeout = 15000; // 15 seconds to detect disconnect
  private disconnectGracePeriod = 30000; // 30 seconds grace period before forfeit
  private inactivityTimeout = 600000; // 10 minutes
  private cleanupInterval: NodeJS.Timeout;
  private disconnectTimers: { [key: string]: NodeJS.Timeout } = {};

  constructor(server: any) {
    this.server = server;
    
    // Clean up stale heartbeats every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleHeartbeats();
    }, 30000);
  }

  /**
   * Update heartbeat for a player
   */
  updateHeartbeat(matchID: string, playerID: string, timestamp: number): PlayerHeartbeat {
    if (!this.gameHeartbeats[matchID]) {
      this.gameHeartbeats[matchID] = {};
    }

    const latency = Date.now() - timestamp;
    const heartbeat: PlayerHeartbeat = {
      playerID,
      timestamp,
      lastHeartbeat: Date.now(),
      latency,
      isConnected: true,
      reconnectAttempts: 0
    };

    this.gameHeartbeats[matchID][playerID] = heartbeat;
    console.log(`Heartbeat updated for match ${matchID}, player ${playerID}: ${latency}ms latency`);
    
    // Clear any existing disconnect timer for this player
    const timerKey = `${matchID}-${playerID}`;
    if (this.disconnectTimers[timerKey]) {
      clearTimeout(this.disconnectTimers[timerKey]);
      delete this.disconnectTimers[timerKey];
    }
    
    return heartbeat;
  }

  /**
   * Get heartbeat status for a player
   */
  getPlayerHeartbeat(matchID: string, playerID: string): PlayerHeartbeat | null {
    return this.gameHeartbeats[matchID]?.[playerID] || null;
  }

  /**
   * Get opponent heartbeat status
   */
  getOpponentHeartbeat(matchID: string, playerID: string): PlayerHeartbeat | null {
    const gameHeartbeats = this.gameHeartbeats[matchID];
    if (!gameHeartbeats) return null;

    // Find the opponent (the other player in the game)
    const opponentID = Object.keys(gameHeartbeats).find(id => id !== playerID);
    return opponentID ? gameHeartbeats[opponentID] : null;
  }

  /**
   * Check if a player is connected based on heartbeat
   */
  isPlayerConnected(matchID: string, playerID: string): boolean {
    const heartbeat = this.getPlayerHeartbeat(matchID, playerID);
    if (!heartbeat) return false;

    const timeSinceLastHeartbeat = Date.now() - heartbeat.lastHeartbeat;
    return timeSinceLastHeartbeat < this.heartbeatTimeout;
  }

  /**
   * Get all disconnected players for a match
   */
  getDisconnectedPlayers(matchID: string): string[] {
    const gameHeartbeats = this.gameHeartbeats[matchID];
    if (!gameHeartbeats) return [];

    const disconnectedPlayers: string[] = [];
    const now = Date.now();

    for (const [playerID, heartbeat] of Object.entries(gameHeartbeats)) {
      const timeSinceLastHeartbeat = now - heartbeat.lastHeartbeat;
      if (timeSinceLastHeartbeat >= this.heartbeatTimeout) {
        disconnectedPlayers.push(playerID);
        
        // Start disconnect timer if not already started
        const timerKey = `${matchID}-${playerID}`;
        if (!this.disconnectTimers[timerKey]) {
          console.log(`Player ${playerID} disconnected from match ${matchID}, starting ${this.disconnectGracePeriod/1000}s forfeit timer`);
          
          this.disconnectTimers[timerKey] = setTimeout(async () => {
            console.log(`Forfeit timer expired for player ${playerID} in match ${matchID}`);
            await this.executeDisconnectionForfeit(matchID, playerID);
            delete this.disconnectTimers[timerKey];
          }, this.disconnectGracePeriod);
        }
      }
    }

    return disconnectedPlayers;
  }

  /**
   * Execute forfeit for a disconnected player
   */
  private async executeDisconnectionForfeit(matchID: string, disconnectedPlayerID: string): Promise<void> {
    if (!this.server.db) return;

    try {
      const match = await this.server.db.fetch(matchID, { state: true });
      if (!match || !match.state) return;

      const gameState = match.state.G;
      if (gameState.gamePhase !== 'playing') return;

      // Determine winner (opponent of disconnected player)
      const connectedPlayerID = disconnectedPlayerID === '0' ? '1' : '0';
      const winnerRole = gameState.attacker?.id === connectedPlayerID ? 'attacker' : 'defender';
      
      console.log(`Executing forfeit for player ${disconnectedPlayerID} in match ${matchID}`);
      
      const updatedG = {
        ...gameState,
        gamePhase: 'gameOver',
        gameEnded: true,
        winner: winnerRole,
        message: `Player ${disconnectedPlayerID} forfeited due to disconnection`
      };

      await this.server.db.setState(matchID, {
        ...match.state,
        G: updatedG
      });
    } catch (error) {
      console.error(`Error executing disconnection forfeit for player ${disconnectedPlayerID} in match ${matchID}:`, error);
    }
  }

  /**
   * Check for inactivity-based forfeit
   */
  async checkInactivityForfeit(matchID: string): Promise<void> {
    if (!this.server.db) return;

    try {
      const match = await this.server.db.fetch(matchID, { state: true });
      if (!match || !match.state) return;

      const gameState = match.state.G;
      const ctx = match.state.ctx;
      
      if (gameState.gamePhase !== 'playing') return;

      const currentPlayerID = ctx.currentPlayer;
      const heartbeat = this.getPlayerHeartbeat(matchID, currentPlayerID);
      
      if (heartbeat) {
        const timeSinceLastActivity = Date.now() - heartbeat.lastHeartbeat;
        
        if (timeSinceLastActivity >= this.inactivityTimeout) {
          console.log(`Player ${currentPlayerID} forfeited due to inactivity in match ${matchID}`);
          
          // Update game state directly since BoardGame.io server doesn't have a play method
          // Determine winner (opponent of inactive player)
          const opponentID = currentPlayerID === '0' ? '1' : '0';
          const winnerRole = gameState.attacker?.id === opponentID ? 'attacker' : 'defender';
          
          const updatedG = {
            ...gameState,
            gamePhase: 'gameOver',
            gameEnded: true,
            winner: winnerRole,
            message: `Player ${currentPlayerID} forfeited due to inactivity`
          };

          await this.server.db.setState(matchID, {
            ...match.state,
            G: updatedG
          });
        }
      }
    } catch (error) {
      console.error(`Error checking inactivity forfeit for match ${matchID}:`, error);
    }
  }

  /**
   * Check for disconnection-based forfeit (now just triggers disconnect detection)
   */
  async checkDisconnectionForfeit(matchID: string): Promise<void> {
    if (!this.server.db) return;

    try {
      const match = await this.server.db.fetch(matchID, { state: true });
      if (!match || !match.state) return;

      const gameState = match.state.G;
      if (gameState.gamePhase !== 'playing') return;

      // This will detect disconnected players and start timers automatically
      const disconnectedPlayers = this.getDisconnectedPlayers(matchID);
      
      if (disconnectedPlayers.length === 2) {
        // Both players disconnected - abandon game immediately
        console.log(`Both players disconnected from match ${matchID}, abandoning game`);
        
        // Clear any existing timers
        for (const playerID of disconnectedPlayers) {
          const timerKey = `${matchID}-${playerID}`;
          if (this.disconnectTimers[timerKey]) {
            clearTimeout(this.disconnectTimers[timerKey]);
            delete this.disconnectTimers[timerKey];
          }
        }
        
        const updatedG = {
          ...gameState,
          gamePhase: 'gameOver',
          gameEnded: true,
          winner: 'abandoned',
          message: 'Game abandoned due to both players disconnecting'
        };

        await this.server.db.setState(matchID, {
          ...match.state,
          G: updatedG
        });

        // Immediately remove the abandoned match from the lobby
        try {
          await this.server.db.wipe(matchID);
          console.log(`Abandoned match ${matchID} removed immediately`);
        } catch (wipeError) {
          console.error(`Failed to remove abandoned match ${matchID}:`, wipeError);
        }
      }
    } catch (error) {
      console.error(`Error checking disconnection forfeit for match ${matchID}:`, error);
    }
  }

  /**
   * Clean up stale heartbeat data
   */
  private cleanupStaleHeartbeats(): void {
    const now = Date.now();
    const staleThreshold = 300000; // 5 minutes

    for (const [matchID, gameHeartbeats] of Object.entries(this.gameHeartbeats)) {
      for (const [playerID, heartbeat] of Object.entries(gameHeartbeats)) {
        const timeSinceLastHeartbeat = now - heartbeat.lastHeartbeat;
        
        if (timeSinceLastHeartbeat > staleThreshold) {
          delete this.gameHeartbeats[matchID][playerID];
          
          // Clear associated disconnect timer to prevent memory leak
          const timerKey = `${matchID}-${playerID}`;
          if (this.disconnectTimers[timerKey]) {
            clearTimeout(this.disconnectTimers[timerKey]);
            delete this.disconnectTimers[timerKey];
          }
          
          console.log(`Cleaned up stale heartbeat for match ${matchID}, player ${playerID}`);
        }
      }
      
      // Remove empty match entries
      if (Object.keys(this.gameHeartbeats[matchID]).length === 0) {
        delete this.gameHeartbeats[matchID];
      }
    }
  }

  /**
   * Remove all heartbeat data for a match
   */
  removeMatch(matchID: string): void {
    delete this.gameHeartbeats[matchID];
    
    // Clear all disconnect timers for this match to prevent memory leak
    for (const timerKey of Object.keys(this.disconnectTimers)) {
      if (timerKey.startsWith(`${matchID}-`)) {
        clearTimeout(this.disconnectTimers[timerKey]);
        delete this.disconnectTimers[timerKey];
      }
    }
    
    console.log(`Removed heartbeat data for match ${matchID}`);
  }

  /**
   * Cleanup and stop the heartbeat manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Clear all disconnect timers to prevent memory leak on shutdown
    for (const timerKey of Object.keys(this.disconnectTimers)) {
      clearTimeout(this.disconnectTimers[timerKey]);
    }
    this.disconnectTimers = {};
    
    console.log('HeartbeatManager destroyed and all timers cleared');
  }
}
