import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const storeController = new StoreController();

// All store routes require authentication
router.use(authMiddleware);

// GET /api/store - get store data
router.get('/', storeController.getStore);

// GET /api/store/purchases - get user's purchases
router.get('/purchases', storeController.getUserPurchases);

export default router; 