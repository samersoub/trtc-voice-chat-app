/**
 * Real-time room monitoring service for admin dashboard
 * Tracks active rooms, participants, audio quality, and engagement metrics
 */

export interface RoomMetrics {
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  participantCount: number;
  duration: number; // in seconds
  startTime: Date;
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
  averageLatency: number; // in ms
  packetsLost: number;
  bitrate: number; // in kbps
  engagementScore: number; // 0-100
  messagesCount: number;
  giftsCount: number;
  activeSpeakers: number;
}

export interface UserEngagement {
  userId: string;
  userName: string;
  totalTimeInRooms: number; // in seconds
  roomsJoined: number;
  messagesSent: number;
  giftsSent: number;
  giftValue: number; // in coins
  lastActive: Date;
  favoriteRooms: string[];
}

export interface AudioQualityMetrics {
  roomId: string;
  userId: string;
  userName: string;
  jitter: number; // in ms
  latency: number; // in ms
  packetsLost: number;
  packetsSent: number;
  bitrate: number; // in kbps
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  timestamp: Date;
}

class RoomMonitoringServiceClass {
  private roomMetrics: Map<string, RoomMetrics> = new Map();
  private userEngagement: Map<string, UserEngagement> = new Map();
  private audioQualityHistory: Map<string, AudioQualityMetrics[]> = new Map();
  private updateCallbacks: Set<() => void> = new Set();

  /**
   * Start monitoring a room
   */
  startMonitoring(roomId: string, roomName: string, hostId: string, hostName: string): void {
    const metrics: RoomMetrics = {
      roomId,
      roomName,
      hostId,
      hostName,
      participantCount: 1, // Host
      duration: 0,
      startTime: new Date(),
      audioQuality: 'excellent',
      averageLatency: 0,
      packetsLost: 0,
      bitrate: 0,
      engagementScore: 0,
      messagesCount: 0,
      giftsCount: 0,
      activeSpeakers: 0,
    };

    this.roomMetrics.set(roomId, metrics);
    this.notifyListeners();
  }

  /**
   * Stop monitoring a room
   */
  stopMonitoring(roomId: string): void {
    const metrics = this.roomMetrics.get(roomId);
    if (metrics) {
      // Archive metrics before removing
      this.archiveRoomMetrics(metrics);
      this.roomMetrics.delete(roomId);
      this.notifyListeners();
    }
  }

  /**
   * Update participant count
   */
  updateParticipantCount(roomId: string, count: number): void {
    const metrics = this.roomMetrics.get(roomId);
    if (metrics) {
      metrics.participantCount = count;
      this.notifyListeners();
    }
  }

  /**
   * Update room duration (called periodically)
   */
  updateRoomDuration(roomId: string): void {
    const metrics = this.roomMetrics.get(roomId);
    if (metrics) {
      const now = new Date();
      metrics.duration = Math.floor((now.getTime() - metrics.startTime.getTime()) / 1000);
      this.notifyListeners();
    }
  }

  /**
   * Record audio quality metrics
   */
  recordAudioQuality(
    roomId: string,
    userId: string,
    userName: string,
    quality: Omit<AudioQualityMetrics, 'roomId' | 'userId' | 'userName' | 'timestamp'>
  ): void {
    const audioMetrics: AudioQualityMetrics = {
      roomId,
      userId,
      userName,
      ...quality,
      timestamp: new Date(),
    };

    // Store in history
    if (!this.audioQualityHistory.has(roomId)) {
      this.audioQualityHistory.set(roomId, []);
    }
    const history = this.audioQualityHistory.get(roomId)!;
    history.push(audioMetrics);

    // Keep last 100 entries per room
    if (history.length > 100) {
      history.shift();
    }

    // Update room metrics
    const roomMetrics = this.roomMetrics.get(roomId);
    if (roomMetrics) {
      // Calculate average latency and quality
      const recentMetrics = history.slice(-10); // Last 10 entries
      const avgLatency = recentMetrics.reduce((sum, m) => sum + m.latency, 0) / recentMetrics.length;
      const avgPacketsLost = recentMetrics.reduce((sum, m) => sum + m.packetsLost, 0) / recentMetrics.length;
      const avgBitrate = recentMetrics.reduce((sum, m) => sum + m.bitrate, 0) / recentMetrics.length;

      roomMetrics.averageLatency = Math.round(avgLatency);
      roomMetrics.packetsLost = Math.round(avgPacketsLost);
      roomMetrics.bitrate = Math.round(avgBitrate);
      roomMetrics.audioQuality = this.calculateAudioQuality(avgLatency, avgPacketsLost);

      this.notifyListeners();
    }
  }

  /**
   * Update engagement metrics
   */
  updateEngagement(roomId: string, messagesCount?: number, giftsCount?: number, activeSpeakers?: number): void {
    const metrics = this.roomMetrics.get(roomId);
    if (metrics) {
      if (messagesCount !== undefined) metrics.messagesCount = messagesCount;
      if (giftsCount !== undefined) metrics.giftsCount = giftsCount;
      if (activeSpeakers !== undefined) metrics.activeSpeakers = activeSpeakers;

      // Calculate engagement score (0-100)
      const messageScore = Math.min(metrics.messagesCount / 10, 30); // Max 30 points
      const giftScore = Math.min(metrics.giftsCount * 5, 30); // Max 30 points
      const speakerScore = Math.min(metrics.activeSpeakers * 10, 40); // Max 40 points
      metrics.engagementScore = Math.round(messageScore + giftScore + speakerScore);

      this.notifyListeners();
    }
  }

  /**
   * Track user engagement
   */
  trackUserEngagement(
    userId: string,
    userName: string,
    action: 'join' | 'message' | 'gift',
    roomId?: string,
    giftValue?: number
  ): void {
    let engagement = this.userEngagement.get(userId);
    if (!engagement) {
      engagement = {
        userId,
        userName,
        totalTimeInRooms: 0,
        roomsJoined: 0,
        messagesSent: 0,
        giftsSent: 0,
        giftValue: 0,
        lastActive: new Date(),
        favoriteRooms: [],
      };
      this.userEngagement.set(userId, engagement);
    }

    engagement.lastActive = new Date();

    switch (action) {
      case 'join':
        engagement.roomsJoined++;
        if (roomId && !engagement.favoriteRooms.includes(roomId)) {
          engagement.favoriteRooms.push(roomId);
          if (engagement.favoriteRooms.length > 5) {
            engagement.favoriteRooms.shift();
          }
        }
        break;
      case 'message':
        engagement.messagesSent++;
        break;
      case 'gift':
        engagement.giftsSent++;
        if (giftValue) engagement.giftValue += giftValue;
        break;
    }

    this.notifyListeners();
  }

  /**
   * Get all active room metrics
   */
  getAllRoomMetrics(): RoomMetrics[] {
    return Array.from(this.roomMetrics.values());
  }

  /**
   * Get metrics for a specific room
   */
  getRoomMetrics(roomId: string): RoomMetrics | undefined {
    return this.roomMetrics.get(roomId);
  }

  /**
   * Get audio quality history for a room
   */
  getAudioQualityHistory(roomId: string): AudioQualityMetrics[] {
    return this.audioQualityHistory.get(roomId) || [];
  }

  /**
   * Get top users by engagement
   */
  getTopUsers(limit: number = 10): UserEngagement[] {
    const users = Array.from(this.userEngagement.values());
    return users
      .sort((a, b) => {
        // Sort by a combination of metrics
        const scoreA = a.messagesSent + a.giftsSent * 5 + a.roomsJoined;
        const scoreB = b.messagesSent + b.giftsSent * 5 + b.roomsJoined;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Get user engagement data
   */
  getUserEngagement(userId: string): UserEngagement | undefined {
    return this.userEngagement.get(userId);
  }

  /**
   * Get dashboard summary
   */
  getDashboardSummary() {
    const rooms = this.getAllRoomMetrics();
    const totalParticipants = rooms.reduce((sum, room) => sum + room.participantCount, 0);
    const totalMessages = rooms.reduce((sum, room) => sum + room.messagesCount, 0);
    const totalGifts = rooms.reduce((sum, room) => sum + room.giftsCount, 0);
    const avgEngagement = rooms.length > 0 
      ? rooms.reduce((sum, room) => sum + room.engagementScore, 0) / rooms.length 
      : 0;

    // Audio quality distribution
    const qualityDistribution = {
      excellent: rooms.filter(r => r.audioQuality === 'excellent').length,
      good: rooms.filter(r => r.audioQuality === 'good').length,
      fair: rooms.filter(r => r.audioQuality === 'fair').length,
      poor: rooms.filter(r => r.audioQuality === 'poor').length,
    };

    return {
      activeRooms: rooms.length,
      totalParticipants,
      totalMessages,
      totalGifts,
      averageEngagement: Math.round(avgEngagement),
      qualityDistribution,
      topRooms: rooms
        .sort((a, b) => b.participantCount - a.participantCount)
        .slice(0, 5),
      recentActivity: this.getRecentActivity(),
    };
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(callback: () => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  /**
   * Format duration as HH:MM:SS
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Private methods

  private calculateAudioQuality(latency: number, packetsLost: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (latency < 50 && packetsLost < 1) return 'excellent';
    if (latency < 100 && packetsLost < 3) return 'good';
    if (latency < 200 && packetsLost < 5) return 'fair';
    return 'poor';
  }

  private archiveRoomMetrics(metrics: RoomMetrics): void {
    // Store in localStorage for persistence
    const archives = this.getArchivedMetrics();
    archives.push({
      ...metrics,
      endTime: new Date(),
    });

    // Keep last 50 archived rooms
    if (archives.length > 50) {
      archives.shift();
    }

    localStorage.setItem('room_metrics_archive', JSON.stringify(archives));
  }

  private getArchivedMetrics(): Array<RoomMetrics & { endTime: Date }> {
    try {
      const data = localStorage.getItem('room_metrics_archive');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getRecentActivity(): Array<{type: string; message: string; timestamp: Date}> {
    const activities: Array<{type: string; message: string; timestamp: Date}> = [];
    
    // Add recent room activities
    const rooms = this.getAllRoomMetrics();
    rooms.forEach(room => {
      if (room.participantCount > 5) {
        activities.push({
          type: 'room',
          message: `${room.roomName} has ${room.participantCount} participants`,
          timestamp: new Date(),
        });
      }
    });

    return activities.slice(0, 10);
  }

  private notifyListeners(): void {
    this.updateCallbacks.forEach(callback => callback());
  }

  /**
   * Clear all data (for testing/reset)
   */
  clear(): void {
    this.roomMetrics.clear();
    this.audioQualityHistory.clear();
    this.notifyListeners();
  }
}

export const RoomMonitoringService = new RoomMonitoringServiceClass();
