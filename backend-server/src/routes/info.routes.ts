import { Router } from 'express';
import { InfoController } from '../controllers/info.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const infoController = new InfoController();

// All info routes require authentication
router.use(authMiddleware);

// Profile endpoint - returns both recent activity and profile stats
router.get('/profile', infoController.getProfile);

// Get profile information for any user by their ID
router.get('/profile/:userId', infoController.getProfileByUserId);

// Individual endpoints for specific data
router.get('/activity', infoController.getRecentActivity);
router.get('/stats', infoController.getProfileStats);
