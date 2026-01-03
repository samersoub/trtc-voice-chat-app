/**
 * Enhanced Session Management Service
 * يوفر إدارة جلسات محسّنة مع أمان عالي
 * يدعم: Multi-device sessions, Session expiration, Activity tracking, Device fingerprinting
 */

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
  isActive: boolean;
  isCurrent: boolean;
}

export interface SessionSettings {
  maxActiveSessions: number;
  sessionTimeout: number; // milliseconds
  rememberMe: boolean;
  requireReauthForSensitive: boolean;
  autoLogoutOnClose: boolean;
}

export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
  canvas: string;
  webgl: string;
  hash: string;
}

class EnhancedSessionManagementService {
  private static instance: EnhancedSessionManagementService;
  private readonly SESSION_KEY = 'active_sessions';
  private readonly CURRENT_SESSION_KEY = 'current_session';
  private readonly SETTINGS_KEY = 'session_settings';
  private readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute
  private activityInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startActivityMonitoring();
    this.checkExpiredSessions();
  }

  public static getInstance(): EnhancedSessionManagementService {
    if (!EnhancedSessionManagementService.instance) {
      EnhancedSessionManagementService.instance = new EnhancedSessionManagementService();
    }
    return EnhancedSessionManagementService.instance;
  }

  /**
   * إنشاء جلسة جديدة
   */
  public async createSession(
    userId: string,
    rememberMe: boolean = false
  ): Promise<Session> {
    const deviceFingerprint = await this.generateDeviceFingerprint();
    const deviceInfo = this.getDeviceInfo();

    const sessionDuration = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 يوم
      : 24 * 60 * 60 * 1000;      // 24 ساعة

    const session: Session = {
      id: this.generateSessionId(),
      userId,
      deviceId: deviceFingerprint.hash,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ipAddress: 'unknown', // في الإنتاج يتم الحصول عليه من Backend
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + sessionDuration,
      isActive: true,
      isCurrent: true,
    };

    // حفظ الجلسة
    this.saveSession(session);
    
    // تحديد الجلسة الحالية
    localStorage.setItem(this.CURRENT_SESSION_KEY, session.id);

    // تسجيل في سجل الأمان
    this.logSecurityEvent(userId, 'session_created', {
      sessionId: session.id,
      deviceType: session.deviceType,
    });

    return session;
  }

  /**
   * توليد معرف جلسة فريد
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `sess_${timestamp}_${randomPart}`;
  }

  /**
   * توليد بصمة الجهاز
   */
  private async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Canvas fingerprint
    const canvas = await this.getCanvasFingerprint();
    
    // WebGL fingerprint
    const webgl = this.getWebGLFingerprint();
    
    // إنشاء hash
    const data = `${userAgent}|${platform}|${language}|${screenResolution}|${timezone}|${canvas}|${webgl}`;
    const hash = await this.hashString(data);

    return {
      userAgent,
      platform,
      language,
      screenResolution,
      timezone,
      canvas,
      webgl,
      hash,
    };
  }

  /**
   * Canvas fingerprint
   */
  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return 'unsupported';
      
      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Hello, World!', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Hello, World!', 4, 17);
      
      return canvas.toDataURL();
    } catch {
      return 'error';
    }
  }

  /**
   * WebGL fingerprint
   */
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'unsupported';
      
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return `${vendor}|${renderer}`;
      }
      
      return 'no_debug_info';
    } catch {
      return 'error';
    }
  }

  /**
   * Hash string
   */
  private async hashString(str: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * الحصول على معلومات الجهاز
   */
  private getDeviceInfo(): {
    deviceName: string;
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
    browser: string;
    os: string;
  } {
    const ua = navigator.userAgent;
    
    // تحديد نوع الجهاز
    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
    if (/mobile/i.test(ua) && !/ipad|tablet/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/ipad|tablet/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/windows|mac|linux/i.test(ua)) {
      deviceType = 'desktop';
    }

    // تحديد المتصفح
    let browser = 'Unknown';
    if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';
    else if (/opera/i.test(ua)) browser = 'Opera';

    // تحديد نظام التشغيل
    let os = 'Unknown';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

    const deviceName = `${os} ${deviceType} - ${browser}`;

    return { deviceName, deviceType, browser, os };
  }

  /**
   * حفظ الجلسة
   */
  private saveSession(session: Session): void {
    const sessions = this.getAllSessions(session.userId);
    
    // إيقاف الجلسات الحالية الأخرى
    sessions.forEach(s => {
      if (s.id !== session.id) {
        s.isCurrent = false;
      }
    });
    
    // إضافة الجلسة الجديدة
    sessions.push(session);
    
    // حفظ
    localStorage.setItem(
      `${this.SESSION_KEY}_${session.userId}`,
      JSON.stringify(sessions)
    );
  }

  /**
   * الحصول على جميع الجلسات
   */
  public getAllSessions(userId: string): Session[] {
    try {
      const data = localStorage.getItem(`${this.SESSION_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * الحصول على الجلسة الحالية
   */
  public getCurrentSession(): Session | null {
    try {
      const sessionId = localStorage.getItem(this.CURRENT_SESSION_KEY);
      if (!sessionId) return null;
      
      const userStr = localStorage.getItem('auth:user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      const sessions = this.getAllSessions(user.id);
      
      return sessions.find(s => s.id === sessionId) || null;
    } catch {
      return null;
    }
  }

  /**
   * تحديث نشاط الجلسة
   */
  public updateActivity(sessionId?: string): void {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return;
    
    const targetSessionId = sessionId || currentSession.id;
    const sessions = this.getAllSessions(currentSession.userId);
    
    const session = sessions.find(s => s.id === targetSessionId);
    if (session) {
      session.lastActivityAt = Date.now();
      
      localStorage.setItem(
        `${this.SESSION_KEY}_${currentSession.userId}`,
        JSON.stringify(sessions)
      );
    }
  }

  /**
   * إنهاء جلسة
   */
  public terminateSession(sessionId: string): boolean {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return false;
    
    const sessions = this.getAllSessions(currentSession.userId);
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index !== -1) {
      const session = sessions[index];
      session.isActive = false;
      
      // حذف الجلسة
      sessions.splice(index, 1);
      
      localStorage.setItem(
        `${this.SESSION_KEY}_${currentSession.userId}`,
        JSON.stringify(sessions)
      );
      
      // إذا كانت الجلسة الحالية، تسجيل خروج
      if (sessionId === currentSession.id) {
        this.logoutCurrentSession();
      }
      
      this.logSecurityEvent(currentSession.userId, 'session_terminated', { sessionId });
      return true;
    }
    
    return false;
  }

  /**
   * إنهاء جميع الجلسات الأخرى
   */
  public terminateOtherSessions(): number {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return 0;
    
    const sessions = this.getAllSessions(currentSession.userId);
    const otherSessions = sessions.filter(s => s.id !== currentSession.id);
    
    // الاحتفاظ بالجلسة الحالية فقط
    localStorage.setItem(
      `${this.SESSION_KEY}_${currentSession.userId}`,
      JSON.stringify([currentSession])
    );
    
    this.logSecurityEvent(currentSession.userId, 'other_sessions_terminated', {
      count: otherSessions.length,
    });
    
    return otherSessions.length;
  }

  /**
   * تسجيل خروج من الجلسة الحالية
   */
  public logoutCurrentSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.terminateSession(session.id);
    }
    
    localStorage.removeItem(this.CURRENT_SESSION_KEY);
    localStorage.removeItem('auth:user');
  }

  /**
   * فحص الجلسات المنتهية
   */
  public checkExpiredSessions(): void {
    const userStr = localStorage.getItem('auth:user');
    if (!userStr) return;
    
    try {
      const user = JSON.parse(userStr);
      const sessions = this.getAllSessions(user.id);
      const now = Date.now();
      
      const activeSessions = sessions.filter(session => {
        if (session.expiresAt < now) {
          this.logSecurityEvent(user.id, 'session_expired', { sessionId: session.id });
          return false;
        }
        return true;
      });
      
      localStorage.setItem(
        `${this.SESSION_KEY}_${user.id}`,
        JSON.stringify(activeSessions)
      );
      
      // إذا انتهت الجلسة الحالية
      const currentSessionId = localStorage.getItem(this.CURRENT_SESSION_KEY);
      const currentStillActive = activeSessions.some(s => s.id === currentSessionId);
      
      if (!currentStillActive) {
        this.logoutCurrentSession();
      }
    } catch (error) {
      console.error('[Session] Failed to check expired sessions:', error);
    }
  }

  /**
   * بدء مراقبة النشاط
   */
  private startActivityMonitoring(): void {
    // تحديث النشاط عند التفاعل
    const updateActivity = () => this.updateActivity();
    
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    
    // فحص الجلسات المنتهية بشكل دوري
    this.activityInterval = setInterval(() => {
      this.checkExpiredSessions();
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * إيقاف مراقبة النشاط
   */
  public stopActivityMonitoring(): void {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }

  /**
   * الحصول على إعدادات الجلسة
   */
  public getSessionSettings(userId: string): SessionSettings {
    try {
      const data = localStorage.getItem(`${this.SETTINGS_KEY}_${userId}`);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  /**
   * إعدادات افتراضية
   */
  private getDefaultSettings(): SessionSettings {
    return {
      maxActiveSessions: 5,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 ساعة
      rememberMe: false,
      requireReauthForSensitive: true,
      autoLogoutOnClose: false,
    };
  }

  /**
   * تحديث إعدادات الجلسة
   */
  public updateSessionSettings(
    userId: string,
    settings: Partial<SessionSettings>
  ): void {
    const current = this.getSessionSettings(userId);
    const updated = { ...current, ...settings };
    
    localStorage.setItem(
      `${this.SETTINGS_KEY}_${userId}`,
      JSON.stringify(updated)
    );
  }

  /**
   * تسجيل حدث أمني
   */
  private logSecurityEvent(
    userId: string,
    event: string,
    details: Record<string, unknown>
  ): void {
    const logEntry = {
      userId,
      event,
      details,
      timestamp: Date.now(),
    };

    const logKey = `security_log_${userId}`;
    const existingLog = localStorage.getItem(logKey);
    const log = existingLog ? JSON.parse(existingLog) : [];
    
    log.push(logEntry);
    
    // الاحتفاظ بآخر 100 سجل
    if (log.length > 100) {
      log.shift();
    }
    
    localStorage.setItem(logKey, JSON.stringify(log));
  }

  /**
   * الحصول على سجل الأمان
   */
  public getSecurityLog(userId: string, limit: number = 50): unknown[] {
    try {
      const logKey = `security_log_${userId}`;
      const data = localStorage.getItem(logKey);
      
      if (data) {
        const log = JSON.parse(data);
        return log.slice(-limit);
      }
    } catch (error) {
      console.error('[Session] Failed to get security log:', error);
    }
    
    return [];
  }

  /**
   * مسح جميع الجلسات (للاختبار)
   */
  public clearAllSessions(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.SESSION_KEY) || key.startsWith(this.SETTINGS_KEY)) {
        localStorage.removeItem(key);
      }
    });
    
    localStorage.removeItem(this.CURRENT_SESSION_KEY);
  }
}

export default EnhancedSessionManagementService.getInstance();
