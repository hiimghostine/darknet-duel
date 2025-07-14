import { Request, Response } from 'express';
import { GameService } from '../services/game.service';
import { RatingService } from '../services/rating.service';

export class GamesController {
  private gameService = new GameService();
  private ratingService = new RatingService();

  /**
   * Record game results from the game server
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
   * Validate server connection (ping endpoint)
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
