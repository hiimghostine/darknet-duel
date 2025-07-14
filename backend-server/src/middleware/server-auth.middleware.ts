import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Get the server API key from environment variables or use a default for development
const SERVER_API_KEY = process.env.SERVER_API_KEY || 'dev-server-key';

/**
 * Middleware to authenticate server-to-server requests
 * This ensures only our game-server can communicate with these endpoints
 */
export const serverAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get API key from request headers
  const apiKey = req.headers['x-server-api-key'] as string;
  const source = req.headers['x-source'] as string;
  
  // Validate the API key and source
  if (!apiKey || apiKey !== SERVER_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid server API key'
    });
  }
  
  if (!source || source !== 'game-server') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid source'
    });
  }
  
  // Request is authenticated, proceed
  next();
};
