export type StreamStatus = 'preparing' | 'live' | 'ended' | 'paused';
export type StreamType = 'voice' | 'video' | 'screen';
export type ViewerRole = 'viewer' | 'moderator' | 'guest';

export interface LiveStream {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  status: StreamStatus;
  type: StreamType;
  startTime: Date;
  endTime?: Date;
  viewerCount: number;
  peakViewerCount: number;
  totalViews: number;
  duration: number; // بالثواني
  settings: StreamSettings;
  monetization: StreamMonetization;
  stats: StreamStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowGifts: boolean;
  requireFollowToComment: boolean;
  requireSubscriptionToView: boolean;
  minSubscriptionTier?: 'silver' | 'gold' | 'platinum';
  chatMode: 'open' | 'followers' | 'subscribers';
  quality: 'auto' | '360p' | '480p' | '720p' | '1080p';
  bitrate: number;
  frameRate: number;
  enableRecording: boolean;
  enableAutoTranscription: boolean;
}

export interface StreamMonetization {
  coinsEarned: number;
  diamondsEarned: number;
  giftsReceived: number;
  subscriptionRevenue: number;
  donationRevenue: number;
  totalRevenue: number;
}

export interface StreamStats {
  totalMessages: number;
  totalGifts: number;
  totalShares: number;
  totalLikes: number;
  engagementRate: number;
  averageWatchTime: number;
  topGifters: Array<{
    userId: string;
    userName: string;
    avatar: string;
    amount: number;
  }>;
  viewersByCountry: Record<string, number>;
  viewersByDevice: Record<string, number>;
}

export interface StreamViewer {
  userId: string;
  userName: string;
  avatar: string;
  role: ViewerRole;
  joinedAt: Date;
  leftAt?: Date;
  watchTime: number;
  messagesSent: number;
  giftsSent: number;
  isMuted: boolean;
  isBanned: boolean;
}

export interface StreamMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  type: 'text' | 'gift' | 'system' | 'join' | 'leave';
  giftId?: string;
  giftName?: string;
  giftValue?: number;
  timestamp: Date;
  isDeleted: boolean;
}

export interface StreamGift {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  giftId: string;
  giftName: string;
  giftAnimation: string;
  value: number; // بالماس
  quantity: number;
  timestamp: Date;
}

export interface StreamHighlight {
  id: string;
  streamId: string;
  title: string;
  startTime: number; // ثانية في البث
  endTime: number;
  thumbnail: string;
  views: number;
  likes: number;
  createdAt: Date;
}

export interface StreamSchedule {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  description: string;
  thumbnail: string;
  scheduledTime: Date;
  duration: number; // بالدقائق
  category: string;
  tags: string[];
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  notificationsSent: number;
  reminders: number;
  createdAt: Date;
}

export interface StreamRecording {
  id: string;
  streamId: string;
  hostId: string;
  title: string;
  thumbnail: string;
  duration: number;
  size: number; // بالبايت
  quality: string;
  url: string;
  views: number;
  likes: number;
  isPublic: boolean;
  transcription?: string;
  createdAt: Date;
}

export interface StreamCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  activeStreams: number;
  totalViewers: number;
  trending: boolean;
}

export interface StreamNotification {
  id: string;
  userId: string;
  streamId: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  streamTitle: string;
  type: 'live' | 'scheduled' | 'highlight';
  message: string;
  messageAr: string;
  read: boolean;
  createdAt: Date;
}

export interface StreamAnalytics {
  streamId: string;
  totalViews: number;
  uniqueViewers: number;
  peakViewers: number;
  averageViewers: number;
  totalWatchTime: number;
  averageWatchTime: number;
  engagementRate: number;
  chatActivity: number;
  giftsReceived: number;
  revenue: number;
  newFollowers: number;
  newSubscribers: number;
  viewerRetention: Array<{
    minute: number;
    percentage: number;
  }>;
  viewerDemographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    countries: Record<string, number>;
    devices: Record<string, number>;
  };
  trafficSources: Record<string, number>;
}
