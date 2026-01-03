export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  level: number;
  points: number;
  rank: number;
  isVip: boolean;
  joinDate: string;
  location: string;
  isOnline: boolean;
  lastSeen: string;
  coins: {
    gold: number;
    silver: number;
    diamonds: number;
  };
  stats: {
    friends: number;
    giftsReceived: number;
    giftsSent: number;
    roomsCreated: number;
    timeInVoiceChat: number;
    achievements: number;
  };
}

export interface VoiceRoom {
  id: string;
  name: string;
  description: string;
  participants: number;
  maxParticipants: number;
  isPrivate: boolean;
  category: string;
  password?: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    isVip: boolean;
  };
  tags: string[];
  createdAt: string;
  isActive: boolean;
  language: string;
  region: string;
}

export interface Gift {
  id: string;
  name: string;
  price: number;
  currency: 'gold' | 'silver' | 'diamonds';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  effect?: string;
  animationUrl?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'gift' | 'system' | 'emoji';
  giftId?: string;
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  acceptedAt?: string;
}

export interface RoomParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  isVip: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  joinTime: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  permissions: {
    canSpeak: boolean;
    canInvite: boolean;
    canKick: boolean;
    canBan: boolean;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'gift_received' | 'room_invite' | 'level_up' | 'achievement';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  reward: {
    points: number;
    coins?: number;
    title?: string;
  };
}

export interface VipPackage {
  id: string;
  name: string;
  duration: number; // in days
  price: number;
  currency: 'usd' | 'eur' | 'gbp';
  benefits: string[];
  features: {
    specialBadge: boolean;
    prioritySupport: boolean;
    exclusiveRooms: boolean;
    customEmojis: boolean;
    giftDiscount: number;
    storageBonus: number;
  };
}

export interface AdminAction {
  id: string;
  adminId: string;
  targetId: string;
  targetType: 'user' | 'room' | 'message';
  action: 'ban' | 'unban' | 'mute' | 'unmute' | 'delete' | 'warn' | 'kick';
  reason: string;
  duration?: number; // in hours
  createdAt: string;
}

export interface ReportTicket {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'user' | 'room' | 'message';
  reason: string;
  description: string;
  evidence?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}