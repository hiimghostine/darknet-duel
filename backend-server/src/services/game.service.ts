import { v4 as uuidv4 } from 'uuid';
import { GameResult } from '../entities/game-result.entity';
import { GamePlayer } from '../entities/game-player.entity';
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
  };
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
      // Create the game result record
      const gameResult = new GameResult();
      gameResult.id = uuidv4();
      gameResult.gameId = data.gameId;
      gameResult.winnerId = data.winner?.id; // Use id as accountId
      gameResult.winnerRole = data.winner?.role;   // Use role directly
      gameResult.turnCount = data.gameData.turnCount;
      gameResult.startTime = new Date(data.gameData.startTime);
      gameResult.endTime = new Date(data.gameData.endTime);
      gameResult.gameMode = data.gameData.gameMode;
      // isAbandoned field doesn't exist in schema
      gameResult.abandonReason = data.gameData.abandonReason;
      
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
        gamePlayer.isWinner = playerData.isWinner || 
          (data.winner && playerData.role === data.winner.role && !data.gameData.abandonReason);
        gamePlayer.ratingBefore = playerData.ratingBefore || null;
        gamePlayer.ratingAfter = playerData.ratingAfter || null;
        gamePlayer.ratingChange = playerData.ratingChange || null;
        
        await queryRunner.manager.save(gamePlayer);
      }
      
      await queryRunner.commitTransaction();
      
      // Return the saved game result with players included
      return this.getGameById(data.gameId);
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
        .orderBy('game.endTime', 'DESC')
        .getMany();
      
      return games;
    } catch (error) {
      console.error('Error in getPlayerGames:', error);
      throw error;
    }
  }
}
