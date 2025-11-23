import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ChatService, ChatMessage } from './chat.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export class ChatSocketService {
  private io: SocketIOServer;
  private chatService: ChatService;
  private sessionService: SessionService;
  private authService: AuthService;
  private connectedUsers: Map<string, Set<string>> = new Map(); // chatId -> Set of userIds

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io'
    });

    this.chatService = new ChatService();
    this.sessionService = new SessionService();
    this.authService = new AuthService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
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
        
        console.log(`🔐 Chat: User ${socket.username} (${socket.userId}) authenticated`);
        next();
      } catch (error) {
        console.error('❌ Chat authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`📡 Chat: User ${socket.username} connected`);

      // Join a chat room
      socket.on('join_chat', async (data: { chatId: string }) => {
        try {
          const { chatId } = data;
          
          console.log(`🏠 Chat: ${socket.username} joining chat ${chatId}`);
          
          // Leave any previous chat rooms and update presence for those rooms
          socket.rooms.forEach(room => {
            if (room !== socket.id) {
              socket.leave(room);
              // Update presence map
              if (this.connectedUsers.has(room)) {
                const set = this.connectedUsers.get(room)!;
                set.delete(socket.userId!);
                if (set.size === 0) {
                  this.connectedUsers.delete(room);
                }
                // Broadcast updated presence to that room
                this.io.to(room).emit('users_connected', {
                  count: set.size,
                  users: Array.from(set)
                });
              }
            }
          });

          // Join the new chat room
          socket.join(chatId);

          // Track connected users
          if (!this.connectedUsers.has(chatId)) {
            this.connectedUsers.set(chatId, new Set());
          }
          this.connectedUsers.get(chatId)!.add(socket.userId!);

          // Send recent messages to the user
          const recentMessages = await this.chatService.getRecentMessages(chatId, 30);
          socket.emit('chat_history', { messages: recentMessages });

          // Notify others that user joined
          socket.to(chatId).emit('user_joined', { 
            userId: socket.userId, 
            username: socket.username 
          });

          // Broadcast current presence to ALL users in the room (including the joiner)
          const presenceSet = this.connectedUsers.get(chatId)!;
          this.io.to(chatId).emit('users_connected', {
            count: presenceSet.size,
            users: Array.from(presenceSet)
          });

          console.log(`✅ Chat: ${socket.username} successfully joined ${chatId}`);
        } catch (error) {
          console.error('❌ Error joining chat:', error);
          socket.emit('chat_error', { message: 'Failed to join chat' });
        }
      });

      // Send a message
      socket.on('send_message', async (data: { chatId: string; message: string }) => {
        try {
          const { chatId, message } = data;

          if (!socket.userId) {
            socket.emit('chat_error', { message: 'Not authenticated' });
            return;
          }

          if (!message.trim()) {
            socket.emit('chat_error', { message: 'Message cannot be empty' });
            return;
          }

          if (message.length > 500) {
            socket.emit('chat_error', { message: 'Message too long (max 500 characters)' });
            return;
          }

          console.log(`💬 Chat: ${socket.username} sending message to ${chatId}`);

          // Save message to database
          const savedMessage = await this.chatService.sendMessage({
            chatId,
            senderUuid: socket.userId,
            messageContent: message.trim()
          });

          // Broadcast message to all users in the chat room
          this.io.to(chatId).emit('new_message', savedMessage);

          console.log(`✅ Chat: Message sent successfully`);

          // Clean up old messages periodically (every 50th message)
          if (Math.random() < 0.02) { // 2% chance
            await this.chatService.cleanupOldMessages(chatId);
          }

        } catch (error) {
          console.error('❌ Error sending message:', error);
          socket.emit('chat_error', { message: 'Failed to send message' });
        }
      });

      // Leave chat room
      socket.on('leave_chat', (data: { chatId: string }) => {
        const { chatId } = data;
        console.log(`🚪 Chat: ${socket.username} leaving chat ${chatId}`);
        
        socket.leave(chatId);
        
        // Remove from connected users
        if (this.connectedUsers.has(chatId)) {
          const set = this.connectedUsers.get(chatId)!;
          set.delete(socket.userId!);
          if (set.size === 0) {
            this.connectedUsers.delete(chatId);
          }
          // Broadcast updated presence to ALL in the room
          this.io.to(chatId).emit('users_connected', {
            count: set.size,
            users: Array.from(set)
          });
        }

        // Notify others that user left
        socket.to(chatId).emit('user_left', { 
          userId: socket.userId, 
          username: socket.username 
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`📡 Chat: User ${socket.username} disconnected`);
        
        // Remove from all chat rooms
        this.connectedUsers.forEach((users, chatId) => {
          if (users.has(socket.userId!)) {
            users.delete(socket.userId!);
            if (users.size === 0) {
              this.connectedUsers.delete(chatId);
            }
            // Notify others in the chat
            socket.to(chatId).emit('user_left', { 
              userId: socket.userId, 
              username: socket.username 
            });
            // Broadcast updated presence after disconnect
            this.io.to(chatId).emit('users_connected', {
              count: users.size,
              users: Array.from(users)
            });
          }
        });
      });
    });
  }

  // Method to send system messages
  public async sendSystemMessage(chatId: string, message: string): Promise<void> {
    const systemMessage = await this.chatService.sendSystemMessage(chatId, message);
    this.io.to(chatId).emit('new_message', systemMessage);
  }

  // Get connected users count for a chat
  public getConnectedUsersCount(chatId: string): number {
    return this.connectedUsers.get(chatId)?.size || 0;
  }
} 