import { AppDataSource } from '../utils/database';
import { LobbyChat } from '../entities/lobby-chat.entity';
import { Account } from '../entities/account.entity';
import enList from '../../files/filter/en.json';
import tlcbList from '../../files/filter/tl_cb.json';

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
  private profanityMatchers: { id: string; regex: RegExp; allowPartial: boolean; exceptions?: string[] }[];

  constructor() {
    // Build regexes from profanity list
    const combined = ([] as any[]).concat(enList as any[], tlcbList as any[]);
    this.profanityMatchers = combined.map((item) => {
      const parts = String(item.match || '').split('|').map(p => p.trim()).filter(Boolean);
      const escapedParts = parts.map((p) => {
        const raw = p;
        let pattern = '';
        for (let i = 0; i < raw.length; i++) {
          const ch = raw[i];
          if (ch === '*') {
            pattern += '+';
          } else {
            if ('\\^$.|?+()[]{}'.includes(ch)) {
              pattern += '\\' + ch;
            } else {
              pattern += ch;
            }
          }
        }
        return pattern;
      });
      const allowPartial = (item as any).allow_partial !== false;
      const boundary = allowPartial ? '' : '\\b';
      const regex = new RegExp(`${boundary}(?:${escapedParts.join('|')})${boundary}`, 'gi');
      return { id: (item as any).id, regex, allowPartial, exceptions: (item as any).exceptions };
    });
  }

  private filterProfanity(input: string): string {
    if (!input) return input;
    let result = input;
    for (const m of this.profanityMatchers) {
      const hasException = (m.exceptions || []).some((ex) => {
        const exPattern = ex.replace('*', '.{0,100}?');
        try {
          const exRegex = new RegExp(exPattern, 'i');
          return exRegex.test(result);
        } catch {
          return false;
        }
      });
      if (hasException) continue;
      result = result.replace(m.regex, (matched) => {
        const base = 'crossfire rocks';
        const targetLen = matched.length;
        if (targetLen <= 0) return '';
        let acc = '';
        while (acc.length < targetLen) acc += base;
        return acc.slice(0, targetLen);
      });
    }
    return result;
  }

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

    // Apply profanity filter to content
    const filteredContent = this.filterProfanity(data.messageContent);

    const chatMessage = this.lobbyRepository.create({
      chatId: data.chatId,
      senderUuid: data.senderUuid,
      messageContent: filteredContent,
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