import { Server, Origins } from 'boardgame.io/server';
import { Game, Ctx, FnContext } from 'boardgame.io';
import cors from '@koa/cors';
import DarknetDuel from '../game/DarknetDuel';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { sendGameResults, recordGameHistory, updatePlayerRatings, GameResultData, GameHistoryData, EloRatingUpdateData } from './serverAuth';
import bodyParser from 'koa-bodyparser';
import { LobbyCleanupService } from '../services/lobbyCleanupService';
import { GameState } from 'shared-types/game.types';
import cardDataRouter from './cardDataRoutes';

// Environment variables
const PORT = parseInt(process.env.GAME_SERVER_PORT || '8001');
const HOST = process.env.GAME_SERVER_HOST || 'localhost';
const PUBLIC_URL = process.env.PUBLIC_SERVER_URL || `http://localhost:${PORT}`;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

// Create boardgame.io server with our game
const server = Server({
  games: [DarknetDuel],
  // Explicitly set the UUID generation method for match IDs to ensure uniqueness
  // This is key to preventing game ID conflicts with multiple instances
  uuid: () => {
    // Generate a truly random ID with timestamp prefix to ensure uniqueness
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomStr}`;
  },
  origins: [
    // Allow all origins in development
    Origins.LOCALHOST,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Allow connections from any origin in development mode
    // This is needed for VPN connections
    ...(process.env.NODE_ENV === 'development' ? [/.*/, 'https://*', 'http://*'] : []),
    // Extract the domain from PUBLIC_URL if it exists
    PUBLIC_URL ? new URL(PUBLIC_URL).origin : '',
  ].filter(Boolean),
});

// Configure server to use lobby
if (server.db) {
  console.log('Database initialized for matchmaking');
}

// ✅ Set up lobby hooks to capture real user data
// This captures player data when they join lobbies
server.router.use(async (ctx, next) => {
  // Intercept lobby join requests to capture real user data
  if (ctx.request.path.includes('/games/darknet-duel/') && 
      ctx.request.path.includes('/join') && 
      ctx.request.method === 'POST') {
    
    console.log('🔍 Intercepting lobby join request...');
    
    // Continue with the original request first
    await next();
    
    // After the join is successful, try to update the game state with real user data
    try {
      // Extract match ID from the path
      const pathParts = ctx.request.path.split('/');
      const matchIndex = pathParts.findIndex(part => part === 'darknet-duel');
      const matchID = pathParts[matchIndex + 1];
      
      if (matchID && server.db) {
        console.log(`🔍 Processing user data for match ${matchID}...`);
        
        // Get the current match state and try to inject real user data
        const matchData = await server.db.fetch(matchID, { state: true, metadata: true });
        
        if (matchData && matchData.metadata && matchData.metadata.players && matchData.state) {
          console.log('🔍 Found match data, attempting to update game state with real user data...');
          
          // Extract real user data from lobby metadata
          const realUserMap: Record<string, { id: string; name: string }> = {};
          
          Object.entries(matchData.metadata.players).forEach(([playerId, playerMeta]: [string, any]) => {
            if (playerMeta && playerMeta.data && playerMeta.data.realUserId && playerMeta.data.realUsername) {
              realUserMap[playerId] = {
                id: playerMeta.data.realUserId,
                name: playerMeta.data.realUsername
              };
              console.log(`✅ Found real user data for player ${playerId}: ${playerMeta.data.realUsername} (${playerMeta.data.realUserId})`);
            }
          });
          
          // If we have real user data and the game state exists, update the player objects
          if (Object.keys(realUserMap).length > 0 && matchData.state.G) {
            let stateUpdated = false;
            const gameState = matchData.state.G;
            
            // Create a new game state with updated player data
            const newGameState = { ...gameState };
            
            // Update attacker if we have real data for player 0
            if (realUserMap['0'] && gameState.attacker) {
              newGameState.attacker = {
                ...gameState.attacker,
                id: realUserMap['0'].id,
                name: realUserMap['0'].name
              };
              console.log(`✅ Updated attacker: ${newGameState.attacker.name} (${newGameState.attacker.id})`);
              stateUpdated = true;
            }
            
            // Update defender if we have real data for player 1
            if (realUserMap['1'] && gameState.defender) {
              newGameState.defender = {
                ...gameState.defender,
                id: realUserMap['1'].id,
                name: realUserMap['1'].name
              };
              console.log(`✅ Updated defender: ${newGameState.defender.name} (${newGameState.defender.id})`);
              stateUpdated = true;
            }
            
            // If we updated the state, save it back to the database
            if (stateUpdated) {
              const newState = {
                ...matchData.state,
                G: newGameState
              };
              await server.db.setState(matchID, newState);
              console.log(`🎮 Successfully updated game state with real user data for match ${matchID}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating game state with real user data:', error);
    }
  } else {
    await next();
  }
});

// Set up lobby server
if (server.app) {
  // Add CORS first
  server.app.use(cors());
  
  // Let's register our custom leave endpoint manually without using bodyParser globally
  // to avoid conflicts with boardgame.io's internal body parsing
  server.router.get('/lobby-config', (ctx) => {
    ctx.body = { maxPlayers: 2 };
  });
  
  // Add endpoint to handle explicit player leave notifications
  // Use bodyParser middleware specifically for this route only
  const parseJsonBody = bodyParser();
  server.router.post('/games/:name/:id/leave', parseJsonBody, async (ctx) => {
    const { name, id } = ctx.params;
    
    try {
      console.log('Leave request received, body:', ctx.request.body);
      
      let playerID = 'unknown';
      let credentials;
      
      // Safely extract playerID and credentials if they exist
      if (ctx.request.body && typeof ctx.request.body === 'object') {
        const body = ctx.request.body as any;
        playerID = body.playerID || playerID;
        credentials = body.credentials;
      }
      
      console.log(`Player ${playerID} manually left game ${id}`);
      
      // Access the internal database to modify the match data
      if (server.db) {
        try {
          // Get all matches to see if our match exists
          const matches = await server.db.listMatches();
          console.log(`Available matches:`, matches);
          
          // Check if this match ID exists
          if (matches.includes(id)) {
            console.log(`Found match ${id} in database, updating player ${playerID}`);
            
            try {
              // Get the match data using just the ID (not prefixed with game name)
              const match = await server.db.fetch(id, { metadata: true });
              
              if (match && match.metadata) {
                const metadata = match.metadata;
                console.log(`Match metadata:`, metadata);
                
                if (metadata.players && typeof metadata.players === 'object') {
                  // Create a copy of the players object and properly type it
                  const players = metadata.players as Record<string, any>;
                  const updatedPlayers: Record<string, any> = { ...players };
                  
                  // Check if the specific player exists in the object
                  if (updatedPlayers[playerID]) {
                    console.log(`Found player ${playerID} in match data`);  
                    
                    // Update the player data
                    updatedPlayers[playerID] = {
                      ...updatedPlayers[playerID],
                      left: true,
                      isConnected: false
                    };
                    
                    console.log(`Player ${playerID} data updated:`, updatedPlayers[playerID]);
                    
                    // Update the match metadata with the modified players object
                    const updatedMetadata = {
                      ...metadata,
                      players: updatedPlayers,
                      updatedAt: Date.now()
                    };
                    
                    // Use just the ID for updating the metadata
                    await server.db.setMetadata(id, updatedMetadata);
                    
                    console.log(`Successfully removed player ${playerID} from match ${id}`);
                  } else {
                    console.log(`Player ${playerID} not found in match ${id} players list`);
                  }
                } else {
                  console.log(`No players array found in match ${id} metadata:`, metadata);
                }
              } else {
                console.log(`Match ${id} metadata not found or invalid`);
              }
            } catch (matchFetchError) {
              console.error(`Error fetching match ${id}:`, matchFetchError);
            }
          } else {
            console.log(`Match ${id} not found in available matches list`);
          }
        } catch (dbError) {
          console.error(`Error updating match in database:`, dbError);
        }
      }
      
      // Return success response regardless of DB update result
      // This prevents the frontend from getting stuck waiting for confirmation
      ctx.body = { success: true, message: `Player ${playerID} successfully removed from lobby` };
      ctx.status = 200;
    } catch (error) {
      console.error('Error handling leave notification:', error);
      ctx.body = { error: 'Internal server error' };
      ctx.status = 500;
    }
  });
}

// Enhanced CORS handling
server.app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.request.headers.origin;
      // Allow requests from frontend and backend servers
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8000'
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        return origin || '*';
      }
      // TypeScript needs a string return, not false
      return '';
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

// Add custom API endpoints to interact with main backend
const router = new (require('@koa/router'))();

// Health check
router.get('/health', (ctx: any) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// Validate auth token with main backend server
router.post('/validate-token', async (ctx: any) => {
  try {
    const { token } = ctx.request.body;
    
    if (!token) {
      ctx.status = 400;
      ctx.body = { error: 'Token required' };
      return;
    }
    
    // Forward token validation to main backend
    const response = await axios.post(`${BACKEND_URL}/auth/validate`, { token }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    ctx.body = response.data;
  } catch (error: any) {
    ctx.status = error.response?.status || 500;
    ctx.body = { 
      error: 'Token validation failed', 
      details: error.response?.data || error.message 
    };
  }
});

// Save game results endpoint
router.post('/game-results', async (ctx: any) => {
  try {
    const { gameId, winner, players, gameData } = ctx.request.body;
    const { token } = ctx.request.headers;
    
    if (!gameId || !winner || !players) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required game result data' };
      return;
    }
    
    // Forward game results to main backend for storage
    const response = await axios.post(
      `${BACKEND_URL}/games/results`, 
      { gameId, winner, players, gameData },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    ctx.body = response.data;
  } catch (error: any) {
    ctx.status = error.response?.status || 500;
    ctx.body = { 
      error: 'Failed to save game results', 
      details: error.response?.data || error.message 
    };
  }
});

// Add custom routes to server
server.app.use(router.routes()).use(router.allowedMethods());

// Add card data API routes for dev cheat panel
server.app.use(cardDataRouter.routes()).use(cardDataRouter.allowedMethods());

// Set up game event listeners
server.app.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname.includes('/games/')) {
    const matchID = pathname.split('/').pop();
    if (matchID) {
      // Game has started
      console.log(`Game connection detected for match: ${matchID}`);
    }
  }
});

// Game lifecycle hooks for backend sync
// Use event handlers instead of direct server properties
const handleGameStart = (gameID: string, players: any): void => {
  console.log(`Game started: ${gameID}`);
};

/**
 * Process a game's end and send the data to the backend server
 * This function takes a completed game's data and sends it to the backend for storage and MMR processing
 * 
 * @param gameID The ID of the completed game
 * @param matchData The full game match data from boardgame.io
 * @returns Promise resolving to void when backend communication is complete
 */
const handleGameEnd = async (gameID: string, matchData: ServerMatchData): Promise<void> => {
  // Log that we're processing a game end with detailed debug info
  console.log(`🏁 Processing game end for ${gameID}...`);
  console.log(`Match data structure: ${JSON.stringify(Object.keys(matchData))}`);
  
  try {
    // Handle different possible match data structures
    let players: any;
    let state: any;
    let startTime: Date;
    
    console.log(`Full match data structure:`, JSON.stringify(matchData, null, 2).substring(0, 1000));
    
    // Extract players and state based on match data structure
    if (matchData.state) {
      state = matchData.state;
      
      // ✅ FIX: First try to get real player data from lobby metadata
      let realPlayerData: any = {};
      
      if (matchData.metadata?.players) {
        console.log('🔍 Found lobby metadata with players:', Object.keys(matchData.metadata.players));
        console.log('🔍 Full metadata structure:', JSON.stringify(matchData.metadata, null, 2));
        
        Object.entries(matchData.metadata.players).forEach(([playerId, playerMeta]: [string, any]) => {
          console.log(`\n🔍 Analyzing player ${playerId}:`);
          console.log(`   - playerMeta type:`, typeof playerMeta);
          console.log(`   - playerMeta.name:`, playerMeta?.name);
          console.log(`   - playerMeta.data:`, playerMeta?.data);
          
          if (playerMeta && typeof playerMeta === 'object') {
            // Extract real user data if available
            if (playerMeta.data?.realUserId && playerMeta.data?.realUsername) {
              console.log(`   - realUserId:`, playerMeta.data.realUserId);
              console.log(`   - realUsername:`, playerMeta.data.realUsername);
              console.log(`   - realUserId type:`, typeof playerMeta.data.realUserId);
              console.log(`   - is UUID format?:`, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(playerMeta.data.realUserId));
              
              realPlayerData[playerId] = {
                id: playerMeta.data.realUserId, // ✅ Always use the UUID
                name: playerMeta.data.realUsername,
                role: playerId === '0' ? 'attacker' : 'defender'
              };
              console.log(`✅ Using real UUID for player ${playerId}: ${playerMeta.data.realUsername} (UUID: ${playerMeta.data.realUserId})`);
            } else if (playerMeta.name) {
              // ❌ DON'T use username as ID - this causes foreign key errors
              console.warn(`⚠️ Player ${playerId} missing real UUID data:`);
              console.warn(`   - Name: ${playerMeta.name}`);
              console.warn(`   - Data keys: ${Object.keys(playerMeta.data || {})}`);
              console.warn(`   - realUserId: ${playerMeta.data?.realUserId}`);
              console.warn(`   - realUsername: ${playerMeta.data?.realUsername}`);
              console.warn(`   ❌ Skipping to prevent foreign key errors`);
            }
          }
        });
      }
      
      // Look for players in the state object
      if (state.G && state.G.attacker && state.G.defender) {
        // Game-specific structure where players are in G as attacker/defender
        // ✅ Use real player data if available, otherwise fall back to game state
        players = {
          '0': realPlayerData['0'] || {
            id: state.G.attacker.id || '0',
            name: state.G.attacker.name || 'Attacker',
            role: 'attacker'
          },
          '1': realPlayerData['1'] || {
            id: state.G.defender.id || '1',
            name: state.G.defender.name || 'Defender',
            role: 'defender'
          }
        };
        console.log(`Using game-specific player structure with real data overlay`);
      } else if (state.players) {
        // Players are directly in state - overlay real data
        players = { ...state.players };
        Object.keys(realPlayerData).forEach(playerId => {
          if (players[playerId]) {
            players[playerId] = { ...players[playerId], ...realPlayerData[playerId] };
          }
        });
        console.log(`Using players from state.players with real data overlay`);
      } else if (Object.keys(realPlayerData).length > 0) {
        // Use real player data directly
        players = realPlayerData;
        console.log(`Using real player data from lobby metadata`);
      } else {
        // Fallback - create minimal players structure
        players = {};
        for (let i = 0; i < 2; i++) {
          players[i] = {
            id: i.toString(),
            name: `Player ${i}`,
            role: i === 0 ? 'attacker' : 'defender'
          };
        }
        console.log(`Created minimal player structure as fallback`);
      }
      
      // Get start time from metadata if available
      startTime = matchData.metadata?.startTime || 
                  matchData.metadata?.createdAt || 
                  new Date(Date.now() - 3600000); // Fallback to 1 hour ago
    } else {
      // Log detailed structure for debugging
      console.error(`Invalid match data structure for game ${gameID} - no state object:`, 
                   JSON.stringify(Object.keys(matchData), null, 2));
      return;
    }
    
    // Skip processing if the game data is still invalid after extraction
    if (!players || !state || !state.G || !state.ctx) {
      console.error(`Missing critical game state components for ${gameID}`);
      return;
    }
    
    // Get the winner from various possible sources
    const G = state.G;
    const ctx = state.ctx;
    
    // Determine winner - check multiple sources
    let winnerRole = ctx.gameover?.winner || G.winner || null;
    console.log(`Found winner role: ${winnerRole || 'none'}`);
    
    // If no winner but game is over, it might be abandoned
    if (!winnerRole && (G.gameEnded || ctx.phase === 'gameOver' || G.gamePhase === 'gameOver')) {
      winnerRole = 'abandoned';
      console.log(`Game ended without explicit winner, marking as abandoned`);
    }
    
    // Skip if no winner detected
    if (!winnerRole) {
      console.log(`Game ${gameID} has no detectable winner, skipping processing`);
      return;
    }
    
    // Find winner player ID (if not abandoned)
    let winnerKey;
    let winnerId = 'abandoned';
    
    console.log(`Player data for winner detection:`, JSON.stringify(Object.keys(players)));
    
    if (winnerRole !== 'abandoned') {
      // Extract player keys and log roles for debugging
      const playerKeys = Object.keys(players);
      playerKeys.forEach(key => {
        console.log(`Player ${key} has role: ${players[key].role || 'unknown'}`);
      });
      
      winnerKey = playerKeys.find(key => {
        const player = players[key];
        return player.role === winnerRole;
      });
      
      if (!winnerKey) {
        console.error(`Winner role ${winnerRole} not found in players for game ${gameID}`);
        return;
      }
      
      winnerId = players[winnerKey].id || winnerKey;
      console.log(`Winner identified: Player ${winnerKey} (ID: ${winnerId}) with role ${winnerRole}`);
    }
    
    // Get game mode from setup data
    const gameMode = G.setupData?.gameMode || G.gameMode || 'standard';
    
    // Check if we have UUID mapping information in the metadata
    const playerUuidMap: Record<string, string> = {};
    if (matchData.metadata && matchData.metadata.credentials) {
      // Try to extract real UUIDs from metadata credentials
      Object.entries(matchData.metadata.credentials).forEach(([playerId, credentials]: [string, any]) => {
        // If this is a JWT token, it might contain the user's UUID
        if (typeof credentials === 'string' && credentials.startsWith('ey')) {
          // We have a JWT token - this could contain user UUID but we can't decode it here
          console.log(`Found JWT credentials for player ${playerId}`); 
        }
      });
    }
    
    // Map player data ensuring we have valid IDs
    const playerData = Object.keys(players).map(key => {
      const player = players[key];
      let playerId = player.id || key;
      
      // Check if this is likely a development/test player ID (numeric)
      const isDevPlayerId = /^\d+$/.test(playerId);
      if (isDevPlayerId) {
        console.log(`WARNING: Using unmapped player ID: ${playerId} - this may cause foreign key errors in backend`);
      }
      
      return {
        id: playerId,
        name: player.name || `Player ${key}`, // Use Player N as fallback if name is missing
        role: player.role || 'unknown' // Use unknown as fallback if role is missing
      };
    });
    
    console.log(`Mapped player data:`, JSON.stringify(playerData));
    
    // Calculate start and end times
    const endTime = new Date();
    const gameDuration = Math.floor((endTime.getTime() - new Date(startTime).getTime()) / 1000); // in seconds
    
    // ✅ FIX: Add debugging and handle abandoned games properly
    console.log('🔍 GAME RESULT DEBUG:');
    console.log('   - winnerId:', winnerId);
    console.log('   - winnerRole:', winnerRole);
    console.log('   - isAbandoned:', winnerRole === 'abandoned');
    
    // Prepare game result data - updated to match the new structure expected by the backend
    const gameResult: GameResultData = {
      gameId: gameID,
      winner: winnerRole === 'abandoned' ? null : {
        id: winnerId,
        role: winnerRole
      },
      players: playerData,
      turnCount: G.turnNumber || 0,
      startTime: startTime,
      endTime: endTime,
      actions: G.actions || [],
      gameMode,
      abandonReason: winnerRole === 'abandoned' ? 'players_disconnected' : undefined
    };
    
    console.log('🔍 Final winner object being sent:', JSON.stringify(gameResult.winner, null, 2));
    
    // Create game history data
    const gameHistory: GameHistoryData = {
      gameId: gameID,
      players: playerData,
      turns: (G.actionLog || []).map((log: any) => ({
        turnNumber: log.turnNumber || 0,
        playerId: log.playerId || 'unknown',
        action: log.actionType || 'unknown',
        timestamp: log.timestamp || new Date()
      })),
      gameMode,
      startTime: startTime,
      endTime: endTime
    };
    
    // Create ELO rating update data
    const ratingData: EloRatingUpdateData = {
      gameId: gameID,
      gameMode,
      players: playerData.map(player => ({
        id: player.id,
        isWinner: winnerRole === 'abandoned' ? false : player.role === winnerRole,
        role: player.role
      }))
    };
    
    console.log(`✨ Sending game end data to backend for game ${gameID}:`);
    console.log(`- Winner: ${winnerRole}${winnerRole !== 'abandoned' ? ` (Player ID: ${winnerId})` : ''}`);
    console.log(`- Game Mode: ${gameMode}`);
    console.log(`- Duration: ${gameDuration} seconds`);
    console.log(`- Players: ${playerData.map(p => `${p.name} (${p.role})`).join(', ')}`);
    
    // Use secure server-to-server communication to record game data
    // Send requests sequentially to avoid overwhelming the backend
    try {
      console.log(`📊 Sending game results to backend...`);
      const resultsSaved = await sendGameResults(gameResult);
      console.log(`Game results response:`, resultsSaved);
      
      console.log(`📜 Sending game history to backend...`);
      const historySaved = await recordGameHistory(gameHistory);
      console.log(`Game history response:`, historySaved);
      
      console.log(`🏆 Updating player ratings...`);
      const ratingsUpdated = await updatePlayerRatings(ratingData);
      console.log(`Rating update response:`, ratingsUpdated);
      
      console.log(`✅ Game ${gameID} processing completed:\n- Results saved: ${resultsSaved}\n- History saved: ${historySaved}\n- Ratings updated: ${ratingsUpdated}`);
    } catch (apiError) {
      console.error(`Backend API communication error:`, apiError);
    }
  } catch (error) {
    console.error(`Failed to process game end for ${gameID}:`, error);
  }
};

// Lobby lifecycle hooks are now added directly in the lobbyConfig object

// ...
// Set up server options
const serverConfig = { port: PORT };

// Before starting, add server hostname configurations
// Note: boardgame.io doesn't directly support setting the host in run(),
// but we'll log the bind address for clarity

// Initialize the lobby cleanup service
const lobbyCleanupService = new LobbyCleanupService(server);

// Function to check if all players have disconnected and mark the game as abandoned
const checkAndHandleAbandonment = async (matchID: string) => {
  if (!server.db) return;
  
  try {
    // Get match data
    const match = await server.db.fetch(matchID, { state: true, metadata: true });
    if (!match) return;

    // Check if any players are still connected
    const metadata = match.metadata;
    let anyPlayersConnected = false;
    
    if (metadata?.players) {
      // Convert players object to array to check connections
      const playerEntries = Object.entries(metadata.players);
      anyPlayersConnected = playerEntries.some(([_, player]) => {
        return player && typeof player === 'object' && (player as any).isConnected;
      });
    }
    
    if (!anyPlayersConnected) {
      console.log(`All players disconnected from match ${matchID}, marking as abandoned and removing immediately`);
      
      // Get the current game state
      const currentState = match.state;
      if (!currentState || !currentState.G) return;
      
      // Set the game as abandoned
      const updatedG = {
        ...currentState.G,
        gamePhase: 'gameOver',
        gameEnded: true,
        winner: 'abandoned',
        message: 'Game abandoned due to all players disconnecting'
      };
      
      // Update the game state with the complete state structure
      await server.db.setState(matchID, {
        ...currentState,
        G: updatedG
      });
      
      // Immediately remove the abandoned game
      await lobbyCleanupService.removeAbandonedGame(matchID);
    }
  } catch (error) {
    console.error(`Error checking abandonment for match ${matchID}:`, error);
  }
};

// Instead of trying to listen to socket events directly, we'll implement a function to
// regularly check for games with all players disconnected and mark them as abandoned
const checkAllGamesForDisconnections = async () => {
  if (!server.db) return;
  
  try {
    // Get all active matches
    const matches = await server.db.listMatches();
    
    for (const matchID of matches) {
      try {
        // Check each match's metadata for player connections
        const match = await server.db.fetch(matchID, { metadata: true, state: true });
        
        if (!match || !match.state || !match.metadata) continue;
        
        // Get player metadata
        const metadata = match.metadata;
        
        // Skip games that are already marked as abandoned
        const gameState = match.state.G;
        if (gameState && gameState.winner === 'abandoned') continue;
        
        // Check all players' connection status
        let anyRealPlayersConnected = false;
        let atLeastOneRealPlayer = false;
        let hostConnected = false;
        let connectedPlayerIds: string[] = [];
        
        if (metadata.players) {
          const playerEntries = Object.entries(metadata.players);
          
          // Check each player
          for (const [playerId, player] of playerEntries) {
            if (player && typeof player === 'object') {
              const hasName = !!(player as any).name;
              const isConnected = !!(player as any).isConnected;
              
              // Check if this is the host (player 0)
              if (playerId === '0') {
                hostConnected = hasName && isConnected;
              }
              
              if (hasName) {
                atLeastOneRealPlayer = true;
                
                if (isConnected) {
                  anyRealPlayersConnected = true;
                  connectedPlayerIds.push(playerId);
                }
              }
            }
          }
          
          // Handle host transfer if host is disconnected but other players remain
          if (!hostConnected && anyRealPlayersConnected && connectedPlayerIds.length > 0) {
            console.log(`Host disconnected from match ${matchID}, transferring host role to another player`);
            
            // Get the next connected player to make host
            const newHostId = connectedPlayerIds[0];
            
            if (newHostId && newHostId !== '0' && metadata.players && (metadata.players as Record<string, any>)[newHostId]) {
              try {
                // Get the current player data
                const players = metadata.players as Record<string, any>;
                const currentHostData = players['0'] || {};
                const newHostData = players[newHostId] || {};
                
                // Transfer host data to player 0 slot
                players['0'] = {
                  ...newHostData,
                  id: 0 // Ensure correct ID
                };
                
                // Move original host data to the other player slot
                players[newHostId] = {
                  ...currentHostData,
                  id: parseInt(newHostId) // Ensure correct ID
                };
                
                // Update game metadata with the new host assignment
                await server.db.setMetadata(matchID, metadata);
                
                console.log(`Successfully transferred host from player 0 to player ${newHostId} in match ${matchID}`);
                
                // Since we transferred the host, we don't need to mark as abandoned
                hostConnected = true;
              } catch (error) {
                console.error(`Failed to transfer host for match ${matchID}:`, error);
              }
            }
          }
        }
        
        // Get the creation time of the match from metadata
        const creationTime = metadata?.createdAt ? new Date(metadata.createdAt).getTime() : 0;
        const now = Date.now();
        const matchAge = now - creationTime;
        
        // Don't mark games as abandoned if they're less than 60 seconds old
        // This gives players time to properly connect to new games
        const NEW_GAME_GRACE_PERIOD = 60000; // 60 seconds
        
        // Only mark as abandoned if there were real players, none are connected, and the game isn't brand new
        if (atLeastOneRealPlayer && !anyRealPlayersConnected && match.state && matchAge > NEW_GAME_GRACE_PERIOD) {
          console.log(`All players disconnected from match ${matchID} (age: ${Math.round(matchAge/1000)}s), marking as abandoned`);
          
          // Update the game state to be abandoned
          const updatedG = {
            ...match.state.G,
            gamePhase: 'gameOver',
            gameEnded: true,
            winner: 'abandoned',
            message: 'Game abandoned due to all players disconnecting'
          };
          
          // Update the state
          await server.db.setState(matchID, {
            ...match.state,
            G: updatedG
          });
        } else if (atLeastOneRealPlayer && !anyRealPlayersConnected && match.state && matchAge <= NEW_GAME_GRACE_PERIOD) {
          console.log(`Skipping abandonment check for new match ${matchID} (age: ${Math.round(matchAge/1000)}s < ${NEW_GAME_GRACE_PERIOD/1000}s grace period)`);
        }
      } catch (error) {
        console.error(`Error checking disconnections for match ${matchID}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking games for disconnections:', error);
  }
};

// Run disconnection check frequently (every 10 seconds)
setInterval(checkAllGamesForDisconnections, 10000);

// Configure the cleanup service to run frequently (every 10 seconds)
lobbyCleanupService.setCleanupInterval(10000); // 10 seconds

// Set a 30-second grace period for abandoned games
// This allows players to see that a game was abandoned before it disappears
lobbyCleanupService.setAbandonedGameTTL(30000); // 30 seconds grace period

// Set a 5-minute TTL for inactive games (games with no connected players)
// This ensures lobbies don't accumulate indefinitely
lobbyCleanupService.setInactiveGameTTL(5 * 60 * 1000); // 5 minutes

// Start the server
server.run(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
  console.log(`Server bound to ${HOST === '0.0.0.0' ? 'all network interfaces' : HOST}`);
  console.log(`Public URL for connections: ${PUBLIC_URL}`);
  
  // Start the lobby cleanup service (for periodic cleanup of any games missed by immediate removal)
  lobbyCleanupService.start();
  console.log('Lobby management active - abandoned games will be immediately removed');
  
  // Set up game over monitoring
  startGameOverMonitoring();
  console.log('Game over monitoring active - completed games will be sent to backend server');
});

// Define types for boardgame.io server match data
type ServerMatchData = any; // Using any because boardgame.io's exact server types are complex

// Function to check all active games for completion and send results to backend
const startGameOverMonitoring = () => {
  if (!server.db) {
    console.error('Cannot start game monitoring - database not initialized');
    return;
  }
  
  // Check every 3 seconds for completed games that need to be processed
  const MONITOR_INTERVAL = 3000; // 3 seconds
  const processedGames = new Set<string>(); // Keep track of games we've already processed
  
  const gameOverMonitoringInterval = setInterval(async () => {
    try {
      // Get list of all matches
      const matches = await server.db.listMatches();
      if (!matches || !matches.length) return;
      
      console.log(`DEBUG: Checking ${matches.length} games for completion status...`);
      
      // For each match, check if it's in a game over state
      for (const matchID of matches) {
        // Skip if we've already processed this game
        if (processedGames.has(matchID)) {
          console.log(`DEBUG: Skipping already processed game ${matchID}`);
          continue;
        }
        
        console.log(`DEBUG: Examining game ${matchID}...`);
        
        try {
          // Fetch the match with all data (using fetch with more specific options)
          const matchData = await server.db.fetch(matchID, { state: true }) as ServerMatchData;
          
          // Validate match data
          if (!matchData) {
            console.log(`DEBUG: No match data found for ${matchID}`);
            continue;
          }
          
          if (!matchData.state) {
            console.log(`DEBUG: No state data found for match ${matchID}`);
            continue;
          }
          
          // Access game state
          const { state } = matchData;
          if (!state.G || !state.ctx) {
            console.log(`DEBUG: Invalid state structure for ${matchID}`);
            continue;
          }
          
          // Extract game state components
          const G = state.G;
          const ctx = state.ctx;
          
          console.log(`DEBUG: Game state for ${matchID}:`);
          console.log(`- Game Phase: ${ctx.phase || 'unknown'}`);
          console.log(`- G.gamePhase: ${G.gamePhase || 'unknown'}`);
          console.log(`- G.winner: ${G.winner || 'none'}`);
          console.log(`- ctx.gameover: ${ctx.gameover ? JSON.stringify(ctx.gameover) : 'none'}`);
          console.log(`- G.gameEnded: ${G.gameEnded ? 'true' : 'false'}`);
          
          // Check if the game is in a completed state
          // We check multiple indicators since different game end conditions might set different flags
          const isGameOver = (
            ctx.phase === 'gameOver' || 
            G.gamePhase === 'gameOver' ||
            ctx.gameover !== undefined ||
            G.winner !== undefined ||
            G.gameEnded === true
          );

          console.log(`DEBUG: Game ${matchID} completed: ${isGameOver ? 'YES' : 'NO'}`);

          if (isGameOver) {
            console.log(`🎮 GAME OVER DETECTED for ${matchID}!`);
            console.log(`👑 Winner: ${ctx.gameover?.winner || G.winner || 'unknown'}`);
            
            // Fetch full match data including metadata for processing
            const fullMatchData = await server.db.fetch(matchID, { state: true, metadata: true });
            
            // Process the game end
            await handleGameEnd(matchID, fullMatchData || matchData);
            
            // Immediately remove the completed game (winner or abandoned)
            if (lobbyCleanupService) {
              await lobbyCleanupService.removeCompletedGame(matchID);
            }
            
            // Mark the game as processed
            processedGames.add(matchID);
            console.log(`DEBUG: Marked game ${matchID} as processed`);
            
            // Set timeout to remove from processed set after some time
            // This ensures we don't accumulate memory over time
            setTimeout(() => {
              processedGames.delete(matchID);
              console.log(`DEBUG: Removed game ${matchID} from processed set`);
            }, 60 * 60 * 1000); // 1 hour
          }
        } catch (error) {
          console.error(`Error processing match ${matchID}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in game over monitoring:', error);
    }
  }, MONITOR_INTERVAL);
  
  console.log(`🔍 Game monitoring started - checking for completed games every ${3000/1000} seconds`);
  
  // Immediate first check
  setTimeout(async () => {
    console.log('Running immediate first check for any completed games...');
    try {
      const matches = await server.db.listMatches();
      console.log(`Found ${matches?.length || 0} games on initial check`);
    } catch (error) {
      console.error('Error in immediate game check:', error);
    }
  }, 1000);
};

// Export handlers for external use
export const processGameEnd = handleGameEnd;
