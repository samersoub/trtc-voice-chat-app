/**
 * Lucky Wheel Service
 * Manages daily spins and prizes
 */

export interface WheelPrize {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  type: 'coins' | 'diamonds' | 'gift' | 'theme' | 'frame' | 'badge';
  value: number;
  probability: number; // 0-100
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SpinResult {
  prize: WheelPrize;
  timestamp: Date;
  userId: string;
}

export interface SpinStats {
  totalSpins: number;
  todaySpins: number;
  remainingSpins: number;
  totalCoinsWon: number;
  totalDiamondsWon: number;
  lastSpinDate: string;
  spinStreak: number;
}

class LuckyWheelServiceClass {
  private readonly STORAGE_KEY = 'lucky_wheel';
  private readonly MAX_DAILY_SPINS = 3;
  private readonly SPIN_COST = 100; // coins per extra spin

  /**
   * Get all available prizes
   */
  getAllPrizes(): WheelPrize[] {
    return [
      {
        id: 'coins_50',
        name: '50 عملة',
        nameEn: '50 Coins',
        icon: '🪙',
        type: 'coins',
        value: 50,
        probability: 30,
        color: '#fbbf24',
        rarity: 'common'
      },
      {
        id: 'coins_100',
        name: '100 عملة',
        nameEn: '100 Coins',
        icon: '💰',
        type: 'coins',
        value: 100,
        probability: 25,
        color: '#f59e0b',
        rarity: 'common'
      },
      {
        id: 'coins_250',
        name: '250 عملة',
        nameEn: '250 Coins',
        icon: '💵',
        type: 'coins',
        value: 250,
        probability: 15,
        color: '#d97706',
        rarity: 'rare'
      },
      {
        id: 'diamonds_5',
        name: '5 ماسات',
        nameEn: '5 Diamonds',
        icon: '💎',
        type: 'diamonds',
        value: 5,
        probability: 10,
        color: '#3b82f6',
        rarity: 'rare'
      },
      {
        id: 'diamonds_10',
        name: '10 ماسات',
        nameEn: '10 Diamonds',
        icon: '💠',
        type: 'diamonds',
        value: 10,
        probability: 5,
        color: '#2563eb',
        rarity: 'epic'
      },
      {
        id: 'rose_gift',
        name: 'وردة حمراء',
        nameEn: 'Rose',
        icon: '🌹',
        type: 'gift',
        value: 1,
        probability: 8,
        color: '#ec4899',
        rarity: 'rare'
      },
      {
        id: 'theme_ticket',
        name: 'تذكرة ثيم',
        nameEn: 'Theme Ticket',
        icon: '🎫',
        type: 'theme',
        value: 1,
        probability: 4,
        color: '#8b5cf6',
        rarity: 'epic'
      },
      {
        id: 'frame_gold',
        name: 'إطار ذهبي',
        nameEn: 'Gold Frame',
        icon: '🖼️',
        type: 'frame',
        value: 1,
        probability: 2,
        color: '#f59e0b',
        rarity: 'legendary'
      },
      {
        id: 'badge_lucky',
        name: 'شارة الحظ',
        nameEn: 'Lucky Badge',
        icon: '🍀',
        type: 'badge',
        value: 1,
        probability: 1,
        color: '#10b981',
        rarity: 'legendary'
      }
    ];
  }

  /**
   * Get spin stats for user
   */
  getSpinStats(userId: string): SpinStats {
    const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    if (!data) {
      return this.initializeStats(userId);
    }

    const stats = JSON.parse(data);
    const today = new Date().toDateString();
    
    // Reset daily spins if new day
    if (stats.lastSpinDate !== today) {
      stats.todaySpins = 0;
      stats.remainingSpins = this.MAX_DAILY_SPINS;
      stats.lastSpinDate = today;
      
      // Update streak
      const lastDate = new Date(stats.lastSpinDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.spinStreak += 1;
      } else if (diffDays > 1) {
        stats.spinStreak = 0;
      }
      
      this.saveStats(userId, stats);
    }

    return stats;
  }

  /**
   * Initialize stats for new user
   */
  private initializeStats(userId: string): SpinStats {
    const stats: SpinStats = {
      totalSpins: 0,
      todaySpins: 0,
      remainingSpins: this.MAX_DAILY_SPINS,
      totalCoinsWon: 0,
      totalDiamondsWon: 0,
      lastSpinDate: new Date().toDateString(),
      spinStreak: 0
    };
    this.saveStats(userId, stats);
    return stats;
  }

  /**
   * Save stats
   */
  private saveStats(userId: string, stats: SpinStats): void {
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(stats));
  }

  /**
   * Spin the wheel
   */
  spin(userId: string, useCoinsPurchase: boolean = false): { success: boolean; prize?: WheelPrize; message: string } {
    const stats = this.getSpinStats(userId);

    // Check remaining spins
    if (stats.remainingSpins <= 0 && !useCoinsPurchase) {
      return {
        success: false,
        message: `لا توجد لفات متبقية. يمكنك شراء لفة إضافية بـ ${this.SPIN_COST} عملة`
      };
    }

    // Select random prize based on probability
    const prize = this.selectRandomPrize();

    // Update stats
    stats.totalSpins += 1;
    stats.todaySpins += 1;
    if (!useCoinsPurchase) {
      stats.remainingSpins -= 1;
    }

    if (prize.type === 'coins') {
      stats.totalCoinsWon += prize.value;
    } else if (prize.type === 'diamonds') {
      stats.totalDiamondsWon += prize.value;
    }

    this.saveStats(userId, stats);

    // Save spin history
    this.addToHistory(userId, { prize, timestamp: new Date(), userId });

    return {
      success: true,
      prize,
      message: `تهانينا! لقد ربحت ${prize.name}`
    };
  }

  /**
   * Select random prize based on probabilities
   */
  private selectRandomPrize(): WheelPrize {
    const prizes = this.getAllPrizes();
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    let random = Math.random() * totalProbability;

    for (const prize of prizes) {
      random -= prize.probability;
      if (random <= 0) {
        return prize;
      }
    }

    return prizes[0]; // Fallback
  }

  /**
   * Purchase extra spin
   */
  purchaseSpin(userId: string, userCoins: number): { success: boolean; message: string; newBalance?: number } {
    if (userCoins < this.SPIN_COST) {
      return {
        success: false,
        message: `عملات غير كافية. تحتاج ${this.SPIN_COST} عملة`
      };
    }

    return {
      success: true,
      message: `تم شراء لفة إضافية بنجاح`,
      newBalance: userCoins - this.SPIN_COST
    };
  }

  /**
   * Get spin history
   */
  getHistory(userId: string, limit: number = 20): SpinResult[] {
    const data = localStorage.getItem(`${this.STORAGE_KEY}_history_${userId}`);
    if (!data) return [];
    
    const history: SpinResult[] = JSON.parse(data);
    return history.slice(0, limit);
  }

  /**
   * Add to history
   */
  private addToHistory(userId: string, result: SpinResult): void {
    const history = this.getHistory(userId, 100);
    history.unshift(result);
    localStorage.setItem(`${this.STORAGE_KEY}_history_${userId}`, JSON.stringify(history));
  }

  /**
   * Get spin cost
   */
  getSpinCost(): number {
    return this.SPIN_COST;
  }

  /**
   * Get max daily spins
   */
  getMaxDailySpins(): number {
    return this.MAX_DAILY_SPINS;
  }
}

export const LuckyWheelService = new LuckyWheelServiceClass();
