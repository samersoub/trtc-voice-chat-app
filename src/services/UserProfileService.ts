import { User } from "@/models/User";
import { ProfileService } from "./ProfileService";
import { ActivityLogService } from "./ActivityLogService";

export interface UserProfileData {
  displayName: string;
  bio: string;
  status: "online" | "busy" | "away" | "offline";
  avatar?: File | string;
}

export interface UserStats {
  totalRooms: number;
  totalMinutes: number;
  totalMessages: number;
  friendsCount: number;
  level: number;
  xp: number;
}

export interface RecentRoom {
  roomId: string;
  roomName: string;
  lastVisit: string;
  duration: number;
}

export interface UserProfileExtended extends User {
  bio?: string;
  status?: "online" | "busy" | "away" | "offline";
  stats?: UserStats;
  recentRooms?: RecentRoom[];
  joinedDate?: string;
  username?: string; // Add username for compatibility
}

/**
 * Service for managing user profiles with status, statistics, and history
 */
export const UserProfileService = {
  /**
   * Get extended profile information for a user
   */
  async getProfile(userId: string): Promise<UserProfileExtended | null> {
    try {
      // Get basic profile
      const user = await ProfileService.getByUserId(userId);
      if (!user) return null;

      // Get additional profile data (bio, status, etc.)
      const profileData = this.getProfileData(userId);

      // Get user statistics
      const stats = await this.getUserStats(userId);

      // Get recent rooms
      const recentRooms = await this.getRecentRooms(userId);

      return {
        ...user,
        name: user.username || user.email?.split('@')[0],
        username: user.username,
        bio: profileData.bio,
        status: profileData.status,
        stats,
        recentRooms,
        joinedDate: profileData.joinedDate,
        createdAt: user.created_at,
        avatarUrl: user.profile_image || undefined,
      };
    } catch (error) {
      console.error("Failed to get profile:", error);
      return null;
    }
  },

  /**
   * Update user profile information
   */
  async updateProfile(userId: string, data: UserProfileData): Promise<boolean> {
    try {
      // Update avatar if provided
      if (data.avatar instanceof File) {
        await ProfileService.uploadProfileImage(userId, data.avatar);
      }

      // Update display name if changed
      const currentUser = await ProfileService.getByUserId(userId);
      if (currentUser && data.displayName !== currentUser.username) {
        // Update profile with new username
        await ProfileService.upsertProfile({ ...currentUser, username: data.displayName });
      }

      // Store bio and status in localStorage (in production, use database)
      this.saveProfileData(userId, {
        bio: data.bio,
        status: data.status,
      });

      // Log activity
      ActivityLogService.log(
        userId,
        "profile_updated",
        userId,
        { fields: ["displayName", "bio", "status", "avatar"] }
      );

      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // In production, fetch from database
      // For now, return mock data or cached data
      const cachedStats = this.getCachedStats(userId);
      if (cachedStats) return cachedStats;

      // Calculate stats from activity logs
      const activities = ActivityLogService.listByUser(userId).slice(0, 100);
      
      const totalRooms = new Set(
        activities
          .filter(a => a.action === "room_join")
          .map(a => a.meta?.roomId)
      ).size;

      const totalMinutes = activities
        .filter(a => a.action === "room_leave")
        .reduce((sum, a) => sum + (a.meta?.duration || 0), 0);

      const totalMessages = activities.filter(a => a.action === "message_sent").length;

      const friendsCount = this.getFriendsCount(userId);

      // Calculate level based on XP (1000 XP per level)
      const xp = this.calculateXP(totalRooms, totalMinutes, totalMessages);
      const level = Math.floor(xp / 1000) + 1;

      const stats: UserStats = {
        totalRooms,
        totalMinutes,
        totalMessages,
        friendsCount,
        level,
        xp,
      };

      // Cache stats
      this.cacheStats(userId, stats);

      return stats;
    } catch (error) {
      console.error("Failed to get user stats:", error);
      return {
        totalRooms: 0,
        totalMinutes: 0,
        totalMessages: 0,
        friendsCount: 0,
        level: 1,
        xp: 0,
      };
    }
  },

  /**
   * Get recent rooms user visited
   */
  async getRecentRooms(userId: string): Promise<RecentRoom[]> {
    try {
      const activities = ActivityLogService.listByUser(userId).slice(0, 50);
      
      const roomVisits: Map<string, RecentRoom> = new Map();

      activities.forEach(activity => {
        if (activity.action === "room_join" && activity.meta?.roomId) {
          const roomId = activity.meta.roomId;
          
          if (!roomVisits.has(roomId)) {
            roomVisits.set(roomId, {
              roomId,
              roomName: activity.meta.roomName || `Room ${roomId}`,
              lastVisit: this.formatDate(new Date(activity.at).toISOString()),
              duration: activity.meta.duration || 0,
            });
          }
        }
      });

      return Array.from(roomVisits.values()).slice(0, 5);
    } catch (error) {
      console.error("Failed to get recent rooms:", error);
      return [];
    }
  },

  /**
   * Update user status
   */
  updateStatus(userId: string, status: "online" | "busy" | "away" | "offline"): void {
    const profileData = this.getProfileData(userId);
    this.saveProfileData(userId, { ...profileData, status });
  },

  /**
   * Get user's current status
   */
  getUserStatus(userId: string): "online" | "busy" | "away" | "offline" {
    const profileData = this.getProfileData(userId);
    return profileData.status || "online";
  },

  // Private helper methods

  getProfileData(userId: string): { bio: string; status: "online" | "busy" | "away" | "offline"; joinedDate: string } {
    const key = `profile:${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Invalid data, return defaults
      }
    }
    return {
      bio: "",
      status: "online",
      joinedDate: this.formatDate(new Date().toISOString()),
    };
  },

  saveProfileData(userId: string, data: Partial<{ bio: string; status: "online" | "busy" | "away" | "offline" }>): void {
    const key = `profile:${userId}`;
    const current = this.getProfileData(userId);
    localStorage.setItem(key, JSON.stringify({ ...current, ...data }));
  },

  getCachedStats(userId: string): UserStats | null {
    const key = `stats:${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Cache expires after 5 minutes
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          return data.stats;
        }
      } catch {
        // Invalid cache
      }
    }
    return null;
  },

  cacheStats(userId: string, stats: UserStats): void {
    const key = `stats:${userId}`;
    localStorage.setItem(key, JSON.stringify({ stats, timestamp: Date.now() }));
  },

  getFriendsCount(userId: string): number {
    // In production, fetch from database
    // For now, return cached or default value
    const key = `friends:${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  },

  calculateXP(rooms: number, minutes: number, messages: number): number {
    // XP formula: rooms * 100 + minutes * 2 + messages * 5
    return rooms * 100 + minutes * 2 + messages * 5;
  },

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  },
};
