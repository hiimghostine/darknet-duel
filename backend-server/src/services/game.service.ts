import { v4 as uuidv4 } from 'uuid';
import { GameResult } from '../entities/game-result.entity';
import { GamePlayer } from '../entities/game-player.entity';
import { Account } from '../entities/account.entity';
import { AppDataSource } from '../utils/database';

interface GameHistoryData {
  gameId: string;
  turns: any[];
  players: any[];
  gameMode: string;
  startTime: Date;
  endTime: Date;
}

// Interface to match what game-server sends
interface GameResultData {
  gameId: string;
  winner: {
    id: string;    // accountId
    role: string;  // playerRole
  } | null; // ✅ Allow null for abandoned games
  players: {
    id: string;    // accountId
    name: string;  // player name
    role: string;  // playerRole
    isWinner?: boolean;
    ratingBefore?: number;
    ratingAfter?: number;
    ratingChange?: number;
  }[];
  gameData: {
    turnCount: number;
    startTime: Date;
    endTime: Date;
    actions: any[];
    gameMode: string;
    abandonReason?: string;
  };
}

export class GameService {
  /**
   * Save game results to the database
   */
  async saveGameResults(data: GameResultData): Promise<GameResult> {
    // Use a transaction to ensure all or nothing commit
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // ✅ FIX: Add debugging to see what winner data we're receiving
      console.log('🔍 WINNER DATA DEBUG:');
      console.log('   - data.winner:', JSON.stringify(data.winner, null, 2));
      console.log('   - data.winner?.id:', data.winner?.id);
      console.log('   - data.winner?.role:', data.winner?.role);
      console.log('   - abandonReason:', data.gameData.abandonReason);
      
      // Create the game result record
      const gameResult = new GameResult();
      gameResult.id = uuidv4();
      gameResult.gameId = data.gameId;
      
      // ✅ FIX: Handle case where winner data might be null/undefined
      if (data.winner && data.winner.id && data.winner.role) {
        gameResult.winnerId = data.winner.id;
        gameResult.winnerRole = data.winner.role;
        console.log(`✅ Winner data set: ${data.winner.role} (${data.winner.id})`);
      } else {
        (gameResult as any).winnerId = null;
        (gameResult as any).winnerRole = null;
        console.log(`❌ No valid winner data - setting winnerId and winnerRole to null`);
      }
      
      gameResult.turnCount = data.gameData.turnCount;
      gameResult.startTime = new Date(data.gameData.startTime);
      gameResult.endTime = new Date(data.gameData.endTime);
      gameResult.gameMode = data.gameData.gameMode;
      (gameResult as any).abandonReason = data.gameData.abandonReason || null;
      
      // Save the game result first to establish the record
      await queryRunner.manager.save(gameResult);
      
      // Create and save player records
      for (const playerData of data.players) {
        const gamePlayer = new GamePlayer();
        gamePlayer.id = uuidv4();
        gamePlayer.gameId = data.gameId;
        gamePlayer.accountId = playerData.id;       // Use id as accountId
        gamePlayer.playerRole = playerData.role;    // Use role directly
        // Determine if player is winner by comparing with winner role
        gamePlayer.isWinner = !!(playerData.isWinner ||
          (data.winner && playerData.role === data.winner.role && !data.gameData.abandonReason));
        gamePlayer.ratingBefore = playerData.ratingBefore || null;
        gamePlayer.ratingAfter = playerData.ratingAfter || null;
        gamePlayer.ratingChange = playerData.ratingChange || null;
        
        await queryRunner.manager.save(gamePlayer);
      }
      
      // ✅ FIX: Update account statistics (gamesPlayed, gamesWon, gamesLost)
      console.log('📊 Updating account statistics for players...');
      
      for (const playerData of data.players) {
        const isWinner = playerData.isWinner ||
          (data.winner && playerData.role === data.winner.role && !data.gameData.abandonReason);
        
        console.log(`📊 Updating stats for player ${playerData.id}: isWinner=${isWinner}, role=${playerData.role}`);
        
        // Increment gamesPlayed for all players
        await queryRunner.manager.increment(Account, { id: playerData.id }, 'gamesPlayed', 1);
        
        // Increment gamesWon or gamesLost based on result
        if (isWinner) {
          await queryRunner.manager.increment(Account, { id: playerData.id }, 'gamesWon', 1);
          console.log(`📊 ✅ Incremented gamesWon for ${playerData.id}`);
        } else {
          await queryRunner.manager.increment(Account, { id: playerData.id }, 'gamesLost', 1);
          console.log(`📊 ❌ Incremented gamesLost for ${playerData.id}`);
        }
        
        console.log(`📊 ✅ Incremented gamesPlayed for ${playerData.id}`);
      }
      
      await queryRunner.commitTransaction();
      
      // Return the saved game result with players included
      const savedGame = await this.getGameById(data.gameId);
      if (!savedGame) {
        throw new Error('Failed to retrieve saved game result');
      }
      return savedGame;
    } catch (error) {
      // If anything fails, rollback the transaction
      await queryRunner.rollbackTransaction();
      console.error('Error saving game results:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
   * Save detailed game history to the database
   * Note: We're not implementing actual game history storage yet as requested
   */
  async saveGameHistory(gameHistoryData: GameHistoryData): Promise<any> {
    try {
      // For now, just log that we received the history data
      console.log(`Game history received for game ${gameHistoryData.gameId}`);
      console.log(`Contains ${gameHistoryData.turns.length} turns`);
      
      // We'll return an acknowledgement without saving
      // This is per user request to defer implementing game history storage
      return { 
        saved: false,
        message: 'Game history storage deferred until replay format is finalized',
        gameId: gameHistoryData.gameId
      };
    } catch (error) {
      console.error('Error in saveGameHistory:', error);
      throw error;
    }
  }

  /**
   * Get game by ID with player details
   */
  async getGameById(gameId: string): Promise<GameResult | null> {
    try {
      // Find the game result with related player data
      const gameRepository = AppDataSource.getRepository(GameResult);
      const game = await gameRepository
        .createQueryBuilder('game')
        .where('game.gameId = :gameId', { gameId })
        .leftJoinAndSelect('game.players', 'players')
        .leftJoinAndSelect('players.account', 'account')
        .getOne();
      
      return game;
    } catch (error) {
      console.error('Error in getGameById:', error);
      throw error;
    }
  }

  /**
   * Get a player's game history
   */
  async getPlayerGames(accountId: string, limit = 10, offset = 0): Promise<GameResult[]> {
    try {
      // Find games where this player participated
      const gamePlayerRepo = AppDataSource.getRepository(GamePlayer);
      const playerGames = await gamePlayerRepo
        .createQueryBuilder('gp')
        .select('gp.gameId')
        .where('gp.accountId = :accountId', { accountId })
        .limit(limit)
        .offset(offset)
        .getRawMany();
      
      if (playerGames.length === 0) return [];
      
      // Get the full game details for these games
      const gameIds = playerGames.map(pg => pg.gp_gameId);
      
      const gameRepo = AppDataSource.getRepository(GameResult);
      const games = await gameRepo
        .createQueryBuilder('game')
        .where('game.gameId IN (:...gameIds)', { gameIds })
        .leftJoinAndSelect('game.players', 'players')
        .leftJoinAndSelect('players.account', 'account')
        .orderBy('game.endTime', 'DESC')
        .getMany();
      
      return games;
    } catch (error) {
      console.error('Error in getPlayerGames:', error);
      throw error;
    }
  }

  /**
   * Get the total count of games for a player (for pagination)
   */
  async getPlayerGameCount(accountId: string): Promise<number> {
    try {
      const gamePlayerRepo = AppDataSource.getRepository(GamePlayer);
      const count = await gamePlayerRepo
        .createQueryBuilder('gp')
        .where('gp.accountId = :accountId', { accountId })
        .getCount();
      
      return count;
    } catch (error) {
      console.error('Error in getPlayerGameCount:', error);
      throw error;
    }
  }
}
