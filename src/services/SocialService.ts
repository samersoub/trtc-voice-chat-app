/**
 * Social service for managing follows, followers, and social interactions
 */

import { NotificationService } from './NotificationService';
import { AuthService } from './AuthService';

export interface FollowRelationship {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface UserSocialStats {
  userId: string;
  followersCount: number;
  followingCount: number;
  roomsHosted: number;
  totalSpeakingTime: number; // in seconds
  joinDate: Date;
}

class SocialServiceClass {
  private readonly STORAGE_KEY = 'social:relationships';
  private readonly STATS_KEY = 'social:stats';
  private relationships: Map<string, Set<string>> = new Map(); // followerId -> Set of followingIds
  private stats: Map<string, UserSocialStats> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Follow a user
   */
  follow(followerId: string, followingId: string): boolean {
    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    if (this.isFollowing(followerId, followingId)) {
      return false; // Already following
    }

    // Add relationship
    if (!this.relationships.has(followerId)) {
      this.relationships.set(followerId, new Set());
    }
    this.relationships.get(followerId)!.add(followingId);

    // Update stats
    this.incrementFollowingCount(followerId);
    this.incrementFollowersCount(followingId);

    // Send notification to the user being followed
    const followerUser = AuthService.getCurrentUser();
    if (followerUser && followerUser.id === followerId) {
      NotificationService.sendFollowNotification(
        followerId,
        followerUser.name || 'User',
        followerUser.avatarUrl,
        followingId
      );
    }

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Unfollow a user
   */
  unfollow(followerId: string, followingId: string): boolean {
    if (!this.isFollowing(followerId, followingId)) {
      return false; // Not following
    }

    // Remove relationship
    this.relationships.get(followerId)?.delete(followingId);

    // Update stats
    this.decrementFollowingCount(followerId);
    this.decrementFollowersCount(followingId);

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Check if user is following another user
   */
  isFollowing(followerId: string, followingId: string): boolean {
    return this.relationships.get(followerId)?.has(followingId) || false;
  }

  /**
   * Get list of users that a user is following
   */
  getFollowing(userId: string): string[] {
    return Array.from(this.relationships.get(userId) || []);
  }

  /**
   * Get list of followers for a user
   */
  getFollowers(userId: string): string[] {
    const followers: string[] = [];
    this.relationships.forEach((followingSet, followerId) => {
      if (followingSet.has(userId)) {
        followers.push(followerId);
      }
    });
    return followers;
  }

  /**
   * Get social stats for a user
   */
  getUserStats(userId: string): UserSocialStats {
    let stats = this.stats.get(userId);
    if (!stats) {
      stats = {
        userId,
        followersCount: this.getFollowers(userId).length,
        followingCount: this.getFollowing(userId).length,
        roomsHosted: 0,
        totalSpeakingTime: 0,
        joinDate: new Date(),
      };
      this.stats.set(userId, stats);
      this.saveToStorage();
    }
    return stats;
  }

  /**
   * Get all user stats
   */
  getAllUserStats(): UserSocialStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Update user stats
   */
  updateStats(userId: string, updates: Partial<Omit<UserSocialStats, 'userId'>>): void {
    const stats = this.getUserStats(userId);
    Object.assign(stats, updates);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Increment rooms hosted count
   */
  incrementRoomsHosted(userId: string): void {
    const stats = this.getUserStats(userId);
    stats.roomsHosted++;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Add speaking time (in seconds)
   */
  addSpeakingTime(userId: string, seconds: number): void {
    const stats = this.getUserStats(userId);
    stats.totalSpeakingTime += seconds;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get mutual followers (users who both follow each other)
   */
  getMutualFollowers(userId: string): string[] {
    const followers = this.getFollowers(userId);
    const following = this.getFollowing(userId);
    return followers.filter(id => following.includes(id));
  }

  /**
   * Get suggested users to follow (based on mutual connections)
   */
  getSuggestedFollows(userId: string, limit: number = 5): string[] {
    const following = this.getFollowing(userId);
    const suggestions = new Map<string, number>(); // userId -> score

    // Get users followed by people you follow
    following.forEach(followingId => {
      const theirFollowing = this.getFollowing(followingId);
      theirFollowing.forEach(suggestedId => {
        if (suggestedId !== userId && !following.includes(suggestedId)) {
          suggestions.set(suggestedId, (suggestions.get(suggestedId) || 0) + 1);
        }
      });
    });

    // Sort by score and return top N
    return Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId]) => userId);
  }

  /**
   * Subscribe to social updates
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Format speaking time to human-readable string
   */
  formatSpeakingTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  }

  /**
   * Format join date
   */
  formatJoinDate(date: Date): string {
    const now = new Date();
    const joinDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }

  // Private methods

  private incrementFollowingCount(userId: string): void {
    const stats = this.getUserStats(userId);
    stats.followingCount++;
  }

  private decrementFollowingCount(userId: string): void {
    const stats = this.getUserStats(userId);
    stats.followingCount = Math.max(0, stats.followingCount - 1);
  }

  private incrementFollowersCount(userId: string): void {
    const stats = this.getUserStats(userId);
    stats.followersCount++;
  }

  private decrementFollowersCount(userId: string): void {
    const stats = this.getUserStats(userId);
    stats.followersCount = Math.max(0, stats.followersCount - 1);
  }

  private loadFromStorage(): void {
    try {
      // Load relationships
      const relationshipsData = localStorage.getItem(this.STORAGE_KEY);
      if (relationshipsData) {
        const parsed = JSON.parse(relationshipsData);
        this.relationships = new Map(
          Object.entries(parsed).map(([key, value]) => [key, new Set(value as string[])])
        );
      }

      // Load stats
      const statsData = localStorage.getItem(this.STATS_KEY);
      if (statsData) {
        const parsed: Record<string, UserSocialStats> = JSON.parse(statsData);
        this.stats = new Map(
          Object.entries(parsed).map(([key, value]) => [
            key,
            {
              ...value,
              joinDate: new Date(value.joinDate),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load social data from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      // Save relationships
      const relationshipsObj: Record<string, string[]> = {};
      this.relationships.forEach((value, key) => {
        relationshipsObj[key] = Array.from(value);
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(relationshipsObj));

      // Save stats
      const statsObj: Record<string, UserSocialStats> = {};
      this.stats.forEach((value, key) => {
        statsObj[key] = value;
      });
      localStorage.setItem(this.STATS_KEY, JSON.stringify(statsObj));
    } catch (error) {
      console.error('Failed to save social data to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.relationships.clear();
    this.stats.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STATS_KEY);
    this.notifyListeners();
  }
}

export const SocialService = new SocialServiceClass();
