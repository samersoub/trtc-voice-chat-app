/**
 * ChatHistoryService - سجل المحادثات مع Pagination
 * حفظ واسترجاع سجل الرسائل
 */

import { Message } from '@/models/Message';

export interface ChatHistory {
  roomId: string;
  messages: Message[];
  participants: string[];
  lastMessageAt: Date;
  totalMessages: number;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
  before?: Date; // الرسائل قبل هذا التاريخ
  after?: Date; // الرسائل بعد هذا التاريخ
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

class ChatHistoryServiceClass {
  private history: Map<string, Message[]> = new Map(); // roomId -> messages
  private readonly MAX_MESSAGES_PER_ROOM = 10000; // أقصى عدد رسائل محفوظة

  constructor() {
    this.loadFromStorage();
  }

  /**
   * إضافة رسالة لسجل المحادثات
   */
  addMessage(roomId: string, message: Message): void {
    const messages = this.history.get(roomId) || [];
    
    // التحقق من عدم التكرار
    if (messages.some(m => m.id === message.id)) {
      return;
    }

    // إضافة الرسالة
    messages.push(message);

    // ترتيب حسب التاريخ
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // الحفاظ على الحد الأقصى
    if (messages.length > this.MAX_MESSAGES_PER_ROOM) {
      messages.splice(0, messages.length - this.MAX_MESSAGES_PER_ROOM);
    }

    this.history.set(roomId, messages);
    this.saveToStorage(roomId);
  }

  /**
   * إضافة رسائل متعددة
   */
  addMessages(roomId: string, messages: Message[]): void {
    messages.forEach(msg => this.addMessage(roomId, msg));
  }

  /**
   * الحصول على الرسائل مع Pagination
   */
  getMessages(
    roomId: string,
    options: Partial<PaginationOptions> = {}
  ): PaginatedResult<Message> {
    const {
      limit = 50,
      offset = 0,
      before,
      after,
    } = options;

    let messages = this.history.get(roomId) || [];

    // تطبيق فلاتر التاريخ
    if (before) {
      messages = messages.filter(m => m.timestamp < before);
    }
    if (after) {
      messages = messages.filter(m => m.timestamp > after);
    }

    const total = messages.length;
    const paginatedMessages = messages.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      data: paginatedMessages,
      total,
      hasMore,
      nextOffset: hasMore ? offset + limit : undefined,
    };
  }

  /**
   * الحصول على آخر N رسالة
   */
  getRecentMessages(roomId: string, limit: number = 50): Message[] {
    const messages = this.history.get(roomId) || [];
    return messages.slice(-limit);
  }

  /**
   * البحث في الرسائل
   */
  searchMessages(
    roomId: string,
    query: string,
    options: Partial<PaginationOptions> = {}
  ): PaginatedResult<Message> {
    const messages = this.history.get(roomId) || [];
    const lowerQuery = query.toLowerCase();

    const filtered = messages.filter(
      msg =>
        msg.text?.toLowerCase().includes(lowerQuery) ||
        msg.senderName?.toLowerCase().includes(lowerQuery)
    );

    const { limit = 50, offset = 0 } = options;
    const total = filtered.length;
    const paginatedMessages = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      data: paginatedMessages,
      total,
      hasMore,
      nextOffset: hasMore ? offset + limit : undefined,
    };
  }

  /**
   * الحصول على رسالة محددة
   */
  getMessage(roomId: string, messageId: string): Message | undefined {
    const messages = this.history.get(roomId) || [];
    return messages.find(m => m.id === messageId);
  }

  /**
   * حذف رسالة
   */
  deleteMessage(roomId: string, messageId: string): boolean {
    const messages = this.history.get(roomId) || [];
    const filtered = messages.filter(m => m.id !== messageId);
    
    if (filtered.length === messages.length) {
      return false; // لم تحذف
    }

    this.history.set(roomId, filtered);
    this.saveToStorage(roomId);
    return true;
  }

  /**
   * حذف رسائل متعددة
   */
  deleteMessages(roomId: string, messageIds: string[]): number {
    const messages = this.history.get(roomId) || [];
    const idsSet = new Set(messageIds);
    const filtered = messages.filter(m => !idsSet.has(m.id));
    
    const deletedCount = messages.length - filtered.length;
    
    if (deletedCount > 0) {
      this.history.set(roomId, filtered);
      this.saveToStorage(roomId);
    }

    return deletedCount;
  }

  /**
   * مسح جميع رسائل غرفة
   */
  clearRoomHistory(roomId: string): void {
    this.history.delete(roomId);
    localStorage.removeItem(`chatHistory:${roomId}`);
  }

  /**
   * مسح رسائل أقدم من تاريخ محدد
   */
  clearOldMessages(roomId: string, before: Date): number {
    const messages = this.history.get(roomId) || [];
    const filtered = messages.filter(m => m.timestamp >= before);
    
    const deletedCount = messages.length - filtered.length;
    
    if (deletedCount > 0) {
      this.history.set(roomId, filtered);
      this.saveToStorage(roomId);
    }

    return deletedCount;
  }

  /**
   * الحصول على إحصائيات الغرفة
   */
  getRoomStats(roomId: string): {
    totalMessages: number;
    firstMessageAt?: Date;
    lastMessageAt?: Date;
    uniqueUsers: number;
    messagesPerUser: Record<string, number>;
  } {
    const messages = this.history.get(roomId) || [];
    
    const messagesPerUser: Record<string, number> = {};
    messages.forEach(msg => {
      messagesPerUser[msg.senderId] = (messagesPerUser[msg.senderId] || 0) + 1;
    });

    return {
      totalMessages: messages.length,
      firstMessageAt: messages[0]?.timestamp,
      lastMessageAt: messages[messages.length - 1]?.timestamp,
      uniqueUsers: Object.keys(messagesPerUser).length,
      messagesPerUser,
    };
  }

  /**
   * تصدير السجل
   */
  exportHistory(roomId: string, format: 'json' | 'txt' = 'json'): string {
    const messages = this.history.get(roomId) || [];

    if (format === 'json') {
      return JSON.stringify(messages, null, 2);
    }

    // تنسيق نصي
    return messages
      .map(msg => {
        const time = msg.timestamp.toLocaleString('ar-SA');
        return `[${time}] ${msg.senderName}: ${msg.text}`;
      })
      .join('\n');
  }

  /**
   * استيراد السجل
   */
  importHistory(roomId: string, data: string, format: 'json' | 'txt' = 'json'): number {
    try {
      if (format === 'json') {
        const messages: Message[] = JSON.parse(data);
        messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp);
          this.addMessage(roomId, msg);
        });
        return messages.length;
      }
      
      // TODO: دعم تنسيق txt
      return 0;
    } catch (error) {
      console.error('فشل استيراد السجل:', error);
      return 0;
    }
  }

  /**
   * حفظ في localStorage
   */
  private saveToStorage(roomId: string): void {
    try {
      const messages = this.history.get(roomId) || [];
      // حفظ آخر 1000 رسالة فقط لتوفير المساحة
      const toSave = messages.slice(-1000);
      localStorage.setItem(`chatHistory:${roomId}`, JSON.stringify(toSave));
    } catch (error) {
      console.error('فشل حفظ السجل:', error);
    }
  }

  /**
   * تحميل من localStorage
   */
  private loadFromStorage(): void {
    try {
      // تحميل قائمة الغرف المحفوظة
      const keys = Object.keys(localStorage).filter(k => k.startsWith('chatHistory:'));
      
      keys.forEach(key => {
        const roomId = key.replace('chatHistory:', '');
        const data = localStorage.getItem(key);
        
        if (data) {
          const messages: Message[] = JSON.parse(data);
          messages.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
          });
          this.history.set(roomId, messages);
        }
      });

      console.log(`تم تحميل سجل ${keys.length} غرفة`);
    } catch (error) {
      console.error('فشل تحميل السجل:', error);
    }
  }

  /**
   * الحصول على جميع الغرف التي لديها سجل
   */
  getRoomsWithHistory(): string[] {
    return Array.from(this.history.keys());
  }

  /**
   * حجم التخزين المستخدم (بالبايت)
   */
  getStorageSize(): number {
    let size = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chatHistory:')) {
        size += localStorage.getItem(key)?.length || 0;
      }
    });
    return size;
  }

  /**
   * تنظيف السجل القديم (أكثر من N يوم)
   */
  cleanupOldHistory(daysOld: number = 30): number {
    const cutoffDate = new Date(Date.now() - daysOld * 86400000);
    let totalDeleted = 0;

    this.history.forEach((messages, roomId) => {
      const deleted = this.clearOldMessages(roomId, cutoffDate);
      totalDeleted += deleted;
    });

    return totalDeleted;
  }
}

export const ChatHistoryService = new ChatHistoryServiceClass();
