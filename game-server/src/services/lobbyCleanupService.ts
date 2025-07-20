import { Server, Origins } from 'boardgame.io/server';
import { LobbyAPI } from 'boardgame.io';
import { GameState } from 'shared-types/game.types';

/**
 * LobbyCleanupService
 * 
 * A service that periodically checks for abandoned game lobbies and removes them.
 * - Games marked as 'abandoned' will be removed after a configurable time period
 * - Games with no players connected for a long time will also be removed
 */
export class LobbyCleanupService {
  private server: ReturnType<typeof Server>;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes by default
  private ABANDONED_GAME_TTL_MS = 30 * 60 * 1000; // Remove abandoned games after 30 minutes by default
  private INACTIVE_GAME_TTL_MS = 5 * 60 * 1000; // Remove inactive games after 5 minutes by default

  constructor(server: ReturnType<typeof Server>) {
    this.server = server;
    console.log('Lobby cleanup service initialized');
  }

  /**
   * Starts the cleanup service
   */
  public start(): void {
    if (this.cleanupInterval) {
      console.log('Cleanup service already running');
      return;
    }
    
    console.log(`Starting lobby cleanup service (interval: ${this.CLEANUP_INTERVAL_MS / 1000} seconds)`);
    this.cleanupInterval = setInterval(() => this.cleanupAbandonedGames(), this.CLEANUP_INTERVAL_MS);
    
    // Run an initial cleanup
    this.cleanupAbandonedGames();
  }
  
  /**
   * Sets the cleanup interval in milliseconds
   * @param intervalMs Interval in milliseconds
   */
  public setCleanupInterval(intervalMs: number): void {
    // Don't allow intervals less than 1 second to prevent excessive load
    if (intervalMs < 1000) intervalMs = 1000;
    
    this.CLEANUP_INTERVAL_MS = intervalMs;
    console.log(`Setting cleanup interval to ${intervalMs}ms`);
    
    // Restart the interval if running
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = setInterval(() => this.cleanupAbandonedGames(), this.CLEANUP_INTERVAL_MS);
    }
  }
  
  /**
   * Sets the time-to-live for abandoned games in milliseconds
   * @param ttlMs TTL in milliseconds (0 means immediate removal)
   */
  public setAbandonedGameTTL(ttlMs: number): void {
    this.ABANDONED_GAME_TTL_MS = ttlMs;
    console.log(`Setting abandoned game TTL to ${ttlMs}ms`);
  }

  /**
   * Sets the time-to-live for inactive games in milliseconds
   * @param ttlMs TTL in milliseconds (0 means immediate removal)
   */
  public setInactiveGameTTL(ttlMs: number): void {
    this.INACTIVE_GAME_TTL_MS = ttlMs;
    console.log(`Setting inactive game TTL to ${ttlMs}ms`);
  }

  /**
   * Stop the cleanup service
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Lobby cleanup service stopped');
    }
  }

  /**
   * Immediately remove a specific abandoned game
   * @param matchID The ID of the match to remove
   */
  public async removeAbandonedGame(matchID: string): Promise<boolean> {
    try {
      console.log(`Attempting to immediately remove abandoned game ${matchID}`);
      
      if (!this.server.db) {
        console.log('No database available to remove game');
        return false;
      }
      
      // Check if the match exists first
      const matchDetails = await this.server.db.fetch(matchID, { state: true });
      if (!matchDetails) {
        console.log(`Match ${matchID} not found`);
        return false;
      }
      
      // Verify this is actually an abandoned game before removing it
      const gameState = matchDetails.state?.G as GameState;
      const isAbandoned = gameState?.winner === 'abandoned';
      
      if (isAbandoned) {
        console.log(`Removing abandoned match ${matchID} immediately`);
        await this.server.db.wipe(matchID);
        return true;
      } else {
        console.log(`Match ${matchID} is not marked as abandoned, won't remove`);
        return false;
      }
    } catch (error) {
      console.error(`Error removing abandoned game ${matchID}:`, error);
      return false;
    }
  }

  /**
   * Immediately remove a specific completed game (winner or abandoned)
   * @param matchID The ID of the match to remove
   */
  public async removeCompletedGame(matchID: string): Promise<boolean> {
    try {
      if (!this.server.db) return false;
      const matchDetails = await this.server.db.fetch(matchID, { state: true });
      if (!matchDetails) return false;
      const gameState = matchDetails.state?.G as GameState;
      // Remove if the game is over (has a winner or is abandoned)
      const isCompleted = gameState?.gamePhase === 'gameOver' && (gameState?.winner !== undefined);
      if (isCompleted) {
        await this.server.db.wipe(matchID);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error removing completed game ${matchID}:`, error);
      return false;
    }
  }

  /**
   * The main cleanup routine that removes abandoned or inactive games
   */
  private async cleanupAbandonedGames(): Promise<void> {
    try {
      console.log('Running lobby cleanup task...');
      
      // Get all active matches from the server database
      if (!this.server.db) {
        console.log('No database available for lobby cleanup');
        return;
      }
      
      // List all matches from the database
      const matches = await this.server.db.listMatches();
      
      if (!matches || matches.length === 0) {
        console.log('No matches found');
        return;
      }
      console.log(`Found ${matches.length} matches`);
      
      let removedCount = 0;
      const now = Date.now();
      
      // Examine each match to see if it should be removed
      for (const matchID of matches) {
        try {
          // Get match details to check its state
          const matchDetails = await this.server.db.fetch(matchID, { state: true, metadata: true });
          
          if (!matchDetails) continue;
          
          const gameState = matchDetails.state?.G as GameState;
          const metadata = matchDetails.metadata;
          
          // Check if the game is marked as abandoned in its state
          const isAbandoned = gameState?.winner === 'abandoned';
          
          // Calculate how long the game has been inactive
          const lastUpdated = metadata?.updatedAt ? new Date(metadata.updatedAt).getTime() : 0;
          const timeSinceUpdate = now - lastUpdated;
          
          // Check player presence
          let hasAnyConnectedPlayers = false;
          
          // The players in metadata is an object with numeric keys
          if (metadata?.players) {
            // Convert players object to array to check connections
            const playerEntries = Object.entries(metadata.players);
            hasAnyConnectedPlayers = playerEntries.some(([_, player]) => {
              return player && typeof player === 'object' && (player as any).isConnected;
            });
          }
          
          // Determine if the game should be removed
          let shouldRemove = false;
          let removalReason = '';
          
          // Remove abandoned games after a grace period
          // This allows players to see that the game was abandoned
          if (isAbandoned) {
            // Use a 30 second grace period by default for abandoned games
            // This keeps them visible briefly in the lobby list so players can see what happened
            const abandonedGracePeriod = this.ABANDONED_GAME_TTL_MS || 30000;
            
            if (timeSinceUpdate >= abandonedGracePeriod) {
              shouldRemove = true;
              removalReason = `abandoned game (removed after ${Math.round(abandonedGracePeriod/1000)}s grace period)`;  
            }
          }
          // Remove inactive games with no connected players
          else if (!hasAnyConnectedPlayers && timeSinceUpdate >= this.INACTIVE_GAME_TTL_MS) {
            shouldRemove = true;
            removalReason = `inactive with no connected players (${Math.round(timeSinceUpdate / 60000)} minutes old)`;
          }
          
          if (shouldRemove) {
            console.log(`Removing match ${matchID}: ${removalReason}`);
            // Use the internal API to remove the match from the database
            await this.server.db.wipe(matchID);
            removedCount++;
          }
        } catch (matchError) {
          console.error(`Error processing match ${matchID}:`, matchError);
        }
      }
      
      console.log(`Lobby cleanup completed: removed ${removedCount} matches`);
    } catch (error) {
      console.error('Error in lobby cleanup service:', error);
    }
  }
}
