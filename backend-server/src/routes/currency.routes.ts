import { Router } from 'express';
import { CurrencyController } from '../controllers/currency.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { serverAuthMiddleware } from '../middleware/server-auth.middleware';

const router = Router();
const currencyController = new CurrencyController();

// All currency routes require authentication
// GET /api/currency/balance - get user's currency balance (user JWT)
router.get('/balance', authMiddleware, currencyController.getBalance);

// POST /api/currency/add - add currency to user's account (server API key only)
router.post('/add', serverAuthMiddleware, currencyController.addCurrency);

// POST /api/currency/subtract - subtract currency from user's account (server API key only)
router.post('/subtract', serverAuthMiddleware, currencyController.subtractCurrency);

// POST /api/currency/transfer - transfer currency between users (server API key only)
router.post('/transfer', serverAuthMiddleware, currencyController.transferCurrency);

export default router; 