import { Request, Response } from 'express';
import { CurrencyService } from '../services/currency.service';

export class CurrencyController {
  private currencyService = new CurrencyService();

  /**
   * @swagger
   * /api/currency/balance:
   *   get:
   *     summary: Get user's currency balance
   *     tags: [Currency]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Currency balance retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CurrencyBalance'
   *       401:
   *         description: Authentication required
   *       404:
   *         description: User not found
   */
  getBalance = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const balance = await this.currencyService.getBalance(userId);

      if (!balance) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Error getting currency balance:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  /**
   * @swagger
   * /api/currency/add:
   *   post:
   *     summary: Add currency to user's account (Admin only)
   *     tags: [Currency]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - type
   *               - amount
   *             properties:
   *               userId:
   *                 type: string
   *                 description: User ID to add currency to
   *               type:
   *                 type: string
   *                 enum: [creds, crypts]
   *                 description: Currency type
   *               amount:
   *                 type: integer
   *                 minimum: 1
   *                 description: Amount to add
   *               reason:
   *                 type: string
   *                 description: Reason for adding currency
   *     responses:
   *       200:
   *         description: Currency added successfully
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Authentication required
   *       404:
   *         description: User not found
   */
  addCurrency = async (req: Request, res: Response) => {
    try {
      const { userId, type, amount, reason } = req.body;

      if (!userId || !type || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, type, amount'
        });
      }

      if (!['creds', 'crypts'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid currency type. Must be "creds" or "crypts"'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be positive'
        });
      }

      const balance = await this.currencyService.addCurrency(userId, type, amount, reason);

      if (!balance) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: balance,
        message: `Added ${amount} ${type} successfully`
      });
    } catch (error) {
      console.error('Error adding currency:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * @swagger
   * /api/currency/subtract:
   *   post:
   *     summary: Subtract currency from user's account (Admin only)
   *     tags: [Currency]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - type
   *               - amount
   *             properties:
   *               userId:
   *                 type: string
   *                 description: User ID to subtract currency from
   *               type:
   *                 type: string
   *                 enum: [creds, crypts]
   *                 description: Currency type
   *               amount:
   *                 type: integer
   *                 minimum: 1
   *                 description: Amount to subtract
   *               reason:
   *                 type: string
   *                 description: Reason for subtracting currency
   *     responses:
   *       200:
   *         description: Currency subtracted successfully
   *       400:
   *         description: Invalid request data or insufficient funds
   *       401:
   *         description: Authentication required
   *       404:
   *         description: User not found
   */
  subtractCurrency = async (req: Request, res: Response) => {
    try {
      const { userId, type, amount, reason } = req.body;

      if (!userId || !type || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, type, amount'
        });
      }

      if (!['creds', 'crypts'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid currency type. Must be "creds" or "crypts"'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be positive'
        });
      }

      const balance = await this.currencyService.subtractCurrency(userId, type, amount, reason);

      if (!balance) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: balance,
        message: `Subtracted ${amount} ${type} successfully`
      });
    } catch (error) {
      console.error('Error subtracting currency:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * @swagger
   * /api/currency/transfer:
   *   post:
   *     summary: Transfer currency between users
   *     tags: [Currency]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - toUserId
   *               - type
   *               - amount
   *             properties:
   *               toUserId:
   *                 type: string
   *                 description: User ID to transfer currency to
   *               type:
   *                 type: string
   *                 enum: [creds, crypts]
   *                 description: Currency type
   *               amount:
   *                 type: integer
   *                 minimum: 1
   *                 description: Amount to transfer
   *     responses:
   *       200:
   *         description: Currency transferred successfully
   *       400:
   *         description: Invalid request data or insufficient funds
   *       401:
   *         description: Authentication required
   *       404:
   *         description: User not found
   */
  transferCurrency = async (req: Request, res: Response) => {
    try {
      const fromUserId = req.user?.id;
      const { toUserId, type, amount } = req.body;

      if (!fromUserId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!toUserId || !type || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: toUserId, type, amount'
        });
      }

      if (!['creds', 'crypts'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid currency type. Must be "creds" or "crypts"'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be positive'
        });
      }

      if (fromUserId === toUserId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer currency to yourself'
        });
      }

      const result = await this.currencyService.transferCurrency(fromUserId, toUserId, type, amount);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'One or both users not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          yourBalance: result.from,
          recipientBalance: result.to
        },
        message: `Transferred ${amount} ${type} successfully`
      });
    } catch (error) {
      console.error('Error transferring currency:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
} 