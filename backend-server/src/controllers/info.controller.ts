import { Request, Response } from 'express';
import { InfoService } from '../services/info.service';

export class InfoController {
  private infoService = new InfoService();

  /**
   * @swagger
   * /api/info/profile:
   *   get:
   *     tags: [Profile & Info]
   *     summary: Get complete user profile information
   *     description: Retrieves user profile including recent activity and statistics
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 10
   *         description: Maximum number of recent activities to return
   *     responses:
   *       200:
   *         description: Profile information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ProfileInfo'
   *             example:
   *               success: true
   *               data:
   *                 recentActivity:
   *                   - type: "WIN"
   *                     opponent: "ByteRunner"
   *                     time: "2h ago"
   *                     pointsChange: "+125 PTS"
   *                     gameId: "game-123"
   *                     gameMode: "standard"
   *                   - type: "LOSS"
   *                     opponent: "NeonHex"
   *                     time: "5h ago"
   *                     pointsChange: "-75 PTS"
   *                     gameId: "game-456"
   *                     gameMode: "standard"
   *                 profileStats:
   *                   wins: 9
   *                   losses: 6
   *                   totalGames: 15
   *                   winRate: "60.0%"
   *                   rating: 1350
   *                   level: 2
   *                 user:
   *                   id: "550e8400-e29b-41d4-a716-446655440000"
   *                   username: "CyberNinja"
   *                   email: "hacker@darknet.com"
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getProfile = async (req: Request, res: Response) => {
    try {
      // Get user ID from the authenticated request
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Get query parameters for pagination
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50 activities

      // Fetch recent activity and profile stats in parallel
      const [recentActivity, profileStats] = await Promise.all([
        this.infoService.getRecentActivity(userId, limit),
        this.infoService.getProfileStats(userId)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          recentActivity,
          profileStats,
          user: {
            id: req.user?.id,
            username: req.user?.username,
            email: req.user?.email
          }
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile information',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/info/activity:
   *   get:
   *     tags: [Profile & Info]
   *     summary: Get user recent activity
   *     description: Retrieves only the recent activity history for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 10
   *         description: Maximum number of recent activities to return
   *     responses:
   *       200:
   *         description: Recent activity retrieved successfully
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
   *                     recentActivity:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/RecentActivityItem'
   *             example:
   *               success: true
   *               data:
   *                 recentActivity:
   *                   - type: "WIN"
   *                     opponent: "ByteRunner"
   *                     time: "2h ago"
   *                     pointsChange: "+125 PTS"
   *                     gameId: "game-123"
   *                     gameMode: "standard"
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getRecentActivity = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const recentActivity = await this.infoService.getRecentActivity(userId, limit);

      return res.status(200).json({
        success: true,
        data: {
          recentActivity
        }
      });

    } catch (error) {
      console.error('Get recent activity error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/info/stats:
   *   get:
   *     tags: [Profile & Info]
   *     summary: Get user profile statistics
   *     description: Retrieves only the statistical information for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile statistics retrieved successfully
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
   *                     profileStats:
   *                       $ref: '#/components/schemas/ProfileStats'
   *             example:
   *               success: true
   *               data:
   *                 profileStats:
   *                   wins: 9
   *                   losses: 6
   *                   totalGames: 15
   *                   winRate: "60.0%"
   *                   rating: 1350
   *                   level: 2
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getProfileStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const profileStats = await this.infoService.getProfileStats(userId);

      return res.status(200).json({
        success: true,
        data: {
          profileStats
        }
      });

    } catch (error) {
      console.error('Get profile stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile statistics',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };