import axios from 'axios';
import { LobbyClient } from 'boardgame.io/client';
import { getActiveMatch, setActiveMatch, clearActiveMatch, getMatchCredentials } from '../utils/lobbyStorage';

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
      swapRequested?: boolean;   // ✅ NEW: Player wants to swap positions
      swapAccepted?: boolean;    // ✅ NEW: Player accepted opponent's swap request
      realUserId?: string;
      realUsername?: string;
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
    isPrivate?: boolean; // Whether the lobby is private
    lobbyName?: string; // Custom lobby name
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
          isPrivate?: boolean;
          lobbyName?: string;
        };
      }
      
      const allMatches: GameMatch[] = response.matches.map((match: RawMatch) => {
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
              roles: {},
              isPrivate: false,
              lobbyName: 'Unnamed Lobby'
            }),
            state: state
          }
        };
      });
      
      // Filter out private lobbies, abandoned lobbies, and finished games from public listing
      const matches = allMatches.filter(match => {
        // Hide private lobbies
        if (match.setupData.isPrivate) return false;
        
        // Hide abandoned lobbies
        if (match.setupData.state === 'abandoned') return false;
        
        // Hide games that are in progress (optional - you can remove this if you want to show in-progress games)
        // if (match.setupData.state === 'in_game') return false;
        
        return true;
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
      roles: {},
      isPrivate: false
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
      // ✅ SIMPLE FIX: Just use the data passed from the caller
      const data = options?.data || {};
      
      // If role preference is specified, add it to join data
      if (options?.role) {
        data.role = options.role;
      }

      console.log('🎮 LOBBY SERVICE: Joining match with data:');
      console.log('   - playerID:', playerID);
      console.log('   - playerName:', playerName);
      console.log('   - data object:', JSON.stringify(data, null, 2));
      console.log('   - data keys:', Object.keys(data));
      
      const joinPayload = {
        playerID,
        playerName,
        data
      };
      
      console.log('🎮 LOBBY SERVICE: Full join payload:', JSON.stringify(joinPayload, null, 2));

      const result = await lobbyClient.joinMatch('darknet-duel', matchID, joinPayload);
      
      console.log('🎮 LOBBY SERVICE: Join result:', result);

      // Store as active match (single entry, overwrites previous)
      setActiveMatch({
        matchID,
        playerID,
        credentials: result.playerCredentials,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Failed to join match:', error);
      return null;
    }
  },

  // Leave a match
  leaveMatch: async (matchID: string): Promise<boolean> => {
    try {
      const creds = getMatchCredentials(matchID);
      
      if (!creds) return false;
      
      await lobbyClient.leaveMatch('darknet-duel', matchID, {
        playerID: creds.playerID,
        credentials: creds.credentials
      });
      
      // Clear active match
      clearActiveMatch();
      
      return true;
    } catch (error) {
      console.error('Failed to leave match:', error);
      return false;
    }
  },
  
  // Update player ready status
  updateReadyStatus: async (matchID: string, isReady: boolean): Promise<boolean> => {
    try {
      const creds = getMatchCredentials(matchID);
      
      if (!creds) return false;
      
      const { playerID, credentials } = creds;
      
      // ✅ FIX: Get current player data to preserve existing fields like realUserId
      const currentMatch = await lobbyService.getMatch(matchID);
      const currentPlayer = currentMatch?.players.find(p => p.id.toString() === playerID);
      const existingData = currentPlayer?.data || {};
      
      console.log('🔍 READY STATUS: Preserving existing data:', existingData);
      console.log('🔍 READY STATUS: Setting isReady to:', isReady);
      
      // Update player metadata with ready status while preserving existing data
      await lobbyClient.updatePlayer('darknet-duel', matchID, {
        playerID,
        credentials,
        data: { ...existingData, isReady }  // ✅ MERGE instead of overwrite
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
  
  // Join a private lobby by ID
  joinPrivateLobby: async (matchID: string): Promise<{ success: boolean; match?: GameMatch; error?: string }> => {
    try {
      // First, try to get the match details to see if it exists and is joinable
      const match = await lobbyService.getMatch(matchID);
      
      if (!match) {
        return { success: false, error: 'Lobby not found' };
      }
      
      // Check if lobby is full
      const activePlayerCount = match.players.filter(p => p.name && (p.isConnected !== false)).length;
      if (activePlayerCount >= 2) {
        return { success: false, error: 'Lobby is full' };
      }
      
      // Check if lobby is abandoned or in game
      const state = match.setupData.state || 'waiting';
      if (state === 'abandoned') {
        return { success: false, error: 'Lobby has been abandoned' };
      }
      if (state === 'in_game') {
        return { success: false, error: 'Game is already in progress' };
      }
      
      return { success: true, match };
    } catch (error) {
      console.error('Failed to join private lobby:', error);
      return { success: false, error: 'Failed to connect to lobby' };
    }
  },
  
  // Mark a game as started (host only)
  startMatch: async (matchID: string): Promise<boolean> => {
    try {
      const creds = getMatchCredentials(matchID);
      
      if (!creds || creds.playerID !== '0') return false;
      
      const { playerID, credentials } = creds;
      
      // ✅ FIX: Get current player data to preserve existing fields like realUserId
      const currentMatch = await lobbyService.getMatch(matchID);
      const currentPlayer = currentMatch?.players.find(p => p.id.toString() === playerID);
      const existingData = currentPlayer?.data || {};
      
      console.log('🔍 START MATCH: Preserving existing data:', existingData);
      console.log('🔍 START MATCH: Adding gameStarted flag');
      
      // Since we can't directly update match metadata, we'll set a special flag
      // on the host player that others can check while preserving existing data
      await lobbyClient.updatePlayer('darknet-duel', matchID, {
        playerID,
        credentials,
        data: { ...existingData, isReady: true, gameStarted: true }  // ✅ MERGE instead of overwrite
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start match:', error);
      return false;
    }
  },
  
  // ============================================
  // POSITION SWAP METHODS
  // ============================================
  
  // Request position swap with opponent
  requestPositionSwap: async (matchID: string): Promise<boolean> => {
    try {
      const creds = getMatchCredentials(matchID);
      
      if (!creds) return false;
      
      const { playerID, credentials } = creds;
      
      const currentMatch = await lobbyService.getMatch(matchID);
      const currentPlayer = currentMatch?.players.find(p => p.id.toString() === playerID);
      const existingData = currentPlayer?.data || {};
      
      console.log('🔄 Requesting position swap...');
      
      await lobbyClient.updatePlayer('darknet-duel', matchID, {
        playerID,
        credentials,
        data: { 
          ...existingData, 
          swapRequested: true,
          swapAccepted: false
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to request position swap:', error);
      return false;
    }
  },
  
  // Accept and execute position swap
  acceptPositionSwap: async (matchID: string): Promise<{success: boolean, newPlayerID?: string}> => {
    try {
      const creds = getMatchCredentials(matchID);
      
      if (!creds) return { success: false };
      
      const { playerID, credentials } = creds;
      
      // First, mark that we accept the swap
      const currentMatch = await lobbyService.getMatch(matchID);
      const currentPlayer = currentMatch?.players.find(p => p.id.toString() === playerID);
      const existingData = currentPlayer?.data || {};
      
      console.log('✅ Accepting position swap...');
      
      await lobbyClient.updatePlayer('darknet-duel', matchID, {
        playerID,
        credentials,
        data: { 
          ...existingData, 
          swapAccepted: true
        }
      });
      
      // Wait a moment for the update to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now call the atomic swap endpoint
      const response = await axios.post(
        `${GAME_SERVER_URL}/games/darknet-duel/${matchID}/swap-positions`,
        { playerID, credentials },
        { timeout: 10000 }
      );
      
      if (response.data.success && response.data.swapped) {
        // Get our new player ID
        const newPlayerID = response.data.newPlayerIdFor[credentials];
        
        console.log(`🎉 Position swap successful! Old ID: ${playerID}, New ID: ${newPlayerID}`);
        
        // Update active match with new player ID
        const activeMatch = getActiveMatch();
        if (activeMatch && activeMatch.matchID === matchID) {
          setActiveMatch({
            ...activeMatch,
            playerID: newPlayerID
          });
        }
        
        return { success: true, newPlayerID };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Failed to accept position swap:', error);
      return { success: false };
    }
  },
  
  // Cancel swap request
  cancelPositionSwap: async (matchID: string): Promise<boolean> => {
    try {
      const creds = getMatchCredentials(matchID);
      
      if (!creds) return false;
      
      const { playerID, credentials } = creds;
      
      const currentMatch = await lobbyService.getMatch(matchID);
      const currentPlayer = currentMatch?.players.find(p => p.id.toString() === playerID);
      const existingData = currentPlayer?.data || {};
      
      await lobbyClient.updatePlayer('darknet-duel', matchID, {
        playerID,
        credentials,
        data: { 
          ...existingData, 
          swapRequested: false,
          swapAccepted: false
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to cancel position swap:', error);
      return false;
    }
  }
};

export default lobbyService;
