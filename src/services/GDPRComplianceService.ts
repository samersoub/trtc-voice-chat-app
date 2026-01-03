/**
 * GDPR Compliance Service
 * يوفر أدوات للامتثال للائحة حماية البيانات العامة (GDPR)
 * يدعم: حق الوصول، حق النسيان، حق النقل، إدارة الموافقات
 */

export interface UserConsent {
  marketing: boolean;
  analytics: boolean;
  personalizedAds: boolean;
  dataSharing: boolean;
  timestamp: number;
  ipAddress?: string;
}

export interface DataExportRequest {
  userId: string;
  requestDate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: number;
}

export interface DataDeletionRequest {
  userId: string;
  requestDate: number;
  scheduledDate: number; // 30 يوم grace period
  status: 'pending' | 'cancelled' | 'completed';
  reason?: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showLocation: boolean;
  allowMessages: 'everyone' | 'friends' | 'none';
  allowRoomInvites: 'everyone' | 'friends' | 'none';
  dataRetention: '30days' | '90days' | '1year' | 'forever';
}

export interface DataCategory {
  category: string;
  description: string;
  dataPoints: string[];
  retention: string;
  purpose: string;
}

class GDPRComplianceService {
  private static instance: GDPRComplianceService;
  private readonly CONSENT_KEY = 'gdpr_consent';
  private readonly PRIVACY_KEY = 'privacy_settings';
  private readonly EXPORT_KEY = 'data_export_requests';
  private readonly DELETION_KEY = 'data_deletion_requests';

  private constructor() {}

  public static getInstance(): GDPRComplianceService {
    if (!GDPRComplianceService.instance) {
      GDPRComplianceService.instance = new GDPRComplianceService();
    }
    return GDPRComplianceService.instance;
  }

  /**
   * الحصول على موافقة المستخدم
   */
  public getUserConsent(userId: string): UserConsent | null {
    try {
      const data = localStorage.getItem(`${this.CONSENT_KEY}_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * حفظ موافقة المستخدم
   */
  public saveUserConsent(userId: string, consent: Omit<UserConsent, 'timestamp'>): void {
    const consentData: UserConsent = {
      ...consent,
      timestamp: Date.now(),
    };

    localStorage.setItem(`${this.CONSENT_KEY}_${userId}`, JSON.stringify(consentData));
    
    // تسجيل في سجل التدقيق
    this.logAudit(userId, 'consent_updated', consent);
  }

  /**
   * التحقق من موافقة محددة
   */
  public hasConsent(userId: string, type: keyof Omit<UserConsent, 'timestamp' | 'ipAddress'>): boolean {
    const consent = this.getUserConsent(userId);
    return consent ? consent[type] : false;
  }

  /**
   * سحب الموافقة
   */
  public revokeConsent(userId: string, type: keyof Omit<UserConsent, 'timestamp' | 'ipAddress'>): void {
    const consent = this.getUserConsent(userId);
    if (consent) {
      consent[type] = false;
      consent.timestamp = Date.now();
      localStorage.setItem(`${this.CONSENT_KEY}_${userId}`, JSON.stringify(consent));
      this.logAudit(userId, 'consent_revoked', { type });
    }
  }

  /**
   * الحصول على إعدادات الخصوصية
   */
  public getPrivacySettings(userId: string): PrivacySettings {
    try {
      const data = localStorage.getItem(`${this.PRIVACY_KEY}_${userId}`);
      return data ? JSON.parse(data) : this.getDefaultPrivacySettings();
    } catch {
      return this.getDefaultPrivacySettings();
    }
  }

  /**
   * إعدادات خصوصية افتراضية
   */
  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      profileVisibility: 'friends',
      showOnlineStatus: true,
      showLocation: false,
      allowMessages: 'friends',
      allowRoomInvites: 'friends',
      dataRetention: '1year',
    };
  }

  /**
   * تحديث إعدادات الخصوصية
   */
  public updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): void {
    const current = this.getPrivacySettings(userId);
    const updated = { ...current, ...settings };
    
    localStorage.setItem(`${this.PRIVACY_KEY}_${userId}`, JSON.stringify(updated));
    this.logAudit(userId, 'privacy_settings_updated', settings);
  }

  /**
   * طلب تصدير البيانات (حق الوصول - Article 15)
   */
  public async requestDataExport(userId: string): Promise<DataExportRequest> {
    const request: DataExportRequest = {
      userId,
      requestDate: Date.now(),
      status: 'pending',
    };

    // حفظ الطلب
    const requests = this.getExportRequests(userId);
    requests.push(request);
    localStorage.setItem(`${this.EXPORT_KEY}_${userId}`, JSON.stringify(requests));
    
    this.logAudit(userId, 'data_export_requested', {});
    
    // في الإنتاج، هذا يرسل إلى Backend
    // هنا سنقوم بإنشاء البيانات مباشرة
    setTimeout(() => {
      this.processDataExport(userId, request);
    }, 2000);
    
    return request;
  }

  /**
   * معالجة تصدير البيانات
   */
  private async processDataExport(userId: string, request: DataExportRequest): Promise<void> {
    try {
      request.status = 'processing';
      this.updateExportRequest(userId, request);
      
      // جمع جميع بيانات المستخدم
      const userData = await this.collectUserData(userId);
      
      // إنشاء ملف JSON
      const dataBlob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      });
      const downloadUrl = URL.createObjectURL(dataBlob);
      
      // تحديث الطلب
      request.status = 'completed';
      request.downloadUrl = downloadUrl;
      request.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 أيام
      
      this.updateExportRequest(userId, request);
      this.logAudit(userId, 'data_export_completed', {});
    } catch (error) {
      request.status = 'failed';
      this.updateExportRequest(userId, request);
      this.logAudit(userId, 'data_export_failed', { error });
    }
  }

  /**
   * جمع بيانات المستخدم
   */
  private async collectUserData(userId: string): Promise<Record<string, unknown>> {
    return {
      exportDate: new Date().toISOString(),
      userId,
      
      // معلومات الحساب
      account: this.getUserAccountData(userId),
      
      // إعدادات الخصوصية
      privacy: this.getPrivacySettings(userId),
      
      // الموافقات
      consents: this.getUserConsent(userId),
      
      // الرسائل (مشفرة)
      messages: this.getUserMessages(userId),
      
      // الغرف الصوتية
      rooms: this.getUserRooms(userId),
      
      // الأصدقاء والمتابعين
      connections: this.getUserConnections(userId),
      
      // سجل النشاط
      activityLog: this.getUserActivityLog(userId),
      
      // البيانات المالية
      transactions: this.getUserTransactions(userId),
    };
  }

  /**
   * الحصول على بيانات الحساب
   */
  private getUserAccountData(userId: string): unknown {
    const userStr = localStorage.getItem('auth:user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id === userId) {
        // إزالة البيانات الحساسة
        const { password, ...safeData } = user;
        return safeData;
      }
    }
    return null;
  }

  /**
   * الحصول على رسائل المستخدم
   */
  private getUserMessages(userId: string): unknown[] {
    // جمع من ChatHistoryService
    const messages: unknown[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_history_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            // تصفية رسائل المستخدم فقط
            const userMessages = parsed.filter((msg: { senderId?: string }) => msg.senderId === userId);
            messages.push(...userMessages);
          }
        } catch (error) {
          console.error('[GDPR] Failed to parse chat history:', error);
        }
      }
    }
    
    return messages;
  }

  /**
   * الحصول على غرف المستخدم
   */
  private getUserRooms(userId: string): unknown[] {
    const rooms: unknown[] = [];
    // جمع من VoiceChatService و RoomService
    // للتوضيح فقط
    return rooms;
  }

  /**
   * الحصول على اتصالات المستخدم
   */
  private getUserConnections(userId: string): unknown {
    return {
      friends: [],
      followers: [],
      following: [],
      blocked: [],
    };
  }

  /**
   * الحصول على سجل النشاط
   */
  private getUserActivityLog(userId: string): unknown[] {
    const log: unknown[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('activity_log_') && key.includes(userId)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            log.push(...JSON.parse(data));
          }
        } catch (error) {
          console.error('[GDPR] Failed to parse activity log:', error);
        }
      }
    }
    
    return log;
  }

  /**
   * الحصول على المعاملات المالية
   */
  private getUserTransactions(userId: string): unknown[] {
    const transactions: unknown[] = [];
    // جمع من EconomyService
    return transactions;
  }

  /**
   * تحديث طلب التصدير
   */
  private updateExportRequest(userId: string, request: DataExportRequest): void {
    const requests = this.getExportRequests(userId);
    const index = requests.findIndex(r => r.requestDate === request.requestDate);
    
    if (index !== -1) {
      requests[index] = request;
      localStorage.setItem(`${this.EXPORT_KEY}_${userId}`, JSON.stringify(requests));
    }
  }

  /**
   * الحصول على طلبات التصدير
   */
  private getExportRequests(userId: string): DataExportRequest[] {
    try {
      const data = localStorage.getItem(`${this.EXPORT_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * طلب حذف البيانات (حق النسيان - Article 17)
   */
  public async requestDataDeletion(userId: string, reason?: string): Promise<DataDeletionRequest> {
    const request: DataDeletionRequest = {
      userId,
      requestDate: Date.now(),
      scheduledDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 يوم grace period
      status: 'pending',
      reason,
    };

    // حفظ الطلب
    localStorage.setItem(`${this.DELETION_KEY}_${userId}`, JSON.stringify(request));
    
    this.logAudit(userId, 'data_deletion_requested', { reason });
    
    return request;
  }

  /**
   * إلغاء طلب الحذف
   */
  public cancelDataDeletion(userId: string): boolean {
    const requestData = localStorage.getItem(`${this.DELETION_KEY}_${userId}`);
    
    if (requestData) {
      try {
        const request: DataDeletionRequest = JSON.parse(requestData);
        
        if (request.status === 'pending' && Date.now() < request.scheduledDate) {
          request.status = 'cancelled';
          localStorage.setItem(`${this.DELETION_KEY}_${userId}`, JSON.stringify(request));
          this.logAudit(userId, 'data_deletion_cancelled', {});
          return true;
        }
      } catch (error) {
        console.error('[GDPR] Failed to cancel deletion:', error);
      }
    }
    
    return false;
  }

  /**
   * تنفيذ حذف البيانات
   */
  public async executeDataDeletion(userId: string): Promise<boolean> {
    try {
      // حذف جميع بيانات المستخدم
      const keysToDelete: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes(userId) || key.endsWith(`_${userId}`))) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => localStorage.removeItem(key));
      
      // تسجيل الحذف
      this.logAudit(userId, 'data_deleted', { keysDeleted: keysToDelete.length });
      
      return true;
    } catch (error) {
      console.error('Failed to delete user data:', error);
      return false;
    }
  }

  /**
   * الحصول على فئات البيانات المجمعة
   */
  public getDataCategories(): DataCategory[] {
    return [
      {
        category: 'معلومات الحساب',
        description: 'البيانات الأساسية للحساب',
        dataPoints: ['الاسم', 'البريد الإلكتروني', 'رقم الهاتف', 'الصورة الشخصية'],
        retention: 'حتى حذف الحساب',
        purpose: 'إدارة الحساب والمصادقة',
      },
      {
        category: 'المحادثات والرسائل',
        description: 'محتوى المحادثات',
        dataPoints: ['الرسائل النصية', 'الرسائل الصوتية', 'الملفات المشاركة'],
        retention: 'حسب إعدادات الخصوصية',
        purpose: 'تقديم خدمة المحادثة',
      },
      {
        category: 'بيانات الموقع',
        description: 'معلومات الموقع الجغرافي',
        dataPoints: ['الموقع الحالي', 'سجل المواقع'],
        retention: '90 يوم',
        purpose: 'تحسين تجربة المستخدم والبحث المحلي',
      },
      {
        category: 'البيانات المالية',
        description: 'معاملات الشراء والدفع',
        dataPoints: ['سجل المشتريات', 'الهدايا المرسلة', 'الرصيد'],
        retention: '7 سنوات (متطلبات قانونية)',
        purpose: 'معالجة المعاملات المالية والامتثال القانوني',
      },
      {
        category: 'بيانات الاستخدام',
        description: 'كيفية استخدام التطبيق',
        dataPoints: ['الصفحات المزارة', 'الوقت المستغرق', 'الميزات المستخدمة'],
        retention: '1 سنة',
        purpose: 'تحليل الأداء وتحسين الخدمة',
      },
    ];
  }

  /**
   * سجل التدقيق
   */
  private logAudit(userId: string, action: string, details: unknown): void {
    const logEntry = {
      userId,
      action,
      details,
      timestamp: Date.now(),
      ipAddress: 'unknown', // في الإنتاج يتم الحصول عليه من الخادم
    };

    // حفظ في سجل التدقيق
    const logKey = `audit_log_${userId}`;
    const existingLog = localStorage.getItem(logKey);
    const log = existingLog ? JSON.parse(existingLog) : [];
    
    log.push(logEntry);
    
    // الاحتفاظ بآخر 1000 سجل فقط
    if (log.length > 1000) {
      log.shift();
    }
    
    localStorage.setItem(logKey, JSON.stringify(log));
  }

  /**
   * الحصول على سجل التدقيق
   */
  public getAuditLog(userId: string, limit: number = 100): unknown[] {
    try {
      const logKey = `audit_log_${userId}`;
      const data = localStorage.getItem(logKey);
      
      if (data) {
        const log = JSON.parse(data);
        return log.slice(-limit);
      }
    } catch (error) {
      console.error('[GDPR] Failed to get audit log:', error);
    }
    
    return [];
  }

  /**
   * التحقق من الامتثال
   */
  public checkCompliance(userId: string): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // التحقق من الموافقة
    const consent = this.getUserConsent(userId);
    if (!consent) {
      issues.push('لم يتم الحصول على موافقة المستخدم');
    }
    
    // التحقق من إعدادات الخصوصية
    const privacy = this.getPrivacySettings(userId);
    if (!privacy) {
      issues.push('إعدادات الخصوصية غير محددة');
    }
    
    // التحقق من طلبات الحذف المعلقة
    const deletionRequest = localStorage.getItem(`${this.DELETION_KEY}_${userId}`);
    if (deletionRequest) {
      try {
        const request: DataDeletionRequest = JSON.parse(deletionRequest);
        if (request.status === 'pending' && Date.now() >= request.scheduledDate) {
          issues.push('يوجد طلب حذف متأخر يحتاج معالجة');
        }
      } catch (error) {
        console.error('[GDPR] Failed to parse deletion request:', error);
      }
    }
    
    return {
      compliant: issues.length === 0,
      issues,
    };
  }
}

export default GDPRComplianceService.getInstance();
