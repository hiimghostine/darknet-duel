import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { moderatorAuthMiddleware } from '../middleware/moderator-auth.middleware';

const router = Router();
const adminController = new AdminController();

// All routes require authentication
router.use(authMiddleware);

// Admin and moderator routes (user viewing and management)
router.get('/users', moderatorAuthMiddleware, adminController.getUsers);
router.get('/users/:id', moderatorAuthMiddleware, adminController.getUserById);

// Admin-only routes (user modification and deletion)
router.put('/users/:id', adminAuthMiddleware, adminController.updateUser);
router.delete('/users/:id', adminAuthMiddleware, adminController.deleteUser);

// Admin and moderator ban management routes
router.post('/users/:id/ban', moderatorAuthMiddleware, adminController.banUser);
router.post('/users/:id/unban', moderatorAuthMiddleware, adminController.unbanUser);

// Admin and moderator statistics routes
router.get('/stats', moderatorAuthMiddleware, adminController.getUserStats);

// Moderator-accessible routes (reports, security overview, etc.)
// These will be added when we implement report management and security overview endpoints
// For now, we'll keep the structure ready for future moderator endpoints

export default router; 