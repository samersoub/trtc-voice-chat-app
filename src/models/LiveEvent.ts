export type EventType = 'tournament' | 'challenge' | 'meetup' | 'contest' | 'party' | 'giveaway';
export type EventStatus = 'upcoming' | 'live' | 'ended' | 'cancelled';
export type ParticipantStatus = 'registered' | 'participating' | 'eliminated' | 'winner';

export interface LiveEvent {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: EventType;
  status: EventStatus;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  thumbnail: string;
  bannerImage: string;
  startTime: Date;
  endTime: Date;
  duration: number; // بالدقائق
  maxParticipants: number;
  currentParticipants: number;
  registeredCount: number;
  requirements: EventRequirements;
  prizes: EventPrize[];
  rules: string[];
  rulesAr: string[];
  tags: string[];
  category: string;
  isPublic: boolean;
  isFeatured: boolean;
  viewerCount: number;
  totalViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRequirements {
  minLevel: number;
  minCoins?: number;
  requiredBadges?: string[];
  isPremiumOnly: boolean;
  minPremiumTier?: 'silver' | 'gold' | 'platinum';
  ageLimitriction?: number;
  customRequirements?: string[];
}

export interface EventPrize {
  rank: number;
  title: string;
  titleAr: string;
  coins: number;
  diamonds: number;
  items?: EventPrizeItem[];
  badge?: string;
  title_reward?: string;
  titleRewardAr?: string;
}

export interface EventPrizeItem {
  id: string;
  name: string;
  nameAr: string;
  type: 'avatar_frame' | 'room_theme' | 'emote_pack' | 'badge' | 'title' | 'other';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  status: ParticipantStatus;
  registeredAt: Date;
  score: number;
  rank: number;
  achievements: EventAchievement[];
  stats: ParticipantStats;
}

export interface ParticipantStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  timeSpent: number;
  completedChallenges: number;
}

export interface EventAchievement {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  earnedAt: Date;
  points: number;
}

export interface EventLeaderboard {
  eventId: string;
  updatedAt: Date;
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  stats: ParticipantStats;
  prize?: EventPrize;
  isWinner: boolean;
}

export interface EventMatch {
  id: string;
  eventId: string;
  round: number;
  matchNumber: number;
  participants: string[]; // User IDs
  scores: Record<string, number>;
  winner?: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'live' | 'completed' | 'cancelled';
}

export interface EventNotification {
  id: string;
  eventId: string;
  userId: string;
  type: 'registration_open' | 'starting_soon' | 'started' | 'round_update' | 'winner_announcement';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  read: boolean;
  createdAt: Date;
}

export interface EventSchedule {
  eventId: string;
  phases: EventPhase[];
}

export interface EventPhase {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  startTime: Date;
  endTime: Date;
  type: 'registration' | 'qualifiers' | 'semifinals' | 'finals' | 'awards';
  status: 'pending' | 'active' | 'completed';
}

export interface EventAnalytics {
  eventId: string;
  totalRegistrations: number;
  totalParticipants: number;
  totalViewers: number;
  peakViewers: number;
  totalEngagement: number;
  completionRate: number;
  averageSessionTime: number;
  topPerformers: LeaderboardEntry[];
  demographicsData: {
    byCountry: Record<string, number>;
    byAge: Record<string, number>;
    byGender: Record<string, number>;
    byLevel: Record<string, number>;
  };
}
