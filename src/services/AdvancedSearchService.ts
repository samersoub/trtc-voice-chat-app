/**
 * AdvancedSearchService - البحث المتقدم
 * بحث بالاسم، الاهتمامات، الموقع، العمر، والمزيد
 */

import { User } from '@/models/User';

export interface SearchFilters {
  query?: string; // البحث بالاسم أو username
  interests?: string[]; // الاهتمامات
  location?: {
    country?: string;
    city?: string;
    radius?: number; // km
    lat?: number;
    lng?: number;
  };
  ageRange?: {
    min?: number;
    max?: number;
  };
  gender?: 'male' | 'female' | 'other';
  online?: boolean; // متصل الآن فقط
  verified?: boolean; // موثق فقط
  premium?: boolean; // premium فقط
  language?: string; // ar, en, etc
  minLevel?: number; // المستوى في التطبيق
  sortBy?: 'relevance' | 'distance' | 'level' | 'popularity' | 'recent';
}

export interface SearchResult {
  user: User;
  score: number; // نقاط التطابق (0-100)
  distance?: number; // المسافة بالكيلومتر
  matchReasons: string[]; // أسباب التطابق
}

class AdvancedSearchServiceClass {
  private searchHistory: Map<string, string[]> = new Map();
  private popularSearches: string[] = [
    'غناء',
    'ألعاب',
    'موسيقى',
    'دردشة',
    'أصدقاء',
    'محادثات صوتية',
  ];

  /**
   * البحث المتقدم
   */
  async search(
    filters: SearchFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<SearchResult[]> {
    // TODO: الاتصال بـ Supabase للبحث الحقيقي
    // في الوقت الحالي، استخدام بيانات تجريبية

    let results = this.getDemoUsers();

    // تطبيق الفلاتر
    results = this.applyFilters(results, filters);

    // حساب نقاط التطابق
    const scoredResults = results.map(user => this.calculateScore(user, filters));

    // الترتيب
    scoredResults.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          return (a.distance || Infinity) - (b.distance || Infinity);
        case 'level':
          return (b.user.level || 0) - (a.user.level || 0);
        case 'popularity':
          return (b.user.followers?.length || 0) - (a.user.followers?.length || 0);
        case 'recent':
          return (b.user.lastSeen?.getTime() || 0) - (a.user.lastSeen?.getTime() || 0);
        case 'relevance':
        default:
          return b.score - a.score;
      }
    });

    // Pagination
    return scoredResults.slice(offset, offset + limit);
  }

  /**
   * البحث السريع (autocomplete)
   */
  quickSearch(query: string, limit: number = 10): User[] {
    if (!query.trim()) return [];

    const users = this.getDemoUsers();
    const lowerQuery = query.toLowerCase();

    return users
      .filter(
        user =>
          user.name?.toLowerCase().includes(lowerQuery) ||
          user.username?.toLowerCase().includes(lowerQuery) ||
          user.bio?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }

  /**
   * اقتراحات البحث
   */
  getSuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return this.popularSearches.filter(s => s.includes(lowerQuery)).slice(0, 5);
  }

  /**
   * سجل البحث للمستخدم
   */
  getSearchHistory(userId: string, limit: number = 10): string[] {
    const history = this.searchHistory.get(userId) || [];
    return history.slice(0, limit);
  }

  /**
   * إضافة لسجل البحث
   */
  addToHistory(userId: string, query: string): void {
    if (!query.trim()) return;

    const history = this.searchHistory.get(userId) || [];
    
    // إزالة التكرار
    const filtered = history.filter(h => h !== query);
    
    // إضافة في البداية
    filtered.unshift(query);
    
    // حفظ آخر 20 بحث فقط
    this.searchHistory.set(userId, filtered.slice(0, 20));
    
    // حفظ في localStorage
    this.saveHistory();
  }

  /**
   * حذف من سجل البحث
   */
  removeFromHistory(userId: string, query: string): void {
    const history = this.searchHistory.get(userId) || [];
    this.searchHistory.set(
      userId,
      history.filter(h => h !== query)
    );
    this.saveHistory();
  }

  /**
   * مسح سجل البحث
   */
  clearHistory(userId: string): void {
    this.searchHistory.delete(userId);
    this.saveHistory();
  }

  /**
   * تطبيق الفلاتر
   */
  private applyFilters(users: User[], filters: SearchFilters): User[] {
    let filtered = users;

    // البحث بالاسم
    if (filters.query) {
      const lowerQuery = filters.query.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name?.toLowerCase().includes(lowerQuery) ||
          user.username?.toLowerCase().includes(lowerQuery) ||
          user.bio?.toLowerCase().includes(lowerQuery)
      );
    }

    // الاهتمامات
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter(user =>
        filters.interests!.some(interest =>
          user.interests?.some(userInterest =>
            userInterest.toLowerCase().includes(interest.toLowerCase())
          )
        )
      );
    }

    // العمر
    if (filters.ageRange) {
      filtered = filtered.filter(user => {
        if (!user.age) return false;
        const { min, max } = filters.ageRange!;
        if (min && user.age < min) return false;
        if (max && user.age > max) return false;
        return true;
      });
    }

    // الجنس
    if (filters.gender) {
      filtered = filtered.filter(user => user.gender === filters.gender);
    }

    // متصل الآن
    if (filters.online) {
      filtered = filtered.filter(user => user.isOnline);
    }

    // موثق
    if (filters.verified) {
      filtered = filtered.filter(user => user.verified);
    }

    // Premium
    if (filters.premium) {
      filtered = filtered.filter(user => user.isPremium);
    }

    // المستوى
    if (filters.minLevel) {
      filtered = filtered.filter(user => (user.level || 0) >= filters.minLevel!);
    }

    return filtered;
  }

  /**
   * حساب نقاط التطابق
   */
  private calculateScore(user: User, filters: SearchFilters): SearchResult {
    let score = 0;
    const matchReasons: string[] = [];

    // تطابق الاسم (50 نقطة)
    if (filters.query) {
      const lowerQuery = filters.query.toLowerCase();
      if (user.name?.toLowerCase() === lowerQuery) {
        score += 50;
        matchReasons.push('تطابق كامل للاسم');
      } else if (user.name?.toLowerCase().includes(lowerQuery)) {
        score += 30;
        matchReasons.push('تطابق جزئي للاسم');
      }
    }

    // تطابق الاهتمامات (30 نقطة)
    if (filters.interests && filters.interests.length > 0) {
      const matchingInterests = filters.interests.filter(interest =>
        user.interests?.some(userInterest =>
          userInterest.toLowerCase().includes(interest.toLowerCase())
        )
      );
      if (matchingInterests.length > 0) {
        score += Math.min(30, matchingInterests.length * 10);
        matchReasons.push(`${matchingInterests.length} اهتمام مشترك`);
      }
    }

    // المستوى (10 نقاط)
    if (user.level && user.level >= (filters.minLevel || 0)) {
      score += Math.min(10, user.level / 10);
      matchReasons.push(`المستوى ${user.level}`);
    }

    // موثق (5 نقاط)
    if (user.verified) {
      score += 5;
      matchReasons.push('موثق');
    }

    // Premium (5 نقاط)
    if (user.isPremium) {
      score += 5;
      matchReasons.push('عضو مميز');
    }

    // المسافة (إذا وجدت)
    let distance: number | undefined;
    if (filters.location?.lat && filters.location?.lng && user.location) {
      distance = this.calculateDistance(
        filters.location.lat,
        filters.location.lng,
        user.location.lat || 0,
        user.location.lng || 0
      );
      
      if (distance < 10) {
        score += 10;
        matchReasons.push(`قريب منك (${distance.toFixed(1)} كم)`);
      }
    }

    return {
      user,
      score: Math.min(100, score),
      distance,
      matchReasons,
    };
  }

  /**
   * حساب المسافة بين نقطتين (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * حفظ السجل
   */
  private saveHistory(): void {
    const data: Record<string, string[]> = {};
    this.searchHistory.forEach((history, userId) => {
      data[userId] = history;
    });
    localStorage.setItem('searchHistory', JSON.stringify(data));
  }

  /**
   * تحميل السجل
   */
  loadHistory(): void {
    try {
      const data = localStorage.getItem('searchHistory');
      if (data) {
        const parsed: Record<string, string[]> = JSON.parse(data);
        Object.entries(parsed).forEach(([userId, history]) => {
          this.searchHistory.set(userId, history);
        });
      }
    } catch (error) {
      console.error('فشل تحميل سجل البحث:', error);
    }
  }

  /**
   * بيانات تجريبية
   */
  private getDemoUsers(): User[] {
    const interests = [
      ['غناء', 'موسيقى', 'أغاني'],
      ['ألعاب', 'PUBG', 'Fortnite'],
      ['رياضة', 'كرة قدم', 'سباحة'],
      ['فن', 'رسم', 'تصميم'],
      ['طبخ', 'وصفات', 'حلويات'],
      ['سفر', 'مغامرات', 'سياحة'],
    ];

    return Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i}`,
      name: `مستخدم ${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
      bio: `مرحباً، أنا مستخدم ${i + 1}`,
      age: 18 + Math.floor(Math.random() * 30),
      gender: i % 3 === 0 ? 'male' : i % 3 === 1 ? 'female' : 'other',
      interests: interests[i % interests.length],
      level: Math.floor(Math.random() * 100),
      verified: Math.random() > 0.7,
      isPremium: Math.random() > 0.8,
      isOnline: Math.random() > 0.5,
      lastSeen: new Date(Date.now() - Math.random() * 86400000),
      location: {
        country: 'Saudi Arabia',
        city: ['Riyadh', 'Jeddah', 'Mecca', 'Medina'][Math.floor(Math.random() * 4)],
        lat: 24.7136 + (Math.random() - 0.5) * 10,
        lng: 46.6753 + (Math.random() - 0.5) * 10,
      },
      followers: [],
      following: [],
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    }));
  }
}

export const AdvancedSearchService = new AdvancedSearchServiceClass();
