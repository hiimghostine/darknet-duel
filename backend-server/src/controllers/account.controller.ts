import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import { validatePassword } from '../utils/validation';

export class AccountController {
  private accountService = new AccountService();

  /**
   * @swagger
   * /api/account/me:
   *   get:
   *     tags: [Account Management]
   *     summary: Get current user's account details
   *     description: Retrieves the authenticated user's complete account information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Account details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *             example:
   *               success: true
   *               data:
   *                 id: "550e8400-e29b-41d4-a716-446655440000"
   *                 email: "hacker@darknet.com"
   *                 username: "CyberNinja"
   *                 isActive: true
   *                 lastLogin: "2023-12-01T10:30:00Z"
   *                 gamesPlayed: 15
   *                 gamesWon: 9
   *                 gamesLost: 6
   *                 rating: 1350
   *                 createdAt: "2023-11-01T08:00:00Z"
   *                 updatedAt: "2023-12-01T10:30:00Z"
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               message: "Authentication required"
   *       404:
   *         description: User account not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               message: "Account not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getMyAccount = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const account = await this.accountService.getAccountById(userId);

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: account
      });

    } catch (error) {
      console.error('Get my account error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve account details',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/account/me:
   *   post:
   *     tags: [Account Management]
   *     summary: Update current user's account details
   *     description: Updates the authenticated user's account information (email, username, password, bio, avatar)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/UpdateAccountFormRequest'
   *           encoding:
   *             avatar:
   *               contentType: image/jpeg, image/png, image/gif, image/webp
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateAccountRequest'
   *           example:
   *             email: "newemail@darknet.com"
   *             username: "EliteHacker"
   *             password: "newSecurePassword123!"
   *             bio: "Elite hacker from the darknet"
   *     responses:
   *       200:
   *         description: Account updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Account updated successfully"
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *             example:
   *               success: true
   *               message: "Account updated successfully"
   *               data:
   *                 id: "550e8400-e29b-41d4-a716-446655440000"
   *                 email: "newemail@darknet.com"
   *                 username: "EliteHacker"
   *                 isActive: true
   *                 lastLogin: "2023-12-01T10:30:00Z"
   *                 gamesPlayed: 15
   *                 gamesWon: 9
   *                 gamesLost: 6
   *                 rating: 1350
   *                 createdAt: "2023-11-01T08:00:00Z"
   *                 updatedAt: "2023-12-01T11:00:00Z"
   *       400:
   *         description: Bad request - validation errors
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             examples:
   *               invalidEmail:
   *                 summary: Invalid email format
   *                 value:
   *                   success: false
   *                   message: "Invalid email format"
   *               weakPassword:
   *                 summary: Weak password
   *                 value:
   *                   success: false
   *                   message: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
   *               emptyUpdate:
   *                 summary: No fields to update
   *                 value:
   *                   success: false
   *                   message: "No valid fields provided for update"
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Conflict - email or username already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             examples:
   *               emailTaken:
   *                 summary: Email already in use
   *                 value:
   *                   success: false
   *                   message: "Email already in use"
   *               usernameTaken:
   *                 summary: Username already in use
   *                 value:
   *                   success: false
   *                   message: "Username already in use"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  updateMyAccount = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { email, username, password, bio } = req.body;
      const avatarFile = req.file;

      // Validate that at least one field is provided
      if (!email && !username && !password && !bio && !avatarFile) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
      }

      // Validate password if provided
      if (password && !validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      // Validate bio if provided
      if (bio && bio.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Bio must be 30 characters or less'
        });
      }

      // Prepare update data
      const updateData: any = {};
      if (email) updateData.email = email;
      if (username) updateData.username = username;
      if (password) updateData.password = password;
      if (bio) updateData.bio = bio;
      
      // Handle avatar upload
      if (avatarFile) {
        updateData.avatar = avatarFile.buffer;
        updateData.avatarMimeType = avatarFile.mimetype;
      }

      const updatedAccount = await this.accountService.updateAccount(userId, updateData);

      if (!updatedAccount) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Account updated successfully',
        data: updatedAccount
      });

    } catch (error) {
      console.error('Update my account error:', error);

      // Handle specific validation errors
      if (error instanceof Error) {
        if (error.message === 'Invalid email format' || error.message === 'Bio must be 30 characters or less') {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
        if (error.message === 'Email already in use' || error.message === 'Username already in use') {
          return res.status(409).json({
            success: false,
            message: error.message
          });
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update account',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/account/{uuid}:
   *   get:
   *     tags: [Account Management]
   *     summary: Get user account details by UUID
   *     description: Retrieves public account information for any user by their UUID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: uuid
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The UUID of the user account to retrieve
   *         example: "550e8400-e29b-41d4-a716-446655440000"
   *     responses:
   *       200:
   *         description: Account details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/PublicUser'
   *             example:
   *               success: true
   *               data:
   *                 id: "550e8400-e29b-41d4-a716-446655440000"
   *                 username: "CyberNinja"
   *                 isActive: true
   *                 gamesPlayed: 15
   *                 gamesWon: 9
   *                 gamesLost: 6
   *                 rating: 1350
   *                 createdAt: "2023-11-01T08:00:00Z"
   *       400:
   *         description: Bad request - invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               message: "Invalid UUID format"
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: User account not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               message: "Account not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getAccountByUuid = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;

      // Basic UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(uuid)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid UUID format'
        });
      }

      const account = await this.accountService.getAccountById(uuid);

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Return public information only (exclude email and sensitive data)
      const publicAccount = {
        id: account.id,
        username: account.username,
        isActive: account.isActive,
        gamesPlayed: account.gamesPlayed,
        gamesWon: account.gamesWon,
        gamesLost: account.gamesLost,
        rating: account.rating,
        createdAt: account.createdAt
      };

      return res.status(200).json({
        success: true,
        data: publicAccount
      });

    } catch (error) {
      console.error('Get account by UUID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve account details',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
} 