import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { avatarUpload } from '../middleware/upload.middleware';

const router = Router();
const accountController = new AccountController();

// All account routes require authentication
router.use(authMiddleware);

// GET /api/account/me - get own user's details
router.get('/me', accountController.getMyAccount);

// POST /api/account/me - update own user's details (supports multipart/form-data)
router.post('/me', avatarUpload, accountController.updateMyAccount);

// GET /api/account/{uuid} - get a user's details by UUID
router.get('/:uuid', accountController.getAccountByUuid);

export default router; 