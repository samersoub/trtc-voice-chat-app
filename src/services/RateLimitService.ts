/**
 * Rate Limiting Service
 * يوفر حماية ضد الهجمات DDoS و Brute Force
 * يدعم Rate Limiting على مستوى المستخدم، IP، والـ API Endpoints
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
  blockedUntil?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate Limit Configurations لمختلف أنواع APIs
 */
export const RATE_LIMITS = {
  // Authentication APIs
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }, // 5 محاولات / 15 دقيقة
  REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 محاولات / ساعة
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
  
  // Messaging APIs
  SEND_MESSAGE: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 رسالة / دقيقة
  SEND_GIFT: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 هدية / دقيقة
  
  // Voice Chat APIs
  JOIN_ROOM: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 انضمام / دقيقة
  CREATE_ROOM: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 غرف / ساعة
  
  // Search & Discovery
  SEARCH: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 بحث / دقيقة
  ADVANCED_SEARCH: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 بحث متقدم / دقيقة
  
  // Profile & User Actions
  UPDATE_PROFILE: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 تحديثات / ساعة
  UPLOAD_IMAGE: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 صورة / ساعة
  FOLLOW_USER: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 متابعة / ساعة
  
  // Reports & Moderation
  REPORT_USER: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 بلاغات / ساعة
  REPORT_CONTENT: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  
  // API General
  API_GENERAL: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 طلب / دقيقة
} as const;

class RateLimitService {
  private static instance: RateLimitService;
  private records: Map<string, Map<string, RateLimitRecord>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanup();
  }

  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  /**
   * التحقق من Rate Limit
   */
  public checkLimit(
    identifier: string, // userId أو IP
    endpoint: keyof typeof RATE_LIMITS,
    customConfig?: RateLimitConfig
  ): RateLimitResult {
    const config = customConfig || RATE_LIMITS[endpoint];
    const key = `${endpoint}:${identifier}`;
    const now = Date.now();

    // الحصول على السجلات
    if (!this.records.has(endpoint)) {
      this.records.set(endpoint, new Map());
    }
    const endpointRecords = this.records.get(endpoint)!;
    let record = endpointRecords.get(identifier);

    // التحقق من الحظر
    if (record?.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockedUntil,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
      };
    }

    // إنشاء سجل جديد أو إعادة تعيين إذا انتهت النافذة
    if (!record || now - record.firstRequestTime > config.windowMs) {
      record = {
        count: 1,
        firstRequestTime: now,
      };
      endpointRecords.set(identifier, record);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }

    // زيادة العداد
    record.count++;

    // التحقق من تجاوز الحد
    if (record.count > config.maxRequests) {
      // تطبيق الحظر إذا كان محدداً
      if (config.blockDurationMs) {
        record.blockedUntil = now + config.blockDurationMs;
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockedUntil || record.firstRequestTime + config.windowMs,
        retryAfter: config.blockDurationMs 
          ? Math.ceil(config.blockDurationMs / 1000)
          : Math.ceil((record.firstRequestTime + config.windowMs - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.firstRequestTime + config.windowMs,
    };
  }

  /**
   * إعادة تعيين Rate Limit لمستخدم محدد
   */
  public resetLimit(identifier: string, endpoint?: keyof typeof RATE_LIMITS): void {
    if (endpoint) {
      this.records.get(endpoint)?.delete(identifier);
    } else {
      // إعادة تعيين جميع الـ endpoints لهذا المستخدم
      this.records.forEach((endpointRecords) => {
        endpointRecords.delete(identifier);
      });
    }
  }

  /**
   * حظر مستخدم مؤقتاً
   */
  public blockUser(
    identifier: string,
    endpoint: keyof typeof RATE_LIMITS,
    durationMs: number
  ): void {
    const now = Date.now();
    if (!this.records.has(endpoint)) {
      this.records.set(endpoint, new Map());
    }
    const endpointRecords = this.records.get(endpoint)!;
    
    endpointRecords.set(identifier, {
      count: 999999,
      firstRequestTime: now,
      blockedUntil: now + durationMs,
    });
  }

  /**
   * التحقق من حالة الحظر
   */
  public isBlocked(identifier: string, endpoint: keyof typeof RATE_LIMITS): boolean {
    const record = this.records.get(endpoint)?.get(identifier);
    if (!record?.blockedUntil) return false;
    
    const now = Date.now();
    return record.blockedUntil > now;
  }

  /**
   * الحصول على إحصائيات Rate Limiting
   */
  public getStats(identifier?: string): {
    totalEndpoints: number;
    totalUsers: number;
    blockedUsers: number;
    details?: Map<string, RateLimitRecord>;
  } {
    let totalUsers = 0;
    let blockedUsers = 0;
    const userMap = new Map<string, RateLimitRecord>();

    this.records.forEach((endpointRecords, endpoint) => {
      endpointRecords.forEach((record, user) => {
        if (identifier && user !== identifier) return;
        
        totalUsers++;
        userMap.set(`${endpoint}:${user}`, record);
        
        if (record.blockedUntil && record.blockedUntil > Date.now()) {
          blockedUsers++;
        }
      });
    });

    return {
      totalEndpoints: this.records.size,
      totalUsers,
      blockedUsers,
      details: identifier ? userMap : undefined,
    };
  }

  /**
   * تنظيف السجلات القديمة
   */
  private cleanup(): void {
    const now = Date.now();
    
    this.records.forEach((endpointRecords, endpoint) => {
      const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS];
      
      endpointRecords.forEach((record, identifier) => {
        // حذف السجلات القديمة
        const isExpired = now - record.firstRequestTime > config.windowMs;
        const isUnblocked = !record.blockedUntil || record.blockedUntil < now;
        
        if (isExpired && isUnblocked) {
          endpointRecords.delete(identifier);
        }
      });
      
      // حذف endpoint إذا كان فارغاً
      if (endpointRecords.size === 0) {
        this.records.delete(endpoint);
      }
    });
  }

  /**
   * بدء التنظيف التلقائي
   */
  private startCleanup(): void {
    // تنظيف كل 5 دقائق
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * إيقاف التنظيف التلقائي
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * مسح جميع السجلات
   */
  public clearAll(): void {
    this.records.clear();
  }

  /**
   * تصدير السجلات (للتخزين الدائم)
   */
  public exportRecords(): string {
    const data: Record<string, Record<string, RateLimitRecord>> = {};
    
    this.records.forEach((endpointRecords, endpoint) => {
      data[endpoint] = {};
      endpointRecords.forEach((record, identifier) => {
        data[endpoint][identifier] = record;
      });
    });
    
    return JSON.stringify(data);
  }

  /**
   * استيراد السجلات (من التخزين الدائم)
   */
  public importRecords(jsonData: string): void {
    try {
      const data: Record<string, Record<string, RateLimitRecord>> = JSON.parse(jsonData);
      
      Object.entries(data).forEach(([endpoint, records]) => {
        const endpointMap = new Map<string, RateLimitRecord>();
        Object.entries(records).forEach(([identifier, record]) => {
          endpointMap.set(identifier, record);
        });
        this.records.set(endpoint, endpointMap);
      });
    } catch (error) {
      console.error('Failed to import rate limit records:', error);
    }
  }
}

/**
 * Rate Limit Middleware للاستخدام مع APIs
 */
export function rateLimitMiddleware(endpoint: keyof typeof RATE_LIMITS) {
  return (identifier: string): RateLimitResult => {
    const service = RateLimitService.getInstance();
    return service.checkLimit(identifier, endpoint);
  };
}

/**
 * Helper function لفحص Rate Limit بسهولة
 */
export function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof RATE_LIMITS
): { success: boolean; message?: string; retryAfter?: number } {
  const result = RateLimitService.getInstance().checkLimit(identifier, endpoint);
  
  if (!result.allowed) {
    return {
      success: false,
      message: result.retryAfter
        ? `تم تجاوز الحد المسموح. حاول مرة أخرى بعد ${result.retryAfter} ثانية`
        : 'تم تجاوز الحد المسموح',
      retryAfter: result.retryAfter,
    };
  }
  
  return { success: true };
}

export default RateLimitService.getInstance();
