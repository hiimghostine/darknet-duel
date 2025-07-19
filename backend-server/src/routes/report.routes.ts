import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';

const router = Router();
const reportController = new ReportController();

// User routes (require authentication)
router.use(authMiddleware);

// Create a new report
router.post('/', reportController.createReport);

// Admin routes (require admin privileges)
router.use('/admin', adminAuthMiddleware);

// Get reports for admin review
router.get('/admin', reportController.getReports);

// Get report statistics
router.get('/admin/stats', reportController.getReportStats);

// Get detailed report information
router.get('/admin/:id', reportController.getReportById);

// Update report status
router.put('/admin/:id/status', reportController.updateReportStatus);

// Delete a report
router.delete('/admin/:id', reportController.deleteReport);

export default router; 