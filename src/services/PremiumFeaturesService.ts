/**
 * Premium Features Service
 * Manages VIP/Premium subscriptions and feature unlocking
 */

import { EconomyService } from './EconomyService';

export type PremiumTier = 'free' | 'silver' | 'gold' | 'platinum';

export interface PremiumSubscription {
  userId: string;
  tier: PremiumTier;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  features: string[];
}

export interface PremiumFeature {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  requiredTier: PremiumTier;
  icon: string;
  category: 'theme' | 'effect' | 'badge' | 'boost' | 'exclusive';
}

export interface PremiumTierInfo {
  tier: PremiumTier;
  name: string;
  nameEn: string;
  price: number; // Monthly price in coins
  benefits: string[];
  features: PremiumFeature[];
  badge: string;
  color: string;
}

class PremiumFeaturesServiceClass {
  private readonly SUBSCRIPTION_KEY = 'premium_subscription';
  private readonly UNLOCKED_FEATURES_KEY = 'unlocked_premium_features';

  /**
   * Get all premium tiers
   */
  getAllTiers(): PremiumTierInfo[] {
    return [
      {
        tier: 'free',
        name: 'مجاني',
        nameEn: 'Free',
        price: 0,
        badge: '🆓',
        color: '#6b7280',
        benefits: [
          'الثيمات الأساسية',
          'المؤثرات الصوتية الأساسية',
          '3 دورات يومية في عجلة الحظ',
          'المهام اليومية'
        ],
        features: []
      },
      {
        tier: 'silver',
        name: 'فضي',
        nameEn: 'Silver',
        price: 1000,
        badge: '🥈',
        color: '#c0c0c0',
        benefits: [
          'جميع ميزات المجاني',
          '5 ثيمات حصرية',
          '3 مؤثرات صوتية إضافية',
          '5 دورات يومية في عجلة الحظ',
          'شارة VIP فضية',
          'أولوية في الدعم'
        ],
        features: [
          {
            id: 'silver_themes',
            name: 'ثيمات فضية',
            nameEn: 'Silver Themes',
            description: '5 ثيمات حصرية للأعضاء الفضيين',
            requiredTier: 'silver',
            icon: '🎨',
            category: 'theme'
          },
          {
            id: 'silver_effects',
            name: 'مؤثرات فضية',
            nameEn: 'Silver Effects',
            description: '3 مؤثرات صوتية متقدمة',
            requiredTier: 'silver',
            icon: '🎙️',
            category: 'effect'
          }
        ]
      },
      {
        tier: 'gold',
        name: 'ذهبي',
        nameEn: 'Gold',
        price: 2500,
        badge: '🥇',
        color: '#ffd700',
        benefits: [
          'جميع ميزات الفضي',
          'جميع الثيمات المتاحة',
          'جميع المؤثرات الصوتية',
          '10 دورات يومية في عجلة الحظ',
          'شارة VIP ذهبية',
          'إطار ملف شخصي ذهبي',
          'ضعف مكافآت المهام',
          'غرف صوتية خاصة'
        ],
        features: [
          {
            id: 'all_themes',
            name: 'جميع الثيمات',
            nameEn: 'All Themes',
            description: 'الوصول لجميع ثيمات الغرف',
            requiredTier: 'gold',
            icon: '🎨',
            category: 'theme'
          },
          {
            id: 'all_effects',
            name: 'جميع المؤثرات',
            nameEn: 'All Effects',
            description: 'الوصول لجميع المؤثرات الصوتية',
            requiredTier: 'gold',
            icon: '🎵',
            category: 'effect'
          },
          {
            id: 'double_rewards',
            name: 'مكافآت مضاعفة',
            nameEn: 'Double Rewards',
            description: 'احصل على ضعف مكافآت المهام',
            requiredTier: 'gold',
            icon: '💰',
            category: 'boost'
          },
          {
            id: 'golden_badge',
            name: 'شارة ذهبية',
            nameEn: 'Golden Badge',
            description: 'شارة VIP ذهبية مميزة',
            requiredTier: 'gold',
            icon: '👑',
            category: 'badge'
          }
        ]
      },
      {
        tier: 'platinum',
        name: 'بلاتيني',
        nameEn: 'Platinum',
        price: 5000,
        badge: '💎',
        color: '#e5e4e2',
        benefits: [
          'جميع ميزات الذهبي',
          'ثيمات حصرية للبلاتينيوم',
          'مؤثرات صوتية حصرية',
          'دورات غير محدودة في عجلة الحظ',
          'شارة VIP بلاتينية متحركة',
          'إطار ملف شخصي بلاتيني متحرك',
          '3x مكافآت المهام',
          'دعم VIP على مدار الساعة',
          'أولوية في الظهور'
        ],
        features: [
          {
            id: 'platinum_exclusive',
            name: 'محتوى بلاتيني حصري',
            nameEn: 'Platinum Exclusive',
            description: 'ثيمات ومؤثرات حصرية للبلاتينيوم فقط',
            requiredTier: 'platinum',
            icon: '✨',
            category: 'exclusive'
          },
          {
            id: 'unlimited_spins',
            name: 'دورات غير محدودة',
            nameEn: 'Unlimited Spins',
            description: 'دورات غير محدودة في عجلة الحظ',
            requiredTier: 'platinum',
            icon: '🎰',
            category: 'boost'
          },
          {
            id: 'triple_rewards',
            name: 'مكافآت ثلاثية',
            nameEn: 'Triple Rewards',
            description: '3x مكافآت المهام اليومية',
            requiredTier: 'platinum',
            icon: '💎',
            category: 'boost'
          },
          {
            id: 'animated_badge',
            name: 'شارة متحركة',
            nameEn: 'Animated Badge',
            description: 'شارة VIP بلاتينية متحركة',
            requiredTier: 'platinum',
            icon: '👑',
            category: 'badge'
          }
        ]
      }
    ];
  }

  /**
   * Get user's subscription
   */
  getSubscription(userId: string): PremiumSubscription | null {
    try {
      const data = localStorage.getItem(`${this.SUBSCRIPTION_KEY}_${userId}`);
      if (data) {
        const sub = JSON.parse(data);
        sub.startDate = new Date(sub.startDate);
        sub.endDate = new Date(sub.endDate);
        
        // Check if subscription is expired
        if (sub.endDate < new Date()) {
          return null;
        }
        
        return sub;
      }
    } catch (error) {
      console.error('Failed to get subscription:', error);
    }
    return null;
  }

  /**
   * Get user's premium tier
   */
  getUserTier(userId: string): PremiumTier {
    const subscription = this.getSubscription(userId);
    return subscription?.tier || 'free';
  }

  /**
   * Subscribe to a premium tier
   */
  async subscribe(
    userId: string, 
    tier: PremiumTier,
    durationDays: number = 30
  ): Promise<{ success: boolean; message: string }> {
    if (tier === 'free') {
      return { success: false, message: 'لا يمكن الاشتراك في الباقة المجانية' };
    }

    const tierInfo = this.getAllTiers().find(t => t.tier === tier);
    if (!tierInfo) {
      return { success: false, message: 'الباقة غير موجودة' };
    }

    // Calculate cost (monthly price * months)
    const months = durationDays / 30;
    const totalCost = Math.ceil(tierInfo.price * months);

    // Check user balance
    const balance = await EconomyService.getBalance(userId);
    if (balance.coins < totalCost) {
      return { 
        success: false, 
        message: `رصيد غير كافٍ. يلزم ${totalCost} عملة` 
      };
    }

    // Deduct coins
    await EconomyService.deductCoins(
      userId,
      totalCost,
      `اشتراك ${tierInfo.name} لمدة ${durationDays} يوم`
    );

    // Create subscription
    const subscription: PremiumSubscription = {
      userId,
      tier,
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      autoRenew: false,
      features: tierInfo.features.map(f => f.id)
    };

    // Save subscription
    localStorage.setItem(
      `${this.SUBSCRIPTION_KEY}_${userId}`,
      JSON.stringify(subscription)
    );

    return { 
      success: true, 
      message: `تم الاشتراك في ${tierInfo.name} بنجاح!` 
    };
  }

  /**
   * Check if user has access to a feature
   */
  hasAccess(userId: string, featureId: string): boolean {
    const subscription = this.getSubscription(userId);
    
    if (!subscription) {
      return false; // No subscription = free tier only
    }

    // Check if feature is in subscription
    return subscription.features.includes(featureId);
  }

  /**
   * Check if user can use a theme
   */
  canUseTheme(userId: string, themePrice: number, themePremium: boolean): boolean {
    if (!themePremium) return true; // Free theme
    
    const tier = this.getUserTier(userId);
    
    if (tier === 'platinum') return true; // Platinum gets everything
    if (tier === 'gold') return true; // Gold gets all themes
    if (tier === 'silver' && themePrice <= 1000) return true; // Silver gets some
    
    return false;
  }

  /**
   * Check if user can use an effect
   */
  canUseEffect(userId: string, effectPremium: boolean): boolean {
    if (!effectPremium) return true; // Free effect
    
    const tier = this.getUserTier(userId);
    
    if (tier === 'platinum') return true;
    if (tier === 'gold') return true;
    if (tier === 'silver') return true;
    
    return false;
  }

  /**
   * Get reward multiplier based on tier
   */
  getRewardMultiplier(userId: string): number {
    const tier = this.getUserTier(userId);
    
    switch (tier) {
      case 'platinum': return 3;
      case 'gold': return 2;
      case 'silver': return 1.5;
      default: return 1;
    }
  }

  /**
   * Get daily wheel spins limit
   */
  getWheelSpinsLimit(userId: string): number {
    const tier = this.getUserTier(userId);
    
    switch (tier) {
      case 'platinum': return 999; // Unlimited
      case 'gold': return 10;
      case 'silver': return 5;
      default: return 3;
    }
  }

  /**
   * Unlock individual premium feature (one-time purchase)
   */
  async unlockFeature(
    userId: string,
    featureId: string,
    price: number
  ): Promise<{ success: boolean; message: string }> {
    // Check if already unlocked
    const unlocked = this.getUnlockedFeatures(userId);
    if (unlocked.includes(featureId)) {
      return { success: false, message: 'الميزة مفعلة بالفعل' };
    }

    // Check balance
    const balance = await EconomyService.getBalance(userId);
    if (balance.coins < price) {
      return { success: false, message: `يلزم ${price} عملة` };
    }

    // Deduct coins
    await EconomyService.deductCoins(userId, price, `فتح ميزة ${featureId}`);

    // Add to unlocked features
    unlocked.push(featureId);
    localStorage.setItem(
      `${this.UNLOCKED_FEATURES_KEY}_${userId}`,
      JSON.stringify(unlocked)
    );

    return { success: true, message: 'تم فتح الميزة بنجاح!' };
  }

  /**
   * Get unlocked features
   */
  getUnlockedFeatures(userId: string): string[] {
    try {
      const data = localStorage.getItem(`${this.UNLOCKED_FEATURES_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Cancel subscription (won't renew)
   */
  cancelSubscription(userId: string): void {
    const subscription = this.getSubscription(userId);
    if (subscription) {
      subscription.autoRenew = false;
      localStorage.setItem(
        `${this.SUBSCRIPTION_KEY}_${userId}`,
        JSON.stringify(subscription)
      );
    }
  }

  /**
   * Get days remaining in subscription
   */
  getDaysRemaining(userId: string): number {
    const subscription = this.getSubscription(userId);
    if (!subscription) return 0;

    const now = new Date();
    const diff = subscription.endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  }
}

export const PremiumFeaturesService = new PremiumFeaturesServiceClass();
