export interface ReferralReward {
  level: number;
  referralsRequired: number;
  coins: number;
  diamonds: number;
  badge?: string;
  title?: string;
}

export interface ReferralUser {
  userId: string;
  userName: string;
  userAvatar: string;
  joinedAt: number;
  level: number;
  isActive: boolean;
  contributions: {
    coins: number;
    referrals: number;
  };
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: {
    coins: number;
    diamonds: number;
  };
  currentLevel: number;
  nextLevelProgress: number;
  referralLink: string;
}

export interface ReferralContest {
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  prizes: {
    rank: number;
    coins: number;
    diamonds: number;
    badge: string;
    title: string;
  }[];
  leaderboard: {
    rank: number;
    userId: string;
    userName: string;
    userAvatar: string;
    referrals: number;
  }[];
  status: 'upcoming' | 'active' | 'ended';
}
