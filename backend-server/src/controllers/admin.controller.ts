import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { AccountType } from '../entities/account.entity';

export class AdminController {
  private adminService = new AdminService();

  /**
   * @swagger
   * /api/admin/users:
   *   get:
   *     tags: [Admin]
   *     summary: Get paginated list of users with search functionality
   *     description: Retrieve all users with pagination, search, and filtering capabilities
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of users per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term to filter users by username or email
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [user, mod, admin]
   *         description: Filter users by account type
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter users by active status
   *     responses:
   *       200:
   *         description: Users retrieved successfully
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
   *                     users:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/AdminUser'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   *       401:
   *         description: Unauthorized - not an admin
   *       500:
   *         description: Internal server error
   */
  getUsers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const search = req.query.search as string;
      const type = req.query.type as AccountType;
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;

      const result = await this.adminService.getUsers({
        page,
        limit,
        search,
        type,
        isActive
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Admin get users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/users/{id}:
   *   get:
   *     tags: [Admin]
   *     summary: Get detailed user information
   *     description: Get comprehensive user details including sensitive information
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID
   *     responses:
   *       200:
   *         description: User details retrieved successfully
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized - not an admin
   */
  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await this.adminService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Admin get user by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user details',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/users/{id}:
   *   put:
   *     tags: [Admin]
   *     summary: Update user details
   *     description: Update any user details including account type and sensitive information
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               username:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [user, mod, admin]
   *               isActive:
   *                 type: boolean
   *               bio:
   *                 type: string
   *                 maxLength: 30
   *               creds:
   *                 type: integer
   *                 minimum: 0
   *               crypts:
   *                 type: integer
   *                 minimum: 0
   *               password:
   *                 type: string
   *                 description: New password (will be hashed)
   *     responses:
   *       200:
   *         description: User updated successfully
   *       400:
   *         description: Invalid input data
   *       404:
   *         description: User not found
   *       409:
   *         description: Email or username already exists
   *       401:
   *         description: Unauthorized - not an admin
   */
  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedUser = await this.adminService.updateUser(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Admin update user error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('already in use') || error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            message: error.message
          });
        }
        if (error.message.includes('Invalid') || error.message.includes('format')) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/users/{id}:
   *   delete:
   *     tags: [Admin]
   *     summary: Delete user account
   *     description: Permanently delete a user account and all associated data
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized - not an admin
   *       403:
   *         description: Cannot delete own account or other admins
   */
  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;

      // Prevent deleting own account
      if (id === adminId) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const deleted = await this.adminService.deleteUser(id, adminId!);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Admin delete user error:', error);
      
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/stats:
   *   get:
   *     tags: [Admin]
   *     summary: Get user statistics for admin dashboard
   *     description: Retrieve various user statistics for the admin dashboard
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User statistics retrieved successfully
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
   *                     totalUsers:
   *                       type: integer
   *                     activeUsers:
   *                       type: integer
   *                     adminUsers:
   *                       type: integer
   *                     modUsers:
   *                       type: integer
   *                     regularUsers:
   *                       type: integer
   *       401:
   *         description: Unauthorized - not an admin
   */
  getUserStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.adminService.getUserStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Admin get user stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/users/{id}/ban:
   *   post:
   *     tags: [Admin]
   *     summary: Ban user account
   *     description: Deactivate a user account with a ban reason
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID to ban
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reason
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Reason for banning the user
   *                 example: "Violated community guidelines"
   *     responses:
   *       200:
   *         description: User banned successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AdminUser'
   *                 message:
   *                   type: string
   *                   example: "User banned successfully"
   *       400:
   *         description: Invalid request or cannot ban admin accounts
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized - not an admin
   */
  banUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Ban reason is required'
        });
      }

      const bannedUser = await this.adminService.banUser(id, reason.trim());

      return res.status(200).json({
        success: true,
        data: bannedUser,
        message: 'User banned successfully'
      });
    } catch (error) {
      console.error('Admin ban user error:', error);
      
      if ((error as Error).message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if ((error as Error).message === 'Cannot ban admin accounts') {
        return res.status(400).json({
          success: false,
          message: 'Cannot ban admin accounts'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to ban user',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/users/{id}/unban:
   *   post:
   *     tags: [Admin]
   *     summary: Unban user account
   *     description: Reactivate a banned user account
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID to unban
   *     responses:
   *       200:
   *         description: User unbanned successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AdminUser'
   *                 message:
   *                   type: string
   *                   example: "User unbanned successfully"
   *       404:
   *         description: User not found
   *       401:
   *         description: Unauthorized - not an admin
   */
  unbanUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const unbannedUser = await this.adminService.unbanUser(id);

      return res.status(200).json({
        success: true,
        data: unbannedUser,
        message: 'User unbanned successfully'
      });
    } catch (error) {
      console.error('Admin unban user error:', error);
      
      if ((error as Error).message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to unban user',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
} 