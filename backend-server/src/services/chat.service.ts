import { AppDataSource } from '../utils/database';
import { LobbyChat } from '../entities/lobby-chat.entity';
import { Account } from '../entities/account.entity';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderUuid: string;
  messageContent: string;
  messageType: string;
  createdAt: Date;
  metadata?: {
    username?: string;
    type?: 'user' | 'mod' | 'admin';
    [key: string]: any;
  };
}

export interface SendMessageData {
  chatId: string;
  senderUuid: string;
  messageContent: string;
  messageType?: string;
  metadata?: any;
}

export class ChatService {
  private lobbyRepository = AppDataSource.getRepository(LobbyChat);
  private accountRepository = AppDataSource.getRepository(Account);

  /**
   * Send a new chat message
   */
  async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    // Get sender information for metadata
    const sender = await this.accountRepository.findOne({
      where: { id: data.senderUuid }
    });

    const metadata = {
      username: sender?.username || 'Unknown User',
      type: sender?.type || 'user',
      ...data.metadata
    };

    const chatMessage = this.lobbyRepository.create({
      chatId: data.chatId,
      senderUuid: data.senderUuid,
      messageContent: data.messageContent,
      messageType: data.messageType || 'user',
      metadata
    });

    await this.lobbyRepository.save(chatMessage);

    return {
      id: chatMessage.id,
      chatId: chatMessage.chatId,
      senderUuid: chatMessage.senderUuid,
      messageContent: chatMessage.messageContent,
      messageType: chatMessage.messageType,
      createdAt: chatMessage.createdAt,
      metadata: chatMessage.metadata
    };
  }

  /**
   * Get recent messages (last 30) for a chat room
   */
  async getRecentMessages(chatId: string, limit: number = 30): Promise<ChatMessage[]> {
    const messages = await this.lobbyRepository.find({
      where: { 
        chatId, 
        isDeleted: false 
      },
      order: { createdAt: 'DESC' },
      take: limit
    });

    // Reverse to show oldest first
    return messages.reverse().map(msg => ({
      id: msg.id,
      chatId: msg.chatId,
      senderUuid: msg.senderUuid,
      messageContent: msg.messageContent,
      messageType: msg.messageType,
      createdAt: msg.createdAt,
      metadata: msg.metadata
    }));
  }

  /**
   * Send a system message
   */
  async sendSystemMessage(chatId: string, messageContent: string): Promise<ChatMessage> {
    return this.sendMessage({
      chatId,
      senderUuid: '00000000-0000-0000-0000-000000000000', // System UUID
      messageContent,
      messageType: 'system',
      metadata: {
        username: 'SYSTEM'
      }
    });
  }

  /**
   * Clean up old messages (keep only last 100 per chat)
   */
  async cleanupOldMessages(chatId: string): Promise<void> {
    const messages = await this.lobbyRepository.find({
      where: { chatId, isDeleted: false },
      order: { createdAt: 'DESC' },
      skip: 100 // Keep latest 100 messages
    });

    if (messages.length > 0) {
      await this.lobbyRepository.update(
        { id: messages.map(m => m.id) as any },
        { isDeleted: true }
      );
    }
  }
} 