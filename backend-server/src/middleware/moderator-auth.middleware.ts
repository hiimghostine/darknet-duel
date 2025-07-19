import { Request, Response, NextFunction } from 'express';
import { AccountType } from '../entities/account.entity';

/**
 * Middleware to ensure the authenticated user is a moderator or admin
 * This should be used after the regular authMiddleware
 */
export const moderatorAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is a moderator or admin
    if (req.user.type !== 'mod' && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Moderator access required'
      });
    }

    // User is authenticated and is a moderator or admin
    next();
  } catch (error) {
    console.error('Moderator auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}; 