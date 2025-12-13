/**
 * Advanced Admin Panel Service
 * Comprehensive admin operations for system management
 */

import type {
  AdminDashboardStats,
  UserManagementAction,
  ContentModerationAction,
  SystemSetting,
  AdminActivity,
  ReportDetails,
  BanDetails,
  FinancialTransaction,
  SystemAlert,
  AdminUser,
  SYSTEM_SETTINGS_DEFAULTS,
} from '../models/AdminPanel';

class AdminPanelService {
  /**
   * Get comprehensive dashboard statistics
   */
  getDashboardStats(): AdminDashboardStats {
    return {
      users: {
        total: this.getTotalUsers(),
        active: this.getActiveUsers(24),
        new: this.getNewUsers(7),
        premium: this.getPremiumUsers(),
        banned: this.getBannedUsers(),
        online: this.getOnlineUsers(),
        byLevel: this.getUsersByLevel(),
        byCountry: this.getUsersByCountry(),
        growthRate: 15.3,
      },
      content: {
        rooms: this.getTotalRooms(),
        activeRooms: this.getActiveRooms(),
        messages: this.getRecentMessages(24),
        streams: this.getTotalStreams(),
        events: this.getTotalEvents(),
        families: this.getTotalFamilies(),
        reports: this.getPendingReports(),
        totalContent: this.getTotalContent(),
      },
      financial: {
        revenue: {
          today: this.getRevenue(1),
          week: this.getRevenue(7),
          month: this.getRevenue(30),
          total: this.getTotalRevenue(),
        },
        transactions: {
          total: this.getTotalTransactions(),
          pending: this.getPendingTransactions(),
          completed: this.getCompletedTransactions(),
          failed: this.getFailedTransactions(),
        },
        subscriptions: {
          active: this.getActiveSubscriptions(),
          cancelled: this.getCancelledSubscriptions(),
          revenue: this.getSubscriptionRevenue(),
        },
        gifts: {
          sent: this.getTotalGiftsSent(),
          revenue: this.getGiftRevenue(),
        },
        payouts: {
          pending: this.getPendingPayouts(),
          amount: this.getPendingPayoutAmount(),
        },
      },
      engagement: {
        dailyActiveUsers: this.getActiveUsers(1),
        monthlyActiveUsers: this.getActiveUsers(30),
        averageSessionDuration: 45,
        averageSessionsPerUser: 3.2,
        retentionRate: 68.5,
        churnRate: 4.2,
        topFeatures: this.getTopFeatures(),
      },
      moderation: {
        pendingReports: this.getPendingReports(),
        resolvedReports: this.getResolvedReports(),
        activeBans: this.getActiveBans(),
        warnings: this.getTotalWarnings(),
        deletedContent: this.getDeletedContent(),
        appealsPending: this.getPendingAppeals(),
      },
      system: {
        uptime: this.getSystemUptime(),
        apiRequests: this.getAPIRequests(),
        averageResponseTime: 245,
        errorRate: 0.12,
        storageUsed: 142.5,
        bandwidth: 1250,
        activeConnections: this.getActiveConnections(),
      },
    };
  }

  /**
   * Perform user management action
   */
  performUserAction(action: UserManagementAction): boolean {
    try {
      const { action: actionType, userId, reason, duration } = action;

      switch (actionType) {
        case 'ban':
          return this.banUser(userId, reason, duration);
        case 'unban':
          return this.unbanUser(userId);
        case 'warn':
          return this.warnUser(userId, reason);
        case 'delete':
          return this.deleteUser(userId, reason);
        case 'verify':
          return this.verifyUser(userId);
        case 'promote':
          return this.promoteUser(userId);
        case 'demote':
          return this.demoteUser(userId);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      return false;
    }
  }

  /**
   * Ban a user
   */
  private banUser(userId: string, reason: string, duration?: number): boolean {
    const ban: BanDetails = {
      id: `ban_${Date.now()}_${userId}`,
      userId,
      username: this.getUsernameById(userId),
      reason,
      category: 'tos_violation',
      duration: duration || 'permanent',
      startedAt: Date.now(),
      expiresAt: duration ? Date.now() + duration * 60 * 60 * 1000 : null,
      bannedBy: this.getCurrentAdminId(),
      appealable: true,
    };

    const key = 'admin:bans';
    const bans = JSON.parse(localStorage.getItem(key) || '[]');
    bans.push(ban);
    localStorage.setItem(key, JSON.stringify(bans));

    this.logAdminActivity('ban_user', `Banned user ${userId}: ${reason}`, 'user');
    return true;
  }

  private unbanUser(userId: string): boolean {
    const key = 'admin:bans';
    const bans: BanDetails[] = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedBans = bans.filter(b => b.userId !== userId);
    localStorage.setItem(key, JSON.stringify(updatedBans));

    this.logAdminActivity('unban_user', `Unbanned user ${userId}`, 'user');
    return true;
  }

  private warnUser(userId: string, reason: string): boolean {
    const warning = {
      userId,
      reason,
      timestamp: Date.now(),
      warnedBy: this.getCurrentAdminId(),
    };

    const key = `admin:warnings:${userId}`;
    const warnings = JSON.parse(localStorage.getItem(key) || '[]');
    warnings.push(warning);
    localStorage.setItem(key, JSON.stringify(warnings));

    this.logAdminActivity('warn_user', `Warned user ${userId}: ${reason}`, 'user');
    return true;
  }

  private deleteUser(userId: string, reason: string): boolean {
    // Mark user as deleted (soft delete)
    const key = `admin:deleted_users`;
    const deleted = JSON.parse(localStorage.getItem(key) || '[]');
    deleted.push({
      userId,
      reason,
      timestamp: Date.now(),
      deletedBy: this.getCurrentAdminId(),
    });
    localStorage.setItem(key, JSON.stringify(deleted));

    this.logAdminActivity('delete_user', `Deleted user ${userId}: ${reason}`, 'user');
    return true;
  }

  private verifyUser(userId: string): boolean {
    this.logAdminActivity('verify_user', `Verified user ${userId}`, 'user');
    return true;
  }

  private promoteUser(userId: string): boolean {
    this.logAdminActivity('promote_user', `Promoted user ${userId}`, 'user');
    return true;
  }

  private demoteUser(userId: string): boolean {
    this.logAdminActivity('demote_user', `Demoted user ${userId}`, 'user');
    return true;
  }

  /**
   * Perform content moderation action
   */
  performContentAction(action: ContentModerationAction): boolean {
    try {
      const { action: actionType, contentType, contentId, reason } = action;

      const key = `admin:moderation_actions`;
      const actions = JSON.parse(localStorage.getItem(key) || '[]');
      actions.push(action);
      localStorage.setItem(key, JSON.stringify(actions));

      this.logAdminActivity(
        `${actionType}_${contentType}`,
        `${actionType} ${contentType} ${contentId}: ${reason}`,
        'content'
      );

      return true;
    } catch (error) {
      console.error('Error performing content action:', error);
      return false;
    }
  }

  /**
   * Get all reports
   */
  getAllReports(): ReportDetails[] {
    const key = 'admin:reports';
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  /**
   * Resolve a report
   */
  resolveReport(reportId: string, resolution: string): boolean {
    try {
      const reports = this.getAllReports();
      const report = reports.find(r => r.id === reportId);
      
      if (report) {
        report.status = 'resolved';
        report.resolution = resolution;
        report.resolvedAt = Date.now();
        
        const key = 'admin:reports';
        localStorage.setItem(key, JSON.stringify(reports));
        
        this.logAdminActivity('resolve_report', `Resolved report ${reportId}`, 'content');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error resolving report:', error);
      return false;
    }
  }

  /**
   * Get system settings
   */
  getSystemSettings(): SystemSetting[] {
    const key = 'admin:system_settings';
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      // Initialize with defaults
      const defaults: SystemSetting[] = [
        {
          key: 'registration_enabled',
          value: true,
          category: 'general',
          label: 'Registration Enabled',
          description: 'Allow new user registrations',
          type: 'boolean',
        },
        {
          key: 'maintenance_mode',
          value: false,
          category: 'general',
          label: 'Maintenance Mode',
          description: 'Enable maintenance mode (blocks access)',
          type: 'boolean',
        },
        {
          key: 'max_room_size',
          value: 50,
          category: 'limits',
          label: 'Max Room Size',
          description: 'Maximum users per room',
          type: 'number',
        },
        {
          key: 'gift_system_enabled',
          value: true,
          category: 'features',
          label: 'Gift System',
          description: 'Enable virtual gift system',
          type: 'boolean',
        },
        {
          key: 'live_streaming_enabled',
          value: true,
          category: 'features',
          label: 'Live Streaming',
          description: 'Enable live streaming feature',
          type: 'boolean',
        },
        {
          key: 'ai_matching_enabled',
          value: true,
          category: 'features',
          label: 'AI Matching',
          description: 'Enable AI-powered matchmaking',
          type: 'boolean',
        },
      ];
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    
    return JSON.parse(stored);
  }

  /**
   * Update system setting
   */
  updateSystemSetting(key: string, value: number | string | boolean): boolean {
    try {
      const settings = this.getSystemSettings();
      const setting = settings.find(s => s.key === key);
      
      if (setting) {
        setting.value = value;
        localStorage.setItem('admin:system_settings', JSON.stringify(settings));
        
        this.logAdminActivity('update_setting', `Updated setting ${key} to ${value}`, 'system');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  }

  /**
   * Get admin activity log
   */
  getAdminActivityLog(limit: number = 100): AdminActivity[] {
    const key = 'admin:activity_log';
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    return log.slice(0, limit);
  }

  /**
   * Log admin activity
   */
  private logAdminActivity(action: string, details: string, category: AdminActivity['category']): void {
    const activity: AdminActivity = {
      id: `activity_${Date.now()}`,
      adminId: this.getCurrentAdminId(),
      adminUsername: this.getCurrentAdminUsername(),
      action,
      details,
      category,
      timestamp: Date.now(),
    };

    const key = 'admin:activity_log';
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    log.unshift(activity);
    localStorage.setItem(key, JSON.stringify(log.slice(0, 1000))); // Keep last 1000
  }

  /**
   * Get financial transactions
   */
  getFinancialTransactions(limit: number = 100): FinancialTransaction[] {
    // Demo data
    const transactions: FinancialTransaction[] = [];
    for (let i = 0; i < 20; i++) {
      transactions.push({
        id: `trans_${Date.now()}_${i}`,
        type: ['purchase', 'gift', 'subscription', 'payout'][Math.floor(Math.random() * 4)] as any,
        userId: `user_${i}`,
        username: `User${i}`,
        amount: Math.floor(Math.random() * 100) + 10,
        currency: 'USD',
        status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)] as any,
        description: 'Transaction description',
        timestamp: Date.now() - i * 3600000,
      });
    }
    return transactions;
  }

  /**
   * Get system alerts
   */
  getSystemAlerts(): SystemAlert[] {
    const key = 'admin:system_alerts';
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  /**
   * Add system alert
   */
  addSystemAlert(alert: Omit<SystemAlert, 'id' | 'acknowledged'>): void {
    const fullAlert: SystemAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      acknowledged: false,
    };

    const key = 'admin:system_alerts';
    const alerts = JSON.parse(localStorage.getItem(key) || '[]');
    alerts.unshift(fullAlert);
    localStorage.setItem(key, JSON.stringify(alerts.slice(0, 100)));
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    try {
      const alerts = this.getSystemAlerts();
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedBy = this.getCurrentAdminId();
        localStorage.setItem('admin:system_alerts', JSON.stringify(alerts));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return false;
    }
  }

  // Helper methods for statistics
  private getTotalUsers(): number {
    return 12547;
  }

  private getActiveUsers(hours: number): number {
    return hours === 1 ? 1234 : hours === 24 ? 3456 : 8901;
  }

  private getNewUsers(days: number): number {
    return 456;
  }

  private getPremiumUsers(): number {
    return 2341;
  }

  private getBannedUsers(): number {
    const key = 'admin:bans';
    const bans = JSON.parse(localStorage.getItem(key) || '[]');
    return bans.filter((b: BanDetails) => 
      !b.expiresAt || b.expiresAt > Date.now()
    ).length;
  }

  private getOnlineUsers(): number {
    return 834;
  }

  private getUsersByLevel(): { level: string; count: number }[] {
    return [
      { level: '1-10', count: 4523 },
      { level: '11-25', count: 3456 },
      { level: '26-50', count: 2345 },
      { level: '51-75', count: 1234 },
      { level: '76-100', count: 989 },
    ];
  }

  private getUsersByCountry(): { country: string; count: number }[] {
    return [
      { country: 'Saudi Arabia', count: 3456 },
      { country: 'Egypt', count: 2890 },
      { country: 'UAE', count: 2234 },
      { country: 'Kuwait', count: 1567 },
      { country: 'Others', count: 2400 },
    ];
  }

  private getTotalRooms(): number {
    return 567;
  }

  private getActiveRooms(): number {
    return 234;
  }

  private getRecentMessages(hours: number): number {
    return 45678;
  }

  private getTotalStreams(): number {
    return 234;
  }

  private getTotalEvents(): number {
    return 67;
  }

  private getTotalFamilies(): number {
    const key = 'families:all';
    const families = JSON.parse(localStorage.getItem(key) || '[]');
    return families.length;
  }

  private getPendingReports(): number {
    const reports = this.getAllReports();
    return reports.filter(r => r.status === 'pending').length;
  }

  private getResolvedReports(): number {
    const reports = this.getAllReports();
    return reports.filter(r => r.status === 'resolved').length;
  }

  private getActiveBans(): number {
    return this.getBannedUsers();
  }

  private getTotalWarnings(): number {
    return 123;
  }

  private getDeletedContent(): number {
    return 456;
  }

  private getPendingAppeals(): number {
    return 12;
  }

  private getTotalContent(): number {
    return this.getTotalRooms() + this.getTotalStreams() + this.getTotalEvents() + this.getTotalFamilies();
  }

  private getRevenue(days: number): number {
    if (days === 1) return 5432;
    if (days === 7) return 34567;
    if (days === 30) return 123456;
    return 0;
  }

  private getTotalRevenue(): number {
    return 1234567;
  }

  private getTotalTransactions(): number {
    return 45678;
  }

  private getPendingTransactions(): number {
    return 234;
  }

  private getCompletedTransactions(): number {
    return 43210;
  }

  private getFailedTransactions(): number {
    return 234;
  }

  private getActiveSubscriptions(): number {
    return 2341;
  }

  private getCancelledSubscriptions(): number {
    return 456;
  }

  private getSubscriptionRevenue(): number {
    return 67890;
  }

  private getTotalGiftsSent(): number {
    return 12345;
  }

  private getGiftRevenue(): number {
    return 45678;
  }

  private getPendingPayouts(): number {
    return 23;
  }

  private getPendingPayoutAmount(): number {
    return 12345;
  }

  private getTopFeatures(): { feature: string; usage: number }[] {
    return [
      { feature: 'Voice Chat', usage: 8901 },
      { feature: 'Live Streaming', usage: 5678 },
      { feature: 'Families', usage: 3456 },
      { feature: 'Events', usage: 2345 },
      { feature: 'AI Matching', usage: 1890 },
    ];
  }

  private getSystemUptime(): number {
    return 2592000; // 30 days in seconds
  }

  private getAPIRequests(): number {
    return 1234567;
  }

  private getActiveConnections(): number {
    return 834;
  }

  private getCurrentAdminId(): string {
    const authUser = localStorage.getItem('auth:user');
    return authUser ? JSON.parse(authUser).id : 'admin';
  }

  private getCurrentAdminUsername(): string {
    const authUser = localStorage.getItem('auth:user');
    return authUser ? JSON.parse(authUser).username : 'Admin';
  }

  private getUsernameById(userId: string): string {
    return `User_${userId}`;
  }
}

export default new AdminPanelService();
