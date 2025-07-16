import { Router } from 'express';
import { CurrencyController } from '../controllers/currency.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const currencyController = new CurrencyController();

// All currency routes require authentication
router.use(authMiddleware);

// GET /api/currency/balance - get user's currency balance
router.get('/balance', currencyController.getBalance);

// POST /api/currency/add - add currency to user's account (Admin only)
router.post('/add', currencyController.addCurrency);

// POST /api/currency/subtract - subtract currency from user's account (Admin only)
router.post('/subtract', currencyController.subtractCurrency);

// POST /api/currency/transfer - transfer currency between users
router.post('/transfer', currencyController.transferCurrency);

export default router; 