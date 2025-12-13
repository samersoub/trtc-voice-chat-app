export type SubscriptionTier = 'free' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CreatorSubscription {
  id: string;
  creatorId: string;
  subscriberId: string;
  subscriberName: string;
  subscriberAvatar: string;
  tier: SubscriptionTier;
  price: number; // بالعملة المحلية
  currency: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  renewDate: Date;
  autoRenew: boolean;
  benefits: SubscriptionBenefit[];
  totalPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionTierData {
  tier: SubscriptionTier;
  name: string;
  nameAr: string;
  price: number;
  currency: string;
  benefits: SubscriptionBenefit[];
  color: string;
  icon: string;
  popular: boolean;
}

export interface SubscriptionBenefit {
  id: string;
  type: 'badge' | 'emote' | 'access' | 'discount' | 'priority' | 'custom';
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  value?: number | string;
}

export interface CreatorEarnings {
  creatorId: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  giftRevenue: number;
  streamRevenue: number;
  otherRevenue: number;
  pendingPayout: number;
  lastPayout: number;
  totalPaidOut: number;
  currency: string;
  updatedAt: Date;
}

export interface Payout {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  method: 'bank' | 'paypal' | 'crypto' | 'wallet';
  status: PayoutStatus;
  requestDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  transactionId?: string;
  notes?: string;
}

export interface CreatorAnalytics {
  creatorId: string;
  period: 'day' | 'week' | 'month' | 'year';
  subscribers: {
    total: number;
    new: number;
    cancelled: number;
    byTier: Record<SubscriptionTier, number>;
  };
  revenue: {
    total: number;
    subscriptions: number;
    gifts: number;
    streams: number;
    growth: number;
  };
  engagement: {
    totalViews: number;
    avgViewers: number;
    totalMessages: number;
    totalGifts: number;
    engagementRate: number;
  };
  content: {
    totalStreams: number;
    avgStreamDuration: number;
    totalWatchTime: number;
    topStreams: Array<{
      id: string;
      title: string;
      views: number;
      revenue: number;
    }>;
  };
  topSubscribers: Array<{
    userId: string;
    userName: string;
    avatar: string;
    tier: SubscriptionTier;
    totalSpent: number;
    since: Date;
  }>;
}

export interface SubscriberPerks {
  subscriberId: string;
  creatorId: string;
  customEmotes: string[];
  exclusiveBadge: string;
  chatColor: string;
  prioritySupport: boolean;
  exclusiveContent: boolean;
  discountPercentage: number;
  earlyAccess: boolean;
  customRole: string;
  roleAr: string;
}
