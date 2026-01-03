import type { ReferralReward, ReferralUser, ReferralStats, ReferralContest } from '@/models/Referral';
import { EconomyService } from './EconomyService';

class ReferralServiceClass {
  private readonly STORAGE_KEY = 'referrals';
  private readonly CONTESTS_KEY = 'referral_contests';
  private readonly STATS_KEY = 'referral_stats';

  private readonly REWARDS: ReferralReward[] = [
    { level: 1, referralsRequired: 1, coins: 100, diamonds: 10, badge: '🥉' },
    { level: 2, referralsRequired: 5, coins: 500, diamonds: 50, badge: '🥈', title: 'المُحيل النشط' },
    { level: 3, referralsRequired: 10, coins: 1500, diamonds: 150, badge: '🥇', title: 'سفير التطبيق' },
    { level: 4, referralsRequired: 25, coins: 5000, diamonds: 500, badge: '💎', title: 'أسطورة الإحالة' },
    { level: 5, referralsRequired: 50, coins: 15000, diamonds: 1500, badge: '👑', title: 'ملك الإحالات' },
    { level: 6, referralsRequired: 100, coins: 50000, diamonds: 5000, badge: '⭐', title: 'نجم التطبيق' }
  ];

  // ============== Generate Referral Link ==============

  generateReferralLink(userId: string): string {
    const baseUrl = window.location.origin;
    const code = this.generateReferralCode(userId);
    return `${baseUrl}/join?ref=${code}`;
  }

  private generateReferralCode(userId: string): string {
    // Simple encoding - in production use proper encryption
    return btoa(userId).replace(/=/g, '').substring(0, 8);
  }

  private decodeReferralCode(code: string): string {
    try {
      return atob(code);
    } catch {
      return '';
    }
  }

  // ============== Referral Registration ==============

  registerReferral(referrerId: string, newUserId: string, newUserName: string, newUserAvatar: string): boolean {
    // Prevent self-referral
    if (referrerId === newUserId) return false;

    const referrals = this.getReferrals(referrerId);
    
    // Check if already referred
    if (referrals.some(r => r.userId === newUserId)) return false;

    const newReferral: ReferralUser = {
      userId: newUserId,
      userName: newUserName,
      userAvatar: newUserAvatar,
      joinedAt: Date.now(),
      level: 1,
      isActive: true,
      contributions: {
        coins: 0,
        referrals: 0
      }
    };

    referrals.push(newReferral);
    this.saveReferrals(referrerId, referrals);

    // Award instant reward
    this.awardReferralReward(referrerId, 1);

    // Update stats
    this.updateStats(referrerId);

    return true;
  }

  // ============== Get Referrals ==============

  getReferrals(userId: string): ReferralUser[] {
    const key = `${this.STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private saveReferrals(userId: string, referrals: ReferralUser[]): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(referrals));
  }

  // ============== Stats ==============

  getStats(userId: string): ReferralStats {
    const referrals = this.getReferrals(userId);
    const activeReferrals = referrals.filter(r => r.isActive).length;
    
    const stats = this.getStoredStats(userId);
    const currentLevel = this.getCurrentLevel(referrals.length);
    const nextLevel = this.REWARDS.find(r => r.referralsRequired > referrals.length);

    return {
      totalReferrals: referrals.length,
      activeReferrals,
      totalEarned: stats.totalEarned,
      currentLevel,
      nextLevelProgress: nextLevel 
        ? (referrals.length / nextLevel.referralsRequired) * 100 
        : 100,
      referralLink: this.generateReferralLink(userId)
    };
  }

  private getStoredStats(userId: string): { totalEarned: { coins: number; diamonds: number } } {
    const key = `${this.STATS_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : { totalEarned: { coins: 0, diamonds: 0 } };
  }

  private updateStats(userId: string): void {
    const referrals = this.getReferrals(userId);
    const level = this.getCurrentLevel(referrals.length);
    const reward = this.REWARDS[level - 1];

    const stats = {
      totalEarned: {
        coins: reward.coins * level,
        diamonds: reward.diamonds * level
      }
    };

    const key = `${this.STATS_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(stats));
  }

  // ============== Rewards ==============

  private getCurrentLevel(referralCount: number): number {
    for (let i = this.REWARDS.length - 1; i >= 0; i--) {
      if (referralCount >= this.REWARDS[i].referralsRequired) {
        return this.REWARDS[i].level;
      }
    }
    return 1;
  }

  getRewardForLevel(level: number): ReferralReward | undefined {
    return this.REWARDS.find(r => r.level === level);
  }

  getAllRewards(): ReferralReward[] {
    return [...this.REWARDS];
  }

  private awardReferralReward(userId: string, count: number): void {
    const level = this.getCurrentLevel(count);
    const reward = this.REWARDS[level - 1];

    if (reward) {
      // Award coins and diamonds
      EconomyService.addCoins(userId, reward.coins);
      if (reward.diamonds > 0) {
        EconomyService.addDiamonds(userId, reward.diamonds);
      }

      // Update total earned
      this.updateStats(userId);
    }
  }

  // ============== Contests ==============

  createContest(
    name: string,
    description: string,
    durationDays: number,
    prizes: ReferralContest['prizes']
  ): string {
    const contest: ReferralContest = {
      id: `contest_${Date.now()}`,
      name,
      description,
      startDate: Date.now(),
      endDate: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
      prizes,
      leaderboard: [],
      status: 'active'
    };

    const contests = this.getAllContests();
    contests.push(contest);
    localStorage.setItem(this.CONTESTS_KEY, JSON.stringify(contests));

    return contest.id;
  }

  getActiveContest(): ReferralContest | null {
    const contests = this.getAllContests();
    const now = Date.now();
    
    return contests.find(c => 
      c.status === 'active' && 
      c.startDate <= now && 
      c.endDate > now
    ) || null;
  }

  getAllContests(): ReferralContest[] {
    const stored = localStorage.getItem(this.CONTESTS_KEY);
    const contests: ReferralContest[] = stored ? JSON.parse(stored) : [];

    // Update statuses
    const now = Date.now();
    contests.forEach(c => {
      if (c.endDate < now && c.status === 'active') {
        c.status = 'ended';
      } else if (c.startDate > now) {
        c.status = 'upcoming';
      }
    });

    return contests;
  }

  updateContestLeaderboard(contestId: string): void {
    const contests = this.getAllContests();
    const contest = contests.find(c => c.id === contestId);
    
    if (!contest) return;

    // Get all users' referral counts (demo data)
    const leaderboard = [
      { rank: 1, userId: 'user1', userName: 'أحمد', userAvatar: '', referrals: 45 },
      { rank: 2, userId: 'user2', userName: 'محمد', userAvatar: '', referrals: 38 },
      { rank: 3, userId: 'user3', userName: 'فاطمة', userAvatar: '', referrals: 32 }
    ].map((entry, index) => ({
      ...entry,
      rank: index + 1,
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`
    }));

    contest.leaderboard = leaderboard;
    localStorage.setItem(this.CONTESTS_KEY, JSON.stringify(contests));
  }

  // ============== Utility ==============

  getTopReferrers(limit: number = 10): Array<{
    userId: string;
    referralCount: number;
    level: number;
    badge: string;
  }> {
    // In production, this would query all users
    // For now, return demo data
    return [];
  }

  trackReferralActivity(referrerId: string, referredId: string, activity: string): void {
    // Track activities like: first_login, first_purchase, level_up
    const referrals = this.getReferrals(referrerId);
    const referral = referrals.find(r => r.userId === referredId);
    
    if (!referral) return;

    // Award bonus for activities
    if (activity === 'first_purchase') {
      EconomyService.addCoins(referrerId, 200);
    } else if (activity === 'level_10') {
      EconomyService.addCoins(referrerId, 100);
    }
  }

  copyToClipboard(text: string): boolean {
    try {
      navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  }

  shareViaWhatsApp(userId: string, userName: string): void {
    const link = this.generateReferralLink(userId);
    const message = `انضم إلي في هذا التطبيق الرائع! 🎉\n${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  shareViaTwitter(userId: string): void {
    const link = this.generateReferralLink(userId);
    const text = `انضم إلي في هذا التطبيق الرائع!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    window.open(url, '_blank');
  }

  shareViaFacebook(userId: string): void {
    const link = this.generateReferralLink(userId);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    window.open(url, '_blank');
  }
}

export const ReferralService = new ReferralServiceClass();
