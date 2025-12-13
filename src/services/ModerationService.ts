/**
 * ModerationService - نظام الحظر والإبلاغ والكتم
 * Block/Report/Mute للمستخدمين والمحتوى
 */

export interface BlockedUser {
  id: string;
  userId: string; // من قام بالحظر
  blockedUserId: string; // المحظور
  reason?: string;
  createdAt: Date;
}

export interface MutedUser {
  id: string;
  userId: string; // من قام بالكتم
  mutedUserId: string; // المكتوم
  duration?: number; // بالدقائق، null = دائم
  expiresAt?: Date;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string; // من قام بالإبلاغ
  reportedUserId?: string; // المستخدم المبلغ عنه
  reportedMessageId?: string; // الرسالة المبلغ عنها
  reportedRoomId?: string; // الغرفة المبلغ عنها
  type: 'user' | 'message' | 'room' | 'content';
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  actionTaken?: string;
  createdAt: Date;
}

export type ReportReason =
  | 'harassment' // مضايقة
  | 'spam' // رسائل مزعجة
  | 'inappropriate_content' // محتوى غير لائق
  | 'hate_speech' // خطاب كراهية
  | 'violence' // عنف
  | 'scam' // احتيال
  | 'impersonation' // انتحال شخصية
  | 'underage' // قاصر
  | 'other'; // أخرى

class ModerationServiceClass {
  private blockedUsers: Map<string, BlockedUser[]> = new Map();
  private mutedUsers: Map<string, MutedUser[]> = new Map();
  private reports: Map<string, Report[]> = new Map();

  constructor() {
    this.loadData();
    // تنظيف الكتم المنتهي كل دقيقة
    setInterval(() => this.cleanExpiredMutes(), 60000);
  }

  // ============== BLOCK ==============

  /**
   * حظر مستخدم
   */
  blockUser(userId: string, blockedUserId: string, reason?: string): BlockedUser {
    if (userId === blockedUserId) {
      throw new Error('لا يمكنك حظر نفسك');
    }

    // التحقق من الحظر المسبق
    if (this.isBlocked(userId, blockedUserId)) {
      throw new Error('المستخدم محظور مسبقاً');
    }

    const block: BlockedUser = {
      id: crypto.randomUUID(),
      userId,
      blockedUserId,
      reason,
      createdAt: new Date(),
    };

    const userBlocks = this.blockedUsers.get(userId) || [];
    userBlocks.push(block);
    this.blockedUsers.set(userId, userBlocks);

    this.saveData();
    return block;
  }

  /**
   * إلغاء حظر مستخدم
   */
  unblockUser(userId: string, blockedUserId: string): boolean {
    const userBlocks = this.blockedUsers.get(userId) || [];
    const filtered = userBlocks.filter(b => b.blockedUserId !== blockedUserId);
    
    if (filtered.length === userBlocks.length) {
      return false; // لم يكن محظوراً
    }

    this.blockedUsers.set(userId, filtered);
    this.saveData();
    return true;
  }

  /**
   * التحقق من الحظر
   */
  isBlocked(userId: string, targetUserId: string): boolean {
    const userBlocks = this.blockedUsers.get(userId) || [];
    return userBlocks.some(b => b.blockedUserId === targetUserId);
  }

  /**
   * الحصول على قائمة المحظورين
   */
  getBlockedUsers(userId: string): BlockedUser[] {
    return this.blockedUsers.get(userId) || [];
  }

  // ============== MUTE ==============

  /**
   * كتم مستخدم
   */
  muteUser(
    userId: string,
    mutedUserId: string,
    durationMinutes?: number
  ): MutedUser {
    if (userId === mutedUserId) {
      throw new Error('لا يمكنك كتم نفسك');
    }

    // إزالة الكتم السابق
    this.unmuteUser(userId, mutedUserId);

    const expiresAt = durationMinutes
      ? new Date(Date.now() + durationMinutes * 60000)
      : undefined;

    const mute: MutedUser = {
      id: crypto.randomUUID(),
      userId,
      mutedUserId,
      duration: durationMinutes,
      expiresAt,
      createdAt: new Date(),
    };

    const userMutes = this.mutedUsers.get(userId) || [];
    userMutes.push(mute);
    this.mutedUsers.set(userId, userMutes);

    this.saveData();
    return mute;
  }

  /**
   * إلغاء كتم مستخدم
   */
  unmuteUser(userId: string, mutedUserId: string): boolean {
    const userMutes = this.mutedUsers.get(userId) || [];
    const filtered = userMutes.filter(m => m.mutedUserId !== mutedUserId);
    
    if (filtered.length === userMutes.length) {
      return false;
    }

    this.mutedUsers.set(userId, filtered);
    this.saveData();
    return true;
  }

  /**
   * التحقق من الكتم
   */
  isMuted(userId: string, targetUserId: string): boolean {
    const userMutes = this.mutedUsers.get(userId) || [];
    const mute = userMutes.find(m => m.mutedUserId === targetUserId);
    
    if (!mute) return false;
    
    // التحقق من انتهاء المدة
    if (mute.expiresAt && mute.expiresAt < new Date()) {
      this.unmuteUser(userId, targetUserId);
      return false;
    }
    
    return true;
  }

  /**
   * الحصول على قائمة المكتومين
   */
  getMutedUsers(userId: string): MutedUser[] {
    return this.mutedUsers.get(userId) || [];
  }

  /**
   * تنظيف الكتم المنتهي
   */
  private cleanExpiredMutes(): void {
    this.mutedUsers.forEach((mutes, userId) => {
      const active = mutes.filter(
        m => !m.expiresAt || m.expiresAt > new Date()
      );
      if (active.length !== mutes.length) {
        this.mutedUsers.set(userId, active);
      }
    });
    this.saveData();
  }

  // ============== REPORT ==============

  /**
   * إبلاغ عن مستخدم/محتوى
   */
  reportUser(
    reporterId: string,
    data: {
      reportedUserId?: string;
      reportedMessageId?: string;
      reportedRoomId?: string;
      type: Report['type'];
      reason: ReportReason;
      description?: string;
    }
  ): Report {
    const report: Report = {
      id: crypto.randomUUID(),
      reporterId,
      ...data,
      status: 'pending',
      createdAt: new Date(),
    };

    const userReports = this.reports.get(reporterId) || [];
    userReports.push(report);
    this.reports.set(reporterId, userReports);

    this.saveData();
    
    // TODO: إرسال للمشرفين
    console.log('تم إرسال البلاغ:', report);
    
    return report;
  }

  /**
   * الحصول على بلاغات المستخدم
   */
  getUserReports(userId: string): Report[] {
    return this.reports.get(userId) || [];
  }

  /**
   * جميع البلاغات (للمشرفين)
   */
  getAllReports(status?: Report['status']): Report[] {
    const allReports: Report[] = [];
    this.reports.forEach(reports => {
      allReports.push(...reports);
    });
    
    if (status) {
      return allReports.filter(r => r.status === status);
    }
    
    return allReports.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * مراجعة بلاغ (للمشرفين)
   */
  reviewReport(
    reportId: string,
    reviewerId: string,
    status: Report['status'],
    actionTaken?: string
  ): boolean {
    let found = false;
    
    this.reports.forEach((reports, userId) => {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        report.status = status;
        report.reviewedBy = reviewerId;
        report.reviewedAt = new Date();
        report.actionTaken = actionTaken;
        found = true;
      }
    });
    
    if (found) {
      this.saveData();
    }
    
    return found;
  }

  // ============== UTILITIES ==============

  /**
   * التحقق من إمكانية التفاعل
   */
  canInteract(userId: string, targetUserId: string): {
    allowed: boolean;
    reason?: string;
  } {
    if (this.isBlocked(userId, targetUserId)) {
      return { allowed: false, reason: 'لقد قمت بحظر هذا المستخدم' };
    }
    
    if (this.isBlocked(targetUserId, userId)) {
      return { allowed: false, reason: 'هذا المستخدم قام بحظرك' };
    }
    
    return { allowed: true };
  }

  /**
   * فلترة المستخدمين المحظورين/المكتومين
   */
  filterUsers<T extends { id: string }>(
    userId: string,
    users: T[],
    includeBlocked: boolean = false,
    includeMuted: boolean = false
  ): T[] {
    return users.filter(user => {
      if (!includeBlocked && this.isBlocked(userId, user.id)) return false;
      if (!includeMuted && this.isMuted(userId, user.id)) return false;
      return true;
    });
  }

  /**
   * أسباب الإبلاغ بالعربية
   */
  getReportReasonLabel(reason: ReportReason): string {
    const labels: Record<ReportReason, string> = {
      harassment: 'مضايقة',
      spam: 'رسائل مزعجة',
      inappropriate_content: 'محتوى غير لائق',
      hate_speech: 'خطاب كراهية',
      violence: 'عنف',
      scam: 'احتيال',
      impersonation: 'انتحال شخصية',
      underage: 'قاصر',
      other: 'أخرى',
    };
    return labels[reason];
  }

  // ============== PERSISTENCE ==============

  private saveData(): void {
    try {
      const data = {
        blocked: Array.from(this.blockedUsers.entries()),
        muted: Array.from(this.mutedUsers.entries()),
        reports: Array.from(this.reports.entries()),
      };
      localStorage.setItem('moderation', JSON.stringify(data));
    } catch (error) {
      console.error('فشل حفظ بيانات الحظر:', error);
    }
  }

  private loadData(): void {
    try {
      const data = localStorage.getItem('moderation');
      if (data) {
        const parsed = JSON.parse(data);
        
        if (parsed.blocked) {
          this.blockedUsers = new Map(
            parsed.blocked.map(([k, v]: [string, BlockedUser[]]) => [
              k,
              v.map(item => ({
                ...item,
                createdAt: new Date(item.createdAt),
              })),
            ])
          );
        }
        
        if (parsed.muted) {
          this.mutedUsers = new Map(
            parsed.muted.map(([k, v]: [string, MutedUser[]]) => [
              k,
              v.map(item => ({
                ...item,
                createdAt: new Date(item.createdAt),
                expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
              })),
            ])
          );
        }
        
        if (parsed.reports) {
          this.reports = new Map(
            parsed.reports.map(([k, v]: [string, Report[]]) => [
              k,
              v.map(item => ({
                ...item,
                createdAt: new Date(item.createdAt),
                reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : undefined,
              })),
            ])
          );
        }
      }
    } catch (error) {
      console.error('فشل تحميل بيانات الحظر:', error);
    }
  }
}

export const ModerationService = new ModerationServiceClass();
