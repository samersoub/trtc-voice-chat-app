/**
 * WealthLevelService - نظام مستويات الثروة
 * يتتبع ثروة المستخدم بناءً على الشحن والهدايا المرسلة
 */

export interface WealthLevel {
  level: number;
  name: string;
  nameEn: string;
  minWealth: number;
  maxWealth: number;
  icon: string;
  color: string;
  gradient: string;
  frameColor: string;
  benefits: string[];
  benefitsEn: string[];
  badge: string;
}

export interface UserWealth {
  userId: string;
  currentWealth: number; // إجمالي الثروة
  currentLevel: number;
  totalRecharge: number; // إجمالي الشحن
  totalGiftsSent: number; // إجمالي قيمة الهدايا المرسلة
  monthlyRecharge: number; // الشحن الشهري
  monthlyGiftsSent: number; // الهدايا المرسلة شهرياً
  lastUpdate: Date;
  rechargeHistory: RechargeRecord[];
  giftHistory: GiftRecord[];
}

export interface RechargeRecord {
  id: string;
  amount: number;
  date: Date;
  method: string;
}

export interface GiftRecord {
  id: string;
  giftName: string;
  value: number;
  recipientId: string;
  recipientName: string;
  date: Date;
}

class WealthLevelServiceClass {
  private userWealth: Map<string, UserWealth> = new Map();

  // تعريف مستويات الثروة (10 مستويات)
  private levels: WealthLevel[] = [
    {
      level: 1,
      name: 'مبتدئ الثروة',
      nameEn: 'Wealth Beginner',
      minWealth: 0,
      maxWealth: 9999,
      icon: '🌱',
      color: 'gray-400',
      gradient: 'from-gray-400 to-gray-500',
      frameColor: 'border-gray-400',
      benefits: ['دخول عادي للغرف', 'إرسال الهدايا الأساسية'],
      benefitsEn: ['Normal room entry', 'Send basic gifts'],
      badge: 'مبتدئ'
    },
    {
      level: 2,
      name: 'صاعد الثروة',
      nameEn: 'Rising Wealth',
      minWealth: 10000,
      maxWealth: 49999,
      icon: '🌿',
      color: 'green-400',
      gradient: 'from-green-400 to-green-500',
      frameColor: 'border-green-400',
      benefits: ['إطار خاص', 'دخول سريع للغرف', '+5% مكافأة على الشحن'],
      benefitsEn: ['Special frame', 'Quick room entry', '+5% recharge bonus'],
      badge: 'صاعد'
    },
    {
      level: 3,
      name: 'الثري',
      nameEn: 'Wealthy',
      minWealth: 50000,
      maxWealth: 99999,
      icon: '💰',
      color: 'blue-400',
      gradient: 'from-blue-400 to-blue-600',
      frameColor: 'border-blue-400',
      benefits: ['إطار مميز', 'أولوية في الدعم', '+10% مكافأة', 'شارة خاصة'],
      benefitsEn: ['Premium frame', 'Priority support', '+10% bonus', 'Special badge'],
      badge: 'ثري'
    },
    {
      level: 4,
      name: 'الثري الكبير',
      nameEn: 'Great Wealthy',
      minWealth: 100000,
      maxWealth: 249999,
      icon: '💎',
      color: 'cyan-400',
      gradient: 'from-cyan-400 to-blue-600',
      frameColor: 'border-cyan-400',
      benefits: ['إطار ماسي', '+15% مكافأة', 'غرفة VIP', 'هدايا حصرية'],
      benefitsEn: ['Diamond frame', '+15% bonus', 'VIP room', 'Exclusive gifts'],
      badge: 'ثري كبير'
    },
    {
      level: 5,
      name: 'المليونير',
      nameEn: 'Millionaire',
      minWealth: 250000,
      maxWealth: 499999,
      icon: '👑',
      color: 'purple-400',
      gradient: 'from-purple-400 to-purple-600',
      frameColor: 'border-purple-400',
      benefits: ['إطار ملكي', '+20% مكافأة', 'مدير VIP', 'هدايا فاخرة', 'دخول حصري'],
      benefitsEn: ['Royal frame', '+20% bonus', 'VIP manager', 'Luxury gifts', 'Exclusive entry'],
      badge: 'مليونير'
    },
    {
      level: 6,
      name: 'الملياردير',
      nameEn: 'Billionaire',
      minWealth: 500000,
      maxWealth: 999999,
      icon: '💫',
      color: 'pink-400',
      gradient: 'from-pink-400 to-purple-600',
      frameColor: 'border-pink-400',
      benefits: ['إطار أسطوري', '+25% مكافأة', 'خدمة VIP+', 'تأثيرات خاصة', 'غرف خاصة'],
      benefitsEn: ['Legendary frame', '+25% bonus', 'VIP+ service', 'Special effects', 'Private rooms'],
      badge: 'ملياردير'
    },
    {
      level: 7,
      name: 'المليونير الماسي',
      nameEn: 'Diamond Millionaire',
      minWealth: 1000000,
      maxWealth: 2499999,
      icon: '💠',
      color: 'cyan-300',
      gradient: 'from-cyan-300 via-blue-400 to-purple-500',
      frameColor: 'border-cyan-300',
      benefits: ['إطار ماسي متطور', '+30% مكافأة', 'مضيف شخصي', 'هدايا نادرة', 'تحكم كامل'],
      benefitsEn: ['Advanced diamond frame', '+30% bonus', 'Personal host', 'Rare gifts', 'Full control'],
      badge: 'ماسي'
    },
    {
      level: 8,
      name: 'إمبراطور الثروة',
      nameEn: 'Wealth Emperor',
      minWealth: 2500000,
      maxWealth: 4999999,
      icon: '👸',
      color: 'yellow-300',
      gradient: 'from-yellow-300 via-orange-400 to-red-500',
      frameColor: 'border-yellow-300',
      benefits: ['إطار إمبراطوري', '+35% مكافأة', 'فريق دعم', 'هدايا إمبراطورية', 'تحكم كامل بالغرف'],
      benefitsEn: ['Imperial frame', '+35% bonus', 'Support team', 'Imperial gifts', 'Full room control'],
      badge: 'إمبراطور'
    },
    {
      level: 9,
      name: 'ملك الثروة',
      nameEn: 'Wealth King',
      minWealth: 5000000,
      maxWealth: 9999999,
      icon: '🔱',
      color: 'amber-300',
      gradient: 'from-amber-300 via-yellow-400 to-orange-500',
      frameColor: 'border-amber-300',
      benefits: ['إطار ملكي ذهبي', '+40% مكافأة', 'خدمات ملكية', 'هدايا ملكية', 'أولوية قصوى', 'تاج خاص'],
      benefitsEn: ['Golden royal frame', '+40% bonus', 'Royal services', 'Royal gifts', 'Top priority', 'Special crown'],
      badge: 'الملك'
    },
    {
      level: 10,
      name: 'أسطورة الثروة',
      nameEn: 'Wealth Legend',
      minWealth: 10000000,
      maxWealth: Infinity,
      icon: '⚡',
      color: 'red-400',
      gradient: 'from-red-400 via-pink-500 to-purple-600',
      frameColor: 'border-red-400',
      benefits: ['إطار أسطوري فريد', '+50% مكافأة', 'خدمات أسطورية', 'جميع الهدايا', 'تحكم كامل', 'مكانة أسطورية', 'تأثيرات حصرية'],
      benefitsEn: ['Unique legendary frame', '+50% bonus', 'Legendary services', 'All gifts', 'Full control', 'Legendary status', 'Exclusive effects'],
      badge: 'أسطورة'
    }
  ];

  /**
   * الحصول على بيانات ثروة المستخدم
   */
  getUserWealth(userId: string): UserWealth | null {
    return this.userWealth.get(userId) || null;
  }

  /**
   * إنشاء حساب ثروة جديد للمستخدم
   */
  createWealthAccount(userId: string): UserWealth {
    const newAccount: UserWealth = {
      userId,
      currentWealth: 0,
      currentLevel: 1,
      totalRecharge: 0,
      totalGiftsSent: 0,
      monthlyRecharge: 0,
      monthlyGiftsSent: 0,
      lastUpdate: new Date(),
      rechargeHistory: [],
      giftHistory: []
    };

    this.userWealth.set(userId, newAccount);
    return newAccount;
  }

  /**
   * تسجيل عملية شحن
   */
  recordRecharge(userId: string, amount: number, method: string = 'card'): void {
    let wealth = this.userWealth.get(userId);
    
    if (!wealth) {
      wealth = this.createWealthAccount(userId);
    }

    const record: RechargeRecord = {
      id: Date.now().toString(),
      amount,
      date: new Date(),
      method
    };

    wealth.totalRecharge += amount;
    wealth.monthlyRecharge += amount;
    wealth.currentWealth += amount;
    wealth.rechargeHistory.push(record);
    wealth.lastUpdate = new Date();

    this.updateLevel(wealth);
  }

  /**
   * تسجيل إرسال هدية
   */
  recordGiftSent(userId: string, giftValue: number, giftName: string, recipientId: string, recipientName: string): void {
    let wealth = this.userWealth.get(userId);
    
    if (!wealth) {
      wealth = this.createWealthAccount(userId);
    }

    const record: GiftRecord = {
      id: Date.now().toString(),
      giftName,
      value: giftValue,
      recipientId,
      recipientName,
      date: new Date()
    };

    wealth.totalGiftsSent += giftValue;
    wealth.monthlyGiftsSent += giftValue;
    wealth.currentWealth += giftValue;
    wealth.giftHistory.push(record);
    wealth.lastUpdate = new Date();

    this.updateLevel(wealth);
  }

  /**
   * تحديث مستوى الثروة بناءً على الثروة الحالية
   */
  private updateLevel(wealth: UserWealth): void {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      const level = this.levels[i];
      if (wealth.currentWealth >= level.minWealth) {
        wealth.currentLevel = level.level;
        break;
      }
    }

    // حفظ التحديث
    this.userWealth.set(wealth.userId, wealth);
  }

  /**
   * الحصول على معلومات المستوى الحالي
   */
  getCurrentLevel(userId: string): WealthLevel | null {
    const wealth = this.userWealth.get(userId);
    if (!wealth) return this.levels[0]; // المستوى الأول افتراضياً

    return this.levels.find(l => l.level === wealth.currentLevel) || this.levels[0];
  }

  /**
   * الحصول على المستوى التالي
   */
  getNextLevel(userId: string): WealthLevel | null {
    const wealth = this.userWealth.get(userId);
    if (!wealth) return this.levels[1];

    const nextLevelIndex = wealth.currentLevel; // المستوى التالي
    return nextLevelIndex < this.levels.length ? this.levels[nextLevelIndex] : null;
  }

  /**
   * حساب التقدم إلى المستوى التالي (نسبة مئوية)
   */
  getProgressToNextLevel(userId: string): number {
    const wealth = this.userWealth.get(userId);
    if (!wealth) return 0;

    const currentLevel = this.levels.find(l => l.level === wealth.currentLevel);
    const nextLevel = this.getNextLevel(userId);

    if (!currentLevel || !nextLevel) return 100;

    const progress = ((wealth.currentWealth - currentLevel.minWealth) / 
                     (nextLevel.minWealth - currentLevel.minWealth)) * 100;

    return Math.min(100, Math.max(0, progress));
  }

  /**
   * الحصول على جميع المستويات
   */
  getAllLevels(): WealthLevel[] {
    return [...this.levels];
  }

  /**
   * الحصول على لوحة المتصدرين (أعلى 10 مستخدمين)
   */
  getLeaderboard(limit: number = 10): Array<{ userId: string; wealth: number; level: number }> {
    const leaderboard = Array.from(this.userWealth.values())
      .map(w => ({
        userId: w.userId,
        wealth: w.currentWealth,
        level: w.currentLevel
      }))
      .sort((a, b) => b.wealth - a.wealth)
      .slice(0, limit);

    return leaderboard;
  }

  /**
   * إعادة تعيين الإحصائيات الشهرية (يتم استدعاءها شهرياً)
   */
  resetMonthlyStats(): void {
    this.userWealth.forEach(wealth => {
      wealth.monthlyRecharge = 0;
      wealth.monthlyGiftsSent = 0;
    });
  }

  /**
   * الحصول على سجل الشحن
   */
  getRechargeHistory(userId: string, limit: number = 10): RechargeRecord[] {
    const wealth = this.userWealth.get(userId);
    if (!wealth) return [];

    return wealth.rechargeHistory
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  /**
   * الحصول على سجل الهدايا
   */
  getGiftHistory(userId: string, limit: number = 10): GiftRecord[] {
    const wealth = this.userWealth.get(userId);
    if (!wealth) return [];

    return wealth.giftHistory
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  /**
   * الحصول على المكافأة الحالية بناءً على المستوى
   */
  getCurrentBonus(userId: string): number {
    const currentLevel = this.getCurrentLevel(userId);
    if (!currentLevel) return 0;

    // استخراج نسبة المكافأة من قائمة المزايا
    const bonusBenefit = currentLevel.benefits.find(b => b.includes('%'));
    if (!bonusBenefit) return 0;

    const match = bonusBenefit.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * إنشاء بيانات تجريبية
   */
  initializeDemoData(userId: string = 'demo-user-123'): void {
    // إنشاء حساب تجريبي
    const wealth = this.createWealthAccount(userId);

    // إضافة سجلات شحن تجريبية
    const recharges = [
      { amount: 50000, method: 'بطاقة ائتمان', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { amount: 100000, method: 'PayPal', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { amount: 150000, method: 'بطاقة ائتمان', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { amount: 200000, method: 'تحويل بنكي', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { amount: 80000, method: 'بطاقة ائتمان', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    ];

    recharges.forEach((r, index) => {
      wealth.rechargeHistory.push({
        id: `recharge-${index}`,
        amount: r.amount,
        date: r.date,
        method: r.method
      });
      wealth.totalRecharge += r.amount;
    });

    // إضافة سجلات هدايا تجريبية
    const gifts = [
      { name: 'وردة', value: 100, recipient: 'user-1', recipientName: 'سارة', date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
      { name: 'سيارة فاخرة', value: 5000, recipient: 'user-2', recipientName: 'ليلى', date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) },
      { name: 'تنين ذهبي', value: 10000, recipient: 'user-3', recipientName: 'نور', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
      { name: 'قلعة', value: 15000, recipient: 'user-1', recipientName: 'سارة', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { name: 'وردة', value: 100, recipient: 'user-4', recipientName: 'مريم', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ];

    gifts.forEach((g, index) => {
      wealth.giftHistory.push({
        id: `gift-${index}`,
        giftName: g.name,
        value: g.value,
        recipientId: g.recipient,
        recipientName: g.recipientName,
        date: g.date
      });
      wealth.totalGiftsSent += g.value;
    });

    // حساب الثروة الإجمالية
    wealth.currentWealth = wealth.totalRecharge + wealth.totalGiftsSent;
    wealth.monthlyRecharge = 230000; // آخر شهر
    wealth.monthlyGiftsSent = 15200;
    
    this.updateLevel(wealth);
    
    // إضافة مستخدمين آخرين للوحة المتصدرين
    this.createDemoLeaderboard();
  }

  /**
   * إنشاء لوحة متصدرين تجريبية
   */
  private createDemoLeaderboard(): void {
    const demoUsers = [
      { id: 'user-top-1', wealth: 15000000 },
      { id: 'user-top-2', wealth: 8500000 },
      { id: 'user-top-3', wealth: 5200000 },
      { id: 'user-top-4', wealth: 3100000 },
      { id: 'user-top-5', wealth: 1800000 },
      { id: 'user-top-6', wealth: 950000 },
      { id: 'user-top-7', wealth: 450000 },
      { id: 'user-top-8', wealth: 180000 },
      { id: 'user-top-9', wealth: 75000 }
    ];

    demoUsers.forEach(user => {
      const wealth = this.createWealthAccount(user.id);
      wealth.currentWealth = user.wealth;
      wealth.totalRecharge = user.wealth * 0.6;
      wealth.totalGiftsSent = user.wealth * 0.4;
      this.updateLevel(wealth);
    });
  }
}

// تصدير singleton
export const WealthLevelService = new WealthLevelServiceClass();
