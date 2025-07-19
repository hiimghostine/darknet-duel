import { Router } from 'express';
import { LogController } from '../controllers/log.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';

const router = Router();
const logController = new LogController();

// All log routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminAuthMiddleware);

// Get logs with pagination
router.get('/', logController.getLogs.bind(logController));

// Get specific log by ID
router.get('/:id', logController.getLogById.bind(logController));

export default router; 