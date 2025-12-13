/**
 * Notification service for managing user notifications
 */

export type NotificationType = 'follow' | 'room_invite' | 'mention' | 'gift' | 'message' | 'system';

export interface Notification {
  id: string;
  userId: string; // recipient
  type: NotificationType;
  title: string;
  message: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  roomId?: string;
  roomName?: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface NotificationSettings {
  userId: string;
  followNotifications: boolean;
  roomInviteNotifications: boolean;
  mentionNotifications: boolean;
  giftNotifications: boolean;
  messageNotifications: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

class NotificationServiceClass {
  private readonly STORAGE_KEY = 'notifications:data';
  private readonly SETTINGS_KEY = 'notifications:settings';
  private notifications: Map<string, Notification[]> = new Map(); // userId -> notifications
  private settings: Map<string, NotificationSettings> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Send a notification to a user
   */
  send(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const userSettings = this.getUserSettings(notification.userId);
    
    // Check if notification type is enabled
    const typeEnabled = this.isNotificationTypeEnabled(userSettings, notification.type);
    if (!typeEnabled) {
      return notification as Notification; // Return without sending
    }

    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date(),
      isRead: false,
    };

    if (!this.notifications.has(notification.userId)) {
      this.notifications.set(notification.userId, []);
    }

    this.notifications.get(notification.userId)!.unshift(newNotification);

    // Keep only last 100 notifications per user
    const userNotifications = this.notifications.get(notification.userId)!;
    if (userNotifications.length > 100) {
      this.notifications.set(notification.userId, userNotifications.slice(0, 100));
    }

    // Show desktop notification if enabled
    if (userSettings.desktopNotifications && this.hasDesktopPermission()) {
      this.showDesktopNotification(newNotification);
    }

    // Play sound if enabled
    if (userSettings.soundEnabled) {
      this.playNotificationSound();
    }

    this.saveToStorage();
    this.notifyListeners();

    return newNotification;
  }

  /**
   * Send follow notification
   */
  sendFollowNotification(followerId: string, followerName: string, followerAvatar: string | undefined, followedUserId: string): void {
    this.send({
      userId: followedUserId,
      type: 'follow',
      title: 'New Follower',
      message: `${followerName} started following you`,
      fromUserId: followerId,
      fromUserName: followerName,
      fromUserAvatar: followerAvatar,
      actionUrl: `/profile/${followerId}`,
    });
  }

  /**
   * Send room invite notification
   */
  sendRoomInviteNotification(fromUserId: string, fromUserName: string, toUserId: string, roomId: string, roomName: string): void {
    this.send({
      userId: toUserId,
      type: 'room_invite',
      title: 'Room Invitation',
      message: `${fromUserName} invited you to join "${roomName}"`,
      fromUserId,
      fromUserName,
      roomId,
      roomName,
      actionUrl: `/voice-chat/${roomId}`,
    });
  }

  /**
   * Send mention notification
   */
  sendMentionNotification(fromUserId: string, fromUserName: string, toUserId: string, roomId: string, roomName: string, message: string): void {
    this.send({
      userId: toUserId,
      type: 'mention',
      title: 'You were mentioned',
      message: `${fromUserName} mentioned you in "${roomName}": ${message.substring(0, 50)}...`,
      fromUserId,
      fromUserName,
      roomId,
      roomName,
      actionUrl: `/voice-chat/${roomId}`,
    });
  }

  /**
   * Get notifications for a user
   */
  getUserNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const notifications = this.notifications.get(userId) || [];
    return unreadOnly ? notifications.filter(n => !n.isRead) : notifications;
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string): number {
    return this.getUserNotifications(userId, true).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): void {
    const notifications = this.notifications.get(userId);
    if (notifications) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        this.saveToStorage();
        this.notifyListeners();
      }
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(userId: string): void {
    const notifications = this.notifications.get(userId);
    if (notifications) {
      notifications.forEach(n => n.isRead = true);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(userId: string, notificationId: string): void {
    const notifications = this.notifications.get(userId);
    if (notifications) {
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications.splice(index, 1);
        this.saveToStorage();
        this.notifyListeners();
      }
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(userId: string): void {
    this.notifications.set(userId, []);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get user settings
   */
  getUserSettings(userId: string): NotificationSettings {
    let settings = this.settings.get(userId);
    if (!settings) {
      settings = {
        userId,
        followNotifications: true,
        roomInviteNotifications: true,
        mentionNotifications: true,
        giftNotifications: true,
        messageNotifications: true,
        systemNotifications: true,
        soundEnabled: true,
        desktopNotifications: false,
      };
      this.settings.set(userId, settings);
      this.saveToStorage();
    }
    return settings;
  }

  /**
   * Update user settings
   */
  updateSettings(userId: string, updates: Partial<NotificationSettings>): void {
    const settings = this.getUserSettings(userId);
    Object.assign(settings, updates);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Request desktop notification permission
   */
  async requestDesktopPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Check if desktop notifications are permitted
   */
  hasDesktopPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Format notification time
   */
  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  // Private methods

  private isNotificationTypeEnabled(settings: NotificationSettings, type: NotificationType): boolean {
    switch (type) {
      case 'follow': return settings.followNotifications;
      case 'room_invite': return settings.roomInviteNotifications;
      case 'mention': return settings.mentionNotifications;
      case 'gift': return settings.giftNotifications;
      case 'message': return settings.messageNotifications;
      case 'system': return settings.systemNotifications;
      default: return true;
    }
  }

  private showDesktopNotification(notification: Notification): void {
    if (!this.hasDesktopPermission()) return;

    new Notification(notification.title, {
      body: notification.message,
      icon: notification.fromUserAvatar || '/icon-192.png',
      badge: '/icon-192.png',
      tag: notification.id,
    });
  }

  private playNotificationSound(): void {
    // Simple beep sound using Web Audio API
    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextConstructor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      // Load notifications
      const notificationsData = localStorage.getItem(this.STORAGE_KEY);
      if (notificationsData) {
        const parsed: Record<string, Notification[]> = JSON.parse(notificationsData);
        this.notifications = new Map(
          Object.entries(parsed).map(([key, value]) => [
            key,
            value.map(n => ({ ...n, createdAt: new Date(n.createdAt) })),
          ])
        );
      }

      // Load settings
      const settingsData = localStorage.getItem(this.SETTINGS_KEY);
      if (settingsData) {
        const parsed: Record<string, NotificationSettings> = JSON.parse(settingsData);
        this.settings = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      // Save notifications
      const notificationsObj: Record<string, Notification[]> = {};
      this.notifications.forEach((value, key) => {
        notificationsObj[key] = value;
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notificationsObj));

      // Save settings
      const settingsObj: Record<string, NotificationSettings> = {};
      this.settings.forEach((value, key) => {
        settingsObj[key] = value;
      });
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settingsObj));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.notifications.clear();
    this.settings.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    this.notifyListeners();
  }

  // ===================================================================
  // Phase 1 Feature Badges
  // ===================================================================

  /**
   * Get Phase 1 feature badges
   */
  async getPhase1Badges(userId: string): Promise<Phase1Badges> {
    try {
      const { DailyMissionsService } = await import('./DailyMissionsService');
      const { FriendRecommendationService } = await import('./FriendRecommendationService');
      const { LuckyWheelService } = await import('./LuckyWheelService');

      // Get uncompleted missions
      const missions = await DailyMissionsService.getMissions(userId);
      const uncompletedMissions = missions.filter(m => !m.completed).length;
      
      // Get unclaimed rewards (completed but not claimed)
      const unclaimedRewards = missions.filter(m => m.completed && !m.claimed).length;
      
      // Get friend recommendations
      const recommendations = await FriendRecommendationService.getRecommendations(10);
      const newRecommendations = this.getNewRecommendationsCount(recommendations.length);
      
      // Get available spins
      const wheelStats = await LuckyWheelService.getSpinStats(userId);
      const availableSpins = wheelStats.remainingSpins || 0;
      
      const badges: Phase1Badges = {
        missions: uncompletedMissions,
        friends: newRecommendations,
        wheel: availableSpins,
        rewards: unclaimedRewards,
        total: uncompletedMissions + newRecommendations + availableSpins + unclaimedRewards
      };
      
      // Cache badges
      localStorage.setItem('phase1_badges', JSON.stringify(badges));
      
      return badges;
    } catch (error) {
      console.error('Failed to get Phase 1 badges:', error);
      
      // Return cached badges if available
      const cached = localStorage.getItem('phase1_badges');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { }
      }
      
      // Return empty badges
      return {
        missions: 0,
        friends: 0,
        wheel: 0,
        rewards: 0,
        total: 0
      };
    }
  }

  /**
   * Get cached Phase 1 badges (for quick access)
   */
  getCachedPhase1Badges(): Phase1Badges {
    const cached = localStorage.getItem('phase1_badges');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch { }
    }
    
    return {
      missions: 0,
      friends: 0,
      wheel: 0,
      rewards: 0,
      total: 0
    };
  }

  /**
   * Get new recommendations count
   */
  private getNewRecommendationsCount(totalCount: number): number {
    const lastCheck = localStorage.getItem('phase1_last_check');
    const lastCheckData = lastCheck ? JSON.parse(lastCheck) : null;
    
    if (!lastCheckData || !lastCheckData.friendsCount) {
      return totalCount > 0 ? totalCount : 0;
    }
    
    const newCount = Math.max(0, totalCount - lastCheckData.friendsCount);
    return newCount;
  }

  /**
   * Clear specific Phase 1 badge
   */
  clearPhase1Badge(type: keyof Omit<Phase1Badges, 'total'>): void {
    const badges = this.getCachedPhase1Badges();
    badges[type] = 0;
    badges.total = badges.missions + badges.friends + badges.wheel + badges.rewards;
    localStorage.setItem('phase1_badges', JSON.stringify(badges));
    this.notifyListeners();
  }

  /**
   * Refresh Phase 1 badges
   */
  async refreshPhase1Badges(userId: string): Promise<void> {
    try {
      await this.getPhase1Badges(userId);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to refresh Phase 1 badges:', error);
    }
  }
}

export interface Phase1Badges {
  missions: number; // Uncompleted missions
  friends: number; // New friend recommendations
  wheel: number; // Available spins
  rewards: number; // Unclaimed rewards
  total: number; // Total badges
}

export const NotificationService = new NotificationServiceClass();
