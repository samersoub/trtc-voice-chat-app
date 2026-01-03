import { ChatRoom } from "@/models/ChatRoom";

export interface RoomMetrics {
  roomId: string;
  roomName: string;
  participantCount: number;
  duration: number; // seconds
  hostId: string;
  hostName: string;
  audioQuality: "excellent" | "good" | "fair" | "poor";
  engagementScore: number; // 0-100
  activeSpeakers: number;
  mutedCount: number;
  averageSessionTime: number; // seconds
  peakParticipants: number;
  messagesCount: number;
  giftsReceived: number;
  timestamp: number;
}

export interface UserEngagement {
  userId: string;
  userName: string;
  totalRoomsJoined: number;
  totalTimeSpent: number; // seconds
  messagesTotal: number;
  giftsent: number;
  lastActive: number;
  engagementScore: number; // 0-100
}

export interface AudioQualityMetric {
  roomId: string;
  userId: string;
  latency: number; // ms
  packetLoss: number; // percentage
  bitrate: number; // kbps
  jitter: number; // ms
  quality: "excellent" | "good" | "fair" | "poor";
  timestamp: number;
}

class AdminAnalyticsService {
  private metricsCache: Map<string, RoomMetrics> = new Map();
  private userEngagementCache: Map<string, UserEngagement> = new Map();
  private audioQualityCache: Map<string, AudioQualityMetric[]> = new Map();

  /**
   * Get real-time metrics for all active rooms
   */
  getActiveRoomMetrics(): RoomMetrics[] {
    const metrics: RoomMetrics[] = [];
    
    // Iterate through all rooms in localStorage
    const keys = Object.keys(localStorage);
    const roomKeys = keys.filter(k => k.startsWith("voice:room:"));
    
    roomKeys.forEach(key => {
      try {
        const roomData = JSON.parse(localStorage.getItem(key) || "{}");
        const roomId = key.replace("voice:room:", "");
        
        // Get participant count
        const participants = roomData.participants || [];
        const participantCount = participants.length;
        
        if (participantCount === 0) return; // Skip empty rooms
        
        // Calculate duration (current time - room creation time)
        const createdAt = roomData.createdAt || Date.now();
        const duration = Math.floor((Date.now() - createdAt) / 1000);
        
        // Get mic seats for active speakers
        const seatsKey = `voice:mic:${roomId}`;
        const seats = JSON.parse(localStorage.getItem(seatsKey) || "[]");
        const activeSpeakers = seats.filter((s: { userId?: string; muted?: boolean }) => s.userId && !s.muted).length;
        const mutedCount = seats.filter((s: { userId?: string; muted?: boolean }) => s.userId && s.muted).length;
        
        // Get messages count
        const messagesKey = `voice:messages:${roomId}`;
        const messages = JSON.parse(localStorage.getItem(messagesKey) || "[]");
        const messagesCount = messages.length;
        
        // Calculate engagement score (0-100)
        const engagementScore = this.calculateEngagementScore({
          participantCount,
          activeSpeakers,
          messagesCount,
          duration,
        });
        
        // Determine audio quality (simulated for now)
        const audioQuality = this.determineRoomAudioQuality(roomId);
        
        // Get peak participants from history
        const peakParticipants = this.getPeakParticipants(roomId);
        
        metrics.push({
          roomId,
          roomName: roomData.name || `Room ${roomId}`,
          participantCount,
          duration,
          hostId: roomData.hostId || "unknown",
          hostName: roomData.hostName || "Unknown Host",
          audioQuality,
          engagementScore,
          activeSpeakers,
          mutedCount,
          averageSessionTime: duration / Math.max(participantCount, 1),
          peakParticipants,
          messagesCount,
          giftsReceived: this.getRoomGiftCount(roomId),
          timestamp: Date.now(),
        });
      } catch (e) {
        console.error("Error parsing room metrics:", e);
      }
    });
    
    // Sort by participant count (most active first)
    return metrics.sort((a, b) => b.participantCount - a.participantCount);
  }

  /**
   * Get gift count for a specific room
   */
  private getRoomGiftCount(roomId: string): number {
    try {
      const giftHistoryKey = "gift:history";
      const history = JSON.parse(localStorage.getItem(giftHistoryKey) || "[]");
      
      return history.filter((gift: any) => gift.roomId === roomId).length;
    } catch {
      return 0;
    }
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics(): UserEngagement[] {
    const engagements: UserEngagement[] = [];
    
    // Parse activity logs
    const activityLogKey = "activity:logs";
    const logs = JSON.parse(localStorage.getItem(activityLogKey) || "[]");
    
    // Group by user
    interface UserEngagementData {
      userId: string;
      userName: string;
      totalTime: number;
      roomsJoined: number;
      messagesSent: number;
      giftsSent: number;
      totalRoomsJoined: number;
      totalTimeSpent: number;
      messagesTotal: number;
      lastActive: number;
    }
    const userMap = new Map<string, UserEngagementData>();

    logs.forEach((log: { userId: string; userName?: string; action: string; timestamp: Date }) => {
      if (!log.userId) return;
      
      if (!userMap.has(log.userId)) {
        userMap.set(log.userId, {
          userId: log.userId,
          userName: log.userName || "Unknown User",
          totalRoomsJoined: 0,
          totalTimeSpent: 0,
          messagesTotal: 0,
          giftsSent: 0,
          lastActive: 0,
          totalTime: 0,
          roomsJoined: 0,
          messagesSent: 0,
        });
      }
      
      const user = userMap.get(log.userId)!;
      
      if (log.action === "room:join") {
        user.totalRoomsJoined++;
        user.roomsJoined++;
      }
      if (log.action === "message:send") {
        user.messagesTotal++;
        user.messagesSent++;
      }
      if (log.action === "gift:send") user.giftsSent++;
      if (new Date(log.timestamp).getTime() > user.lastActive) user.lastActive = new Date(log.timestamp).getTime();
      
      // Estimate time spent (simplified)
      if (log.action === "room:join" || log.action === "room:leave") {
        user.totalTimeSpent += 300; // Assume 5 min per session
        user.totalTime += 300;
      }
    });
    
    userMap.forEach((user) => {
      const engagementScore = this.calculateUserEngagementScore(user);
      engagements.push({
        userId: user.userId,
        userName: user.userName,
        totalRoomsJoined: user.totalRoomsJoined,
        totalTimeSpent: user.totalTimeSpent,
        messagesTotal: user.messagesTotal,
        giftsent: user.giftsSent,
        lastActive: user.lastActive,
        engagementScore,
      });
    });
    
    return engagements.sort((a, b) => b.engagementScore - a.engagementScore);
  }

  /**
   * Get audio quality metrics for a room
   */
  getAudioQualityMetrics(roomId: string): AudioQualityMetric[] {
    return this.audioQualityCache.get(roomId) || [];
  }

  /**
   * Record audio quality metric (called by TRTC monitoring)
   */
  recordAudioQuality(metric: AudioQualityMetric): void {
    const roomMetrics = this.audioQualityCache.get(metric.roomId) || [];
    roomMetrics.push(metric);
    
    // Keep only last 100 metrics per room
    if (roomMetrics.length > 100) {
      roomMetrics.shift();
    }
    
    this.audioQualityCache.set(metric.roomId, roomMetrics);
  }

  /**
   * Calculate engagement score based on multiple factors
   */
  private calculateEngagementScore(params: {
    participantCount: number;
    activeSpeakers: number;
    messagesCount: number;
    duration: number;
  }): number {
    const { participantCount, activeSpeakers, messagesCount, duration } = params;
    
    // Normalize each factor (0-100)
    const participantScore = Math.min((participantCount / 10) * 100, 100);
    const speakerScore = Math.min((activeSpeakers / 8) * 100, 100);
    const messageScore = Math.min((messagesCount / 50) * 100, 100);
    const durationScore = Math.min((duration / 3600) * 100, 100); // 1 hour = 100
    
    // Weighted average
    const score = 
      participantScore * 0.3 +
      speakerScore * 0.3 +
      messageScore * 0.2 +
      durationScore * 0.2;
    
    return Math.round(score);
  }

  /**
   * Calculate user engagement score
   */
  private calculateUserEngagementScore(user: { 
    totalTime: number; 
    roomsJoined: number; 
    messagesSent: number; 
    giftsSent: number;
    totalRoomsJoined: number;
    totalTimeSpent: number;
    messagesTotal: number;
  }): number {
    const roomsScore = Math.min((user.totalRoomsJoined / 20) * 100, 100);
    const timeScore = Math.min((user.totalTimeSpent / 36000) * 100, 100); // 10 hours = 100
    const messagesScore = Math.min((user.messagesTotal / 100) * 100, 100);
    const giftsScore = Math.min((user.giftsSent / 10) * 100, 100);
    
    const score = 
      roomsScore * 0.25 +
      timeScore * 0.35 +
      messagesScore * 0.25 +
      giftsScore * 0.15;
    
    return Math.round(score);
  }

  /**
   * Determine audio quality for a room based on metrics
   */
  private determineRoomAudioQuality(roomId: string): "excellent" | "good" | "fair" | "poor" {
    const metrics = this.audioQualityCache.get(roomId) || [];
    
    if (metrics.length === 0) return "good"; // Default
    
    // Get average quality from last 10 metrics
    const recentMetrics = metrics.slice(-10);
    const qualityScores = { excellent: 4, good: 3, fair: 2, poor: 1 };
    const avgScore = recentMetrics.reduce((sum, m) => sum + qualityScores[m.quality], 0) / recentMetrics.length;
    
    if (avgScore >= 3.5) return "excellent";
    if (avgScore >= 2.5) return "good";
    if (avgScore >= 1.5) return "fair";
    return "poor";
  }

  /**
   * Get peak participants for a room
   */
  private getPeakParticipants(roomId: string): number {
    const historyKey = `room:history:${roomId}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || "{}");
    return history.peakParticipants || 1;
  }

  /**
   * Update peak participants for a room
   */
  updatePeakParticipants(roomId: string, count: number): void {
    const historyKey = `room:history:${roomId}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || "{}");
    
    if (!history.peakParticipants || count > history.peakParticipants) {
      history.peakParticipants = count;
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
  }

  /**
   * Get summary statistics for dashboard
   */
  getDashboardSummary() {
    const roomMetrics = this.getActiveRoomMetrics();
    const userMetrics = this.getUserEngagementMetrics();
    
    const totalActiveRooms = roomMetrics.length;
    const totalActiveUsers = roomMetrics.reduce((sum, r) => sum + r.participantCount, 0);
    const averageRoomSize = totalActiveRooms > 0 ? totalActiveUsers / totalActiveRooms : 0;
    const averageEngagement = roomMetrics.reduce((sum, r) => sum + r.engagementScore, 0) / Math.max(totalActiveRooms, 1);
    
    const audioQualityDistribution = {
      excellent: roomMetrics.filter(r => r.audioQuality === "excellent").length,
      good: roomMetrics.filter(r => r.audioQuality === "good").length,
      fair: roomMetrics.filter(r => r.audioQuality === "fair").length,
      poor: roomMetrics.filter(r => r.audioQuality === "poor").length,
    };
    
    return {
      totalActiveRooms,
      totalActiveUsers,
      averageRoomSize: Math.round(averageRoomSize * 10) / 10,
      averageEngagement: Math.round(averageEngagement),
      audioQualityDistribution,
      topRooms: roomMetrics.slice(0, 5),
      topUsers: userMetrics.slice(0, 10),
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
