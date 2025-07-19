import { Request, Response, NextFunction } from 'express';
import { AccountType } from '../entities/account.entity';

/**
 * Middleware to ensure the authenticated user is an admin
 * This should be used after the regular authMiddleware
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is an admin
    if (req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // User is authenticated and is an admin
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}; 