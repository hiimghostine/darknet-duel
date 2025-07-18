import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUICK_CHAT_MESSAGES } from 'shared-types/chat.types';
import type { ChatState } from 'shared-types/chat.types';

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
      <motion.div 
        key={msg.id || index} 
        className={`mb-3 ${isCurrentUser ? 'ml-8' : 'mr-8'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isSystemMessage ? (
          <div className="text-center">
            <div className="inline-block bg-primary/20 border border-primary/30 px-3 py-1 rounded font-mono text-xs text-primary">
              <span className="mr-2">⚠</span>
              {msg.content}
            </div>
            <div className="text-xs text-base-content/50 font-mono mt-1">
              {formatTimestamp(msg.timestamp)}
            </div>
          </div>
        ) : (
          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              isCurrentUser 
                ? 'bg-primary/20 border-primary/30' 
                : 'bg-base-300/50 border-base-content/20'
            } border rounded-lg p-3`}>
              <div className={`text-xs font-mono mb-1 ${
                isCurrentUser ? 'text-primary' : 'text-base-content/70'
              }`}>
                {isCurrentUser ? 'YOU' : 
                  (msg.senderRole === 'attacker' ? 'ATTACKER' : 'DEFENDER')}
              </div>
              <div className="text-sm font-mono break-words">
                {msg.content}
              </div>
              <div className="text-xs text-base-content/50 font-mono mt-1 text-right">
                {formatTimestamp(msg.timestamp)}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        <AnimatePresence initial={false}>
          {chat.messages.length > 0 ? (
            chat.messages.map(renderMessage)
          ) : (
            <motion.div 
              className="text-center text-base-content/50 font-mono text-sm mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-2xl mb-2">💬</div>
              <p>No messages yet...</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>
      
      {/* Quick Messages */}
      <div className="border-t border-primary/20 pt-3 pb-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(QUICK_CHAT_MESSAGES).map(([key, content]) => (
            <motion.button 
              key={key} 
              className="btn btn-xs bg-base-300/50 border-primary/30 hover:border-primary hover:bg-primary/20 text-primary font-mono"
              onClick={() => sendMessage(content)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {key}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Message Input */}
      <form className="flex gap-2 pt-3 border-t border-primary/20" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 input input-sm bg-base-300/50 border-primary/30 focus:border-primary text-base-content font-mono placeholder:text-base-content/50"
          maxLength={200}
        />
        <motion.button 
          type="submit" 
          disabled={!message.trim()}
          className="btn btn-sm btn-primary font-mono"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          SEND
        </motion.button>
      </form>
    </div>
  );
};

export default PostGameChat;
