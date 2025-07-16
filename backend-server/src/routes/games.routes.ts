import { Router } from 'express';
import { GamesController } from '../controllers/games.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const gamesController = new GamesController();

// All routes require authentication
router.use(authMiddleware);

// Game history endpoints
router.get('/history', gamesController.getGameHistory);
router.get('/:gameId', gamesController.getGameDetails);

export default router; 