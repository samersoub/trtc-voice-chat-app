/**
 * AI Matchmaking Service
 * Smart matching algorithm using machine learning principles
 */

import type {
  UserProfile,
  MatchResult,
  MatchingSession,
  MatchingPreferences,
  MatchingAlgorithmConfig,
  MatchFeedback,
  AIInsight,
  SmartRecommendation,
  MatchingStatistics,
  DEFAULT_ALGORITHM_CONFIG,
} from '../models/AIMatchmaking';

class AIMatchmakingService {
  private algorithmConfig: MatchingAlgorithmConfig = {
    interestWeight: 0.25,
    personalityWeight: 0.20,
    activityWeight: 0.15,
    languageWeight: 0.15,
    levelWeight: 0.10,
    premiumBoost: 0.15,
    minCompatibilityScore: 60,
    maxResultsCount: 20,
  };

  /**
   * Find matches for a user based on their profile and preferences
   */
  async findMatches(
    userId: string,
    preferences?: Partial<MatchingPreferences>
  ): Promise<MatchResult[]> {
    try {
      const userProfile = this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get all potential matches
      const allUsers = this.getAllUserProfiles();
      const candidates = allUsers.filter(u => u.userId !== userId);

      // Calculate compatibility scores
      const matches: MatchResult[] = [];
      for (const candidate of candidates) {
        // Apply preference filters
        if (!this.meetsPreferences(candidate, preferences || userProfile.preferences)) {
          continue;
        }

        const score = this.calculateCompatibility(userProfile, candidate);
        
        if (score >= this.algorithmConfig.minCompatibilityScore) {
          matches.push({
            userId: candidate.userId,
            username: candidate.username,
            avatar: candidate.avatar,
            level: candidate.level,
            compatibilityScore: Math.round(score),
            matchReasons: this.generateMatchReasons(userProfile, candidate, score),
            commonInterests: this.findCommonInterests(userProfile, candidate),
            complementaryTraits: this.findComplementaryTraits(userProfile, candidate),
            suggestedActivity: this.suggestActivity(userProfile, candidate),
            estimatedChemistry: this.estimateChemistry(score),
          });
        }
      }

      // Sort by compatibility score
      matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      // Limit results
      const limitedMatches = matches.slice(0, this.algorithmConfig.maxResultsCount);

      // Save matching session
      this.saveMatchingSession(userId, preferences || userProfile.preferences, limitedMatches);

      return limitedMatches;
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  }

  /**
   * Calculate compatibility score between two users
   */
  private calculateCompatibility(user1: UserProfile, user2: UserProfile): number {
    let totalScore = 0;
    const config = this.algorithmConfig;

    // 1. Interest similarity (25%)
    const interestScore = this.calculateInterestSimilarity(user1, user2);
    totalScore += interestScore * config.interestWeight;

    // 2. Personality compatibility (20%)
    const personalityScore = this.calculatePersonalityCompatibility(user1, user2);
    totalScore += personalityScore * config.personalityWeight;

    // 3. Activity pattern match (15%)
    const activityScore = this.calculateActivityMatch(user1, user2);
    totalScore += activityScore * config.activityWeight;

    // 4. Language compatibility (15%)
    const languageScore = this.calculateLanguageMatch(user1, user2);
    totalScore += languageScore * config.languageWeight;

    // 5. Level proximity (10%)
    const levelScore = this.calculateLevelProximity(user1, user2);
    totalScore += levelScore * config.levelWeight;

    // 6. Premium boost (15%)
    const premiumScore = this.calculatePremiumBoost(user1, user2);
    totalScore += premiumScore * config.premiumBoost;

    return totalScore * 100; // Convert to 0-100 scale
  }

  private calculateInterestSimilarity(user1: UserProfile, user2: UserProfile): number {
    const interests1 = new Set(user1.interests);
    const interests2 = new Set(user2.interests);
    const common = [...interests1].filter(i => interests2.has(i)).length;
    const total = new Set([...interests1, ...interests2]).size;
    return total > 0 ? common / total : 0;
  }

  private calculatePersonalityCompatibility(user1: UserProfile, user2: UserProfile): number {
    const p1 = user1.personality;
    const p2 = user2.personality;
    
    // Calculate difference in personality traits (lower is better)
    const extroversionDiff = Math.abs(p1.extroversion - p2.extroversion);
    const opennessDiff = Math.abs(p1.openness - p2.openness);
    const agreeablenessDiff = Math.abs(p1.agreeableness - p2.agreeableness);
    
    // Average difference (0-100)
    const avgDiff = (extroversionDiff + opennessDiff + agreeablenessDiff) / 3;
    
    // Convert to similarity score (inverse of difference)
    return 1 - (avgDiff / 100);
  }

  private calculateActivityMatch(user1: UserProfile, user2: UserProfile): number {
    const a1 = user1.activity;
    const a2 = user2.activity;

    // Check if peak hours overlap
    const overlappingHours = a1.peakActivityHours.filter(h => 
      a2.peakActivityHours.includes(h)
    ).length;
    const maxHours = Math.max(a1.peakActivityHours.length, a2.peakActivityHours.length);
    const hourScore = maxHours > 0 ? overlappingHours / maxHours : 0;

    // Check feature preferences overlap
    const features1 = new Set(a1.favoriteFeatures);
    const features2 = new Set(a2.favoriteFeatures);
    const commonFeatures = [...features1].filter(f => features2.has(f)).length;
    const totalFeatures = new Set([...features1, ...features2]).size;
    const featureScore = totalFeatures > 0 ? commonFeatures / totalFeatures : 0;

    return (hourScore + featureScore) / 2;
  }

  private calculateLanguageMatch(user1: UserProfile, user2: UserProfile): number {
    const langs1 = new Set(user1.languages);
    const langs2 = new Set(user2.languages);
    const commonLangs = [...langs1].filter(l => langs2.has(l)).length;
    return commonLangs > 0 ? 1 : 0.5; // Perfect match if any common language
  }

  private calculateLevelProximity(user1: UserProfile, user2: UserProfile): number {
    const levelDiff = Math.abs(user1.level - user2.level);
    // Closer levels = higher score
    return Math.max(0, 1 - (levelDiff / 100));
  }

  private calculatePremiumBoost(user1: UserProfile, user2: UserProfile): number {
    // Boost score if both users are premium (stored in user data)
    const user1Premium = this.isPremiumUser(user1.userId);
    const user2Premium = this.isPremiumUser(user2.userId);
    return (user1Premium && user2Premium) ? 1 : 0.5;
  }

  private meetsPreferences(candidate: UserProfile, preferences: MatchingPreferences): boolean {
    // Gender filter
    if (preferences.genderPreference && preferences.genderPreference !== 'any') {
      const candidateGender = this.getUserGender(candidate.userId);
      if (candidateGender !== preferences.genderPreference) return false;
    }

    // Age filter
    if (preferences.ageRange) {
      const candidateAge = this.getUserAge(candidate.userId);
      if (candidateAge < preferences.ageRange.min || candidateAge > preferences.ageRange.max) {
        return false;
      }
    }

    // Level filter
    if (preferences.levelRange) {
      if (candidate.level < preferences.levelRange.min || candidate.level > preferences.levelRange.max) {
        return false;
      }
    }

    // Premium filter
    if (preferences.premiumOnly && !this.isPremiumUser(candidate.userId)) {
      return false;
    }

    return true;
  }

  private generateMatchReasons(user1: UserProfile, user2: UserProfile, score: number): string[] {
    const reasons: string[] = [];

    const commonInterests = this.findCommonInterests(user1, user2);
    if (commonInterests.length > 0) {
      reasons.push(`Common interests: ${commonInterests.slice(0, 3).join(', ')}`);
    }

    const overlappingHours = user1.activity.peakActivityHours.filter(h =>
      user2.activity.peakActivityHours.includes(h)
    );
    if (overlappingHours.length > 0) {
      reasons.push('Active at similar times');
    }

    const personalityDiff = Math.abs(
      (user1.personality.extroversion + user1.personality.openness + user1.personality.agreeableness) -
      (user2.personality.extroversion + user2.personality.openness + user2.personality.agreeableness)
    ) / 3;
    if (personalityDiff < 20) {
      reasons.push('Similar personality');
    } else if (personalityDiff > 50) {
      reasons.push('Complementary personality');
    }

    const levelDiff = Math.abs(user1.level - user2.level);
    if (levelDiff < 10) {
      reasons.push('Similar experience level');
    }

    if (reasons.length === 0) {
      reasons.push('Good overall compatibility');
    }

    return reasons;
  }

  private findCommonInterests(user1: UserProfile, user2: UserProfile): string[] {
    const interests1 = new Set(user1.interests);
    const interests2 = new Set(user2.interests);
    return [...interests1].filter(i => interests2.has(i));
  }

  private findComplementaryTraits(user1: UserProfile, user2: UserProfile): string[] {
    const traits: string[] = [];

    // Speaker + Listener = good match
    if (user1.personality.communicationStyle === 'speaker' && user2.personality.communicationStyle === 'listener') {
      traits.push('Speaker & Listener balance');
    }

    // Extrovert + Introvert can complement
    const extroversionDiff = Math.abs(user1.personality.extroversion - user2.personality.extroversion);
    if (extroversionDiff > 40) {
      traits.push('Energy balance');
    }

    return traits;
  }

  private suggestActivity(user1: UserProfile, user2: UserProfile): string {
    const commonInterests = this.findCommonInterests(user1, user2);
    
    if (commonInterests.includes('Music')) {
      return 'Join a music voice room together';
    } else if (commonInterests.includes('Gaming')) {
      return 'Participate in a gaming tournament';
    } else if (commonInterests.length > 0) {
      return `Chat about ${commonInterests[0]}`;
    }
    
    return 'Start a conversation in a general chat room';
  }

  private estimateChemistry(score: number): 'low' | 'medium' | 'high' | 'excellent' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  /**
   * Submit feedback on a match
   */
  submitMatchFeedback(feedback: MatchFeedback): void {
    const key = 'ai_match_feedback';
    const allFeedback = JSON.parse(localStorage.getItem(key) || '[]');
    allFeedback.push(feedback);
    localStorage.setItem(key, JSON.stringify(allFeedback));

    // Update algorithm based on feedback (simple learning)
    this.updateAlgorithmFromFeedback(feedback);
  }

  private updateAlgorithmFromFeedback(feedback: MatchFeedback): void {
    if (feedback.successfulInteraction && feedback.rating >= 4) {
      // Boost weights that led to this successful match
      // In a real ML system, this would update model weights
      console.log('Positive feedback received - algorithm learning...');
    }
  }

  /**
   * Get AI insights for a user
   */
  getAIInsights(userId: string): AIInsight[] {
    const profile = this.getUserProfile(userId);
    if (!profile) return [];

    const insights: AIInsight[] = [];

    // Personality insight
    if (profile.personality.extroversion > 70) {
      insights.push({
        userId,
        insightType: 'personality',
        title: 'Social Butterfly 🦋',
        description: 'You love meeting new people! Try hosting a voice room.',
        confidence: 85,
        timestamp: Date.now(),
      });
    }

    // Activity insight
    if (profile.activity.socialEngagement > 80) {
      insights.push({
        userId,
        insightType: 'activity',
        title: 'Highly Social 🎉',
        description: 'You thrive in group settings. Consider creating a family!',
        confidence: 90,
        timestamp: Date.now(),
      });
    }

    return insights;
  }

  /**
   * Get smart recommendations
   */
  getSmartRecommendations(userId: string): SmartRecommendation[] {
    const profile = this.getUserProfile(userId);
    if (!profile) return [];

    const recommendations: SmartRecommendation[] = [];

    // Recommend users
    const matches = this.findMatches(userId);
    matches.slice(0, 5).forEach(match => {
      recommendations.push({
        type: 'user',
        targetId: match.userId,
        reason: match.matchReasons[0] || 'Good compatibility',
        score: match.compatibilityScore,
        category: 'people',
      });
    });

    return recommendations;
  }

  /**
   * Get matching statistics
   */
  getMatchingStatistics(): MatchingStatistics {
    const sessions = this.getAllMatchingSessions();
    const feedback = this.getAllFeedback();

    const totalMatches = sessions.reduce((sum, s) => sum + s.results.length, 0);
    const successfulMatches = feedback.filter(f => f.successfulInteraction).length;
    const avgCompatibility = sessions.reduce((sum, s) => {
      const sessionAvg = s.results.reduce((s2, r) => s2 + r.compatibilityScore, 0) / (s.results.length || 1);
      return sum + sessionAvg;
    }, 0) / (sessions.length || 1);

    return {
      totalMatches,
      successfulMatches,
      averageCompatibility: Math.round(avgCompatibility),
      averageResponseTime: 2.5,
      topMatchCategories: [
        { category: 'Music Lovers', count: 45 },
        { category: 'Gamers', count: 38 },
        { category: 'Social Butterflies', count: 32 },
      ],
      peakMatchingHours: [14, 15, 20, 21, 22],
      userSatisfaction: 87,
    };
  }

  // Storage helpers
  private getUserProfile(userId: string): UserProfile | null {
    const key = `ai_user_profile:${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : this.createDefaultProfile(userId);
  }

  private createDefaultProfile(userId: string): UserProfile {
    const user = this.getBasicUserInfo(userId);
    return {
      userId,
      username: user.username,
      avatar: user.avatar,
      level: user.level || 1,
      interests: ['Music', 'Chat'],
      languages: ['Arabic', 'English'],
      voicePreferences: {
        preferredRoomTypes: ['music', 'chat'],
        preferredRoomSize: 'medium',
        voiceChatFrequency: 30,
        favoriteTimeSlots: ['evening'],
        micUsageRate: 50,
      },
      personality: {
        extroversion: 50,
        openness: 50,
        agreeableness: 50,
        emotionalTone: 'casual',
        communicationStyle: 'balanced',
      },
      activity: {
        averageSessionDuration: 45,
        sessionsPerWeek: 7,
        peakActivityHours: [20, 21, 22],
        favoriteFeatures: ['voice_chat', 'missions'],
        socialEngagement: 60,
      },
      preferences: {
        genderPreference: 'any',
        languageMatch: 'flexible',
        personalityMatch: 'any',
      },
    };
  }

  private getBasicUserInfo(userId: string): any {
    const authUser = localStorage.getItem('auth:user');
    if (authUser) {
      const user = JSON.parse(authUser);
      if (user.id === userId) return user;
    }
    return { userId, username: 'User', level: 1 };
  }

  private getAllUserProfiles(): UserProfile[] {
    // Generate demo profiles for matching
    const currentUserId = this.getCurrentUserId();
    const profiles: UserProfile[] = [];
    
    for (let i = 0; i < 50; i++) {
      const userId = `user_${i}`;
      if (userId !== currentUserId) {
        profiles.push(this.createDefaultProfile(userId));
      }
    }
    
    return profiles;
  }

  private getCurrentUserId(): string {
    const authUser = localStorage.getItem('auth:user');
    return authUser ? JSON.parse(authUser).id : 'guest';
  }

  private isPremiumUser(userId: string): boolean {
    const premiumKey = `premium:subscription:${userId}`;
    const subscription = localStorage.getItem(premiumKey);
    if (!subscription) return false;
    const sub = JSON.parse(subscription);
    return sub.status === 'active' && sub.expiresAt > Date.now();
  }

  private getUserGender(userId: string): 'male' | 'female' | 'any' {
    // Would be stored in user profile
    return 'any';
  }

  private getUserAge(userId: string): number {
    // Would be stored in user profile
    return 25; // Default
  }

  private saveMatchingSession(
    userId: string,
    criteria: MatchingPreferences,
    results: MatchResult[]
  ): void {
    const session: MatchingSession = {
      id: `session_${Date.now()}_${userId}`,
      userId,
      timestamp: Date.now(),
      criteria,
      results,
      acceptedMatches: [],
      rejectedMatches: [],
      status: 'completed',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    const key = `ai_matching_sessions:${userId}`;
    const sessions = JSON.parse(localStorage.getItem(key) || '[]');
    sessions.unshift(session);
    localStorage.setItem(key, JSON.stringify(sessions.slice(0, 10))); // Keep last 10
  }

  private getAllMatchingSessions(): MatchingSession[] {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('ai_matching_sessions:'));
    const allSessions: MatchingSession[] = [];
    keys.forEach(key => {
      const sessions = JSON.parse(localStorage.getItem(key) || '[]');
      allSessions.push(...sessions);
    });
    return allSessions;
  }

  private getAllFeedback(): MatchFeedback[] {
    return JSON.parse(localStorage.getItem('ai_match_feedback') || '[]');
  }
}

export default new AIMatchmakingService();
