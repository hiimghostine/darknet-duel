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
}
