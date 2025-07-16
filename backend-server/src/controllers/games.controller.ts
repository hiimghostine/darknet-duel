import { Request, Response } from 'express';
import { GameService } from '../services/game.service';
import { RatingService } from '../services/rating.service';

export class GamesController {
  private gameService = new GameService();
  private ratingService = new RatingService();

  /**
   * @swagger
   * /api/server/games/results:
   *   post:
   *     tags: [Server]
   *     summary: Save game results (Server-to-server)
   *     description: Records game results sent from the game server for persistence and rating updates
   *     security:
   *       - serverApiKey: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [gameId, players, gameData]
   *             properties:
   *               gameId:
   *                 type: string
   *                 description: Unique game identifier
   *               players:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     playerId:
   *                       type: string
   *                     accountId:
   *                       type: string
   *                     role:
   *                       type: string
   *                       enum: [attacker, defender]
   *                     isWinner:
   *                       type: boolean
   *               gameData:
   *                 type: object
   *                 properties:
   *                   mode:
   *                     type: string
   *                   startTime:
   *                     type: string
   *                     format: date-time
   *                   endTime:
   *                     type: string
   *                     format: date-time
   *                   turnCount:
   *                     type: integer
   *           example:
   *             gameId: "game-123-456"
   *             players:
   *               - playerId: "0"
   *                 accountId: "550e8400-e29b-41d4-a716-446655440000"
   *                 role: "attacker"
   *                 isWinner: true
   *               - playerId: "1"
   *                 accountId: "550e8400-e29b-41d4-a716-446655440001"
   *                 role: "defender"
   *                 isWinner: false
   *             gameData:
   *               mode: "standard"
   *               startTime: "2023-12-01T10:00:00Z"
   *               endTime: "2023-12-01T10:30:00Z"
   *               turnCount: 25
   *     responses:
   *       200:
   *         description: Game results saved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *       400:
   *         description: Bad request - missing required data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - invalid server API key
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  saveGameResults = async (req: Request, res: Response): Promise<void> => {
    try {
      const gameResultData = req.body;
      
      // Validate required fields
      if (!gameResultData.gameId || !gameResultData.players || !gameResultData.gameData) {
        res.status(400).json({ success: false, message: 'Missing required game result data' });
        return;
      }

      // Save the game result
      const result = await this.gameService.saveGameResults(gameResultData);
      
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error saving game results:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save game results',
        error: error.message 
      });
    }
  };

  /**
   * Record detailed game history from the game server
   */
  saveGameHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const gameHistoryData = req.body;
      
      // Validate required fields
      if (!gameHistoryData.gameId || !gameHistoryData.players || !gameHistoryData.turns) {
        res.status(400).json({ success: false, message: 'Missing required game history data' });
        return;
      }

      // Save the game history
      const result = await this.gameService.saveGameHistory(gameHistoryData);
      
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error saving game history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save game history',
        error: error.message 
      });
    }
  };

  /**
   * Update player ratings based on game results
   */
  updatePlayerRatings = async (req: Request, res: Response): Promise<void> => {
    try {
      const ratingData = req.body;
      
      // Validate required fields
      if (!ratingData.gameId || !ratingData.players) {
        res.status(400).json({ success: false, message: 'Missing required player rating data' });
        return;
      }

      // Update player ratings using the ELO algorithm
      const results = await this.ratingService.updatePlayerRatings(ratingData);
      
      res.status(200).json({ success: true, data: results });
    } catch (error: any) {
      console.error('Error updating player ratings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update player ratings',
        error: error.message 
      });
    }
  };

  /**
   * @swagger
   * /api/server/validate:
   *   get:
   *     tags: [Server]
   *     summary: Validate server connection (Server-to-server)
   *     description: Validates that the game server can communicate with the backend server
   *     security:
   *       - serverApiKey: []
   *     responses:
   *       200:
   *         description: Server connection validated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "ok"
   *                 message:
   *                   type: string
   *                   example: "Server-to-server communication successful"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: Unauthorized - invalid server API key
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  validateServer = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ 
        status: 'ok',
        message: 'Server-to-server communication successful',
        timestamp: new Date()
      });
    } catch (error: any) {
      console.error('Error validating server:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  };

  /**
   * @swagger
   * /api/games/history:
   *   get:
   *     tags: [Games]
   *     summary: Get user's game history
   *     description: Retrieves the authenticated user's game history with pagination support
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Maximum number of games to return
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Number of games to skip for pagination
   *     responses:
   *       200:
   *         description: Game history retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     games:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           gameId:
   *                             type: string
   *                           gameMode:
   *                             type: string
   *                           startTime:
   *                             type: string
   *                             format: date-time
   *                           endTime:
   *                             type: string
   *                             format: date-time
   *                           turnCount:
   *                             type: integer
   *                           isWinner:
   *                             type: boolean
   *                           playerRole:
   *                             type: string
   *                           ratingChange:
   *                             type: integer
   *                             nullable: true
   *                           opponent:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: string
   *                               username:
   *                                 type: string
   *                               role:
   *                                 type: string
   *                     total:
   *                       type: integer
   *                       description: Total number of games for pagination
   *                     hasMore:
   *                       type: boolean
   *                       description: Whether there are more games to load
   *             example:
   *               success: true
   *               data:
   *                 games:
   *                   - gameId: "game-123-456"
   *                     gameMode: "standard"
   *                     startTime: "2023-12-01T10:00:00Z"
   *                     endTime: "2023-12-01T10:30:00Z"
   *                     turnCount: 25
   *                     isWinner: true
   *                     playerRole: "attacker"
   *                     ratingChange: 125
   *                     opponent:
   *                       id: "550e8400-e29b-41d4-a716-446655440001"
   *                       username: "DefenderX"
   *                       role: "defender"
   *                 total: 50
   *                 hasMore: true
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getGameHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user ID from the authenticated request
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Get pagination parameters
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

      // Get the player's games and total count
      const games = await this.gameService.getPlayerGames(userId, limit, offset);
      const totalGames = await this.gameService.getPlayerGameCount(userId);

      // Format the games for frontend consumption
      const formattedGames = await Promise.all(games.map(async (game) => {
        // Find the current user's player record
        const userPlayer = game.players.find(p => p.accountId === userId);
        
        // Find the opponent
        const opponent = game.players.find(p => p.accountId !== userId);

        // Get opponent's account details if available
        let opponentInfo = null;
        if (opponent) {
          try {
            // We'll need to get the opponent's username from their account
            // For now, we'll return basic info and enhance this later
            opponentInfo = {
              id: opponent.accountId,
              username: opponent.account?.username || 'Unknown Player',
              role: opponent.playerRole
            };
          } catch (error) {
            console.warn('Could not fetch opponent details:', error);
            opponentInfo = {
              id: opponent.accountId,
              username: 'Unknown Player',
              role: opponent.playerRole
            };
          }
        }

        return {
          gameId: game.gameId,
          gameMode: game.gameMode,
          startTime: game.startTime,
          endTime: game.endTime,
          turnCount: game.turnCount,
          isWinner: userPlayer?.isWinner || false,
          playerRole: userPlayer?.playerRole || 'unknown',
          ratingChange: userPlayer?.ratingChange || null,
          ratingBefore: userPlayer?.ratingBefore || null,
          ratingAfter: userPlayer?.ratingAfter || null,
          opponent: opponentInfo,
          abandonReason: game.abandonReason || null
        };
      }));

      res.status(200).json({
        success: true,
        data: {
          games: formattedGames,
          total: totalGames,
          hasMore: (offset + limit) < totalGames
        }
      });
    } catch (error: any) {
      console.error('Error getting game history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve game history',
        error: error.message
      });
    }
  };

  /**
   * @swagger
   * /api/games/{gameId}:
   *   get:
   *     tags: [Games]
   *     summary: Get detailed game information
   *     description: Retrieves detailed information about a specific game
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: gameId
   *         required: true
   *         schema:
   *           type: string
   *         description: The game ID to retrieve
   *     responses:
   *       200:
   *         description: Game details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     gameId:
   *                       type: string
   *                     gameMode:
   *                       type: string
   *                     startTime:
   *                       type: string
   *                       format: date-time
   *                     endTime:
   *                       type: string
   *                       format: date-time
   *                     turnCount:
   *                       type: integer
   *                     winnerId:
   *                       type: string
   *                       nullable: true
   *                     winnerRole:
   *                       type: string
   *                       nullable: true
   *                     abandonReason:
   *                       type: string
   *                       nullable: true
   *                     players:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           accountId:
   *                             type: string
   *                           username:
   *                             type: string
   *                           playerRole:
   *                             type: string
   *                           isWinner:
   *                             type: boolean
   *                           ratingBefore:
   *                             type: integer
   *                             nullable: true
   *                           ratingAfter:
   *                             type: integer
   *                             nullable: true
   *                           ratingChange:
   *                             type: integer
   *                             nullable: true
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Game not found or user not authorized to view
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getGameDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user ID from the authenticated request
      const userId = req.user?.id;
      const { gameId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!gameId) {
        res.status(400).json({
          success: false,
          message: 'Game ID is required'
        });
        return;
      }

      // Get the game details
      const game = await this.gameService.getGameById(gameId);

      if (!game) {
        res.status(404).json({
          success: false,
          message: 'Game not found'
        });
        return;
      }

      // Check if the user was a participant in this game
      const userParticipated = game.players.some(p => p.accountId === userId);
      
      if (!userParticipated) {
        res.status(403).json({
          success: false,
          message: 'Not authorized to view this game'
        });
        return;
      }

      // Format the response with player details
      const formattedPlayers = await Promise.all(game.players.map(async (player) => {
        return {
          accountId: player.accountId,
          username: player.account?.username || 'Unknown Player',
          playerRole: player.playerRole,
          isWinner: player.isWinner,
          ratingBefore: player.ratingBefore,
          ratingAfter: player.ratingAfter,
          ratingChange: player.ratingChange
        };
      }));

      res.status(200).json({
        success: true,
        data: {
          gameId: game.gameId,
          gameMode: game.gameMode,
          startTime: game.startTime,
          endTime: game.endTime,
          turnCount: game.turnCount,
          winnerId: game.winnerId,
          winnerRole: game.winnerRole,
          abandonReason: game.abandonReason,
          players: formattedPlayers
        }
      });
    } catch (error: any) {
      console.error('Error getting game details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve game details',
        error: error.message
      });
    }
  };
}
