import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../utils/database';
import { PlayerRating } from '../entities/player-rating.entity';
import { RatingHistory } from '../entities/rating-history.entity';
import { Account } from '../entities/account.entity';

// Interface to match data sent from game-server
interface RatingData {
  gameId: string;
  gameMode: string;
  players: {
    id: string;       // This is the accountId from the game server
    role: string;     // Player role in the game
    isWinner: boolean;
  }[];
}

export class RatingService {
  // Constants for ELO calculation
  private K_FACTOR = 32; // How much a single game can affect rating
  private DEFAULT_RATING = 1200; // Starting rating for new players
  
  /**
   * Update player ratings based on game results
   * Implements the ELO rating algorithm:
   * R_new = R_old + K * (S - E)
   * where:
   * - K is a factor that determines maximum rating change
   * - S is the actual score (1 for win, 0 for loss, 0.5 for draw)
   * - E is the expected score based on rating difference
   */
  async updatePlayerRatings(ratingData: RatingData): Promise<any[]> {
    // Use transaction to ensure data consistency
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      console.log('Updating player ratings for game:', ratingData.gameId);
      const { gameId, gameMode, players } = ratingData;
      const results = [];
      
      // Get current ratings for all players
      const playerRatingsMap = new Map<string, PlayerRating>();
      
      // Fetch current ratings from database
      for (const player of players) {
        const accountId = player.id; // Using id as accountId from game-server
        let playerRating = await queryRunner.manager
          .findOne(PlayerRating, {
            where: { accountId, gameMode }
          });
        
        // If no rating exists for this player/mode, create one
        if (!playerRating) {
          playerRating = new PlayerRating();
          playerRating.id = uuidv4();
          playerRating.accountId = accountId;
          playerRating.rating = this.DEFAULT_RATING;
          playerRating.gameMode = gameMode;
          playerRating.gamesPlayed = 0;
          playerRating.wins = 0;
          playerRating.losses = 0;
          
          await queryRunner.manager.save(playerRating);
        }
        
        playerRatingsMap.set(accountId, playerRating);
      }
      
      // Calculate new ratings and prepare updates
      for (const player of players) {
        const accountId = player.id;  // Use player.id as accountId
        const isWinner = player.isWinner;
        const playerRating = playerRatingsMap.get(accountId)!;
        const currentRating = playerRating.rating;
        
        // Find opponents (everyone else in the game)
        const opponents = players.filter(p => p.id !== accountId);
        
        let ratingChange = 0;
        
        // For each opponent, calculate rating change
        for (const opponent of opponents) {
          const opponentId = opponent.id;
          const opponentRating = playerRatingsMap.get(opponentId)!;
          const opponentRatingValue = opponentRating.rating;
          
          // Calculate rating change based on ELO formula
          const matchupChange = this.calculateEloChange(
            currentRating,
            opponentRatingValue,
            isWinner ? 1 : 0  // 1 for win, 0 for loss
          );
          
          // Adjust rating based on game mode
          const modeMultiplier = this.getModeMultiplier(gameMode);
          ratingChange += matchupChange * modeMultiplier;
        }
        
        // Round the rating change
        const roundedRatingChange = Math.round(ratingChange);
        const newRating = Math.max(1, currentRating + roundedRatingChange); // Prevent ratings below 1
        
        // Update player rating entity
        playerRating.rating = newRating;
        playerRating.gamesPlayed += 1;
        if (isWinner) {
          playerRating.wins += 1;
        } else {
          playerRating.losses += 1;
        }
        
        // Save updated rating
        await queryRunner.manager.save(playerRating);
        
        // Create rating history record
        const ratingHistory = new RatingHistory();
        ratingHistory.id = uuidv4();
        ratingHistory.accountId = accountId; // player.id is used as accountId
        ratingHistory.gameId = gameId;
        ratingHistory.gameMode = gameMode;
        ratingHistory.ratingBefore = currentRating;
        ratingHistory.ratingAfter = newRating;
        ratingHistory.ratingChange = roundedRatingChange;
        ratingHistory.timestamp = new Date();
        
        await queryRunner.manager.save(ratingHistory);
        
        // Update account level rating too
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: accountId }
        });
        
        if (account) {
          account.rating = newRating;
          if (isWinner) {
            account.gamesWon += 1;
          } else {
            account.gamesLost += 1;
          }
          await queryRunner.manager.save(account);
        }
        
        // Add to results
        results.push({
          accountId, // player.id is used as accountId
          oldRating: currentRating,
          newRating: newRating,
          change: roundedRatingChange,
          playerRole: player.role // Include player role in the response
        });
      }
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      return results;
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error in updatePlayerRatings:', error);
      throw error;
    } finally {
      // Release resources
      await queryRunner.release();
    }
  }
  
  /**
   * Calculate the expected score for a player
   */
  private calculateExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }
  
  /**
   * Calculate ELO rating change for a single match-up
   */
  private calculateEloChange(playerRating: number, opponentRating: number, actualScore: number): number {
    const expectedScore = this.calculateExpectedScore(playerRating, opponentRating);
    return this.K_FACTOR * (actualScore - expectedScore);
  }
  
  /**
   * Get rating multiplier based on game mode
   * Different game modes can have different impacts on rating
   */
  private getModeMultiplier(gameMode: string): number {
    switch (gameMode) {
      case 'competitive': return 1.0;  // Full impact
      case 'standard': return 0.8;     // Slightly reduced impact
      case 'casual': return 0.5;       // Half impact
      case 'tutorial': return 0.0;     // No impact
      default: return 0.8;             // Default is standard mode
    }
  }
  
  /**
   * Get current rating for a player
   */
  async getPlayerRating(accountId: string, gameMode = 'standard'): Promise<number> {
    try {
      const ratingRepo = AppDataSource.getRepository(PlayerRating);
      const playerRating = await ratingRepo.findOne({
        where: { accountId, gameMode }
      });
      
      return playerRating?.rating || this.DEFAULT_RATING;
    } catch (error) {
      console.error('Error in getPlayerRating:', error);
      throw error;
    }
  }
  
  /**
   * Get rating history for a player
   */
  async getPlayerRatingHistory(accountId: string, gameMode = 'standard', limit = 20): Promise<RatingHistory[]> {
    try {
      const historyRepo = AppDataSource.getRepository(RatingHistory);
      const history = await historyRepo.find({
        where: { accountId, gameMode },
        order: { timestamp: 'DESC' },
        take: limit
      });
      
      return history;
    } catch (error) {
      console.error('Error in getPlayerRatingHistory:', error);
      throw error;
    }
  }
}
