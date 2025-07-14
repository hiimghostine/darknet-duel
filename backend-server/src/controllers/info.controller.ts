import { Request, Response } from 'express';
import { InfoService } from '../services/info.service';

export class InfoController {
  private infoService = new InfoService();

  /**
   * Get user profile information including recent activity and stats
   * GET /api/info/profile
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
   * Get only recent activity for a user
   * GET /api/info/activity
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
   * Get only profile stats for a user
   * GET /api/info/stats
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
} 