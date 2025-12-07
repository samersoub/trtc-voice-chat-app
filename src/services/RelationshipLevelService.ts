/**
 * RelationshipLevelService - Manages relationship levels and progression
 */

export interface RelationshipLevel {
  level: number;
  name: string;
  nameEn: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  color: string;
  gradient: string;
  benefits: string[];
  benefitsEn: string[];
}

export interface UserRelationship {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  currentPoints: number;
  currentLevel: number;
  giftsGiven: number;
  giftsReceived: number;
  startDate: Date;
  lastGiftDate?: Date;
}

class RelationshipLevelServiceClass {
  private relationships: Map<string, UserRelationship> = new Map();

  // Relationship levels definition
  private levels: RelationshipLevel[] = [
    {
      level: 1,
      name: 'بداية الحب',
      nameEn: 'New Love',
      minPoints: 0,
      maxPoints: 999,
      icon: '💕',
      color: 'pink-400',
      gradient: 'from-pink-400 to-rose-400',
      benefits: ['إمكانية إرسال الرسائل', 'ظهور العلاقة في الملف الشخصي'],
      benefitsEn: ['Send messages', 'Show relationship in profile'],
    },
    {
      level: 2,
      name: 'الحب المتنامي',
      nameEn: 'Growing Love',
      minPoints: 1000,
      maxPoints: 4999,
      icon: '💖',
      color: 'pink-500',
      gradient: 'from-pink-500 to-rose-500',
      benefits: ['إطار مميز للعلاقة', 'شارة خاصة', 'دخول مشترك للغرف'],
      benefitsEn: ['Special relationship frame', 'Exclusive badge', 'Joint room entry'],
    },
    {
      level: 3,
      name: 'الحب القوي',
      nameEn: 'Strong Love',
      minPoints: 5000,
      maxPoints: 14999,
      icon: '💗',
      color: 'pink-600',
      gradient: 'from-pink-600 to-rose-600',
      benefits: ['إطار ذهبي', 'تأثيرات دخول خاصة', 'غرفة خاصة للشريكين'],
      benefitsEn: ['Golden frame', 'Special entry effects', 'Private couple room'],
    },
    {
      level: 4,
      name: 'الحب الأبدي',
      nameEn: 'Eternal Love',
      minPoints: 15000,
      maxPoints: 29999,
      icon: '💝',
      color: 'purple-600',
      gradient: 'from-purple-600 to-pink-600',
      benefits: ['إطار ماسي', 'تأثيرات متحركة', 'هدايا حصرية', 'أولوية في الدعم'],
      benefitsEn: ['Diamond frame', 'Animated effects', 'Exclusive gifts', 'Priority support'],
    },
    {
      level: 5,
      name: 'حب الأسطورة',
      nameEn: 'Legendary Love',
      minPoints: 30000,
      maxPoints: 59999,
      icon: '👑',
      color: 'yellow-500',
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      benefits: ['تاج ذهبي متحرك', 'غرفة VIP خاصة', 'جميع الهدايا مجاناً', 'ظهور في قائمة الأساطير'],
      benefitsEn: ['Animated golden crown', 'VIP private room', 'All gifts free', 'Legendary couples list'],
    },
    {
      level: 6,
      name: 'حب السماء',
      nameEn: 'Heavenly Love',
      minPoints: 60000,
      maxPoints: Infinity,
      icon: '✨',
      color: 'indigo-600',
      gradient: 'from-indigo-600 via-purple-600 to-pink-600',
      benefits: ['تأثيرات سماوية', 'قاعة شرف دائمة', 'جميع المزايا', 'شارة خاصة فريدة'],
      benefitsEn: ['Heavenly effects', 'Permanent hall of fame', 'All benefits', 'Unique special badge'],
    },
  ];

  /**
   * Create or update a relationship
   */
  createRelationship(
    userId: string,
    partnerId: string,
    partnerName: string,
    partnerAvatar: string
  ): UserRelationship {
    const key = this.getRelationshipKey(userId, partnerId);
    const existing = this.relationships.get(key);

    if (existing) {
      return existing;
    }

    const relationship: UserRelationship = {
      partnerId,
      partnerName,
      partnerAvatar,
      currentPoints: 0,
      currentLevel: 1,
      giftsGiven: 0,
      giftsReceived: 0,
      startDate: new Date(),
    };

    this.relationships.set(key, relationship);
    return relationship;
  }

  /**
   * Add points from sending a gift
   */
  addGiftPoints(userId: string, partnerId: string, giftValue: number): UserRelationship | null {
    const key = this.getRelationshipKey(userId, partnerId);
    const relationship = this.relationships.get(key);

    if (!relationship) return null;

    // Calculate points (1 coin = 1 point)
    relationship.currentPoints += giftValue;
    relationship.giftsGiven++;
    relationship.lastGiftDate = new Date();

    // Update level
    this.updateLevel(relationship);

    return relationship;
  }

  /**
   * Receive gift points
   */
  receiveGiftPoints(userId: string, partnerId: string, giftValue: number): UserRelationship | null {
    const key = this.getRelationshipKey(userId, partnerId);
    const relationship = this.relationships.get(key);

    if (!relationship) return null;

    relationship.giftsReceived++;
    relationship.lastGiftDate = new Date();

    return relationship;
  }

  /**
   * Update relationship level based on points
   */
  updateLevel(relationship: UserRelationship): void {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      const level = this.levels[i];
      if (relationship.currentPoints >= level.minPoints) {
        relationship.currentLevel = level.level;
        break;
      }
    }
  }

  /**
   * Get current level details
   */
  getCurrentLevel(userId: string, partnerId: string): RelationshipLevel | null {
    const key = this.getRelationshipKey(userId, partnerId);
    const relationship = this.relationships.get(key);

    if (!relationship) return null;

    return this.levels.find(l => l.level === relationship.currentLevel) || this.levels[0];
  }

  /**
   * Get next level details
   */
  getNextLevel(userId: string, partnerId: string): RelationshipLevel | null {
    const currentLevel = this.getCurrentLevel(userId, partnerId);
    if (!currentLevel || currentLevel.level >= this.levels.length) return null;

    return this.levels.find(l => l.level === currentLevel.level + 1) || null;
  }

  /**
   * Get progress to next level (percentage)
   */
  getProgressToNextLevel(userId: string, partnerId: string): number {
    const key = this.getRelationshipKey(userId, partnerId);
    const relationship = this.relationships.get(key);
    const currentLevel = this.getCurrentLevel(userId, partnerId);

    if (!relationship || !currentLevel) return 0;

    const nextLevel = this.getNextLevel(userId, partnerId);
    if (!nextLevel) return 100; // Max level reached

    const currentPoints = relationship.currentPoints;
    const levelMin = currentLevel.minPoints;
    const levelMax = currentLevel.maxPoints;

    const progress = ((currentPoints - levelMin) / (levelMax - levelMin)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  /**
   * Get relationship details
   */
  getRelationship(userId: string, partnerId: string): UserRelationship | null {
    const key = this.getRelationshipKey(userId, partnerId);
    return this.relationships.get(key) || null;
  }

  /**
   * Get all levels
   */
  getAllLevels(): RelationshipLevel[] {
    return [...this.levels];
  }

  /**
   * Get level by number
   */
  getLevelByNumber(level: number): RelationshipLevel | null {
    return this.levels.find(l => l.level === level) || null;
  }

  /**
   * Calculate days together
   */
  getDaysTogether(userId: string, partnerId: string): number {
    const relationship = this.getRelationship(userId, partnerId);
    if (!relationship) return 0;

    const now = new Date();
    const diff = now.getTime() - relationship.startDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get relationship key
   */
  private getRelationshipKey(userId: string, partnerId: string): string {
    // Sort IDs to ensure same key regardless of order
    const ids = [userId, partnerId].sort();
    return `${ids[0]}_${ids[1]}`;
  }

  /**
   * Initialize demo relationship
   */
  initializeDemoRelationship(userId: string): void {
    const demoPartner = {
      id: 'partner123',
      name: 'سارة السورية',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner123',
    };

    const relationship = this.createRelationship(
      userId,
      demoPartner.id,
      demoPartner.name,
      demoPartner.avatar
    );

    // Add some demo points (level 3)
    relationship.currentPoints = 8500;
    relationship.giftsGiven = 45;
    relationship.giftsReceived = 38;
    relationship.startDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    this.updateLevel(relationship);
  }
}

export const RelationshipLevelService = new RelationshipLevelServiceClass();
