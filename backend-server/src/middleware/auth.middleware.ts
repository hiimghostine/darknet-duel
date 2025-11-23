import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>;
    }
  }
}

const sessionService = new SessionService();
const authService = new AuthService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Validate session token
    const userId = await sessionService.validateSession(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Get user data
    const user = await authService.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request object (same format as before for compatibility)
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      type: user.type
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};
