/**
 * Phase 1 Analytics Service
 * Tracks and analyzes usage of Phase 1 features
 */

import { DailyMissionsService } from './DailyMissionsService';
import { RoomThemesService } from './RoomThemesService';
import { VoiceEffectsService } from './VoiceEffectsService';
import { LuckyWheelService } from './LuckyWheelService';
import { FriendRecommendationService } from './FriendRecommendationService';

export interface FeatureAnalytics {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  totalUsage: number;
}

export interface ThemeAnalytics {
  themeId: string;
  themeName: string;
  usageCount: number;
  activeUsers: number;
  revenue: number;
  popularity: number; // 0-100
}

export interface EffectAnalytics {
  effectId: string;
  effectName: string;
  usageCount: number;
  activeUsers: number;
  averageDuration: number; // minutes
  popularity: number;
}

export interface MissionAnalytics {
  missionType: string;
  totalAttempts: number;
  completionRate: number; // 0-100
  averageCompletionTime: number; // minutes
  rewardsClaimed: number;
}

export interface WheelAnalytics {
  totalSpins: number;
  uniqueUsers: number;
  topPrizes: Array<{
    prizeId: string;
    prizeName: string;
    wonCount: number;
    totalValue: number;
  }>;
  averageSpinsPerUser: number;
}

export interface Phase1Analytics {
  overview: {
    totalFeatureUsage: number;
    mostPopularFeature: string;
    engagementRate: number; // 0-100
    generatedAt: Date;
  };
  themes: ThemeAnalytics[];
  effects: EffectAnalytics[];
  missions: MissionAnalytics[];
  wheel: WheelAnalytics;
}

class Phase1AnalyticsServiceClass {
  private readonly ANALYTICS_STORAGE_KEY = 'phase1_analytics';
  private readonly USAGE_LOG_KEY = 'phase1_usage_log';

  /**
   * Get comprehensive analytics for Phase 1 features
   */
  async getAnalytics(): Promise<Phase1Analytics> {
    try {
      const [themes, effects, missions, wheel] = await Promise.all([
        this.getThemeAnalytics(),
        this.getEffectAnalytics(),
        this.getMissionAnalytics(),
        this.getWheelAnalytics()
      ]);

      // Calculate overall metrics
      const totalUsage = 
        themes.reduce((sum, t) => sum + t.usageCount, 0) +
        effects.reduce((sum, e) => sum + e.usageCount, 0) +
        missions.reduce((sum, m) => sum + m.totalAttempts, 0) +
        wheel.totalSpins;

      // Determine most popular feature
      const featureUsage = {
        themes: themes.reduce((sum, t) => sum + t.usageCount, 0),
        effects: effects.reduce((sum, e) => sum + e.usageCount, 0),
        missions: missions.reduce((sum, m) => sum + m.totalAttempts, 0),
        wheel: wheel.totalSpins
      };

      const mostPopular = Object.entries(featureUsage)
        .sort(([, a], [, b]) => b - a)[0][0];

      const analytics: Phase1Analytics = {
        overview: {
          totalFeatureUsage: totalUsage,
          mostPopularFeature: mostPopular,
          engagementRate: this.calculateEngagementRate(),
          generatedAt: new Date()
        },
        themes,
        effects,
        missions,
        wheel
      };

      // Cache analytics
      this.cacheAnalytics(analytics);

      return analytics;
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      return this.getCachedAnalytics();
    }
  }

  /**
   * Get theme usage analytics
   */
  private async getThemeAnalytics(): Promise<ThemeAnalytics[]> {
    const allThemes = await RoomThemesService.getAllThemes();
    const usageLog = this.getUsageLog();

    return allThemes.map(theme => {
      const themeUsage = usageLog.filter(log => 
        log.feature === 'theme' && log.featureId === theme.id
      );

      const uniqueUsers = new Set(themeUsage.map(log => log.userId)).size;
      const totalUsage = themeUsage.length;
      const maxUsage = Math.max(...allThemes.map(t => 
        usageLog.filter(l => l.feature === 'theme' && l.featureId === t.id).length
      ), 1);

      return {
        themeId: theme.id,
        themeName: theme.name,
        usageCount: totalUsage,
        activeUsers: uniqueUsers,
        revenue: uniqueUsers * theme.price,
        popularity: Math.round((totalUsage / maxUsage) * 100)
      };
    }).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get voice effect analytics
   */
  private async getEffectAnalytics(): Promise<EffectAnalytics[]> {
    const allEffects = await VoiceEffectsService.getAllEffects();
    const usageLog = this.getUsageLog();

    return allEffects.map(effect => {
      const effectUsage = usageLog.filter(log => 
        log.feature === 'effect' && log.featureId === effect.id
      );

      const uniqueUsers = new Set(effectUsage.map(log => log.userId)).size;
      const totalUsage = effectUsage.length;
      const totalDuration = effectUsage.reduce((sum, log) => sum + (log.duration || 0), 0);
      const maxUsage = Math.max(...allEffects.map(e => 
        usageLog.filter(l => l.feature === 'effect' && l.featureId === e.id).length
      ), 1);

      return {
        effectId: effect.id,
        effectName: effect.name,
        usageCount: totalUsage,
        activeUsers: uniqueUsers,
        averageDuration: totalUsage > 0 ? totalDuration / totalUsage : 0,
        popularity: Math.round((totalUsage / maxUsage) * 100)
      };
    }).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get mission completion analytics
   */
  private async getMissionAnalytics(): Promise<MissionAnalytics[]> {
    const missionTypes = [
      'daily_login',
      'send_messages',
      'voice_chat_time',
      'send_gifts',
      'make_friends',
      'room_visits',
      'profile_views',
      'lucky_wheel_spins'
    ];

    const usageLog = this.getUsageLog();

    return missionTypes.map(type => {
      const missions = usageLog.filter(log => 
        log.feature === 'mission' && log.featureId === type
      );

      const completed = missions.filter(m => m.completed).length;
      const totalAttempts = missions.length;
      const totalTime = missions.reduce((sum, m) => sum + (m.duration || 0), 0);
      const claimed = missions.filter(m => m.claimed).length;

      return {
        missionType: type,
        totalAttempts,
        completionRate: totalAttempts > 0 ? (completed / totalAttempts) * 100 : 0,
        averageCompletionTime: completed > 0 ? totalTime / completed : 0,
        rewardsClaimed: claimed
      };
    }).sort((a, b) => b.totalAttempts - a.totalAttempts);
  }

  /**
   * Get lucky wheel analytics
   */
  private async getWheelAnalytics(): Promise<WheelAnalytics> {
    const usageLog = this.getUsageLog();
    const wheelSpins = usageLog.filter(log => log.feature === 'wheel');

    const uniqueUsers = new Set(wheelSpins.map(log => log.userId)).size;
    const totalSpins = wheelSpins.length;

    // Aggregate prizes
    const prizeMap = new Map<string, { name: string; count: number; value: number }>();
    
    wheelSpins.forEach(spin => {
      if (spin.prize) {
        const existing = prizeMap.get(spin.prize.id) || { 
          name: spin.prize.name, 
          count: 0, 
          value: 0 
        };
        existing.count++;
        existing.value += spin.prize.value || 0;
        prizeMap.set(spin.prize.id, existing);
      }
    });

    const topPrizes = Array.from(prizeMap.entries())
      .map(([id, data]) => ({
        prizeId: id,
        prizeName: data.name,
        wonCount: data.count,
        totalValue: data.value
      }))
      .sort((a, b) => b.wonCount - a.wonCount)
      .slice(0, 5);

    return {
      totalSpins,
      uniqueUsers,
      topPrizes,
      averageSpinsPerUser: uniqueUsers > 0 ? totalSpins / uniqueUsers : 0
    };
  }

  /**
   * Log feature usage
   */
  logUsage(entry: {
    userId: string;
    feature: 'theme' | 'effect' | 'mission' | 'wheel' | 'friends';
    featureId: string;
    duration?: number;
    completed?: boolean;
    claimed?: boolean;
    prize?: { id: string; name: string; value: number };
  }): void {
    const log = this.getUsageLog();
    
    log.push({
      ...entry,
      timestamp: Date.now()
    });

    // Keep last 1000 entries
    if (log.length > 1000) {
      log.splice(0, log.length - 1000);
    }

    localStorage.setItem(this.USAGE_LOG_KEY, JSON.stringify(log));
  }

  /**
   * Get usage log
   */
  private getUsageLog(): Record<string, unknown>[] {
    try {
      const data = localStorage.getItem(this.USAGE_LOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Calculate engagement rate
   */
  private calculateEngagementRate(): number {
    const log = this.getUsageLog();
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentActivity = log.filter(entry => entry.timestamp > oneWeekAgo);
    const uniqueUsers = new Set(recentActivity.map(entry => entry.userId));
    
    // Assume total users = unique users in log (simplified)
    const totalUsers = new Set(log.map(entry => entry.userId)).size;
    
    return totalUsers > 0 ? (uniqueUsers.size / totalUsers) * 100 : 0;
  }

  /**
   * Cache analytics
   */
  private cacheAnalytics(analytics: Phase1Analytics): void {
    try {
      localStorage.setItem(this.ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to cache analytics:', error);
    }
  }

  /**
   * Get cached analytics
   */
  getCachedAnalytics(): Phase1Analytics {
    try {
      const data = localStorage.getItem(this.ANALYTICS_STORAGE_KEY);
      if (data) {
        const analytics = JSON.parse(data);
        analytics.overview.generatedAt = new Date(analytics.overview.generatedAt);
        return analytics;
      }
    } catch (error) {
      console.error('Failed to get cached analytics:', error);
    }

    // Return empty analytics
    return {
      overview: {
        totalFeatureUsage: 0,
        mostPopularFeature: 'themes',
        engagementRate: 0,
        generatedAt: new Date()
      },
      themes: [],
      effects: [],
      missions: [],
      wheel: {
        totalSpins: 0,
        uniqueUsers: 0,
        topPrizes: [],
        averageSpinsPerUser: 0
      }
    };
  }

  /**
   * Clear all analytics data
   */
  clearAnalytics(): void {
    localStorage.removeItem(this.ANALYTICS_STORAGE_KEY);
    localStorage.removeItem(this.USAGE_LOG_KEY);
  }
}

export const Phase1AnalyticsService = new Phase1AnalyticsServiceClass();
