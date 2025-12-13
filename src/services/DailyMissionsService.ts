/**
 * Daily Missions Service
 * Manages daily tasks, progress tracking, and rewards
 */

export interface DailyMission {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  reward: {
    coins: number;
    exp: number;
    diamonds?: number;
  };
  progress: {
    current: number;
    target: number;
  };
  completed: boolean;
  claimed: boolean;
  category: 'social' | 'voice' | 'economy' | 'engagement';
  difficulty: 'easy' | 'medium' | 'hard';
  expiresAt: Date;
}

export interface MissionProgress {
  missionId: string;
  userId: string;
  progress: number;
  completedAt?: Date;
  claimedAt?: Date;
}

class DailyMissionsServiceClass {
  private readonly STORAGE_KEY = 'daily_missions';
  private readonly PROGRESS_KEY = 'missions_progress';
  private readonly LAST_RESET_KEY = 'missions_last_reset';

  /**
   * Get all daily missions for today
   */
  getDailyMissions(userId: string): DailyMission[] {
    this.checkAndResetDaily();
    
    const savedMissions = this.getSavedMissions(userId);
    if (savedMissions.length > 0) {
      return savedMissions;
    }

    // Generate new missions for today
    const missions = this.generateDailyMissions();
    this.saveMissions(userId, missions);
    return missions;
  }

  /**
   * Generate random daily missions
   */
  private generateDailyMissions(): DailyMission[] {
    const allMissions: Omit<DailyMission, 'id' | 'progress' | 'completed' | 'expiresAt'>[] = [
      // Social Missions
      {
        title: 'متحدث نشيط',
        titleEn: 'Active Speaker',
        description: 'تحدث في الغرف الصوتية لمدة 30 دقيقة',
        descriptionEn: 'Speak in voice rooms for 30 minutes',
        icon: '🎤',
        reward: { coins: 100, exp: 50 },
        category: 'voice',
        difficulty: 'medium',
        claimed: false
      },
      {
        title: 'صديق ودود',
        titleEn: 'Friendly',
        description: 'أرسل 50 رسالة في الدردشة',
        descriptionEn: 'Send 50 messages in chat',
        icon: '💬',
        reward: { coins: 50, exp: 30 },
        category: 'social',
        difficulty: 'easy',
        claimed: false
      },
      {
        title: 'كريم سخي',
        titleEn: 'Generous',
        description: 'أرسل 5 هدايا لأصدقائك',
        descriptionEn: 'Send 5 gifts to friends',
        icon: '🎁',
        reward: { coins: 200, exp: 100, diamonds: 10 },
        category: 'economy',
        difficulty: 'hard',
        claimed: false
      },
      {
        title: 'مشارك فعال',
        titleEn: 'Active Participant',
        description: 'انضم إلى 3 غرف صوتية مختلفة',
        descriptionEn: 'Join 3 different voice rooms',
        icon: '🚪',
        reward: { coins: 75, exp: 40 },
        category: 'voice',
        difficulty: 'easy',
        claimed: false
      },
      {
        title: 'صانع صداقات',
        titleEn: 'Friend Maker',
        description: 'أضف 3 أصدقاء جدد',
        descriptionEn: 'Add 3 new friends',
        icon: '👥',
        reward: { coins: 150, exp: 70 },
        category: 'social',
        difficulty: 'medium',
        claimed: false
      },
      {
        title: 'لاعب محظوظ',
        titleEn: 'Lucky Player',
        description: 'العب عجلة الحظ 3 مرات',
        descriptionEn: 'Play lucky wheel 3 times',
        icon: '🎰',
        reward: { coins: 100, exp: 50 },
        category: 'engagement',
        difficulty: 'easy',
        claimed: false
      },
      {
        title: 'مستمع جيد',
        titleEn: 'Good Listener',
        description: 'استمع في الغرف الصوتية لمدة ساعة',
        descriptionEn: 'Listen in voice rooms for 1 hour',
        icon: '👂',
        reward: { coins: 120, exp: 60 },
        category: 'voice',
        difficulty: 'medium',
        claimed: false
      },
      {
        title: 'متفاعل نشيط',
        titleEn: 'Active Engager',
        description: 'اضغط إعجاب على 20 رسالة',
        descriptionEn: 'Like 20 messages',
        icon: '❤️',
        reward: { coins: 40, exp: 20 },
        category: 'engagement',
        difficulty: 'easy',
        claimed: false
      }
    ];

    // Select 5 random missions
    const shuffled = allMissions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    return selected.map((mission, index) => ({
      ...mission,
      id: `mission_${Date.now()}_${index}`,
      progress: { current: 0, target: this.getTargetForMission(mission.description) },
      completed: false,
      claimed: false,
      expiresAt
    }));
  }

  /**
   * Extract target number from mission description
   */
  private getTargetForMission(description: string): number {
    const match = description.match(/(\d+)/);
    return match ? parseInt(match[0]) : 1;
  }

  /**
   * Update mission progress
   */
  updateProgress(userId: string, missionId: string, increment: number = 1): boolean {
    const missions = this.getDailyMissions(userId);
    const mission = missions.find(m => m.id === missionId);
    
    if (!mission || mission.completed) return false;

    mission.progress.current = Math.min(
      mission.progress.current + increment,
      mission.progress.target
    );

    if (mission.progress.current >= mission.progress.target) {
      mission.completed = true;
    }

    this.saveMissions(userId, missions);
    return mission.completed;
  }

  /**
   * Claim mission reward
   */
  claimReward(userId: string, missionId: string): { coins: number; exp: number; diamonds?: number } | null {
    const missions = this.getDailyMissions(userId);
    const mission = missions.find(m => m.id === missionId);
    
    if (!mission || !mission.completed) return null;

    // Mark as claimed by removing from list
    const updated = missions.filter(m => m.id !== missionId);
    this.saveMissions(userId, updated);

    // Track claimed missions
    const claimed = this.getClaimedMissions(userId);
    claimed.push({
      missionId,
      userId,
      progress: mission.progress.target,
      completedAt: new Date(),
      claimedAt: new Date()
    });
    localStorage.setItem(`claimed_missions_${userId}`, JSON.stringify(claimed));

    return mission.reward;
  }

  /**
   * Get mission completion stats
   */
  getStats(userId: string): {
    totalCompleted: number;
    totalCoinsEarned: number;
    totalExpEarned: number;
    currentStreak: number;
  } {
    const claimed = this.getClaimedMissions(userId);
    
    return {
      totalCompleted: claimed.length,
      totalCoinsEarned: claimed.reduce((sum, c) => {
        const mission = this.getMissionById(c.missionId);
        return sum + (mission?.reward.coins || 0);
      }, 0),
      totalExpEarned: claimed.reduce((sum, c) => {
        const mission = this.getMissionById(c.missionId);
        return sum + (mission?.reward.exp || 0);
      }, 0),
      currentStreak: this.calculateStreak(userId)
    };
  }

  /**
   * Calculate completion streak (consecutive days)
   */
  private calculateStreak(userId: string): number {
    const claimed = this.getClaimedMissions(userId);
    if (claimed.length === 0) return 0;

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const completedToday = claimed.some(c => {
        const claimDate = new Date(c.claimedAt!);
        return claimDate >= dayStart && claimDate <= dayEnd;
      });

      if (!completedToday) break;

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);

      if (streak > 365) break; // Safety limit
    }

    return streak;
  }

  /**
   * Helper methods
   */
  private getSavedMissions(userId: string): DailyMission[] {
    const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  private saveMissions(userId: string, missions: DailyMission[]): void {
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(missions));
  }

  private getClaimedMissions(userId: string): MissionProgress[] {
    const data = localStorage.getItem(`claimed_missions_${userId}`);
    return data ? JSON.parse(data) : [];
  }

  private getMissionById(missionId: string): DailyMission | null {
    // This is simplified - in production, store mission templates separately
    return null;
  }

  private checkAndResetDaily(): void {
    const lastReset = localStorage.getItem(this.LAST_RESET_KEY);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!lastReset || new Date(lastReset) < today) {
      // Reset time passed - clear all missions
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_KEY)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(this.LAST_RESET_KEY, today.toISOString());
    }
  }
}

export const DailyMissionsService = new DailyMissionsServiceClass();
