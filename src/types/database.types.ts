/**
 * Supabase Database Types
 * Generated from schema.sql
 * تاريخ: 2025-12-07
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DbUser;
        Insert: DbUserInsert;
        Update: DbUserUpdate;
      };
      gifts: {
        Row: DbGift;
        Insert: DbGiftInsert;
        Update: DbGiftUpdate;
      };
      gift_transactions: {
        Row: DbGiftTransaction;
        Insert: DbGiftTransactionInsert;
        Update: DbGiftTransactionUpdate;
      };
      voice_rooms: {
        Row: DbVoiceRoom;
        Insert: DbVoiceRoomInsert;
        Update: DbVoiceRoomUpdate;
      };
      room_participants: {
        Row: DbRoomParticipant;
        Insert: DbRoomParticipantInsert;
        Update: DbRoomParticipantUpdate;
      };
      coin_transactions: {
        Row: DbCoinTransaction;
        Insert: DbCoinTransactionInsert;
        Update: DbCoinTransactionUpdate;
      };
      wealth_history: {
        Row: DbWealthHistory;
        Insert: DbWealthHistoryInsert;
        Update: DbWealthHistoryUpdate;
      };
      notifications: {
        Row: DbNotification;
        Insert: DbNotificationInsert;
        Update: DbNotificationUpdate;
      };
      activity_logs: {
        Row: DbActivityLog;
        Insert: DbActivityLogInsert;
        Update: DbActivityLogUpdate;
      };
      app_settings: {
        Row: DbAppSettings;
        Insert: DbAppSettingsInsert;
        Update: DbAppSettingsUpdate;
      };
    };
  };
}

// ============= User Types =============
export interface DbUser {
  id: string;
  email: string | null;
  phone: string | null;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  gender: 'male' | 'female' | 'other' | null;
  date_of_birth: string | null;
  country: string | null;
  language: string;
  voice_quality: string;
  total_voice_minutes: number;
  coins: number;
  diamonds: number;
  wealth_level: number;
  total_recharge: number;
  total_gifts_sent: number;
  monthly_recharge: number;
  monthly_gifts: number;
  is_online: boolean;
  last_seen: string;
  is_verified: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type DbUserInsert = Omit<DbUser, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DbUserUpdate = Partial<DbUserInsert>;

// ============= Gift Types =============
export interface DbGift {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  icon: string | null;
  price: number;
  reward_diamonds: number;
  categories: string[];
  is_active: boolean;
  created_at: string;
}

export type DbGiftInsert = Omit<DbGift, 'created_at'> & {
  created_at?: string;
};

export type DbGiftUpdate = Partial<DbGiftInsert>;

// ============= Gift Transaction Types =============
export interface DbGiftTransaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  gift_id: string;
  quantity: number;
  total_cost: number;
  room_id: string | null;
  created_at: string;
}

export type DbGiftTransactionInsert = Omit<DbGiftTransaction, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type DbGiftTransactionUpdate = Partial<DbGiftTransactionInsert>;

// ============= Voice Room Types =============
export interface DbVoiceRoom {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  owner_id: string;
  room_type: 'public' | 'private' | 'password';
  password: string | null;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  allows_gifts: boolean;
  allows_messages: boolean;
  total_messages: number;
  total_gifts_received: number;
  created_at: string;
  updated_at: string;
}

export type DbVoiceRoomInsert = Omit<DbVoiceRoom, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type DbVoiceRoomUpdate = Partial<DbVoiceRoomInsert>;

// ============= Room Participant Types =============
export interface DbRoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'speaker' | 'listener';
  mic_seat: number | null;
  is_muted: boolean;
  joined_at: string;
  left_at: string | null;
}

export type DbRoomParticipantInsert = Omit<DbRoomParticipant, 'id' | 'joined_at'> & {
  id?: string;
  joined_at?: string;
};

export type DbRoomParticipantUpdate = Partial<DbRoomParticipantInsert>;

// ============= Coin Transaction Types =============
export interface DbCoinTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'gift_sent' | 'gift_received' | 'reward' | 'admin_adjustment';
  amount: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export type DbCoinTransactionInsert = Omit<DbCoinTransaction, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type DbCoinTransactionUpdate = Partial<DbCoinTransactionInsert>;

// ============= Wealth History Types =============
export interface DbWealthHistory {
  id: string;
  user_id: string;
  old_level: number;
  new_level: number;
  total_wealth: number;
  reason: string | null;
  created_at: string;
}

export type DbWealthHistoryInsert = Omit<DbWealthHistory, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type DbWealthHistoryUpdate = Partial<DbWealthHistoryInsert>;

// ============= Notification Types =============
export interface DbNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'gift' | 'system' | 'room' | 'follow' | 'level_up';
  icon: string | null;
  is_read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type DbNotificationInsert = Omit<DbNotification, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type DbNotificationUpdate = Partial<DbNotificationInsert>;

// ============= Activity Log Types =============
export interface DbActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type DbActivityLogInsert = Omit<DbActivityLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type DbActivityLogUpdate = Partial<DbActivityLogInsert>;

// ============= App Settings Types =============
export interface DbAppSettings {
  id: number;
  // General
  app_name: string;
  app_logo_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  // Features
  enable_voice_chat: boolean;
  enable_gifts: boolean;
  enable_matching: boolean;
  enable_music_rooms: boolean;
  enable_agencies: boolean;
  enable_store: boolean;
  enable_games: boolean;
  // Limits
  min_age: number;
  max_username_length: number;
  max_bio_length: number;
  max_room_capacity: number;
  max_daily_gifts_per_user: number;
  // Economy
  default_signup_coins: number;
  default_signup_diamonds: number;
  coin_to_diamond_ratio: number;
  gift_commission_percentage: number;
  // Security
  require_phone_verification: boolean;
  require_email_verification: boolean;
  enable_two_factor_auth: boolean;
  min_password_length: number;
  // Moderation
  auto_ban_threshold: number;
  profanity_filter_enabled: boolean;
  require_profile_image: boolean;
  // Notifications
  enable_push_notifications: boolean;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  // Analytics
  track_user_activity: boolean;
  track_gift_analytics: boolean;
  track_room_analytics: boolean;
  // Maintenance
  maintenance_mode: boolean;
  maintenance_message: string | null;
  // Social
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  // Legal
  terms_url: string | null;
  privacy_url: string | null;
  // Metadata
  updated_at: string;
  updated_by: string | null;
}

export type DbAppSettingsInsert = Partial<DbAppSettings>;
export type DbAppSettingsUpdate = Partial<DbAppSettings>;
