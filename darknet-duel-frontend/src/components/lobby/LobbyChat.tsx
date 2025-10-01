import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/auth.store';
import { useAudioManager } from '../../hooks/useAudioManager';
import type { LobbyChatMessage } from 'shared-types/chat.types';
import { FaPaperPlane, FaUsers, FaComments, FaHashtag, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';
import UserProfilePopup from '../UserProfilePopup';
import ReportModal from '../ReportModal';
import ContextMenu from '../ContextMenu';
import UserTypeTag from '../UserTypeTag';
import { useThemeStore } from '../../store/theme.store';

interface LobbyChatProps {
  chatId?: string;
  className?: string;
  lobbyId?: string; // Optional lobby ID for per-lobby chat
  showChannelSwitcher?: boolean; // Whether to show channel switching UI
}

const LobbyChat: React.FC<LobbyChatProps> = ({ 
  chatId = 'global-lobby', 
  className = '',
  lobbyId,
  showChannelSwitcher = false
}) => {
  const { user } = useAuthStore();
  const { triggerSendMsg, triggerRecvMsg } = useAudioManager();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<LobbyChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Channel switching state
  const [currentChannel, setCurrentChannel] = useState<'global' | 'lobby'>('global');
  const [channels] = useState(() => {
    const channelList = [
      { id: 'global', name: 'darknet_lobby', chatId: 'global-lobby' }
    ];
    
    if (lobbyId && showChannelSwitcher) {
      channelList.push({
        id: 'lobby',
        name: `lobby_${lobbyId.substring(0, 8)}`,
        chatId: `lobby_${lobbyId}`
      });
    }
    
    return channelList;
  });

  // Get current channel info
  const getCurrentChannelInfo = () => {
    if (showChannelSwitcher && lobbyId) {
      return currentChannel === 'global' 
        ? { name: 'darknet_lobby', chatId: 'global-lobby' }
        : { name: `lobby_${lobbyId.substring(0, 8)}`, chatId: `lobby_${lobbyId}` };
    }
    return { name: 'darknet_lobby', chatId: chatId };
  };

  const channelInfo = getCurrentChannelInfo();
  
  // Profile popup state
  const [profilePopup, setProfilePopup] = useState<{
    isVisible: boolean;
    userId: string;
    username: string;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    userId: '',
    username: '',
    position: { x: 0, y: 0 }
  });

  // Report modal state
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    reporteeId: string;
    reporteeUsername: string;
    content?: string;
  }>({
    isOpen: false,
    reporteeId: '',
    reporteeUsername: '',
    content: undefined
  });

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    selectedMessage: LobbyChatMessage | null;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    selectedMessage: null
  });

  const { theme } = useThemeStore();

  // Scroll to bottom when new messages arrive - only within the message container
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
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
      
      // Join the current chat room
      socketInstance.emit('join_chat', { chatId: channelInfo.chatId });
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
      // Only play receive sound for messages from other users
      if (message.senderUuid !== user?.id) {
        triggerRecvMsg();
      }
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
      socketInstance.emit('leave_chat', { chatId: channelInfo.chatId });
      socketInstance.disconnect();
    };
  }, [user, channelInfo.chatId]);

  // Handle channel switching
  const switchChannel = (newChannel: 'global' | 'lobby') => {
    if (!socket || newChannel === currentChannel) return;
    
    // Leave current channel
    socket.emit('leave_chat', { chatId: channelInfo.chatId });
    
    // Update current channel
    setCurrentChannel(newChannel);
    
    // Clear messages for smooth transition
    setMessages([]);
    setConnectedUsers(new Set());
    
    // Join new channel
    const newChannelInfo = newChannel === 'global' 
      ? { chatId: 'global-lobby' }
      : { chatId: `lobby_${lobbyId}` };
    
    socket.emit('join_chat', newChannelInfo);
  };

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    triggerSendMsg();
    socket.emit('send_message', {
      chatId: channelInfo.chatId,
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

  // Handle username click to show profile popup
  const handleUsernameClick = (event: React.MouseEvent, message: LobbyChatMessage) => {
    // Don't show popup for system messages
    if (message.messageType === 'system') return;
    
    // Get the user ID from the message
    const userId = message.senderUuid;
    const username = message.metadata?.username || 'ANON';
    
    if (!userId) return;

    setProfilePopup({
      isVisible: true,
      userId,
      username,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  const closeProfilePopup = () => {
    setProfilePopup(prev => ({ ...prev, isVisible: false }));
  };

  // Handle right-click on message to show context menu
  const handleMessageRightClick = (event: React.MouseEvent, message: LobbyChatMessage) => {
    event.preventDefault();
    
    // Don't show context menu for system messages or own messages
    if (message.messageType === 'system' || isOwnMessage(message)) {
      return;
    }

    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      selectedMessage: message
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false, selectedMessage: null }));
  };

  const handleReportFromContextMenu = () => {
    const message = contextMenu.selectedMessage;
    if (!message) return;

    const userId = message.senderUuid;
    const username = message.metadata?.username || 'ANON';
    
    if (!userId) return;

    setReportModal({
      isOpen: true,
      reporteeId: userId,
      reporteeUsername: username,
      content: message.messageContent
    });

    closeContextMenu();
  };

  const closeReportModal = () => {
    setReportModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className={`${className}`}>
      {/* Compact Chat banner */}
      <div className="bg-base-200 border border-primary/20">
        {/* IRC-style header - compact */}
        <div className="p-2 border-b border-primary/20">
          <div className="font-mono">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-mono text-primary">
                  #{channelInfo.name.toUpperCase()}
                </h3>
                
                {/* Channel switcher - compact */}
                {showChannelSwitcher && lobbyId && channels.length > 1 && (
                  <div className="flex items-center gap-1 ml-2">
                    {channels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => switchChannel(channel.id as 'global' | 'lobby')}
                        className={`px-2 py-0.5 text-xs font-mono transition-colors flex items-center gap-0.5 ${
                          currentChannel === channel.id
                            ? 'bg-primary/20 text-primary border border-primary/40'
                            : 'text-base-content/60 hover:text-primary/80 hover:bg-primary/10 border border-transparent'
                        }`}
                      >
                        <FaHashtag className="text-xs" />
                        <span className="text-xs">{channel.id === 'global' ? 'GLOBAL' : 'LOBBY'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-base-content text-xs flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 pulse-glow' : 'bg-red-500'}`}></div>
              <span>{connectedUsers.size} USERS • {isConnected ? 'SECURE' : 'OFFLINE'}</span>
            </div>
            {error && (
              <div className="text-xs text-error mt-1">⚠️ {error}</div>
            )}
          </div>
        </div>

        {/* IRC-style message area - compact */}
        <div className="p-2">
          <div ref={messageContainerRef} className="bg-base-300/50 border border-primary/30 p-2 font-mono text-xs h-40 lg:h-48 overflow-y-auto">
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
                    <div 
                      key={message.id} 
                      className="text-xs mb-1 break-words"
                      onContextMenu={(e) => handleMessageRightClick(e, message)}
                    >
                      <span className="text-base-content/50">[{timestamp}]</span>{' '}
                      <span 
                        className={`font-bold cursor-pointer hover:opacity-80 transition-opacity ${
                          isOwnMessage(message) ? 'text-primary data-corrupt' : 'text-secondary hover:text-secondary/80'
                        }`}
                        onClick={(e) => handleUsernameClick(e, message)}
                      >
                        &lt;{username}&gt;
                        {message.metadata?.type && <UserTypeTag userType={message.metadata.type} className="ml-1" />}
                      </span>{' '}
                      <span className="text-base-content">{message.messageContent}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

          {/* IRC-style input - compact */}
          <div className={`mt-2 border border-primary/30 transition-colors duration-200 ${theme === 'cyberpunk-dark' ? 'bg-base-900/80' : 'bg-base-100/80'}`}>
            <div className="flex items-center p-1.5">
              <span className="text-primary font-mono text-xs mr-1.5 text-flicker">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
                onKeyPress={handleKeyPress}
                placeholder="TYPE MESSAGE..."
                disabled={!isConnected}
                maxLength={500}
                className={`flex-1 border-none outline-none text-base-content text-xs font-mono bg-transparent placeholder:text-base-content/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
              />
              {newMessage.length > 450 && (
                <span className="text-warning text-xs ml-1 font-mono">
                  {500 - newMessage.length}
                </span>
              )}
            </div>
            
            {/* Status line - compact */}
            <div className="px-1.5 pb-1 text-xs text-base-content/50 font-mono border-t border-primary/20">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <div className={`w-1 h-1 rounded-full ${isTyping ? 'bg-primary animate-pulse' : 'bg-base-content/30'}`}></div>
                  <span className="text-xs">{isTyping ? 'TYPING' : 'READY'}</span>
                </span>
                <span className="text-xs">
                  {newMessage.length}/500
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Popup */}
      <UserProfilePopup
        userId={profilePopup.userId}
        username={profilePopup.username}
        isVisible={profilePopup.isVisible}
        position={profilePopup.position}
        onClose={closeProfilePopup}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={closeReportModal}
        reporteeId={reportModal.reporteeId}
        reporteeUsername={reportModal.reporteeUsername}
        reportType="chat"
        content={reportModal.content}
      />

      {/* Context Menu */}
      <ContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onReport={handleReportFromContextMenu}
      />
    </div>
  );
};

export default LobbyChat; 