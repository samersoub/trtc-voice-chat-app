/**
 * PK Battle Model
 * Voice room battles where hosts compete for gifts
 */

export type PKBattleStatus = 'waiting' | 'countdown' | 'active' | 'finished' | 'cancelled';
export type PKBattleType = 'quick' | 'standard' | 'ranked';

export interface PKBattleRoom {
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostLevel: number;
  score: number; // Total gift value received
  supporters: number; // Number of users who sent gifts
}

export interface PKBattle {
  id: string;
  type: PKBattleType;
  status: PKBattleStatus;
  
  // Rooms
  room1: PKBattleRoom;
  room2: PKBattleRoom;
  
  // Timing
  duration: number; // Duration in seconds (180, 300, 600)
  countdownStartTime?: Date;
  startTime?: Date;
  endTime?: Date;
  remainingTime?: number;
  
  // Results
  winnerId?: string;
  winnerRoomId?: string;
  totalGiftsValue: number;
  totalParticipants: number;
  
  // Rewards
  rewards?: {
    winner: {
      coins: number;
      diamonds: number;
      badge?: string;
    };
    loser: {
      coins: number;
      diamonds: number;
    };
  };
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  invitedBy?: string; // If Room2 was invited
}

export interface PKBattleInvite {
  id: string;
  battleId: string;
  fromRoomId: string;
  fromHostId: string;
  fromHostName: string;
  toRoomId: string;
  toHostId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface PKBattleGift {
  id: string;
  battleId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  giftId: string;
  giftName: string;
  giftValue: number;
  quantity: number;
  totalValue: number;
  timestamp: Date;
}

export interface PKBattleStats {
  battleId: string;
  room1Stats: {
    totalGifts: number;
    totalValue: number;
    topGifters: Array<{
      userId: string;
      username: string;
      avatar: string;
      totalValue: number;
    }>;
    giftBreakdown: Record<string, number>; // giftId -> count
  };
  room2Stats: {
    totalGifts: number;
    totalValue: number;
    topGifters: Array<{
      userId: string;
      username: string;
      avatar: string;
      totalValue: number;
    }>;
    giftBreakdown: Record<string, number>;
  };
}

export interface PKBattleHistory {
  userId: string;
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  totalGiftsReceived: number;
  totalGiftsSent: number;
  highestScore: number;
  winStreak: number;
  currentStreak: number;
  rank: number;
}

export interface PKLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
  winRate: number;
  totalScore: number;
  badge?: string;
}
