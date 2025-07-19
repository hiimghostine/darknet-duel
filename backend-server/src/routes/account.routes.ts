import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { StoreController } from '../controllers/store.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { avatarUpload } from '../middleware/upload.middleware';

const router = Router();
const accountController = new AccountController();
const storeController = new StoreController();

// All account routes require authentication
router.use(authMiddleware);

// GET /api/account/me - get own user's details
router.get('/me', accountController.getMyAccount);

// POST /api/account/me - update own user's details (supports multipart/form-data)
router.post('/me', avatarUpload, accountController.updateMyAccount);

// GET /api/account/search - search user by username
router.get('/search', accountController.searchAccountByUsername);

// GET /api/account/{uuid} - get a user's details by UUID
router.get('/:uuid', accountController.getAccountByUuid);

// POST /api/account/apply/decoration/{decorationId} - apply decoration
router.post('/apply/decoration/:decorationId', storeController.applyDecoration);

// POST /api/account/remove/decoration - remove current decoration
router.post('/remove/decoration', storeController.removeDecoration);

export default router; 