import { AppDataSource } from '../utils/database';
import { GamePlayer } from '../entities/game-player.entity';
import { GameResult } from '../entities/game-result.entity';
import { Account } from '../entities/account.entity';

export interface RecentActivityItem {
  type: 'WIN' | 'LOSS';
  opponent: string;
  time: string;
  pointsChange: string;
  gameId: string;
  gameMode: string;
}

export class InfoService {
  private gamePlayerRepository = AppDataSource.getRepository(GamePlayer);
  private gameResultRepository = AppDataSource.getRepository(GameResult);
  private accountRepository = AppDataSource.getRepository(Account);

  /**
   * Get recent activity for a user
   * @param accountId - The user's account ID
   * @param limit - Number of recent activities to return (default: 10)
   * @returns Array of recent activity items
   */
  async getRecentActivity(accountId: string, limit: number = 10): Promise<RecentActivityItem[]> {
    try {
      // Get recent game player records for this user, ordered by creation date
      const userGamePlayers = await this.gamePlayerRepository.find({
        where: { accountId },
        relations: ['game', 'account'],
        order: { createdAt: 'DESC' },
        take: limit
      });

      const activities: RecentActivityItem[] = [];

      for (const playerRecord of userGamePlayers) {
        if (!playerRecord.game) continue;

        // Find the opponent(s) in the same game
        const allPlayersInGame = await this.gamePlayerRepository.find({
          where: { gameId: playerRecord.gameId },
          relations: ['account']
        });

        // Filter out the current user to get opponents
        const opponents = allPlayersInGame.filter(p => p.accountId !== accountId);
        
        // If no opponents found, skip this game
        if (opponents.length === 0) continue;

        // Get the opponent's username (take the first one if multiple)
        const opponent = opponents[0];
        const opponentUsername = opponent.account?.username || 'Unknown Player';

        // Determine if this was a win or loss
        const isWin = playerRecord.isWinner;
        const type: 'WIN' | 'LOSS' = isWin ? 'WIN' : 'LOSS';

        // Calculate time difference
        const timeDiff = this.formatTimeAgo(playerRecord.createdAt);

        // Calculate points change based on rating change
        const pointsChange = playerRecord.ratingChange 
          ? (playerRecord.ratingChange > 0 ? `+${playerRecord.ratingChange}` : `${playerRecord.ratingChange}`)
          : (isWin ? '+125' : '-75'); // Default values if no rating change recorded

        activities.push({
          type,
          opponent: opponentUsername,
          time: timeDiff,
          pointsChange: `${pointsChange} PTS`,
          gameId: playerRecord.gameId,
          gameMode: playerRecord.game.gameMode || 'standard'
        });
      }

      return activities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }

  /**
   * Format a date into a human-readable "time ago" string
   * @param date - The date to format
   * @returns Formatted time string like "2h ago", "1d ago", etc.
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    if (minutes < 60) {
      return minutes <= 1 ? 'just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return `${weeks}w ago`;
    }
  }

  /**
   * Get profile statistics for a user
   * @param accountId - The user's account ID
   * @returns Profile statistics
   */
  async getProfileStats(accountId: string) {
    try {
      const user = await this.accountRepository.findOne({
        where: { id: accountId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Calculate win rate
      const winRate = user.gamesPlayed > 0 
        ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1)
        : '0.0';

      return {
        wins: user.gamesWon,
        losses: user.gamesLost,
        totalGames: user.gamesPlayed,
        winRate: `${winRate}%`,
        rating: user.rating,
        level: Math.floor(user.gamesPlayed / 10) + 1 // Simple level calculation
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      throw new Error('Failed to fetch profile statistics');
    }
  }