/**
 * Advanced Admin Panel Models
 * Comprehensive admin dashboard with user management, moderation, analytics, and system controls
 */

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: AdminPermission[];
  createdAt: number;
  lastLogin: number;
}

export type AdminPermission = 
  | 'user_management'
  | 'content_moderation'
  | 'financial_management'
  | 'system_settings'
  | 'analytics_access'
  | 'ban_users'
  | 'delete_content'
  | 'manage_events'
  | 'manage_families'
  | 'manage_gifts'
  | 'view_reports'
  | 'manage_admins';

export interface AdminDashboardStats {
  users: UserStats;
  content: ContentStats;
  financial: FinancialStats;
  engagement: EngagementStats;
  moderation: ModerationStats;
  system: SystemStats;
}

export interface UserStats {
  total: number;
  active: number; // last 24h
  new: number; // last 7 days
  premium: number;
  banned: number;
  online: number;
  byLevel: { level: string; count: number }[];
  byCountry: { country: string; count: number }[];
  growthRate: number; // percentage
}

export interface ContentStats {
  rooms: number;
  activeRooms: number;
  messages: number; // last 24h
  streams: number;
  events: number;
  families: number;
  reports: number; // pending
  totalContent: number;
}

export interface FinancialStats {
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  transactions: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
  };
  subscriptions: {
    active: number;
    cancelled: number;
    revenue: number;
  };
  gifts: {
    sent: number;
    revenue: number;
  };
  payouts: {
    pending: number;
    amount: number;
  };
}

export interface EngagementStats {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number; // minutes
  averageSessionsPerUser: number;
  retentionRate: number; // percentage
  churnRate: number; // percentage
  topFeatures: { feature: string; usage: number }[];
}

export interface ModerationStats {
  pendingReports: number;
  resolvedReports: number;
  activeBans: number;
  warnings: number;
  deletedContent: number;
  appealsPending: number;
}

export interface SystemStats {
  uptime: number; // seconds
  apiRequests: number;
  averageResponseTime: number; // ms
  errorRate: number; // percentage
  storageUsed: number; // GB
  bandwidth: number; // GB
  activeConnections: number;
}

export interface UserManagementAction {
  action: 'ban' | 'unban' | 'warn' | 'delete' | 'verify' | 'promote' | 'demote';
  userId: string;
  reason: string;
  duration?: number; // for bans (hours)
  performedBy: string;
  timestamp: number;
}

export interface ContentModerationAction {
  action: 'delete' | 'hide' | 'approve' | 'flag';
  contentType: 'message' | 'room' | 'stream' | 'event' | 'profile' | 'comment';
  contentId: string;
  reason: string;
  performedBy: string;
  timestamp: number;
}

export interface SystemSetting {
  key: string;
  value: number | string | boolean;
  category: 'general' | 'features' | 'limits' | 'security' | 'payments' | 'notifications';
  label: string;
  description: string;
  type: 'boolean' | 'number' | 'string' | 'select';
  options?: string[]; // for select type
}

export interface AdminActivity {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  details: string;
  category: 'user' | 'content' | 'financial' | 'system' | 'security';
  timestamp: number;
  ipAddress?: string;
}

export interface ReportDetails {
  id: string;
  type: 'user' | 'content' | 'room' | 'stream' | 'message';
  targetId: string;
  targetName: string;
  reportedBy: string;
  reporterName: string;
  reason: string;
  category: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'violence' | 'other';
  description: string;
  evidence?: string[]; // URLs to screenshots, etc.
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string; // admin ID
  resolution?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface BanDetails {
  id: string;
  userId: string;
  username: string;
  reason: string;
  category: 'spam' | 'harassment' | 'cheating' | 'fraud' | 'tos_violation';
  duration: number | 'permanent';
  startedAt: number;
  expiresAt: number | null;
  bannedBy: string;
  adminNote?: string;
  appealable: boolean;
  appealStatus?: 'pending' | 'approved' | 'denied';
}

export interface FinancialTransaction {
  id: string;
  type: 'purchase' | 'gift' | 'subscription' | 'payout' | 'refund';
  userId: string;
  username: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string; // service/component name
  timestamp: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export interface BackupInfo {
  id: string;
  timestamp: number;
  size: number; // bytes
  type: 'full' | 'incremental';
  status: 'completed' | 'failed' | 'in_progress';
  location: string;
}

export const ADMIN_ROLES = {
  super_admin: {
    label: 'Super Admin',
    permissions: [
      'user_management',
      'content_moderation',
      'financial_management',
      'system_settings',
      'analytics_access',
      'ban_users',
      'delete_content',
      'manage_events',
      'manage_families',
      'manage_gifts',
      'view_reports',
      'manage_admins',
    ] as AdminPermission[],
  },
  admin: {
    label: 'Admin',
    permissions: [
      'user_management',
      'content_moderation',
      'analytics_access',
      'ban_users',
      'delete_content',
      'manage_events',
      'manage_families',
      'view_reports',
    ] as AdminPermission[],
  },
  moderator: {
    label: 'Moderator',
    permissions: [
      'content_moderation',
      'view_reports',
    ] as AdminPermission[],
  },
  support: {
    label: 'Support',
    permissions: [
      'view_reports',
      'analytics_access',
    ] as AdminPermission[],
  },
};

export const SYSTEM_SETTINGS_DEFAULTS: SystemSetting[] = [
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
    key: 'max_message_length',
    value: 500,
    category: 'limits',
    label: 'Max Message Length',
    description: 'Maximum characters per message',
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
