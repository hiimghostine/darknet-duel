/**
 * Lobby Socket Service
 * 
 * Handles WebSocket events for lobby system using Socket.io
 * Reuses existing authentication middleware from chat system
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket, Namespace } from 'socket.io';
import axios from 'axios';
import { LobbyManager } from './lobby-manager.service';
import { LobbyCleanupService } from './lobby-cleanup.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { LobbyVisibility } from '../types/lobby.types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export class LobbySocketService {
  private lobbyNamespace: Namespace;
  private lobbyManager: LobbyManager;
  private cleanupService: LobbyCleanupService;
  private sessionService: SessionService;
  private authService: AuthService;

  constructor(io: SocketIOServer) {
    this.lobbyManager = new LobbyManager();
    this.sessionService = new SessionService();
    this.authService = new AuthService();
    
    // Create /lobby namespace
    this.lobbyNamespace = io.of('/lobby');
    
    // Pass io to cleanup service so it can send warnings
    this.cleanupService = new LobbyCleanupService(this.lobbyManager, io);
    
    this.setupSocketHandlers();
    this.cleanupService.start();
    
    console.log('🎮 Lobby Socket.io service initialized on /lobby namespace');
  }

  private setupSocketHandlers() {
    // Authentication middleware (reuse from chat)
    this.lobbyNamespace.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          throw new Error('No token provided');
        }

        // Validate session token
        const userId = await this.sessionService.validateSession(token);
        if (!userId) {
          throw new Error('Invalid or expired session');
        }

        // Get user data
        const user = await this.authService.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }

        socket.userId = user.id;
        socket.username = user.username;
        
        console.log(`🔐 Lobby: User ${socket.username} (${socket.userId}) authenticated`);
        next();
      } catch (error) {
        console.error('❌ Lobby authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.lobbyNamespace.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`📡 Lobby: User ${socket.username} connected`);

      // Request public lobby list
      socket.on('lobbies:list:request', () => {
        const publicLobbies = this.lobbyManager.getPublicLobbies();
        socket.emit('lobbies:list', {
          lobbies: publicLobbies.map(lobby => this.lobbyManager.serializeLobby(lobby))
        });
      });

      // Create lobby
      socket.on('lobby:create', async (data: {
        name: string;
        visibility: 'public' | 'private';
        maxPlayers: number;
        gameSettings: {
          gameMode: 'standard' | 'blitz' | 'custom';
          initialResources: number;
          maxTurns: number;
        };
      }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          // Validate input
          if (data.name && (data.name.length < 3 || data.name.length > 50)) {
            socket.emit('lobby:error', { error: 'Lobby name must be 3-50 characters or empty' });
            return;
          }

          if (data.maxPlayers < 2 || data.maxPlayers > 8) {
            socket.emit('lobby:error', { error: 'Max players must be between 2 and 8' });
            return;
          }

          const lobby = await this.lobbyManager.createLobby({
            name: data.name || 'Unnamed Lobby',
            visibility: data.visibility === 'private' ? LobbyVisibility.PRIVATE : LobbyVisibility.PUBLIC,
            maxPlayers: data.maxPlayers,
            createdBy: socket.userId,
            gameSettings: data.gameSettings
          });

          // Auto-join creator to lobby
          const joinResult = await this.lobbyManager.joinLobby(
            lobby.lobbyId,
            socket.userId,
            socket.username!,
            socket.id
          );

          if (joinResult.allowed && joinResult.lobby) {
            // Join socket room
            socket.join(`lobby:${lobby.lobbyId}`);

            // Send lobby data to creator
            socket.emit('lobby:created', {
              lobby: this.lobbyManager.serializeLobby(joinResult.lobby)
            });

            // Broadcast updated public lobby list if this is a public lobby
            if (lobby.visibility === LobbyVisibility.PUBLIC) {
              console.log('📡 Broadcasting public lobby list after creation');
              this.broadcastPublicLobbies();
            }

            console.log(`✅ Lobby ${lobby.lobbyId} created and joined by ${socket.username}`);
          } else {
            socket.emit('lobby:error', { error: 'Failed to join created lobby' });
          }
        } catch (error) {
          console.error('❌ Error creating lobby:', error);
          socket.emit('lobby:error', { error: 'Failed to create lobby' });
        }
      });

      // Join lobby (by ID or code)
      socket.on('lobby:join', async (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          let { lobbyId } = data;
          
          // Try to find lobby by code if not found by ID
          let lobby = this.lobbyManager.getLobby(lobbyId);
          if (!lobby) {
            lobby = this.lobbyManager.getLobbyByCode(lobbyId);
            if (lobby) {
              lobbyId = lobby.lobbyId;
              console.log(`🔍 Found lobby by code: ${data.lobbyId} → ${lobbyId}`);
            }
          }

          const joinResult = await this.lobbyManager.joinLobby(
            lobbyId,
            socket.userId,
            socket.username!,
            socket.id
          );

          if (!joinResult.allowed) {
            socket.emit('lobby:join:error', { error: joinResult.reason });
            return;
          }

          if (joinResult.lobby) {
            // Join socket room
            socket.join(`lobby:${lobbyId}`);

            // Send lobby data to joiner
            socket.emit('lobby:joined', {
              lobby: this.lobbyManager.serializeLobby(joinResult.lobby)
            });

            // Broadcast to others in lobby
            socket.to(`lobby:${lobbyId}`).emit('lobby:player:joined', {
              userId: socket.userId,
              username: socket.username
            });

            // Broadcast updated lobby state to all
            this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
              lobby: this.lobbyManager.serializeLobby(joinResult.lobby)
            });

            // Broadcast updated public lobby list if this is a public lobby
            if (joinResult.lobby.visibility === LobbyVisibility.PUBLIC) {
              console.log('📡 Broadcasting public lobby list after join');
              this.broadcastPublicLobbies();
            }

            console.log(`✅ ${socket.username} joined lobby ${lobbyId}`);
          }
        } catch (error) {
          console.error('❌ Error joining lobby:', error);
          socket.emit('lobby:error', { error: 'Failed to join lobby' });
        }
      });

      // Leave lobby
      socket.on('lobby:leave', async (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);

          if (!lobby) {
            socket.emit('lobby:error', { error: 'Lobby not found' });
            return;
          }

          // Check if user is the host
          const isHost = lobby.createdBy === socket.userId;
          const isPublic = lobby.visibility === LobbyVisibility.PUBLIC;

          const success = await this.lobbyManager.leaveLobby(lobbyId, socket.userId);

          if (success) {
            // Leave socket room
            socket.leave(`lobby:${lobbyId}`);

            // Notify user
            socket.emit('lobby:left', { lobbyId });

            // If host left, close the lobby and kick everyone
            if (isHost) {
              console.log(`👑 Host left lobby ${lobbyId}, closing lobby and kicking all players`);
              
              // Notify all remaining players
              this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:closed', {
                lobbyId,
                reason: 'Host has left the lobby'
              });

              // Close the lobby
              this.lobbyManager.closeLobby(lobbyId, 'Host left');

              // Broadcast updated public lobby list if this was a public lobby
              if (isPublic) {
                this.broadcastPublicLobbies();
              }
            } else {
              // Non-host left, just broadcast update
              socket.to(`lobby:${lobbyId}`).emit('lobby:player:left', {
                userId: socket.userId,
                username: socket.username
              });

              // Get updated lobby
              const updatedLobby = this.lobbyManager.getLobby(lobbyId);
              if (updatedLobby) {
                // Broadcast updated lobby state
                this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
                  lobby: this.lobbyManager.serializeLobby(updatedLobby)
                });

                // Broadcast updated public lobby list if this is a public lobby
                if (isPublic) {
                  this.broadcastPublicLobbies();
                }
              } else {
                // Lobby was closed, notify remaining players
                this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:closed', {
                  lobbyId,
                  reason: 'Lobby empty'
                });

                // Broadcast updated public lobby list if this was a public lobby
                if (isPublic) {
                  this.broadcastPublicLobbies();
                }
              }
            }

            console.log(`✅ ${socket.username} left lobby ${lobbyId}`);
          }
        } catch (error) {
          console.error('❌ Error leaving lobby:', error);
          socket.emit('lobby:error', { error: 'Failed to leave lobby' });
        }
      });

      // Toggle ready status
      socket.on('lobby:ready', async (data: { lobbyId: string; isReady: boolean }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId, isReady } = data;

          const success = await this.lobbyManager.updateReadyStatus(lobbyId, socket.userId, isReady);

          if (success) {
            const lobby = this.lobbyManager.getLobby(lobbyId);
            if (lobby) {
              // Broadcast updated lobby state to all
              this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
                lobby: this.lobbyManager.serializeLobby(lobby)
              });
            }
          } else {
            socket.emit('lobby:error', { error: 'Failed to update ready status' });
          }
        } catch (error) {
          console.error('❌ Error updating ready status:', error);
          socket.emit('lobby:error', { error: 'Failed to update ready status' });
        }
      });

      // Get lobby details
      socket.on('lobby:get', (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);

          if (!lobby) {
            socket.emit('lobby:error', { error: 'Lobby not found' });
            return;
          }

          // Check if user is in the lobby
          if (!lobby.players.has(socket.userId)) {
            socket.emit('lobby:error', { error: 'You are not in this lobby' });
            return;
          }

          // Send lobby state to requester
          socket.emit('lobby:updated', {
            lobby: this.lobbyManager.serializeLobby(lobby)
          });

          console.log(`📡 Sent lobby ${lobbyId} details to ${socket.username}`);
        } catch (error) {
          console.error('❌ Error getting lobby:', error);
          socket.emit('lobby:error', { error: 'Failed to get lobby details' });
        }
      });

      // Heartbeat to keep lobby alive
      socket.on('lobby:heartbeat', (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) return;

          const { lobbyId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);

          if (!lobby) return;

          // Check if user is in the lobby
          const player = lobby.players.get(socket.userId);
          if (!player) return;

          // Update player heartbeat and lobby activity
          player.lastHeartbeat = Date.now();
          lobby.lastActivity = Date.now();
        } catch (error) {
          // Silent fail for heartbeat
        }
      });

      // Toggle ready status (convenience)
      socket.on('lobby:ready:toggle', async (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);
          
          if (!lobby) {
            socket.emit('lobby:error', { error: 'Lobby not found' });
            return;
          }

          // Find current player's ready status
          const player = lobby.players.get(socket.userId);
          if (!player) {
            socket.emit('lobby:error', { error: 'You are not in this lobby' });
            return;
          }

          // Toggle the ready status
          const newReadyStatus = !player.isReady;
          const success = await this.lobbyManager.updateReadyStatus(lobbyId, socket.userId, newReadyStatus);

          if (success) {
            const updatedLobby = this.lobbyManager.getLobby(lobbyId);
            if (updatedLobby) {
              // Broadcast updated lobby state to all
              this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
                lobby: this.lobbyManager.serializeLobby(updatedLobby)
              });
              console.log(`✅ ${socket.username} toggled ready to ${newReadyStatus}`);
            }
          } else {
            socket.emit('lobby:error', { error: 'Failed to toggle ready status' });
          }
        } catch (error) {
          console.error('❌ Error toggling ready status:', error);
          socket.emit('lobby:error', { error: 'Failed to toggle ready status' });
        }
      });

      // Kick player (host only)
      socket.on('lobby:kick', async (data: { lobbyId: string; userId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId, userId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);

          if (!lobby) {
            socket.emit('lobby:error', { error: 'Lobby not found' });
            return;
          }

          // Verify requester is the host
          if (lobby.createdBy !== socket.userId) {
            socket.emit('lobby:error', { error: 'Only the host can kick players' });
            return;
          }

          // Can't kick yourself
          if (userId === socket.userId) {
            socket.emit('lobby:error', { error: 'You cannot kick yourself' });
            return;
          }

          // Check if target player is in the lobby
          const targetPlayer = lobby.players.get(userId);
          if (!targetPlayer) {
            socket.emit('lobby:error', { error: 'Player not found in lobby' });
            return;
          }

          // Remove player from lobby
          const success = await this.lobbyManager.leaveLobby(lobbyId, userId);

          if (success) {
            // Notify the kicked player
            this.lobbyNamespace.to(targetPlayer.socketId).emit('lobby:kicked', {
              lobbyId,
              reason: 'You have been kicked by the host'
            });

            // Force disconnect from lobby room
            const kickedSocket = this.lobbyNamespace.sockets.get(targetPlayer.socketId);
            if (kickedSocket) {
              kickedSocket.leave(`lobby:${lobbyId}`);
            }

            // Broadcast to remaining players
            this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:player:left', {
              userId,
              username: targetPlayer.username
            });

            // Send updated lobby state
            const updatedLobby = this.lobbyManager.getLobby(lobbyId);
            if (updatedLobby) {
              this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
                lobby: this.lobbyManager.serializeLobby(updatedLobby)
              });
            }

            console.log(`👢 ${targetPlayer.username} kicked from lobby ${lobbyId} by ${socket.username}`);
          }
        } catch (error) {
          console.error('❌ Error kicking player:', error);
          socket.emit('lobby:error', { error: 'Failed to kick player' });
        }
      });

      // Request position swap
      socket.on('lobby:swap:request', async (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);

          if (!lobby) {
            socket.emit('lobby:error', { error: 'Lobby not found' });
            return;
          }

          // Need exactly 2 players to swap
          if (lobby.players.size !== 2) {
            socket.emit('lobby:error', { error: 'Need exactly 2 players to swap positions' });
            return;
          }

          // Find the other player
          const otherPlayer = Array.from(lobby.players.values()).find(p => p.userId !== socket.userId);
          if (!otherPlayer) {
            socket.emit('lobby:error', { error: 'No other player found' });
            return;
          }

          // Update last activity
          lobby.lastActivity = Date.now();

          // Notify the other player about swap request
          this.lobbyNamespace.to(otherPlayer.socketId).emit('lobby:swap:requested', {
            lobbyId,
            requesterId: socket.userId,
            requesterName: socket.username
          });

          // Notify requester that request was sent
          socket.emit('lobby:swap:sent', { lobbyId });

          console.log(`🔄 ${socket.username} requested position swap in lobby ${lobbyId}`);
        } catch (error) {
          console.error('❌ Error requesting swap:', error);
          socket.emit('lobby:error', { error: 'Failed to request swap' });
        }
      });

      // Accept position swap
      socket.on('lobby:swap:accept', async (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);

          if (!lobby) {
            socket.emit('lobby:error', { error: 'Lobby not found' });
            return;
          }

          // Need exactly 2 players to swap
          if (lobby.players.size !== 2) {
            socket.emit('lobby:error', { error: 'Need exactly 2 players to swap positions' });
            return;
          }

          // Swap the players in the map (reverse the order)
          const playersArray = Array.from(lobby.players.entries());
          lobby.players.clear();
          
          // Add in reverse order
          lobby.players.set(playersArray[1][0], playersArray[1][1]);
          lobby.players.set(playersArray[0][0], playersArray[0][1]);

          lobby.lastActivity = Date.now();

          // Broadcast updated lobby state
          this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:updated', {
            lobby: this.lobbyManager.serializeLobby(lobby)
          });

          console.log(`🔄 Positions swapped in lobby ${lobbyId}`);
        } catch (error) {
          console.error('❌ Error accepting swap:', error);
          socket.emit('lobby:error', { error: 'Failed to accept swap' });
        }
      });

      // Decline position swap
      socket.on('lobby:swap:decline', async (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId } = data;
          const lobby = this.lobbyManager.getLobby(lobbyId);

          if (!lobby) {
            socket.emit('lobby:error', { error: 'Lobby not found' });
            return;
          }

          // Update last activity
          lobby.lastActivity = Date.now();

          // Find the other player
          const otherPlayer = Array.from(lobby.players.values()).find(p => p.userId !== socket.userId);
          if (otherPlayer) {
            // Notify the requester that swap was declined
            this.lobbyNamespace.to(otherPlayer.socketId).emit('lobby:swap:declined', {
              lobbyId
            });
          }

          console.log(`❌ ${socket.username} declined position swap in lobby ${lobbyId}`);
        } catch (error) {
          console.error('❌ Error declining swap:', error);
          socket.emit('lobby:error', { error: 'Failed to decline swap' });
        }
      });

      // Start game (host only)
      socket.on('lobby:start', async (data: { lobbyId: string }) => {
        try {
          if (!socket.userId) {
            socket.emit('lobby:error', { error: 'Not authenticated' });
            return;
          }

          const { lobbyId } = data;

          const success = await this.lobbyManager.startGame(lobbyId, socket.userId);

          if (success) {
            const lobby = this.lobbyManager.getLobby(lobbyId);
            if (lobby) {
              // Create boardgame.io match
              const matchID = await this.createBoardgameMatch(lobby);
              
              if (matchID) {
                // Broadcast game starting with matchID to all players
                this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:game:starting', {
                  lobbyId,
                  matchID,
                  lobby: this.lobbyManager.serializeLobby(lobby)
                });

                console.log(`🎮 Game starting in lobby ${lobbyId}, boardgame.io match: ${matchID}`);
              } else {
                socket.emit('lobby:error', { error: 'Failed to create game match' });
              }
            }
          } else {
            socket.emit('lobby:error', { error: 'Failed to start game (not host or players not ready)' });
          }
        } catch (error) {
          console.error('❌ Error starting game:', error);
          socket.emit('lobby:error', { error: 'Failed to start game' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log(`📡 Lobby: User ${socket.username} disconnected`);

        if (!socket.userId) return;

        // Get all lobbies user is in
        const lobbies = this.lobbyManager.getUserLobbies(socket.userId);

        for (const lobby of lobbies) {
          const player = lobby.players.get(socket.userId);
          if (player) {
            // Check if disconnected user is the host
            const isHost = lobby.createdBy === socket.userId;

            if (isHost) {
              // Host disconnected - close lobby immediately
              console.log(`👑 Host ${socket.username} disconnected from lobby ${lobby.lobbyId}. Closing lobby...`);
              
              // Notify all players that lobby is closing
              this.lobbyNamespace.to(`lobby:${lobby.lobbyId}`).emit('lobby:closed', {
                lobbyId: lobby.lobbyId,
                reason: 'Host has lost connection. Lobby will be destroyed.'
              });

              // Close the lobby
              await this.lobbyManager.closeLobby(lobby.lobbyId, 'Host disconnected');
              
              console.log(`🗑️ Lobby ${lobby.lobbyId} closed due to host disconnection`);
            } else {
              // Non-host player disconnected - start grace period
              console.log(`⏳ Player ${socket.username} disconnected, starting 30s grace period...`);
              
              setTimeout(async () => {
                // Check if player is still disconnected
                const currentLobby = this.lobbyManager.getLobby(lobby.lobbyId);
                const currentPlayer = currentLobby?.players.get(socket.userId!);

                if (currentPlayer && currentPlayer.socketId === socket.id) {
                  // Player hasn't reconnected, remove them
                  console.log(`⏰ Grace period expired for ${socket.username}, removing from lobby`);
                  await this.lobbyManager.leaveLobby(lobby.lobbyId, socket.userId!);

                  // Notify others
                  this.lobbyNamespace.to(`lobby:${lobby.lobbyId}`).emit('lobby:player:left', {
                    userId: socket.userId,
                    username: socket.username
                  });

                  const updatedLobby = this.lobbyManager.getLobby(lobby.lobbyId);
                  if (updatedLobby) {
                    this.lobbyNamespace.to(`lobby:${lobby.lobbyId}`).emit('lobby:updated', {
                      lobby: this.lobbyManager.serializeLobby(updatedLobby)
                    });
                  }
                } else {
                  console.log(`✅ Player ${socket.username} reconnected within grace period`);
                }
              }, 30000); // 30 seconds
            }
          }
        }
      });
    });
  }

  /**
   * Create a boardgame.io match from lobby data
   * Returns matchID only - players will join on the frontend to get credentials
   */
  private async createBoardgameMatch(lobby: { lobbyId: string; name: string; gameSettings: any; players: Map<string, { userId: string; username: string }> }): Promise<string | null> {
    try {
      const GAME_SERVER_URL = process.env.GAME_SERVER_URL || 'http://localhost:8001';

      // Prepare setup data for boardgame.io
      const setupData = {
        gameMode: lobby.gameSettings.gameMode || 'standard',
        initialResources: lobby.gameSettings.initialResources || 5,
        maxTurns: lobby.gameSettings.maxTurns || 30,
        isPrivate: true,
        lobbyName: lobby.name,
        lobbyId: lobby.lobbyId
      };

      console.log(`🎮 Creating boardgame.io match for lobby ${lobby.lobbyId}...`);

      // Create the match using boardgame.io lobby API
      const createResponse = await axios.post(`${GAME_SERVER_URL}/games/darknet-duel/create`, {
        numPlayers: 2,
        setupData
      });

      const matchID = createResponse.data.matchID;
      console.log(`✅ Match created: ${matchID}`);
      console.log(`   Players will join on frontend to receive credentials`);

      // Mark lobby as in-game
      await this.lobbyManager.markInGame(lobby.lobbyId);

      return matchID;
    } catch (error: any) {
      console.error('❌ Failed to create boardgame.io match:', error.message);
      if (error.response) {
        console.error('   Response status:', error.response.status);
        console.error('   Response data:', error.response.data);
      }
      return null;
    }
  }

  /**
   * Broadcast public lobby list to all connected clients
   */
  private broadcastPublicLobbies(): void {
    const publicLobbies = this.lobbyManager.getPublicLobbies();
    this.lobbyNamespace.emit('lobbies:list', {
      lobbies: publicLobbies.map(lobby => this.lobbyManager.serializeLobby(lobby))
    });
  }

  /**
   * Get lobby manager instance (for external use)
   */
  getLobbyManager(): LobbyManager {
    return this.lobbyManager;
  }

  /**
   * Stop the service
   */
  stop(): void {
    this.cleanupService.stop();
    console.log('🛑 Lobby Socket.io service stopped');
  }
}
