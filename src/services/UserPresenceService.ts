/**
 * UserPresenceService - Tracks user presence and current room location
 * Manages which room a user is currently in for the follow/track feature
 */

interface UserPresence {
  userId: string;
  roomId: string | null;
  roomTitle?: string;
  joinedAt: Date;
  status: 'online' | 'offline' | 'in-room';
}

class UserPresenceServiceClass {
  private userPresences: Map<string, UserPresence> = new Map();

  /**
   * Set user's current room when they join
   */
  setUserInRoom(userId: string, roomId: string, roomTitle?: string): void {
    this.userPresences.set(userId, {
      userId,
      roomId,
      roomTitle,
      joinedAt: new Date(),
      status: 'in-room'
    });
  }

  /**
   * Remove user from room when they leave
   */
  removeUserFromRoom(userId: string): void {
    const presence = this.userPresences.get(userId);
    if (presence) {
      this.userPresences.set(userId, {
        ...presence,
        roomId: null,
        status: 'online'
      });
    }
  }

  /**
   * Get the room a user is currently in
   */
  getUserCurrentRoom(userId: string): { roomId: string; roomTitle?: string } | null {
    const presence = this.userPresences.get(userId);
    if (presence && presence.roomId && presence.status === 'in-room') {
      return {
        roomId: presence.roomId,
        roomTitle: presence.roomTitle
      };
    }
    return null;
  }

  /**
   * Check if user is in a room
   */
  isUserInRoom(userId: string): boolean {
    const presence = this.userPresences.get(userId);
    return presence?.status === 'in-room' && presence.roomId !== null;
  }

  /**
   * Get all users in a specific room
   */
  getUsersInRoom(roomId: string): string[] {
    const users: string[] = [];
    this.userPresences.forEach((presence) => {
      if (presence.roomId === roomId && presence.status === 'in-room') {
        users.push(presence.userId);
      }
    });
    return users;
  }

  /**
   * Set user online status
   */
  setUserOnline(userId: string): void {
    const presence = this.userPresences.get(userId);
    if (presence) {
      this.userPresences.set(userId, {
        ...presence,
        status: 'online'
      });
    } else {
      this.userPresences.set(userId, {
        userId,
        roomId: null,
        joinedAt: new Date(),
        status: 'online'
      });
    }
  }

  /**
   * Set user offline status
   */
  setUserOffline(userId: string): void {
    const presence = this.userPresences.get(userId);
    if (presence) {
      this.userPresences.set(userId, {
        ...presence,
        roomId: null,
        status: 'offline'
      });
    }
  }

  /**
   * Get user status
   */
  getUserStatus(userId: string): 'online' | 'offline' | 'in-room' {
    const presence = this.userPresences.get(userId);
    return presence?.status || 'offline';
  }

  /**
   * Clear all presence data (for testing/development)
   */
  clearAll(): void {
    this.userPresences.clear();
  }
}

// Export singleton instance
export const UserPresenceService = new UserPresenceServiceClass();
