/**
 * User status service for managing online/offline and activity states
 */

export type UserStatus = 'online' | 'in-room' | 'away' | 'dnd' | 'offline';

export interface UserStatusData {
  userId: string;
  status: UserStatus;
  lastActive: Date;
  currentRoomId?: string;
  currentRoomName?: string;
  customMessage?: string;
}

class UserStatusServiceClass {
  private readonly STORAGE_KEY = 'user:statuses';
  private readonly ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private statuses: Map<string, UserStatusData> = new Map();
  private listeners: Set<() => void> = new Set();
  private activityInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
    this.startActivityMonitoring();
  }

  /**
   * Set user status
   */
  setStatus(userId: string, status: UserStatus, customMessage?: string): void {
    const existing = this.statuses.get(userId);
    const statusData: UserStatusData = {
      userId,
      status,
      lastActive: new Date(),
      currentRoomId: existing?.currentRoomId,
      currentRoomName: existing?.currentRoomName,
      customMessage,
    };

    this.statuses.set(userId, statusData);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Set user as online
   */
  setOnline(userId: string): void {
    this.setStatus(userId, 'online');
  }

  /**
   * Set user as in a room
   */
  setInRoom(userId: string, roomId: string, roomName: string): void {
    const statusData: UserStatusData = {
      userId,
      status: 'in-room',
      lastActive: new Date(),
      currentRoomId: roomId,
      currentRoomName: roomName,
    };

    this.statuses.set(userId, statusData);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Set user as away (AFK)
   */
  setAway(userId: string): void {
    this.setStatus(userId, 'away');
  }

  /**
   * Set user as Do Not Disturb
   */
  setDND(userId: string, customMessage?: string): void {
    this.setStatus(userId, 'dnd', customMessage);
  }

  /**
   * Set user as offline
   */
  setOffline(userId: string): void {
    const statusData = this.statuses.get(userId);
    if (statusData) {
      statusData.status = 'offline';
      statusData.lastActive = new Date();
      statusData.currentRoomId = undefined;
      statusData.currentRoomName = undefined;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Get user status
   */
  getStatus(userId: string): UserStatusData {
    const status = this.statuses.get(userId);
    if (!status) {
      // Default status for unknown users
      return {
        userId,
        status: 'offline',
        lastActive: new Date(),
      };
    }

    // Auto-detect away based on last activity
    if (status.status === 'online' || status.status === 'in-room') {
      const timeSinceActive = Date.now() - new Date(status.lastActive).getTime();
      if (timeSinceActive > this.ACTIVITY_TIMEOUT) {
        status.status = 'away';
      }
    }

    return status;
  }

  /**
   * Update user activity (resets away timer)
   */
  updateActivity(userId: string): void {
    const status = this.statuses.get(userId);
    if (status) {
      status.lastActive = new Date();
      
      // Auto-return from away to previous status
      if (status.status === 'away') {
        status.status = status.currentRoomId ? 'in-room' : 'online';
      }

      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Leave room (but stay online)
   */
  leaveRoom(userId: string): void {
    const status = this.statuses.get(userId);
    if (status) {
      status.currentRoomId = undefined;
      status.currentRoomName = undefined;
      if (status.status === 'in-room') {
        status.status = 'online';
      }
      status.lastActive = new Date();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Get all users by status
   */
  getUsersByStatus(status: UserStatus): UserStatusData[] {
    const users: UserStatusData[] = [];
    this.statuses.forEach(statusData => {
      if (this.getStatus(statusData.userId).status === status) {
        users.push(statusData);
      }
    });
    return users;
  }

  /**
   * Get online count
   */
  getOnlineCount(): number {
    let count = 0;
    this.statuses.forEach(status => {
      const currentStatus = this.getStatus(status.userId).status;
      if (currentStatus === 'online' || currentStatus === 'in-room') {
        count++;
      }
    });
    return count;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: UserStatus): string {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'in-room':
        return 'bg-purple-500';
      case 'away':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: UserStatus): string {
    switch (status) {
      case 'online':
        return 'Online';
      case 'in-room':
        return 'In a room';
      case 'away':
        return 'Away';
      case 'dnd':
        return 'Do Not Disturb';
      case 'offline':
        return 'Offline';
    }
  }

  /**
   * Format last active time
   */
  formatLastActive(lastActive: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(lastActive).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(lastActive).toLocaleDateString();
  }

  /**
   * Subscribe to status updates
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Private methods

  private startActivityMonitoring(): void {
    // Check for inactive users every minute
    this.activityInterval = setInterval(() => {
      let hasChanges = false;
      this.statuses.forEach((status) => {
        if (status.status === 'online' || status.status === 'in-room') {
          const timeSinceActive = Date.now() - new Date(status.lastActive).getTime();
          if (timeSinceActive > this.ACTIVITY_TIMEOUT) {
            status.status = 'away';
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        this.saveToStorage();
        this.notifyListeners();
      }
    }, 60 * 1000); // Check every minute
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed: Record<string, UserStatusData> = JSON.parse(data);
        this.statuses = new Map(
          Object.entries(parsed).map(([key, value]) => [
            key,
            {
              ...value,
              lastActive: new Date(value.lastActive),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load user statuses from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const obj: Record<string, UserStatusData> = {};
      this.statuses.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to save user statuses to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.statuses.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyListeners();
  }

  /**
   * Cleanup (stop monitoring)
   */
  destroy(): void {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }
}

export const UserStatusService = new UserStatusServiceClass();
