import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { moderatorAuthMiddleware } from '../middleware/moderator-auth.middleware';

const router = Router();
const adminController = new AdminController();

// All routes require authentication
router.use(authMiddleware);

// Admin-only routes (user management)
router.get('/users', adminAuthMiddleware, adminController.getUsers);
router.get('/users/:id', adminAuthMiddleware, adminController.getUserById);
router.put('/users/:id', adminAuthMiddleware, adminController.updateUser);
router.delete('/users/:id', adminAuthMiddleware, adminController.deleteUser);

// Admin-only ban management routes
router.post('/users/:id/ban', adminAuthMiddleware, adminController.banUser);
router.post('/users/:id/unban', adminAuthMiddleware, adminController.unbanUser);

// Admin-only statistics routes
router.get('/stats', adminAuthMiddleware, adminController.getUserStats);

// Moderator-accessible routes (reports, security overview, etc.)
// These will be added when we implement report management and security overview endpoints
// For now, we'll keep the structure ready for future moderator endpoints

export default router; 