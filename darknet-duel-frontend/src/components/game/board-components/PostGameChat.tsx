import React, { useState, useEffect, useRef } from 'react';
import { QUICK_CHAT_MESSAGES } from 'shared-types/chat.types';
import type { ChatState } from 'shared-types/chat.types';
import '../../../styles/post-game-chat.css';

interface PostGameChatProps {
  chat: ChatState;
  playerID?: string;
  sendMessage: (content: string) => void;
}

const PostGameChat: React.FC<PostGameChatProps> = ({
  chat,
  playerID,
  sendMessage
}) => {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages]);
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };
  
  // Format timestamp to HH:MM:SS
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render a single message
  const renderMessage = (msg: typeof chat.messages[0], index: number) => {
    const isCurrentUser = msg.sender === playerID;
    const isSystemMessage = msg.isSystem;
    
    return (
      <div 
        key={msg.id || index} 
        className={`chat-message ${isCurrentUser ? 'own-message' : ''} ${isSystemMessage ? 'system-message' : ''}`}
      >
        {!isSystemMessage && (
          <div className="message-sender">
            {msg.sender === playerID ? 'You' : 
              (msg.senderRole === 'attacker' ? 'Attacker' : 'Defender')}
          </div>
        )}
        <div className="message-content">{msg.content}</div>
        <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
      </div>
    );
  };

  return (
    <div className="post-game-chat">
      <div className="chat-header">
        <h3>Post-Game Chat</h3>
      </div>
      
      <div className="chat-messages">
        {chat.messages.map(renderMessage)}
        <div ref={chatEndRef} />
      </div>
      
      <div className="quick-messages">
        {Object.entries(QUICK_CHAT_MESSAGES).map(([key, content]) => (
          <button 
            key={key} 
            className="quick-message-btn"
            onClick={() => sendMessage(content)}
          >
            {key}
          </button>
        ))}
      </div>
      
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          maxLength={200}
        />
        <button type="submit" disabled={!message.trim()}>Send</button>
      </form>
    </div>
  );
};

export default PostGameChat;
