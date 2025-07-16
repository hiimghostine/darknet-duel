import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  private paymentService = new PaymentService();

  /**
   * @swagger
   * /api/payment/create:
   *   post:
   *     summary: Create a payment invoice for purchasing crypts
   *     tags: [Payment]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - packageId
   *             properties:
   *               packageId:
   *                 type: string
   *                 enum: [starter, small, medium, large, xl, xxl, mega, ultra, supreme]
   *                 description: Package ID to purchase
   *     responses:
   *       200:
   *         description: Payment invoice created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     invoiceId:
   *                       type: string
   *                       description: Xendit invoice ID
   *                     invoiceUrl:
   *                       type: string
   *                       description: Payment URL for user
   *                     status:
   *                       type: string
   *                       description: Initial payment status
   *       400:
   *         description: Invalid package ID
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Payment service error
   */
  createPayment = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { packageId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!packageId) {
        return res.status(400).json({
          success: false,
          message: 'Package ID is required'
        });
      }

      const validPackages = ['starter', 'small', 'medium', 'large', 'xl', 'xxl', 'mega', 'ultra', 'supreme'];
      if (!validPackages.includes(packageId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package ID'
        });
      }

      console.log(`Creating payment for user ${userId}, package: ${packageId}`);

      const paymentResponse = await this.paymentService.createPayment(userId, packageId);

      return res.status(200).json({
        success: true,
        data: paymentResponse,
        message: 'Payment invoice created successfully'
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * @swagger
   * /api/payment/status/{invoiceId}:
   *   get:
   *     summary: Check payment status
   *     tags: [Payment]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: invoiceId
   *         required: true
   *         schema:
   *           type: string
   *         description: Xendit invoice ID
   *     responses:
   *       200:
   *         description: Payment status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       enum: [PENDING, PAID, EXPIRED, CANCELLED]
   *                       description: Current payment status
   *                     invoiceId:
   *                       type: string
   *                       description: Invoice ID
   *       400:
   *         description: Missing invoice ID
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Payment service error
   */
  checkPaymentStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { invoiceId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!invoiceId) {
        return res.status(400).json({
          success: false,
          message: 'Invoice ID is required'
        });
      }

      console.log(`Checking payment status for user ${userId}, invoice: ${invoiceId}`);

      const statusResponse = await this.paymentService.checkPaymentStatus(invoiceId);

      return res.status(200).json({
        success: true,
        data: statusResponse,
        message: 'Payment status retrieved successfully'
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * @swagger
   * /api/payment/process:
   *   post:
   *     summary: Process successful payment and add crypts to user account
   *     tags: [Payment]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - invoiceId
   *               - packageId
   *             properties:
   *               invoiceId:
   *                 type: string
   *                 description: Xendit invoice ID
   *               packageId:
   *                 type: string
   *                 enum: [starter, small, medium, large, xl, xxl, mega, ultra, supreme]
   *                 description: Package ID that was purchased
   *     responses:
   *       200:
   *         description: Payment processed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     crypts:
   *                       type: integer
   *                       description: Number of crypts added
   *                     newBalance:
   *                       type: integer
   *                       description: User's new crypt balance
   *       400:
   *         description: Invalid request or payment not completed
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Payment processing error
   */
  processPayment = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { invoiceId, packageId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!invoiceId || !packageId) {
        return res.status(400).json({
          success: false,
          message: 'Invoice ID and package ID are required'
        });
      }

      console.log(`Processing payment for user ${userId}, invoice: ${invoiceId}, package: ${packageId}`);

      // First check if payment is completed
      const statusResponse = await this.paymentService.checkPaymentStatus(invoiceId);
      
      if (statusResponse.status !== 'PAID') {
        return res.status(400).json({
          success: false,
          message: `Payment not completed. Status: ${statusResponse.status}`
        });
      }

      // Process the successful payment
      const result = await this.paymentService.processSuccessfulPayment(userId, packageId, invoiceId);

      return res.status(200).json({
        success: true,
        data: result,
        message: `Successfully added ${result.crypts} crypts to your account!`
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
} 