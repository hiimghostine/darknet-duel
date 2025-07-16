import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminAuthMiddleware);

// User management routes
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Ban management routes
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);

// Statistics routes
router.get('/stats', adminController.getUserStats);

export default router; 