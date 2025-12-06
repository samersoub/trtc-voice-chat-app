/**
 * MessagesService - Manages user messages, app notifications, and admin notifications
 */

export type MessageType = 'user' | 'app' | 'admin';
export type MessageStatus = 'unread' | 'read';

export interface UserMessage {
  id: string;
  type: 'user';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  isOnline?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'app';
  title: string;
  content: string;
  icon: string;
  status: MessageStatus;
  createdAt: Date;
  actionUrl?: string;
}

export interface AdminNotification {
  id: string;
  type: 'admin';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: MessageStatus;
  createdAt: Date;
  actionUrl?: string;
}

export type Message = UserMessage | AppNotification | AdminNotification;

class MessagesServiceClass {
  private messages: Map<string, Message> = new Map();

  /**
   * Send a user message
   */
  sendUserMessage(
    fromUserId: string,
    fromUserName: string,
    fromUserAvatar: string,
    toUserId: string,
    content: string
  ): UserMessage {
    const message: UserMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      fromUserId,
      fromUserName,
      fromUserAvatar,
      toUserId,
      content,
      status: 'unread',
      createdAt: new Date(),
      isOnline: Math.random() > 0.5, // Random for demo
    };
    this.messages.set(message.id, message);
    return message;
  }

  /**
   * Create app notification
   */
  createAppNotification(
    title: string,
    content: string,
    icon: string,
    actionUrl?: string
  ): AppNotification {
    const notification: AppNotification = {
      id: `app_${Date.now()}`,
      type: 'app',
      title,
      content,
      icon,
      status: 'unread',
      createdAt: new Date(),
      actionUrl,
    };
    this.messages.set(notification.id, notification);
    return notification;
  }

  /**
   * Create admin notification
   */
  createAdminNotification(
    title: string,
    content: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    actionUrl?: string
  ): AdminNotification {
    const notification: AdminNotification = {
      id: `admin_${Date.now()}`,
      type: 'admin',
      title,
      content,
      priority,
      status: 'unread',
      createdAt: new Date(),
      actionUrl,
    };
    this.messages.set(notification.id, notification);
    return notification;
  }

  /**
   * Get all messages for a user
   */
  getUserMessages(userId: string): Message[] {
    const userMessages: Message[] = [];
    this.messages.forEach((message) => {
      if (message.type === 'user' && message.toUserId === userId) {
        userMessages.push(message);
      } else if (message.type === 'app' || message.type === 'admin') {
        userMessages.push(message);
      }
    });
    return userMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get messages by type
   */
  getMessagesByType(userId: string, type: MessageType): Message[] {
    return this.getUserMessages(userId).filter(m => m.type === type);
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string): boolean {
    const message = this.messages.get(messageId);
    if (message) {
      message.status = 'read';
      return true;
    }
    return false;
  }

  /**
   * Mark all messages as read
   */
  markAllAsRead(userId: string, type?: MessageType): void {
    this.getUserMessages(userId).forEach(message => {
      if (!type || message.type === type) {
        message.status = 'read';
      }
    });
  }

  /**
   * Delete message
   */
  deleteMessage(messageId: string): boolean {
    return this.messages.delete(messageId);
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string, type?: MessageType): number {
    const messages = type 
      ? this.getMessagesByType(userId, type)
      : this.getUserMessages(userId);
    return messages.filter(m => m.status === 'unread').length;
  }

  /**
   * Search messages
   */
  searchMessages(userId: string, query: string): Message[] {
    const lowerQuery = query.toLowerCase();
    return this.getUserMessages(userId).filter(message => {
      if (message.type === 'user') {
        return message.fromUserName.toLowerCase().includes(lowerQuery) ||
               message.content.toLowerCase().includes(lowerQuery);
      } else {
        return message.title.toLowerCase().includes(lowerQuery) ||
               message.content.toLowerCase().includes(lowerQuery);
      }
    });
  }

  /**
   * Initialize demo messages
   */
  initializeDemoMessages(userId: string): void {
    // User messages
    this.sendUserMessage(
      'user123',
      'أحمد الأردني',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user123',
      userId,
      'مرحباً! كيف حالك؟ هل تريد الانضمام للغرفة الصوتية؟'
    );

    this.sendUserMessage(
      'user456',
      'سارة السورية',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user456',
      userId,
      'شكراً على الهدية! ❤️'
    );

    this.sendUserMessage(
      'user789',
      'محمد المصري',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user789',
      userId,
      'هل شاهدت البث المباشر اليوم؟ كان رائعاً! 🎵'
    );

    // App notifications
    this.createAppNotification(
      'مكافأة يومية',
      'تهانينا! حصلت على 100 عملة ذهبية كمكافأة يومية 🎁',
      '🎁',
      '/rewards'
    );

    this.createAppNotification(
      'مستوى جديد',
      'مبروك! وصلت إلى المستوى 29 🎉',
      '🏆',
      '/profile'
    );

    this.createAppNotification(
      'صديق جديد',
      'بدأ أحمد الأردني بمتابعتك',
      '👥',
      '/profile/user123'
    );

    // Admin notifications
    this.createAdminNotification(
      'تحديث النظام',
      'سيتم إجراء صيانة للنظام يوم الجمعة من الساعة 2 صباحاً حتى 4 صباحاً',
      'high'
    );

    this.createAdminNotification(
      'قواعد المجتمع',
      'تذكير: يرجى احترام قواعد المجتمع والتعامل بلطف مع الجميع',
      'medium'
    );

    this.createAdminNotification(
      'عرض خاص',
      'خصم 50% على جميع باقات الألماس لمدة 24 ساعة فقط! 💎',
      'high',
      '/store'
    );
  }
}

export const MessagesService = new MessagesServiceClass();
