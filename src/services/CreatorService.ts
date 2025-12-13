import { supabase, isSupabaseReady } from './db/supabaseClient';
import {
  CreatorSubscription,
  SubscriptionTierData,
  SubscriptionTier,
  SubscriptionStatus,
  CreatorEarnings,
  Payout,
  PayoutStatus,
  CreatorAnalytics,
  SubscriberPerks
} from '../models/CreatorSubscription';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'creator:subscriptions',
  MY_SUBSCRIPTIONS: 'creator:my_subscriptions',
  EARNINGS: 'creator:earnings',
  PAYOUTS: 'creator:payouts',
  ANALYTICS: 'creator:analytics',
  PERKS: 'creator:perks',
  TIERS: 'creator:tiers'
};

class CreatorService {
  // =====================================================
  // إعداد الباقات والمستويات
  // =====================================================

  getSubscriptionTiers(creatorId: string): SubscriptionTierData[] {
    return [
      {
        tier: 'bronze',
        name: 'Bronze',
        nameAr: 'برونزي',
        price: 4.99,
        currency: 'USD',
        color: '#CD7F32',
        icon: '🥉',
        popular: false,
        benefits: [
          {
            id: 'badge_bronze',
            type: 'badge',
            name: 'Bronze Badge',
            nameAr: 'شارة برونزية',
            description: 'Special bronze badge next to your name',
            descriptionAr: 'شارة برونزية خاصة بجانب اسمك',
            icon: '🥉'
          },
          {
            id: 'emotes_basic',
            type: 'emote',
            name: '5 Custom Emotes',
            nameAr: '5 ملصقات مخصصة',
            description: 'Access to 5 exclusive emotes',
            descriptionAr: 'الوصول إلى 5 ملصقات حصرية',
            icon: '😊'
          },
          {
            id: 'chat_color',
            type: 'custom',
            name: 'Chat Name Color',
            nameAr: 'لون اسم الدردشة',
            description: 'Bronze color for your chat name',
            descriptionAr: 'لون برونزي لاسمك في الدردشة',
            icon: '🎨',
            value: '#CD7F32'
          }
        ]
      },
      {
        tier: 'silver',
        name: 'Silver',
        nameAr: 'فضي',
        price: 9.99,
        currency: 'USD',
        color: '#C0C0C0',
        icon: '🥈',
        popular: true,
        benefits: [
          {
            id: 'badge_silver',
            type: 'badge',
            name: 'Silver Badge',
            nameAr: 'شارة فضية',
            description: 'Special silver badge next to your name',
            descriptionAr: 'شارة فضية خاصة بجانب اسمك',
            icon: '🥈'
          },
          {
            id: 'emotes_plus',
            type: 'emote',
            name: '15 Custom Emotes',
            nameAr: '15 ملصق مخصص',
            description: 'Access to 15 exclusive emotes',
            descriptionAr: 'الوصول إلى 15 ملصق حصري',
            icon: '😊'
          },
          {
            id: 'discount_10',
            type: 'discount',
            name: '10% Discount',
            nameAr: 'خصم 10%',
            description: '10% off all gifts and coins',
            descriptionAr: 'خصم 10% على جميع الهدايا والعملات',
            icon: '💰',
            value: 10
          },
          {
            id: 'priority_support',
            type: 'priority',
            name: 'Priority Support',
            nameAr: 'دعم ذو أولوية',
            description: 'Get priority in creator response',
            descriptionAr: 'احصل على أولوية في رد المنشئ',
            icon: '⭐'
          }
        ]
      },
      {
        tier: 'gold',
        name: 'Gold',
        nameAr: 'ذهبي',
        price: 24.99,
        currency: 'USD',
        color: '#FFD700',
        icon: '🥇',
        popular: false,
        benefits: [
          {
            id: 'badge_gold',
            type: 'badge',
            name: 'Gold Badge',
            nameAr: 'شارة ذهبية',
            description: 'Special gold badge next to your name',
            descriptionAr: 'شارة ذهبية خاصة بجانب اسمك',
            icon: '🥇'
          },
          {
            id: 'emotes_premium',
            type: 'emote',
            name: '30 Custom Emotes',
            nameAr: '30 ملصق مخصص',
            description: 'Access to 30 exclusive emotes',
            descriptionAr: 'الوصول إلى 30 ملصق حصري',
            icon: '😊'
          },
          {
            id: 'discount_20',
            type: 'discount',
            name: '20% Discount',
            nameAr: 'خصم 20%',
            description: '20% off all gifts and coins',
            descriptionAr: 'خصم 20% على جميع الهدايا والعملات',
            icon: '💰',
            value: 20
          },
          {
            id: 'exclusive_content',
            type: 'access',
            name: 'Exclusive Content',
            nameAr: 'محتوى حصري',
            description: 'Access to subscriber-only streams',
            descriptionAr: 'الوصول إلى بث المشتركين فقط',
            icon: '🔒'
          },
          {
            id: 'early_access',
            type: 'access',
            name: 'Early Access',
            nameAr: 'وصول مبكر',
            description: 'Get early access to new features',
            descriptionAr: 'احصل على وصول مبكر للميزات الجديدة',
            icon: '⚡'
          }
        ]
      },
      {
        tier: 'platinum',
        name: 'Platinum',
        nameAr: 'بلاتيني',
        price: 49.99,
        currency: 'USD',
        color: '#E5E4E2',
        icon: '💎',
        popular: false,
        benefits: [
          {
            id: 'badge_platinum',
            type: 'badge',
            name: 'Platinum Badge',
            nameAr: 'شارة بلاتينية',
            description: 'Animated platinum badge',
            descriptionAr: 'شارة بلاتينية متحركة',
            icon: '💎'
          },
          {
            id: 'emotes_unlimited',
            type: 'emote',
            name: 'Unlimited Emotes',
            nameAr: 'ملصقات غير محدودة',
            description: 'Access to all exclusive emotes',
            descriptionAr: 'الوصول إلى جميع الملصقات الحصرية',
            icon: '😊'
          },
          {
            id: 'discount_30',
            type: 'discount',
            name: '30% Discount',
            nameAr: 'خصم 30%',
            description: '30% off all gifts and coins',
            descriptionAr: 'خصم 30% على جميع الهدايا والعملات',
            icon: '💰',
            value: 30
          },
          {
            id: 'vip_access',
            type: 'access',
            name: 'VIP Access',
            nameAr: 'وصول VIP',
            description: 'VIP access to all creator content',
            descriptionAr: 'وصول VIP لجميع محتوى المنشئ',
            icon: '👑'
          },
          {
            id: 'custom_role',
            type: 'custom',
            name: 'Custom Role',
            nameAr: 'دور مخصص',
            description: 'Get a custom role in the community',
            descriptionAr: 'احصل على دور مخصص في المجتمع',
            icon: '🎭',
            value: 'VIP Member'
          },
          {
            id: 'direct_message',
            type: 'access',
            name: 'Direct Messaging',
            nameAr: 'رسائل مباشرة',
            description: 'Send direct messages to creator',
            descriptionAr: 'إرسال رسائل مباشرة للمنشئ',
            icon: '💬'
          }
        ]
      }
    ];
  }

  // =====================================================
  // إدارة الاشتراكات
  // =====================================================

  async subscribe(
    creatorId: string,
    subscriberId: string,
    subscriberName: string,
    subscriberAvatar: string,
    tier: SubscriptionTier
  ): Promise<CreatorSubscription> {
    const tiers = this.getSubscriptionTiers(creatorId);
    const tierData = tiers.find(t => t.tier === tier);
    
    if (!tierData) {
      throw new Error('Invalid subscription tier');
    }

    const subscription: CreatorSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId,
      subscriberId,
      subscriberName,
      subscriberAvatar,
      tier,
      price: tierData.price,
      currency: tierData.currency,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      benefits: tierData.benefits,
      totalPaid: tierData.price,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('creator_subscriptions')
          .insert([{
            id: subscription.id,
            creator_id: creatorId,
            subscriber_id: subscriberId,
            tier: tier,
            price: tierData.price,
            status: 'active',
            start_date: subscription.startDate.toISOString(),
            end_date: subscription.endDate.toISOString(),
            auto_renew: true,
            created_at: subscription.createdAt.toISOString()
          }]);
      } catch (error) {
        console.error('Error creating subscription:', error);
      }
    }

    // حفظ محلي
    const subscriptions = this.getCreatorSubscriptions(creatorId);
    subscriptions.push(subscription);
    localStorage.setItem(`${STORAGE_KEYS.SUBSCRIPTIONS}:${creatorId}`, JSON.stringify(subscriptions));

    // حفظ في قائمة اشتراكاتي
    const mySubscriptions = this.getMySubscriptions(subscriberId);
    mySubscriptions.push(subscription);
    localStorage.setItem(`${STORAGE_KEYS.MY_SUBSCRIPTIONS}:${subscriberId}`, JSON.stringify(mySubscriptions));

    // تحديث الأرباح
    await this.addRevenue(creatorId, tierData.price, 'subscription');

    // إنشاء المميزات
    await this.createSubscriberPerks(subscription);

    return subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // TODO: Implement cancellation logic
    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('creator_subscriptions')
          .update({ status: 'cancelled', auto_renew: false })
          .eq('id', subscriptionId);
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
    }
  }

  async renewSubscription(subscriptionId: string): Promise<void> {
    // TODO: Implement renewal logic
    if (isSupabaseReady && supabase) {
      try {
        const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await supabase
          .from('creator_subscriptions')
          .update({
            status: 'active',
            end_date: newEndDate.toISOString(),
            renew_date: newEndDate.toISOString()
          })
          .eq('id', subscriptionId);
      } catch (error) {
        console.error('Error renewing subscription:', error);
      }
    }
  }

  // =====================================================
  // الأرباح والمدفوعات
  // =====================================================

  async addRevenue(
    creatorId: string,
    amount: number,
    type: 'subscription' | 'gift' | 'stream' | 'other'
  ): Promise<void> {
    let earnings = this.getEarnings(creatorId);
    
    if (!earnings) {
      earnings = {
        creatorId,
        totalRevenue: 0,
        subscriptionRevenue: 0,
        giftRevenue: 0,
        streamRevenue: 0,
        otherRevenue: 0,
        pendingPayout: 0,
        lastPayout: 0,
        totalPaidOut: 0,
        currency: 'USD',
        updatedAt: new Date()
      };
    }

    earnings.totalRevenue += amount;
    earnings.pendingPayout += amount;
    
    switch (type) {
      case 'subscription':
        earnings.subscriptionRevenue += amount;
        break;
      case 'gift':
        earnings.giftRevenue += amount;
        break;
      case 'stream':
        earnings.streamRevenue += amount;
        break;
      case 'other':
        earnings.otherRevenue += amount;
        break;
    }
    
    earnings.updatedAt = new Date();

    localStorage.setItem(`${STORAGE_KEYS.EARNINGS}:${creatorId}`, JSON.stringify(earnings));

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('creator_earnings')
          .upsert([{
            creator_id: creatorId,
            total_revenue: earnings.totalRevenue,
            subscription_revenue: earnings.subscriptionRevenue,
            gift_revenue: earnings.giftRevenue,
            stream_revenue: earnings.streamRevenue,
            pending_payout: earnings.pendingPayout,
            updated_at: earnings.updatedAt.toISOString()
          }]);
      } catch (error) {
        console.error('Error updating earnings:', error);
      }
    }
  }

  async requestPayout(
    creatorId: string,
    amount: number,
    method: 'bank' | 'paypal' | 'crypto' | 'wallet'
  ): Promise<Payout> {
    const earnings = this.getEarnings(creatorId);
    
    if (!earnings || earnings.pendingPayout < amount) {
      throw new Error('Insufficient balance');
    }

    const payout: Payout = {
      id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId,
      amount,
      currency: earnings.currency,
      method,
      status: 'pending',
      requestDate: new Date()
    };

    // حفظ محلي
    const payouts = this.getPayouts(creatorId);
    payouts.push(payout);
    localStorage.setItem(`${STORAGE_KEYS.PAYOUTS}:${creatorId}`, JSON.stringify(payouts));

    // تحديث الأرباح
    earnings.pendingPayout -= amount;
    localStorage.setItem(`${STORAGE_KEYS.EARNINGS}:${creatorId}`, JSON.stringify(earnings));

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('creator_payouts')
          .insert([{
            id: payout.id,
            creator_id: creatorId,
            amount: amount,
            currency: earnings.currency,
            method: method,
            status: 'pending',
            request_date: payout.requestDate.toISOString()
          }]);
      } catch (error) {
        console.error('Error requesting payout:', error);
      }
    }

    return payout;
  }

  async processPayout(payoutId: string, transactionId: string): Promise<void> {
    const payouts = this.getAllPayouts();
    const payout = payouts.find(p => p.id === payoutId);
    
    if (!payout) return;

    payout.status = 'completed';
    payout.completedDate = new Date();
    payout.transactionId = transactionId;

    // تحديث الأرباح
    const earnings = this.getEarnings(payout.creatorId);
    if (earnings) {
      earnings.lastPayout = payout.amount;
      earnings.totalPaidOut += payout.amount;
      localStorage.setItem(`${STORAGE_KEYS.EARNINGS}:${payout.creatorId}`, JSON.stringify(earnings));
    }

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('creator_payouts')
          .update({
            status: 'completed',
            completed_date: payout.completedDate.toISOString(),
            transaction_id: transactionId
          })
          .eq('id', payoutId);
      } catch (error) {
        console.error('Error processing payout:', error);
      }
    }
  }

  // =====================================================
  // المميزات والامتيازات
  // =====================================================

  private async createSubscriberPerks(subscription: CreatorSubscription): Promise<SubscriberPerks> {
    const tierData = this.getSubscriptionTiers(subscription.creatorId).find(
      t => t.tier === subscription.tier
    );

    const perks: SubscriberPerks = {
      subscriberId: subscription.subscriberId,
      creatorId: subscription.creatorId,
      customEmotes: [],
      exclusiveBadge: tierData?.icon || '',
      chatColor: tierData?.color || '#FFFFFF',
      prioritySupport: ['silver', 'gold', 'platinum', 'diamond'].includes(subscription.tier),
      exclusiveContent: ['gold', 'platinum', 'diamond'].includes(subscription.tier),
      discountPercentage: this.getDiscountPercentage(subscription.tier),
      earlyAccess: ['gold', 'platinum', 'diamond'].includes(subscription.tier),
      customRole: tierData?.name || '',
      roleAr: tierData?.nameAr || ''
    };

    localStorage.setItem(
      `${STORAGE_KEYS.PERKS}:${subscription.subscriberId}:${subscription.creatorId}`,
      JSON.stringify(perks)
    );

    return perks;
  }

  private getDiscountPercentage(tier: SubscriptionTier): number {
    const discounts: Record<SubscriptionTier, number> = {
      free: 0,
      bronze: 5,
      silver: 10,
      gold: 20,
      platinum: 30,
      diamond: 50
    };
    return discounts[tier] || 0;
  }

  getSubscriberPerks(subscriberId: string, creatorId: string): SubscriberPerks | null {
    const key = `${STORAGE_KEYS.PERKS}:${subscriberId}:${creatorId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // =====================================================
  // Helper Functions
  // =====================================================

  getCreatorSubscriptions(creatorId: string): CreatorSubscription[] {
    const key = `${STORAGE_KEYS.SUBSCRIPTIONS}:${creatorId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getMySubscriptions(subscriberId: string): CreatorSubscription[] {
    const key = `${STORAGE_KEYS.MY_SUBSCRIPTIONS}:${subscriberId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getEarnings(creatorId: string): CreatorEarnings | null {
    const key = `${STORAGE_KEYS.EARNINGS}:${creatorId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  getPayouts(creatorId: string): Payout[] {
    const key = `${STORAGE_KEYS.PAYOUTS}:${creatorId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private getAllPayouts(): Payout[] {
    const allPayouts: Payout[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.PAYOUTS)) {
        const data = localStorage.getItem(key);
        if (data) {
          allPayouts.push(...JSON.parse(data));
        }
      }
    }
    
    return allPayouts;
  }

  getSubscriberCount(creatorId: string): number {
    const subscriptions = this.getCreatorSubscriptions(creatorId);
    return subscriptions.filter(s => s.status === 'active').length;
  }

  getSubscribersByTier(creatorId: string): Record<SubscriptionTier, number> {
    const subscriptions = this.getCreatorSubscriptions(creatorId);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    
    return {
      free: 0,
      bronze: activeSubscriptions.filter(s => s.tier === 'bronze').length,
      silver: activeSubscriptions.filter(s => s.tier === 'silver').length,
      gold: activeSubscriptions.filter(s => s.tier === 'gold').length,
      platinum: activeSubscriptions.filter(s => s.tier === 'platinum').length,
      diamond: activeSubscriptions.filter(s => s.tier === 'diamond').length
    };
  }
}

export default new CreatorService();
