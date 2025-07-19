import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const storeController = new StoreController();

// All purchase routes require authentication
router.use(authMiddleware);

// POST /api/purchase/{itemId} - purchase an item
router.post('/:itemId', storeController.purchaseItem);

export default router; 