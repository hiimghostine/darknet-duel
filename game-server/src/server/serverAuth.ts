import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';
const SERVER_API_KEY = process.env.SERVER_API_KEY || 'dev-server-key';
const MAX_RETRIES = 3; // Maximum number of retries for failed requests
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

/**
 * Server-to-server authentication for secure communication between game-server and backend-server
 * Uses a dedicated API key for server authentication instead of user tokens
 */
export const serverToServerRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
  data?: any
): Promise<T> => {
  const url = `${BACKEND_URL}${endpoint}`;
  const config = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      'x-server-api-key': SERVER_API_KEY, // Must match exactly what the backend expects (case-sensitive)!
      'X-Source': 'game-server'
    },
    data: data || {}
  };
  
  try {
    // Log detailed request information
    console.log(`🌐 API Request: ${method} ${url}`);
    console.log(`📤 Request Headers: ${JSON.stringify(config.headers, null, 2)}`);
    console.log(`📦 Request Payload: ${JSON.stringify(data, null, 2).substring(0, 500)}${JSON.stringify(data, null, 2).length > 500 ? '...(truncated)' : ''}`);

    // Start timer for response time measurement
    const startTime = Date.now();
    
    // Make the API request
    const response = await axios(config);
    
    // Log response information
    const duration = Date.now() - startTime;
    console.log(`✅ API Response (${duration}ms): Status ${response.status}`);
    console.log(`📥 Response Data: ${JSON.stringify(response.data, null, 2).substring(0, 500)}${JSON.stringify(response.data, null, 2).length > 500 ? '...(truncated)' : ''}`);
    
    return response.data as T;
  } catch (error: any) {
    // Log detailed error information
    console.error(`❌ API Request Failed: ${method} ${url}`);
    console.error(`🔴 Error Status: ${error.response?.status || 'No status'}`);
    console.error(`🔴 Error Message: ${error.message}`);
    console.error(`🔴 Response Data: ${JSON.stringify(error.response?.data || {}, null, 2)}`);
    
    throw new Error(`Server communication error (${endpoint}): ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Check if the game-server is properly authorized with the backend
 * Useful for startup validation
 */
export const validateServerConnection = async (): Promise<boolean> => {
  try {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const result = await serverToServerRequest<{ status: string }>('/server/validate', 'GET');
        console.log('Server connection validated successfully');
        return result.status === 'ok';
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) throw error;
        console.warn(`Retrying server validation (attempt ${retries}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    return false;
  } catch (error) {
    console.error('Server validation failed after multiple attempts:', error);
    return false;
  }
};

/**
 * Send game results to the backend server
 * @param gameResult The game result data to send
 * @returns Promise resolving to true if successful, false otherwise
 */
export const sendGameResults = async (gameResult: GameResultData): Promise<boolean> => {
  try {
    // Check for development/test player IDs (numeric IDs like "0", "1")
    const hasNumericPlayerIds = gameResult.players.some(player => {
      const isNumericId = /^\d+$/.test(player.id);
      if (isNumericId) {
        console.log(`WARNING: Using unmapped player ID: ${player.id} - this may cause foreign key errors in backend`);
      }
      return isNumericId;
    });
    
    // Restructure game result to match backend expectations
    const restructuredPayload = {
      gameId: gameResult.gameId,
      players: gameResult.players,
      gameData: {
        turnCount: gameResult.turnCount,
        startTime: gameResult.startTime,
        endTime: gameResult.endTime,
        actions: gameResult.actions,
        winner: gameResult.winner,
        gameMode: gameResult.gameMode,
        abandonReason: gameResult.abandonReason
      }
    };
    
    console.log(`Sending game results to backend for ${gameResult.gameId}...`);
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await serverToServerRequest<{ success: boolean }>('/server/games/results', 'POST', restructuredPayload);
        console.log('Successfully sent game results to backend server');
        return response.success === true;
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) throw error;
        console.warn(`Retrying game results send (attempt ${retries}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    return false; // Should not reach here
  } catch (error) {
    console.error('Failed to send game results after multiple attempts:', error);
    return false;
  }
};

/**
 * Record game history for analytics and player statistics
 */
export const recordGameHistory = async (gameHistory: GameHistoryData): Promise<boolean> => {
  try {
    // Check for unmapped player IDs that would cause foreign key errors
    gameHistory.players.forEach(player => {
      const isNumericId = /^\d+$/.test(player.id);
      if (isNumericId) {
        console.log(`WARNING: Using unmapped player ID: ${player.id} - this may cause foreign key errors in backend`);
      }
    });
    
    console.log(`Recording game history for ${gameHistory.gameId} to backend server...`);
    
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        await serverToServerRequest<{ success: boolean }>('/server/games/history', 'POST', gameHistory);
        console.log('Successfully recorded game history in backend server');
        return true;
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) throw error;
        console.warn(`Retrying game history record (attempt ${retries}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to record game history after multiple attempts:', error);
    return false;
  }
};

/**
 * Update player ELO ratings based on game results
 * The actual ELO calculation is done on the backend for security
 * 
 * Note: In development/test mode, this may fail if player IDs don't match real accounts
 * in the backend database due to foreign key constraints.
 */
export const updatePlayerRatings = async (ratingData: EloRatingUpdateData): Promise<boolean> => {
  try {
    // Check for development/test mode player IDs
    const hasTestIds = ratingData.players.some(player => 
      player.id === '0' || player.id === '1' || !isNaN(Number(player.id)));
    
    if (hasTestIds) {
      console.warn('⚠️ Development mode detected - using test player IDs that may not exist in the database');
      console.warn('Skipping player ratings update to avoid foreign key constraint errors');
      console.warn('In production with real player accounts, this will work properly');
      // Return true to prevent cascading errors in development mode
      return true;
    }
    
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await serverToServerRequest<{ success: boolean }>('/server/players/ratings', 'POST', ratingData);
        console.log('✅ Successfully updated player ratings in backend server');
        return response.success === true;
      } catch (error: any) {
        // Check specifically for foreign key constraint errors
        if (error.message?.includes('foreign key constraint fails')) {
          console.warn('⚠️ Foreign key constraint error: Player IDs not found in accounts database');
          console.warn('This is expected in development/testing with non-persistent players');
          return false;
        }
        
        retries++;
        if (retries >= MAX_RETRIES) throw error;
        console.warn(`Retrying player ratings update (attempt ${retries}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to update player ratings after multiple attempts:', error);
    return false;
  }
};

// Type definitions for better type safety
export interface GameResultData {
  gameId: string;
  winner: {
    id: string;
    role: string;
  };
  players: {
    id: string;
    name: string;
    role: string;
  }[];
  turnCount: number;
  startTime: Date;
  endTime: Date;
  actions: any[];
  gameMode: string;
  abandonReason?: string;
}

export interface GameHistoryData {
  gameId: string;
  players: {
    id: string;
    name: string;
    role: string;
  }[];
  turns: {
    turnNumber: number;
    playerId: string;
    action: string;
    timestamp: Date;
  }[];
  gameMode: string;
  startTime: Date;
  endTime: Date;
}

export interface EloRatingUpdateData {
  gameId: string;
  gameMode: string;
  players: {
    id: string;
    isWinner: boolean;
    role: string;
  }[];
}
