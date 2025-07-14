import axios from 'axios';
import { Ctx } from 'boardgame.io';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

// Extended context type that includes authentication properties
interface AuthCtx extends Ctx {
  playerID?: string;
  credentials?: string;
}

/**
 * Validates an authentication token against the backend server
 * Also retrieves the user's UUID for later use
 */
export const validateToken = async (token: string): Promise<{valid: boolean; user?: any}> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data && response.data.id) {
      console.log(`Player authenticated with UUID: ${response.data.id}`);
    }
    
    return {
      valid: true,
      user: response.data
    };
  } catch (error) {
    console.error('Token validation failed:', error);
    return { valid: false };
  }
};

/**
 * Middleware to validate player credentials before allowing game actions
 */
export const authMiddleware = {
  beforeAction: async (ctx: AuthCtx, action: any) => {
    const { playerID, credentials } = ctx;
    
    // Skip validation for non-player actions
    if (!playerID || !credentials) {
      return action;
    }
    
    // Validate player token
    const { valid } = await validateToken(credentials);
    if (!valid) {
      return false; // Block the action
    }
    
    return action;
  }
};

/**
 * Save game results to main backend
 */
export const saveGameResults = async (gameData: any, token: string): Promise<boolean> => {
  try {
    await axios.post(`${BACKEND_URL}/games/results`, gameData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to save game results:', error);
    return false;
  }
};
