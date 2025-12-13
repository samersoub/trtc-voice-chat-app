/**
 * Friend Recommendation Service
 * AI-based friend matching system
 */

import { AuthService } from './AuthService';

export interface FriendSuggestion {
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    vipLevel?: number;
    bio?: string;
    interests?: string[];
    location?: string;
  };
  matchScore: number; // 0-100
  commonInterests: string[];
  mutualFriends: number;
  reason: string;
  matchFactors: {
    interests: number;
    activity: number;
    location: number;
    level: number;
  };
}

// Type alias for backward compatibility
export type UserRecommendation = FriendSuggestion & {
  id: string;
  name: string;
  interests: string[];
  location: string;
  level: number;
  matchScore: number;
  matchReason: string;
  commonInterests: string[];
  mutualFriends: number;
};

class FriendRecommendationServiceClass {
  private readonly STORAGE_KEY = 'friend_suggestions';

  /**
   * Get personalized friend recommendations
   */
  getRecommendations(limit: number = 10): FriendSuggestion[] {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];

    const allUsers = this.getAllUsers();
    const recommendations = allUsers
      .filter(u => u.id !== currentUser.id)
      .map(user => this.calculateMatch(currentUser, user))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Calculate match score between two users
   */
  private calculateMatch(user1: any, user2: any): FriendSuggestion {
    let totalScore = 0;
    const factors = {
      interests: 0,
      activity: 0,
      location: 0,
      level: 0
    };

    // Interest matching (40 points max)
    const commonInterests = this.getCommonInterests(user1, user2);
    factors.interests = Math.min(commonInterests.length * 10, 40);
    totalScore += factors.interests;

    // Activity level matching (20 points max)
    const activityDiff = Math.abs((user1.level || 1) - (user2.level || 1));
    factors.activity = Math.max(20 - activityDiff, 0);
    totalScore += factors.activity;

    // Location matching (20 points max)
    if (user1.location && user2.location && user1.location === user2.location) {
      factors.location = 20;
      totalScore += 20;
    }

    // Level proximity (20 points max)
    const levelDiff = Math.abs((user1.level || 1) - (user2.level || 1));
    factors.level = Math.max(20 - levelDiff * 2, 0);
    totalScore += factors.level;

    // Generate reason
    const reason = this.generateReason(commonInterests, factors);

    return {
      user: {
        id: user2.id,
        name: user2.name,
        avatar: user2.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user2.name}`,
        level: user2.level || 1,
        vipLevel: user2.vipLevel,
        bio: user2.bio,
        interests: user2.interests || [],
        location: user2.location
      },
      matchScore: Math.round(totalScore),
      commonInterests,
      mutualFriends: Math.floor(Math.random() * 5), // Simplified
      reason,
      matchFactors: factors
    };
  }

  /**
   * Get common interests between users
   */
  private getCommonInterests(user1: any, user2: any): string[] {
    const interests1 = user1.interests || [];
    const interests2 = user2.interests || [];
    return interests1.filter((i: string) => interests2.includes(i));
  }

  /**
   * Generate human-readable match reason
   */
  private generateReason(commonInterests: string[], factors: Record<string, number>): string {
    if (commonInterests.length > 0) {
      return `يشاركك اهتمام ${commonInterests[0]}`;
    }
    if (factors.location > 0) {
      return 'من نفس المدينة';
    }
    if (factors.level > 15) {
      return 'مستوى قريب منك';
    }
    if (factors.activity > 15) {
      return 'نشاط مشابه لنشاطك';
    }
    return 'قد يعجبك هذا المستخدم';
  }

  /**
   * Get all users (demo data)
   */
  private getAllUsers(): any[] {
    return [
      {
        id: 'user1',
        name: 'سارة أحمد',
        level: 45,
        vipLevel: 3,
        bio: 'أحب الموسيقى والسفر',
        interests: ['موسيقى', 'سفر', 'قراءة'],
        location: 'الرياض'
      },
      {
        id: 'user2',
        name: 'محمد علي',
        level: 32,
        vipLevel: 2,
        bio: 'لاعب محترف',
        interests: ['ألعاب', 'تكنولوجيا', 'رياضة'],
        location: 'جدة'
      },
      {
        id: 'user3',
        name: 'فاطمة حسن',
        level: 55,
        vipLevel: 5,
        bio: 'فنانة ومبدعة',
        interests: ['فن', 'موسيقى', 'تصوير'],
        location: 'الرياض'
      },
      {
        id: 'user4',
        name: 'أحمد خالد',
        level: 28,
        bio: 'محب للتقنية',
        interests: ['تكنولوجيا', 'برمجة', 'ألعاب'],
        location: 'الدمام'
      },
      {
        id: 'user5',
        name: 'نور الدين',
        level: 40,
        vipLevel: 4,
        bio: 'مسافر حول العالم',
        interests: ['سفر', 'ثقافة', 'طعام'],
        location: 'الرياض'
      },
      {
        id: 'user6',
        name: 'ليلى عمر',
        level: 38,
        vipLevel: 3,
        bio: 'قارئة نهمة',
        interests: ['قراءة', 'كتابة', 'فن'],
        location: 'جدة'
      },
      {
        id: 'user7',
        name: 'يوسف سعيد',
        level: 50,
        vipLevel: 6,
        bio: 'موسيقي محترف',
        interests: ['موسيقى', 'غناء', 'تأليف'],
        location: 'الرياض'
      },
      {
        id: 'user8',
        name: 'ريم فهد',
        level: 35,
        vipLevel: 2,
        bio: 'رياضية ونشيطة',
        interests: ['رياضة', 'صحة', 'طبخ'],
        location: 'الدمام'
      }
    ];
  }

  /**
   * Refresh recommendations
   */
  refreshRecommendations(): FriendSuggestion[] {
    const recommendations = this.getRecommendations(10);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recommendations));
    return recommendations;
  }
}

export const FriendRecommendationService = new FriendRecommendationServiceClass();
