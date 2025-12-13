export type FamilyRole = 'leader' | 'admin' | 'member';
export type FamilyPrivacy = 'public' | 'private' | 'invite-only';

export interface FamilyMember {
  userId: string;
  userName: string;
  userAvatar: string;
  role: FamilyRole;
  joinedAt: number;
  contributionPoints: number;
  level: number;
  isOnline: boolean;
}

export interface FamilyStats {
  totalMembers: number;
  activeMembers: number;
  totalPoints: number;
  weeklyPoints: number;
  rank: number;
  level: number;
  nextLevelPoints: number;
  roomsCreated: number;
  eventsHosted: number;
}

export interface FamilyRoom {
  id: string;
  name: string;
  type: 'voice' | 'chat';
  isPrivate: boolean;
  currentUsers: number;
  maxUsers: number;
  createdBy: string;
  createdAt: number;
}

export interface FamilyEvent {
  id: string;
  name: string;
  description: string;
  type: 'tournament' | 'challenge' | 'meetup' | 'party';
  startTime: number;
  endTime: number;
  participants: string[];
  rewards: {
    coins: number;
    diamonds: number;
    badges: string[];
  };
  status: 'upcoming' | 'active' | 'completed';
}

export interface FamilyMission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  reward: {
    coins: number;
    exp: number;
    familyPoints: number;
  };
  expiresAt: number;
  completed: boolean;
}

export interface FamilyBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: number;
}

export interface Family {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  colors: {
    primary: string;
    secondary: string;
  };
  privacy: FamilyPrivacy;
  createdAt: number;
  createdBy: string;
  members: FamilyMember[];
  stats: FamilyStats;
  rooms: FamilyRoom[];
  events: FamilyEvent[];
  missions: FamilyMission[];
  badges: FamilyBadge[];
  rules: string[];
  requirements: {
    minLevel: number;
    minAge: number;
    requiresApproval: boolean;
  };
}

export interface FamilyInvite {
  id: string;
  familyId: string;
  familyName: string;
  invitedBy: string;
  invitedByName: string;
  invitedUser: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface FamilyJoinRequest {
  id: string;
  familyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  message: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FamilyLeaderboard {
  rank: number;
  familyId: string;
  familyName: string;
  familyLogo: string;
  points: number;
  members: number;
  level: number;
  change: number; // +/- rank change
}
