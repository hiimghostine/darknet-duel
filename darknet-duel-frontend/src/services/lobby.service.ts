import axios from 'axios';
import { LobbyClient } from 'boardgame.io/client';

// Helper function to get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const GAME_SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:8001';

// Configure global axios defaults
axios.defaults.timeout = 10000; // 10 second default timeout for all requests

// Configure authentication for API requests
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Set a shorter timeout for polling requests to prevent UI hanging
  if (config.url?.includes('/games/darknet-duel/')) {
    config.timeout = 5000; // 5 seconds for polling requests
  }
  
  return config;
});

// Create an API instance with our server URL
const lobbyClient = new LobbyClient({ server: GAME_SERVER_URL });

// Types
// Define possible lobby states
export type LobbyState = 'waiting' | 'ready' | 'in_game' | 'abandoned';

export interface GameMatch {
  matchID: string; 
  gameName: string;
  players: {
    id: number;
    name?: string;
    data?: {
      isReady?: boolean;
      gameStarted?: boolean;
    };
    // boardgame.io automatically adds these fields for presence tracking
    isConnected?: boolean; 
    credentials?: string;
  }[];
  setupData: {
    gameMode: 'standard' | 'blitz' | 'custom';
    timeLimit?: number;
    initialResources: number;
    maxTurns: number;
    roles: {
      attackerPlayerId?: string;
      defenderPlayerId?: string;
    };
    started?: boolean; // Flag to indicate if the game has started
    state?: LobbyState; // Current lobby state
  };
}

// Enhanced lobby service with our custom functionality
export const lobbyService = {
  // Get list of available matches
  getMatches: async (): Promise<GameMatch[]> => {
    try {
      const response = await lobbyClient.listMatches('darknet-duel');
      // Convert the response to our GameMatch interface format
      // Define a player interface for match data
      interface MatchPlayer {
        id: number;
        name?: string;
        isConnected?: boolean;
        data?: {
          isReady?: boolean;
          gameStarted?: boolean;
        };
      }
      
      interface RawMatch {
        matchID: string;
        gameName: string;
        players: MatchPlayer[];
        setupData?: {
          gameMode: 'standard' | 'blitz' | 'custom';
          timeLimit?: number;
          initialResources: number;
          maxTurns: number;
          roles: Record<string, string>;
          started?: boolean;
        };
      }
      
      const matches: GameMatch[] = response.matches.map((match: RawMatch) => {
        // Determine lobby state based on player data and connection status
        let state: LobbyState = 'waiting';
        const players: MatchPlayer[] = match.players || [];
        const filledPlayerCount = players.filter((p: MatchPlayer) => p.name).length;
        const requiredPlayers = 2; // Always 2 players for our game
        const allPlayersConnected = players.every((p: MatchPlayer) => p.name ? (p.isConnected !== false) : true);
        const allPlayersReady = players.every((p: MatchPlayer) => p.name ? (p.data?.isReady === true) : true);
        const anyPlayersStarted = players.some((p: MatchPlayer) => p.data?.gameStarted === true);
        const hostConnected = players[0]?.name && players[0]?.isConnected !== false;

        // Host missing or disconnected = abandoned
        if (!hostConnected && filledPlayerCount > 0) {
          state = 'abandoned';
        }
        // Game already started
        else if (anyPlayersStarted || match.setupData?.started) {
          state = 'in_game';
        }
        // All players present and ready
        else if (filledPlayerCount === requiredPlayers && allPlayersReady && allPlayersConnected) {
          state = 'ready';
        }
        // Default is waiting

        return {
          matchID: match.matchID,
          gameName: match.gameName,
          players: match.players,
          setupData: {
            ...(match.setupData || {
              gameMode: 'standard',
              initialResources: 5,
              maxTurns: 30,
              roles: {}
            }),
            state: state
          }
        };
      });
      return matches;
    } catch (error) {
      console.error('Failed to fetch matches:', error as Error);
      return [];
    }
  },

  // Create a new match
  createMatch: async (
    numPlayers: number = 2, 
    setupData: any = {
      gameMode: 'standard',
      initialResources: 5,
      maxTurns: 30,
      roles: {}
    }
  ): Promise<string | null> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const createdMatch = await lobbyClient.createMatch('darknet-duel', {
        numPlayers,
        setupData
      });

      return createdMatch.matchID;
    } catch (error) {
      console.error('Failed to create match:', error);
      return null;
    }
  },

  // Join an existing match
  joinMatch: async (
    matchID: string, 
    playerName: string, 
    playerID: string = '0',
    options?: {
      role?: 'attacker' | 'defender';
      data?: any;
    }
  ): Promise<{ playerCredentials: string } | null> => {
    try {
      // We don't need to access token directly here, the fetch wrapper handles it
      const data = options?.data || {};
      
      // If role preference is specified, add it to join data
      if (options?.role) {
        data.role = options.role;
      }

      const result = await lobbyClient.joinMatch('darknet-duel', matchID, {
        playerID,
        playerName,
        data
      });

      // Store the player credentials locally
      localStorage.setItem(`match_${matchID}_credentials`, result.playerCredentials);
      localStorage.setItem(`match_${matchID}_playerID`, playerID);

      return result;
    } catch (error) {
      console.error('Failed to join match:', error);
      return null;
    }
  },

  // Leave a match
  leaveMatch: async (matchID: string): Promise<boolean> => {
    try {
      const playerID = localStorage.getItem(`match_${matchID}_playerID`);
      const credentials = localStorage.getItem(`match_${matchID}_credentials`);
      
      if (!playerID || !credentials) return false;
      
      await lobbyClient.leaveMatch('darknet-duel', matchID, {
        playerID,
        credentials
      });
      
      // Clean up local storage
      localStorage.removeItem(`match_${matchID}_playerID`);
      localStorage.removeItem(`match_${matchID}_credentials`);
      
      return true;
    } catch (error) {
      console.error('Failed to leave match:', error);
      return false;
    }
  },
  
  // Update player ready status
  updateReadyStatus: async (matchID: string, isReady: boolean): Promise<boolean> => {
    try {
      const playerID = localStorage.getItem(`match_${matchID}_playerID`);
      const credentials = localStorage.getItem(`match_${matchID}_credentials`);
      
      if (!playerID || !credentials) return false;
      
      // Update player metadata with ready status
      await lobbyClient.updatePlayer('darknet-duel', matchID, {
        playerID,
        credentials,
        data: { isReady }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update ready status:', error);
      return false;
    }
  },

  // Get match details with timeout and error handling
  getMatch: async (matchID: string): Promise<GameMatch | null> => {
    try {
      const match = await axios.get(`${GAME_SERVER_URL}/games/darknet-duel/${matchID}`, {
        timeout: 5000, // 5 second timeout
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined // Additional timeout for modern browsers
      });
      return match.data;
    } catch (error) {
      // Only log non-timeout errors to reduce console spam
      if (axios.isAxiosError(error) && error.code !== 'ECONNABORTED') {
        console.error('Failed to get match details:', error);
      }
      return null;
    }
  },
  
  // Mark a game as started (host only)
  startMatch: async (matchID: string): Promise<boolean> => {
    try {
      const playerID = localStorage.getItem(`match_${matchID}_playerID`);
      const credentials = localStorage.getItem(`match_${matchID}_credentials`);
      
      if (!playerID || !credentials || playerID !== '0') return false;
      
      // Since we can't directly update match metadata, we'll set a special flag
      // on the host player that others can check
      await lobbyClient.updatePlayer('darknet-duel', matchID, {
        playerID,
        credentials,
        data: { isReady: true, gameStarted: true }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start match:', error);
      return false;
    }
  }
};

export default lobbyService;
