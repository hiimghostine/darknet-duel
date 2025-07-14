import { Router } from 'express';
import { GamesController } from '../controllers/games.controller';
import { serverAuthMiddleware } from '../middleware/server-auth.middleware';

const router = Router();
const gamesController = new GamesController();

// All routes are protected with server authentication middleware
// This ensures only the game-server can access these endpoints

// Server validation endpoint (ping)
router.get('/validate', serverAuthMiddleware, gamesController.validateServer);

// Game results endpoint - record game outcomes
router.post('/games/results', serverAuthMiddleware, gamesController.saveGameResults);

// Game history endpoint - record detailed game history
router.post('/games/history', serverAuthMiddleware, gamesController.saveGameHistory);

// Player ratings endpoint - update ELO ratings
router.post('/players/ratings', serverAuthMiddleware, gamesController.updatePlayerRatings);

export default router;
