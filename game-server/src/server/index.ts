import { Server, Origins } from 'boardgame.io/server';
import { Game, Ctx, FnContext } from 'boardgame.io';
import cors from '@koa/cors';
import DarknetDuel from '../game/DarknetDuel';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { sendGameResults, recordGameHistory, updatePlayerRatings, GameResultData, GameHistoryData, EloRatingUpdateData, serverToServerRequest } from './serverAuth';
import bodyParser from 'koa-bodyparser';
import { LobbyCleanupService } from '../services/lobbyCleanupService';
import { GameState } from 'shared-types/game.types';
import cardDataRouter from './cardDataRoutes';
import { HeartbeatManager } from './heartbeat';

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

// Initialize heartbeat manager
const heartbeatManager = new HeartbeatManager(server);

// Configure server to use lobby
if (server.db) {
  console.log('Database initialized for matchmaking');
}

// ✅ Set up lobby hooks to capture real user data
// This captures player data when they join lobbies
server.router.use(async (ctx, next) => {
  // Intercept lobby creation to validate lobbyName length (blank allowed) AFTER creation
  // This avoids consuming the request stream (which boardgame.io also reads)
  if (ctx.request.path.includes('/games/darknet-duel/') &&
      ctx.request.path.endsWith('/create') &&
      ctx.request.method === 'POST') {
    await next();
    try {
      const created: any = ctx.body;
      const matchID: string | undefined = created?.matchID;
      if (matchID && server.db) {
        const match = await server.db.fetch(matchID, { metadata: true });
        const setupData = (match as any)?.setupData || {};
        const lobbyNameRaw = (setupData.lobbyName ?? '').toString();
        const trimmed = lobbyNameRaw.trim();
        if (trimmed && (trimmed.length < 3 || trimmed.length > 50)) {
          // Invalid name: wipe the match and return error
          await server.db.wipe(matchID);
          ctx.status = 400;
          ctx.body = { error: 'Lobby name must be 3-50 characters or left blank' };
          return;
        }
      }
    } catch (e) {
      console.error('Error validating lobby after creation:', e);
    }
    return; // We've already called next() above
  }
  // Intercept lobby join requests to validate and capture real user data
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
          const userIdCounts: Record<string, number> = {};
          
          Object.entries(matchData.metadata.players).forEach(([playerId, playerMeta]: [string, any]) => {
            if (playerMeta && playerMeta.data && playerMeta.data.realUserId && playerMeta.data.realUsername) {
              const userId = playerMeta.data.realUserId;
              
              // Track how many times each user ID appears
              userIdCounts[userId] = (userIdCounts[userId] || 0) + 1;
              
              realUserMap[playerId] = {
                id: userId,
                name: playerMeta.data.realUsername
              };
              console.log(`✅ Found real user data for player ${playerId}: ${playerMeta.data.realUsername} (${userId})`);
            }
          });
          
          // ✅ VALIDATION: Check if the same user joined twice
          const duplicateUserIds = Object.entries(userIdCounts).filter(([_, count]) => count > 1);
          if (duplicateUserIds.length > 0) {
            console.log(`❌ Detected duplicate user in lobby ${matchID}:`, duplicateUserIds);
            
            // Find the player who just joined (the one with the highest player ID with this user ID)
            const duplicateUserId = duplicateUserIds[0][0];
            const playersWithDuplicateId = Object.entries(matchData.metadata.players)
              .filter(([_, playerMeta]: [string, any]) => 
                playerMeta?.data?.realUserId === duplicateUserId
              )
              .map(([playerId]) => playerId);
            
            if (playersWithDuplicateId.length > 1) {
              // Remove the player with the higher ID (the one who just joined)
              const playerToRemove = playersWithDuplicateId.sort().pop();
              
              if (playerToRemove) {
                console.log(`🚫 Removing duplicate player ${playerToRemove} from lobby ${matchID}`);
                
                // Update metadata to remove the duplicate player
                const updatedPlayers = { ...matchData.metadata.players };
                delete updatedPlayers[playerToRemove];
                
                const updatedMetadata = {
                  ...matchData.metadata,
                  players: updatedPlayers
                };
                
                await server.db.setMetadata(matchID, updatedMetadata);
                
                // Return error to the client
                ctx.status = 403;
                ctx.body = { error: 'You cannot join your own lobby' };
                return;
              }
            }
          }
          
          // If we have real user data and the game state exists, update the player objects
          if (Object.keys(realUserMap).length > 0 && matchData.state.G) {
            let stateUpdated = false;
            const gameState = matchData.state.G;
            
            // Create a new game state with updated player data
            const newGameState = { ...gameState };
            
            // ✅ FIXED: Update attacker with both BoardGame.io ID and UUID
            if (realUserMap['0'] && gameState.attacker) {
              newGameState.attacker = {
                ...gameState.attacker,
                id: '0', // ← Keep BoardGame.io ID for game logic
                uuid: realUserMap['0'].id, // ← Add real UUID for server operations
                name: realUserMap['0'].name
              };
              console.log(`✅ Updated attacker: ${newGameState.attacker.name} (ID: ${newGameState.attacker.id}, UUID: ${newGameState.attacker.uuid})`);
              stateUpdated = true;
            }
            
            // ✅ FIXED: Update defender with both BoardGame.io ID and UUID  
            if (realUserMap['1'] && gameState.defender) {
              newGameState.defender = {
                ...gameState.defender,
                id: '1', // ← Keep BoardGame.io ID for game logic
                uuid: realUserMap['1'].id, // ← Add real UUID for server operations
                name: realUserMap['1'].name
              };
              console.log(`✅ Updated defender: ${newGameState.defender.name} (ID: ${newGameState.defender.id}, UUID: ${newGameState.defender.uuid})`);
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
                    
                    // Update and sanitize the player data to free the slot
                    updatedPlayers[playerID] = {
                      id: updatedPlayers[playerID].id,
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

                    // If lobby has no connected players after this update, remove it immediately
                    try {
                      const latest = await server.db.fetch(id, { metadata: true });
                      const latestPlayers: Record<string, any> = latest?.metadata?.players || {};
                      const anyPresent = Object.keys(latestPlayers).length > 0;
                      // Consider a player connected unless explicitly marked left or isConnected === false
                      const hasConnected = Object.values(latestPlayers).some((p: any) => p && p.left !== true && p.isConnected !== false);
                      // Only remove if ALL players are explicitly left or disconnected
                      const allLeftOrDisconnected = anyPresent && Object.values(latestPlayers).every((p: any) => p && (p.left === true || p.isConnected === false));

                      if (!hasConnected && allLeftOrDisconnected) {
                        console.log(`No connected players remain in match ${id}. Removing lobby immediately.`);
                        await server.db.wipe(id);
                      }
                    } catch (wipeErr) {
                      console.error(`Failed to immediately remove empty lobby ${id}:`, wipeErr);
                    }
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
  
  // ============================================
  // Custom endpoint for ATOMIC player position swap
  // This swaps ALL data between player 0 and player 1
  // ============================================
  server.router.post('/games/:name/:id/swap-positions', parseJsonBody, async (ctx) => {
    const { name, id } = ctx.params;
    const { playerID, credentials } = ctx.request.body as { playerID: string; credentials: string };
    
    console.log(`🔄 POSITION SWAP request for match ${id} from player ${playerID}`);
    
    try {
      // Fetch current match data with BOTH metadata and state
      const matchData = await server.db.fetch(id, { metadata: true, state: true });
      
      if (!matchData || !matchData.metadata) {
        ctx.status = 404;
        ctx.body = { error: 'Match not found' };
        return;
      }
      
      const metadata = matchData.metadata;
      
      // Verify requesting player credentials
      if (!metadata.players?.[playerID] || metadata.players[playerID].credentials !== credentials) {
        ctx.status = 403;
        ctx.body = { error: 'Invalid credentials' };
        return;
      }
      
      // Get both players
      const player0 = metadata.players['0'];
      const player1 = metadata.players['1'];
      
      if (!player0 || !player1 || !player0.name || !player1.name) {
        ctx.status = 400;
        ctx.body = { error: 'Both players must be present to swap positions' };
        return;
      }
      
      // Check if the OTHER player has requested the swap
      const otherPlayerId = playerID === '0' ? '1' : '0';
      const otherPlayer = metadata.players[otherPlayerId];
      
      console.log(`🔍 Swap validation:`);
      console.log(`   - Requesting player: ${playerID}`);
      console.log(`   - Requesting player swapAccepted: ${player0.id === parseInt(playerID) ? player0.data?.swapAccepted : player1.data?.swapAccepted}`);
      console.log(`   - Other player: ${otherPlayerId}`);
      console.log(`   - Other player swapRequested: ${otherPlayer.data?.swapRequested}`);
      
      // The accepting player calls this endpoint after setting swapAccepted=true
      // We need to verify the OTHER player has swapRequested=true
      if (!otherPlayer.data?.swapRequested) {
        ctx.status = 400;
        ctx.body = { error: 'Other player must request swap first' };
        return;
      }
      
      console.log(`✅ Both players agreed to swap. Swapping positions...`);
      
      // ============================================
      // ATOMIC SWAP: Exchange ALL player data
      // ============================================
      
      // Store player credentials - these will ALSO be swapped
      const player0OldCredentials = player0.credentials;
      const player1OldCredentials = player1.credentials;
      
      // Create swapped player objects
      // Player 0 gets player 1's data AND credentials
      // Player 1 gets player 0's data AND credentials
      const swappedPlayer0 = {
        id: 0,
        name: player1.name,
        credentials: player1OldCredentials, // ✅ Swap credentials with the player!
        data: {
          ...(player1.data || {}),
          swapAccepted: false, // Clear swap flags
          swapRequested: false,
          isReady: false // Reset ready status after swap
        },
        isConnected: player1.isConnected
      };
      
      const swappedPlayer1 = {
        id: 1,
        name: player0.name,
        credentials: player0OldCredentials, // ✅ Swap credentials with the player!
        data: {
          ...(player0.data || {}),
          swapAccepted: false, // Clear swap flags
          swapRequested: false,
          isReady: false // Reset ready status after swap
        },
        isConnected: player0.isConnected
      };
      
      // Update metadata with swapped players
      const updatedMetadata = {
        ...metadata,
        players: {
          '0': swappedPlayer0,
          '1': swappedPlayer1
        },
        updatedAt: Date.now()
      };
      
      await server.db.setMetadata(id, updatedMetadata);
      
      // ============================================
      // Update game state if it exists
      // ============================================
      if (matchData.state && matchData.state.G) {
        const gameState = matchData.state.G;
        
        // Update playerUuidMap if it exists
        if (gameState.playerUuidMap) {
          const oldPlayer0Uuid = gameState.playerUuidMap['0'];
          const oldPlayer1Uuid = gameState.playerUuidMap['1'];
          
          if (oldPlayer0Uuid && oldPlayer1Uuid) {
            gameState.playerUuidMap = {
              '0': oldPlayer1Uuid,
              '1': oldPlayer0Uuid
            };
            console.log('✅ Updated playerUuidMap in game state');
          }
        }
        
        // Save updated game state
        await server.db.setState(id, matchData.state);
      }
      
      // ============================================
      // Return swap confirmation
      // ============================================
      
      const swapResult = {
        success: true,
        swapped: true,
        // Tell each client what their NEW player ID is
        newPlayerIdFor: {
          [player0OldCredentials]: '1', // Player 0's connection is now player 1
          [player1OldCredentials]: '0'  // Player 1's connection is now player 0
        }
      };
      
      console.log(`✅ Position swap complete for match ${id}`);
      console.log(`   - ${swappedPlayer1.name} (was player 0) → now player 1 (DEFENDER)`);
      console.log(`   - ${swappedPlayer0.name} (was player 1) → now player 0 (ATTACKER)`);
      
      ctx.status = 200;
      ctx.body = swapResult;
      
    } catch (error) {
      console.error('❌ Error swapping positions:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to swap positions' };
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

// Heartbeat endpoint with body parser middleware
const parseJsonBody = bodyParser();
router.post('/heartbeat', parseJsonBody, async (ctx: any) => {
  try {
    const { matchID, playerID, timestamp } = ctx.request.body;
    
    if (!matchID || !playerID || !timestamp) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: matchID, playerID, timestamp' };
      return;
    }

    // Update heartbeat for the player
    const playerHeartbeat = heartbeatManager.updateHeartbeat(matchID, playerID, timestamp);
    
    // Get opponent heartbeat status
    const opponentHeartbeat = heartbeatManager.getOpponentHeartbeat(matchID, playerID);
    
    // Check for disconnection detection (immediate check)
    await heartbeatManager.checkDisconnectionForfeit(matchID);
    
    // Check for inactivity-based forfeit
    await heartbeatManager.checkInactivityForfeit(matchID);
    
    ctx.body = {
      success: true,
      playerStatus: {
        isConnected: playerHeartbeat.isConnected,
        latency: playerHeartbeat.latency,
        lastHeartbeat: playerHeartbeat.lastHeartbeat,
        reconnectAttempts: 0
      },
      opponentStatus: opponentHeartbeat ? {
        isConnected: heartbeatManager.isPlayerConnected(matchID, opponentHeartbeat.playerID),
        latency: opponentHeartbeat.latency,
        lastHeartbeat: opponentHeartbeat.lastHeartbeat,
        reconnectAttempts: 0
      } : {
        isConnected: false,
        latency: 0,
        lastHeartbeat: 0,
        reconnectAttempts: 0
      }
    };
  } catch (error) {
    console.error('Error handling heartbeat:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
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
        // ✅ FIXED: Prefer UUID from game state, fallback to real player data, last resort to BoardGame.io ID
        players = {
          '0': realPlayerData['0'] || {
            id: state.G.attacker.uuid || state.G.attacker.id || '0', // ← Try UUID first!
            name: state.G.attacker.name || 'Attacker',
            role: 'attacker'
          },
          '1': realPlayerData['1'] || {
            id: state.G.defender.uuid || state.G.defender.id || '1', // ← Try UUID first!
            name: state.G.defender.name || 'Defender',
            role: 'defender'
          }
        };
        console.log(`Using game-specific player structure with UUID priority`);
        console.log(`Player 0 ID: ${players['0'].id} (from ${state.G.attacker.uuid ? 'game state UUID' : state.G.attacker.id === '0' ? 'BoardGame.io ID' : 'game state ID'})`);
        console.log(`Player 1 ID: ${players['1'].id} (from ${state.G.defender.uuid ? 'game state UUID' : state.G.defender.id === '1' ? 'BoardGame.io ID' : 'game state ID'})`);
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
      
      // ✅ FIXED: Check if we have a UUID vs BoardGame.io ID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(playerId);
      const isDevPlayerId = /^\d+$/.test(playerId);
      
      if (isUuid) {
        console.log(`✅ Using UUID for player ${key}: ${playerId}`);
      } else if (isDevPlayerId) {
        console.log(`⚠️ Using development/test player ID: ${playerId} - this may cause foreign key errors in backend`);
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

      // Award creds to winner and loser (if not abandoned)
      if (winnerRole !== 'abandoned') {
        for (const player of playerData) {
          const isWinner = player.role === winnerRole;
          const creds = isWinner ? 10 : 5;
          try {
            const resp = await serverToServerRequest(
              '/currency/add',
              'POST',
              {
                userId: player.id,
                type: 'creds',
                amount: creds,
                reason: isWinner ? 'Match victory' : 'Match participation'
              }
            );
            console.log(`💰 Awarded ${creds} creds to ${player.name} (${player.id}) [${isWinner ? 'WINNER' : 'LOSER'}]:`, resp);
          } catch (err) {
            console.error(`❌ Failed to award creds to ${player.name} (${player.id}):`, err);
          }
        }
      } else {
        console.log('No creds awarded: game was abandoned.');
      }

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




// Configure the cleanup service to run frequently (every 10 seconds)
lobbyCleanupService.setCleanupInterval(10000); // 10 seconds

// Remove abandoned games immediately (no grace period)
lobbyCleanupService.setAbandonedGameTTL(0);

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

// Processing state tracker to prevent race conditions
interface ProcessingState {
  matchID: string;
  startedAt: number;
  status: 'processing' | 'completed' | 'failed';
}

// Function to check all active games for completion and send results to backend
const startGameOverMonitoring = () => {
  if (!server.db) {
    console.error('Cannot start game monitoring - database not initialized');
    return;
  }
  
  // Check every 3 seconds for completed games that need to be processed
  const MONITOR_INTERVAL = 3000; // 3 seconds
  const PROCESSING_TIMEOUT = 30000; // 30 seconds - mark as stale if processing takes longer
  
  // Track processing state with metadata (not just a Set)
  const processingStates = new Map<string, ProcessingState>();
  
  const gameOverMonitoringInterval = setInterval(async () => {
    try {
      // Clean up stale processing states (stuck for >30 seconds)
      const now = Date.now();
      for (const [matchID, state] of processingStates.entries()) {
        if (state.status === 'processing' && (now - state.startedAt) > PROCESSING_TIMEOUT) {
          console.warn(`⚠️ Game ${matchID} processing timed out after ${PROCESSING_TIMEOUT/1000}s - removing stale lock`);
          processingStates.delete(matchID);
        }
      }
      
      // Get list of all matches
      const matches = await server.db.listMatches();
      if (!matches || !matches.length) return;
      
      console.log(`🔍 Checking ${matches.length} games for completion status...`);
      
      // For each match, check if it's in a game over state
      for (const matchID of matches) {
        // ✅ ATOMIC CHECK: Skip if already being processed or completed
        const existingState = processingStates.get(matchID);
        if (existingState) {
          if (existingState.status === 'processing') {
            console.log(`⏳ Game ${matchID} is currently being processed (started ${((now - existingState.startedAt)/1000).toFixed(1)}s ago) - skipping`);
            continue;
          } else if (existingState.status === 'completed') {
            console.log(`✅ Game ${matchID} already processed successfully - skipping`);
            continue;
          }
          // If status is 'failed', we'll retry (don't skip)
        }
        
        try {
          // Fetch the match with all data (using fetch with more specific options)
          const matchData = await server.db.fetch(matchID, { state: true }) as ServerMatchData;
          
          // Validate match data
          if (!matchData) {
            continue;
          }
          
          if (!matchData.state) {
            continue;
          }
          
          // Access game state
          const { state } = matchData;
          if (!state.G || !state.ctx) {
            continue;
          }
          
          // Extract game state components
          const G = state.G;
          const ctx = state.ctx;
          
          // Check if the game is in a completed state
          const isGameOver = (
            ctx.phase === 'gameOver' || 
            G.gamePhase === 'gameOver' ||
            ctx.gameover !== undefined ||
            G.winner !== undefined ||
            G.gameEnded === true
          );

          if (isGameOver) {
            console.log(`🎮 GAME OVER DETECTED for ${matchID}!`);
            console.log(`👑 Winner: ${ctx.gameover?.winner || G.winner || 'unknown'}`);
            
            // ✅ ATOMIC LOCK: Mark as processing IMMEDIATELY before any async operations
            processingStates.set(matchID, {
              matchID,
              startedAt: Date.now(),
              status: 'processing'
            });
            
            console.log(`🔒 Locked game ${matchID} for processing`);
            
            try {
              // Fetch full match data including metadata for processing
              const fullMatchData = await server.db.fetch(matchID, { state: true, metadata: true });
              
              // Process the game end
              await handleGameEnd(matchID, fullMatchData || matchData);
              
              // Mark as completed BEFORE wiping (in case wipe fails)
              processingStates.set(matchID, {
                matchID,
                startedAt: processingStates.get(matchID)!.startedAt,
                status: 'completed'
              });
              
              // ✅ FIX: Delay game wipe to allow players to view winner screen and refresh
              // Players can stay on the winner screen for up to 10 minutes without the game restarting
              setTimeout(async () => {
                try {
                  await server.db.wipe(matchID);
                  console.log(`✅ Removed completed game ${matchID} from database (after 10 minute delay)`);
                } catch (wipeErr) {
                  console.error(`❌ Failed to wipe game ${matchID}:`, wipeErr);
                }
              }, 600000); // 10 minutes delay before wiping
              
              // Clean up from processing map after game is wiped (with delay)
              setTimeout(() => {
                processingStates.delete(matchID);
                console.log(`🧹 Cleaned up processing state for ${matchID}`);
              }, 610000); // Keep for 10 minutes + 10 seconds to ensure game is wiped first
              
            } catch (processingError) {
              // Mark as failed so it can be retried
              console.error(`❌ Failed to process game ${matchID}:`, processingError);
              processingStates.set(matchID, {
                matchID,
                startedAt: processingStates.get(matchID)!.startedAt,
                status: 'failed'
              });
              
              // Clean up failed state after a delay to allow retry
              setTimeout(() => {
                processingStates.delete(matchID);
                console.log(`🔄 Cleared failed state for ${matchID} - will retry on next check`);
              }, 30000); // Retry after 30 seconds
            }
          }
        } catch (error) {
          console.error(`Error examining match ${matchID}:`, error);
          // Don't mark as processing if we couldn't even examine it
        }
      }
    } catch (error) {
      console.error('Error in game over monitoring:', error);
    }
  }, MONITOR_INTERVAL);
  
  console.log(`🔍 Game monitoring started - checking for completed games every ${MONITOR_INTERVAL/1000} seconds`);
  console.log(`⏱️  Processing timeout set to ${PROCESSING_TIMEOUT/1000} seconds`);
};

// Export handlers for external use
export const processGameEnd = handleGameEnd;
