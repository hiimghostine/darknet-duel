import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/auth.store';
import type { LobbyChatMessage } from 'shared-types/chat.types';
import { FaPaperPlane, FaUsers, FaComments } from 'react-icons/fa';

interface LobbyChatProps {
  chatId?: string;
  className?: string;
}

const LobbyChat: React.FC<LobbyChatProps> = ({ 
  chatId = 'global-lobby', 
  className = '' 
}) => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<LobbyChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Use the same pattern as api.ts to get backend URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const backendUrl = apiUrl.replace('/api', ''); // Remove /api suffix for Socket.io
    
    const socketInstance = io(backendUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('📡 Connected to chat server');
      setIsConnected(true);
      setError(null);
      
      // Join the chat room
      socketInstance.emit('join_chat', { chatId });
    });

    socketInstance.on('disconnect', () => {
      console.log('📡 Disconnected from chat server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Chat connection error:', error);
      setError('Failed to connect to chat server');
      setIsConnected(false);
    });

    // Chat event handlers
    socketInstance.on('chat_history', (data: { messages: LobbyChatMessage[] }) => {
      console.log('📜 Received chat history:', data.messages.length, 'messages');
      setMessages(data.messages);
    });

    socketInstance.on('new_message', (message: LobbyChatMessage) => {
      console.log('💬 New message:', message);
      setMessages(prev => {
        // Keep only last 30 messages for performance
        const newMessages = [...prev, message];
        return newMessages.length > 30 ? newMessages.slice(-30) : newMessages;
      });
    });

    socketInstance.on('user_joined', (data: { userId: string; username: string }) => {
      console.log('👋 User joined:', data.username);
      setConnectedUsers(prev => new Set([...prev, data.userId]));
    });

    socketInstance.on('user_left', (data: { userId: string; username: string }) => {
      console.log('👋 User left:', data.username);
      setConnectedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    socketInstance.on('chat_error', (data: { message: string }) => {
      console.error('❌ Chat error:', data.message);
      setError(data.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave_chat', { chatId });
      socketInstance.disconnect();
    };
  }, [user, chatId]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.emit('send_message', {
      chatId,
      message: newMessage.trim()
    });

    setNewMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message: LobbyChatMessage) => {
    return message.senderUuid === user?.id;
  };

  return (
    <div className={`${className}`}>
      {/* Chat banner with same styling as lobbies banner */}
      <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
        <div className="bg-base-200 border border-primary/20 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
          
          {/* IRC-style header with cyberpunk styling */}
          <div className="p-4 pb-2">
            <div className="font-mono">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-xl font-bold font-mono">
                  #DARKNET_LOBBY
                </h3>
                <div className="text-xs text-base-content/70">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-base-content text-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 pulse-glow' : 'bg-red-500'}`}></div>
                <span>{connectedUsers.size} USERS CONNECTED • {isConnected ? 'SECURE CHANNEL ACTIVE' : 'CONNECTION LOST'}</span>
              </div>
              {error && (
                <div className="text-xs text-error mt-1">⚠️ TRANSMISSION ERROR: {error}</div>
              )}
            </div>
          </div>

          {/* IRC-style message area with cyberpunk styling */}
          <div className="px-4 pb-4">
            <div className="bg-base-300/50 border border-primary/30 p-3 font-mono text-sm min-h-[200px] max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-base-content/50 text-xs space-y-1">
                  <div className="text-primary">*** NEURAL LINK ESTABLISHED TO #DARKNET_LOBBY</div>
                  <div className="text-base-content/70">*** ENCRYPTION: AES-256 | STATUS: SECURE</div>
                  <div className="text-base-content/70">*** AWAITING TRANSMISSION...</div>
                </div>
              ) : (
                messages.map((message) => {
                  const timestamp = formatTimestamp(message.createdAt);
                  const username = isOwnMessage(message) ? user?.username : message.metadata?.username || 'ANON';
                  
                  if (message.messageType === 'system') {
                    return (
                      <div key={message.id} className="text-primary text-xs mb-1">
                        <span className="text-base-content/50">[{timestamp}]</span> <span className="text-primary">***</span> {message.messageContent}
                      </div>
                    );
                  }
                  
                  return (
                    <div key={message.id} className="text-xs mb-1 break-words">
                      <span className="text-base-content/50">[{timestamp}]</span>{' '}
                      <span className={`font-bold ${isOwnMessage(message) ? 'text-primary data-corrupt' : 'text-secondary'}`}>
                        &lt;{username}&gt;
                      </span>{' '}
                      <span className="text-base-content">{message.messageContent}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* IRC-style input with cyberpunk styling */}
            <div className="mt-3 bg-base-300/30 border border-primary/30 relative">
              {/* Corner accents for input */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50"></div>
              
              <div className="flex items-center p-2">
                <span className="text-primary font-mono text-sm mr-2 text-flicker">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="ENTER_TRANSMISSION..."
                  disabled={!isConnected}
                  maxLength={500}
                  className="flex-1 bg-transparent border-none outline-none text-base-content text-sm font-mono
                           placeholder:text-base-content/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {newMessage.length > 450 && (
                  <span className="text-warning text-xs ml-2 font-mono">
                    {500 - newMessage.length}
                  </span>
                )}
              </div>
              
              {/* Status line with cyberpunk styling */}
              <div className="px-2 pb-2 text-xs text-base-content/50 font-mono border-t border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${isTyping ? 'bg-primary animate-pulse' : 'bg-base-content/30'}`}></div>
                    {isTyping ? 'TRANSMITTING...' : 'STANDBY'}
                  </span>
                  <span>
                    ENTER→SEND • {newMessage.length}/500 CHARS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyChat; 