import api from './api';
import type { GameHistoryItem, GameHistoryResponse, GameDetails } from '../types/game.types';

interface GameHistoryApiResponse {
  success: boolean;
  data: GameHistoryResponse;
  message?: string;
}

interface GameDetailsApiResponse {
  success: boolean;
  data: GameDetails;
  message?: string;
}

class GameService {
  /**
   * Get user's game history with pagination
   * @param limit - Number of games to fetch (default: 20)
   * @param offset - Number of games to skip (default: 0)
   */
  async getGameHistory(limit = 20, offset = 0): Promise<GameHistoryResponse> {
    const response = await api.get<GameHistoryApiResponse>('/games/history', {
      params: { limit, offset }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch game history');
    }
    
    return response.data.data;
  }

  /**
   * Get detailed information about a specific game
   * @param gameId - The ID of the game to retrieve
   */
  async getGameDetails(gameId: string): Promise<GameDetails> {
    const response = await api.get<GameDetailsApiResponse>(`/games/${gameId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch game details');
    }
    
    return response.data.data;
  }

  /**
   * Format game duration for display
   * @param startTime - Game start timestamp
   * @param endTime - Game end timestamp
   */
  formatGameDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param timestamp - ISO timestamp string
   */
  formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const gameTime = new Date(timestamp);
    const diffMs = now.getTime() - gameTime.getTime();
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Get role display information
   * @param role - Player role string
   */
  getRoleInfo(role: string) {
    if (role === 'attacker') {
      return {
        name: 'Attacker',
        icon: '⚔️',
        color: 'text-red-400',
        description: 'Attempting to hack the network'
      };
    } else if (role === 'defender') {
      return {
        name: 'Defender',
        icon: '🛡️',
        color: 'text-blue-400',
        description: 'Protecting the network'
      };
    } else {
      return {
        name: 'Unknown',
        icon: '❓',
        color: 'text-gray-400',
        description: 'Unknown role'
      };
    }
  }

  /**
   * Get game mode display information
   * @param gameMode - Game mode string
   */
  getGameModeInfo(gameMode: string) {
    switch (gameMode) {
      case 'standard':
        return {
          name: 'Standard',
          description: 'Classic Darknet Duel gameplay',
          color: 'text-primary'
        };
      case 'blitz':
        return {
          name: 'Blitz',
          description: 'Fast-paced gameplay with shorter turns',
          color: 'text-yellow-400'
        };
      case 'custom':
        return {
          name: 'Custom',
          description: 'Custom game rules and settings',
          color: 'text-purple-400'
        };
      default:
        return {
          name: gameMode || 'Unknown',
          description: 'Custom game mode',
          color: 'text-gray-400'
        };
    }
  }
}

export default new GameService(); 