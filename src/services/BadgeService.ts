/**
 * BadgeService - إدارة أوسمة المستخدمين
 * يتتبع إنجازات المستخدمين ويمنحهم الأوسمة المناسبة
 */

export interface Badge {
  id: string;
  type: 'room_star' | 'top_gifter' | 'vip' | 'veteran' | 'social_butterfly';
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  gradient: string;
  earnedDate?: Date;
  expiryDate?: Date; // للأوسمة المؤقتة مثل "نجم الغرفة هذا الأسبوع"
  stats?: {
    giftsValue?: number;
    roomsVisited?: number;
    daysActive?: number;
    friendsCount?: number;
  };
}

export interface UserBadges {
  userId: string;
  badges: Badge[];
  featuredBadge?: string; // ID of the badge to display prominently
}

class BadgeServiceClass {
  private userBadges: Map<string, UserBadges> = new Map();
  private giftLeaderboard: Map<string, number> = new Map(); // userId -> total gift value

  // تعريف الأوسمة المتاحة
  private availableBadges: Omit<Badge, 'earnedDate' | 'expiryDate' | 'stats'>[] = [
    {
      id: 'room_star_weekly',
      type: 'room_star',
      name: 'نجم الغرفة',
      nameEn: 'Room Star',
      description: 'نجم الغرفة هذا الأسبوع - أعلى قيمة هدايا مرسلة',
      descriptionEn: 'Room Star this week - Highest gifts sent',
      icon: '⭐',
      rarity: 'legendary',
      color: 'yellow-400',
      gradient: 'from-yellow-400 via-amber-400 to-orange-400',
    },
    {
      id: 'top_gifter_monthly',
      type: 'top_gifter',
      name: 'كريم الشهر',
      nameEn: 'Top Gifter',
      description: 'أكثر شخص سخاءً هذا الشهر',
      descriptionEn: 'Most generous person this month',
      icon: '🎁',
      rarity: 'epic',
      color: 'purple-500',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'vip_member',
      type: 'vip',
      name: 'عضو VIP',
      nameEn: 'VIP Member',
      description: 'عضو مميز في التطبيق',
      descriptionEn: 'Premium member',
      icon: '👑',
      rarity: 'rare',
      color: 'amber-500',
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      id: 'veteran',
      type: 'veteran',
      name: 'عضو قديم',
      nameEn: 'Veteran',
      description: 'أكثر من 365 يوم في التطبيق',
      descriptionEn: 'More than 365 days in the app',
      icon: '🏆',
      rarity: 'rare',
      color: 'blue-500',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'social_butterfly',
      type: 'social_butterfly',
      name: 'اجتماعي',
      nameEn: 'Social Butterfly',
      description: 'أكثر من 100 صديق',
      descriptionEn: 'More than 100 friends',
      icon: '🦋',
      rarity: 'common',
      color: 'pink-500',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  /**
   * تسجيل قيمة الهدايا للمستخدم
   */
  recordGiftSent(userId: string, giftValue: number): void {
    const currentValue = this.giftLeaderboard.get(userId) || 0;
    this.giftLeaderboard.set(userId, currentValue + giftValue);

    // تحديث الأوسمة بناءً على القيمة الجديدة
    this.updateBadgesForUser(userId);
  }

  /**
   * الحصول على نجم الغرفة الحالي (أعلى مرسل للهدايا)
   */
  getRoomStar(): { userId: string; totalGifts: number } | null {
    if (this.giftLeaderboard.size === 0) return null;

    let topUser = '';
    let topValue = 0;

    this.giftLeaderboard.forEach((value, userId) => {
      if (value > topValue) {
        topValue = value;
        topUser = userId;
      }
    });

    return topUser ? { userId: topUser, totalGifts: topValue } : null;
  }

  /**
   * منح وسام نجم الغرفة للمستخدم صاحب أعلى قيمة هدايا
   */
  awardRoomStarBadge(): void {
    const roomStar = this.getRoomStar();
    if (!roomStar) return;

    const badge = this.availableBadges.find(b => b.id === 'room_star_weekly');
    if (!badge) return;

    // إزالة الوسام من جميع المستخدمين الآخرين
    this.userBadges.forEach((userBadgesData, userId) => {
      if (userId !== roomStar.userId) {
        userBadgesData.badges = userBadgesData.badges.filter(b => b.id !== 'room_star_weekly');
      }
    });

    // منح الوسام للمستخدم الفائز
    const fullBadge: Badge = {
      ...badge,
      earnedDate: new Date(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ينتهي بعد أسبوع
      stats: {
        giftsValue: roomStar.totalGifts,
      },
    };

    this.awardBadge(roomStar.userId, fullBadge);
  }

  /**
   * منح وسام للمستخدم
   */
  awardBadge(userId: string, badge: Badge): void {
    let userBadgesData = this.userBadges.get(userId);
    
    if (!userBadgesData) {
      userBadgesData = {
        userId,
        badges: [],
        featuredBadge: badge.id, // أول وسام يكون مميز تلقائياً
      };
      this.userBadges.set(userId, userBadgesData);
    }

    // إزالة الوسام القديم من نفس النوع إذا وجد
    userBadgesData.badges = userBadgesData.badges.filter(b => b.id !== badge.id);
    
    // إضافة الوسام الجديد
    userBadgesData.badges.push(badge);

    // إذا كان وسام نجم الغرفة، اجعله مميزاً
    if (badge.type === 'room_star') {
      userBadgesData.featuredBadge = badge.id;
    }
  }

  /**
   * تحديث أوسمة المستخدم بناءً على إنجازاته
   */
  private updateBadgesForUser(userId: string): void {
    const giftValue = this.giftLeaderboard.get(userId) || 0;

    // منح وسام كريم الشهر إذا أرسل أكثر من 50000 عملة
    if (giftValue >= 50000) {
      const badge = this.availableBadges.find(b => b.id === 'top_gifter_monthly');
      if (badge) {
        this.awardBadge(userId, {
          ...badge,
          earnedDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stats: { giftsValue: giftValue },
        });
      }
    }
  }

  /**
   * الحصول على أوسمة المستخدم
   */
  getUserBadges(userId: string): UserBadges | null {
    return this.userBadges.get(userId) || null;
  }

  /**
   * الحصول على جميع الأوسمة النشطة للمستخدم (غير منتهية الصلاحية)
   */
  getActiveBadges(userId: string): Badge[] {
    const userBadgesData = this.userBadges.get(userId);
    if (!userBadgesData) return [];

    const now = new Date();
    return userBadgesData.badges.filter(badge => {
      if (!badge.expiryDate) return true; // أوسمة دائمة
      return badge.expiryDate > now; // أوسمة مؤقتة لم تنتهِ بعد
    });
  }

  /**
   * الحصول على الوسام المميز للمستخدم
   */
  getFeaturedBadge(userId: string): Badge | null {
    const userBadgesData = this.userBadges.get(userId);
    if (!userBadgesData || !userBadgesData.featuredBadge) return null;

    return userBadgesData.badges.find(b => b.id === userBadgesData.featuredBadge) || null;
  }

  /**
   * تعيين وسام مميز
   */
  setFeaturedBadge(userId: string, badgeId: string): void {
    const userBadgesData = this.userBadges.get(userId);
    if (!userBadgesData) return;

    const badge = userBadgesData.badges.find(b => b.id === badgeId);
    if (badge) {
      userBadgesData.featuredBadge = badgeId;
    }
  }

  /**
   * الحصول على لوحة المتصدرين (top 10)
   */
  getLeaderboard(limit: number = 10): Array<{ userId: string; totalGifts: number }> {
    const leaderboard = Array.from(this.giftLeaderboard.entries())
      .map(([userId, totalGifts]) => ({ userId, totalGifts }))
      .sort((a, b) => b.totalGifts - a.totalGifts)
      .slice(0, limit);

    return leaderboard;
  }

  /**
   * إعادة تعيين لوحة المتصدرين (يتم استدعاءها أسبوعياً)
   */
  resetWeeklyLeaderboard(): void {
    this.giftLeaderboard.clear();
  }

  /**
   * إنشاء بيانات تجريبية
   */
  initializeDemoData(): void {
    // إضافة بعض المستخدمين التجريبيين
    this.recordGiftSent('user1', 150000);
    this.recordGiftSent('user2', 80000);
    this.recordGiftSent('user3', 120000);
    this.recordGiftSent('demo-user-123', 200000); // المستخدم الحالي

    // منح وسام نجم الغرفة
    this.awardRoomStarBadge();

    // منح أوسمة إضافية للمستخدم التجريبي
    const vipBadge = this.availableBadges.find(b => b.id === 'vip_member');
    if (vipBadge) {
      this.awardBadge('demo-user-123', {
        ...vipBadge,
        earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // منذ 30 يوم
      });
    }

    const veteranBadge = this.availableBadges.find(b => b.id === 'veteran');
    if (veteranBadge) {
      this.awardBadge('demo-user-123', {
        ...veteranBadge,
        earnedDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // منذ 400 يوم
        stats: { daysActive: 400 },
      });
    }
  }

  /**
   * الحصول على جميع الأوسمة المتاحة
   */
  getAllAvailableBadges(): Omit<Badge, 'earnedDate' | 'expiryDate' | 'stats'>[] {
    return [...this.availableBadges];
  }
}

// تصدير singleton
export const BadgeService = new BadgeServiceClass();
