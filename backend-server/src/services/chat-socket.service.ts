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
  
  // Rate limiting: Track message timestamps per user
  private messageTimestamps: Map<string, number[]> = new Map(); // userId -> array of timestamps
  private readonly MESSAGE_LIMIT = 5; // Max messages
  private readonly TIME_WINDOW = 10000; // 10 seconds in milliseconds
  private readonly COOLDOWN_DURATION = 30000; // 30 seconds cooldown after rate limit

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

  /**
   * Check if user is rate limited
   * @param userId User ID to check
   * @returns true if rate limited, false otherwise
   */
  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const timestamps = this.messageTimestamps.get(userId) || [];
    
    // Remove timestamps older than the time window
    const recentTimestamps = timestamps.filter(ts => now - ts < this.TIME_WINDOW);
    
    // Update the map with filtered timestamps
    this.messageTimestamps.set(userId, recentTimestamps);
    
    // Check if user has exceeded the message limit
    return recentTimestamps.length >= this.MESSAGE_LIMIT;
  }

  /**
   * Record a message timestamp for rate limiting
   * @param userId User ID
   */
  private recordMessageTimestamp(userId: string): void {
    const now = Date.now();
    const timestamps = this.messageTimestamps.get(userId) || [];
    timestamps.push(now);
    this.messageTimestamps.set(userId, timestamps);
  }

  /**
   * Get remaining cooldown time for a rate-limited user
   * @param userId User ID
   * @returns Remaining cooldown in milliseconds, or 0 if not rate limited
   */
  private getRemainingCooldown(userId: string): number {
    const timestamps = this.messageTimestamps.get(userId) || [];
    if (timestamps.length === 0) return 0;
    
    const oldestTimestamp = timestamps[0];
    const elapsed = Date.now() - oldestTimestamp;
    const remaining = this.TIME_WINDOW - elapsed;
    
    return remaining > 0 ? remaining : 0;
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

          // Check rate limiting
          if (this.isRateLimited(socket.userId)) {
            const cooldown = this.getRemainingCooldown(socket.userId);
            const cooldownSeconds = Math.ceil(cooldown / 1000);
            socket.emit('rate_limited', { 
              message: `You're sending messages too quickly. Please wait ${cooldownSeconds} seconds.`,
              cooldownMs: cooldown,
              limit: this.MESSAGE_LIMIT,
              window: this.TIME_WINDOW / 1000
            });
            console.log(`⚠️  Chat: ${socket.username} is rate limited (${cooldownSeconds}s remaining)`);
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

          // Record message timestamp for rate limiting
          this.recordMessageTimestamp(socket.userId);

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