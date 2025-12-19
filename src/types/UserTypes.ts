/**
 * Database User Type - يطابق جدول users في Supabase
 * يستخدم هذا Type في جميع عمليات قاعدة البيانات
 */
export interface DbUser {
  // Authentication & Identity
  id: string;
  email: string;
  username: string;
  display_id?: string | null; // Custom 7-digit ID
  phone: string | null;

  // Profile Basic Info
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  gender: 'male' | 'female' | 'other' | null;
  date_of_birth: string | null; // ISO date string
  age?: number; // Auto-calculated from date_of_birth
  country: string | null;
  language: string;

  // Voice Chat
  voice_quality: 'low' | 'medium' | 'high' | 'ultra';
  total_voice_minutes: number;

  // Economy
  coins: number;
  diamonds: number;

  // Wealth System
  wealth_level: number;
  total_recharge: number;
  monthly_recharge: number;
  total_gifts_sent: number;
  total_gifts_received: number;

  // Social & Gaming (NEW - added in migration)
  level: number;
  followers: string[]; // Array of user IDs
  following: string[]; // Array of user IDs
  interests: string[]; // Array of interest tags

  // Location (NEW - added in migration)
  location_lat: number | null;
  location_lng: number | null;
  city: string | null;

  // Status
  is_online: boolean;
  last_seen: string | null; // ISO timestamp
  is_verified: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  is_premium: boolean; // NEW - added in migration

  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Premium ID Interface
 * Represents a special/custom ID that can be assigned to a user
 */
export interface PremiumId {
  id: string; // UUID of the record
  user_id: string | null; // Owner of the ID
  custom_id: string; // The special 7-digit ID
  type: 'admin' | 'purchased' | 'gifted' | 'reward';
  price?: number; // If purchased
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  expires_at: string | null;
  created_by?: string; // Admin ID
}

/**
 * Inventory Item Interface
 * Represents an item in the user's backpack
 */
export interface InventoryItem {
  id: string;        // Unique instance ID
  userId: string;    // Owner
  itemId: string;    // Product ID (e.g. 'frame_01')
  type: 'frame' | 'entry_effect' | 'bubble' | 'gift' | 'vehicle' | 'medal';
  name: string;
  icon: string;
  description?: string;
  expiresAt?: string | null; // ISO Date string
  isActive: boolean; // For equippable items
  purchasedAt: string;
  source?: 'store' | 'gift' | 'admin' | 'reward';
}

/**
 * Frontend User Type - يستخدم في الواجهة الأمامية
 * مطابق لـ src/models/User.ts
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;

  // Profile Information
  username?: string;
  displayId?: string; // Custom 7-digit ID
  bio?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';

  // Social & Gaming
  level?: number;
  followers?: string[];
  following?: string[];
  interests?: string[];

  // Status
  isOnline?: boolean;
  lastSeen?: Date;
  verified?: boolean;
  isPremium?: boolean;

  // Location
  location?: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
}

/**
 * تحويل من Database User إلى Frontend User
 * يُستخدم عند قراءة البيانات من Supabase
 */
export function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.full_name || dbUser.username || undefined,
    phone: dbUser.phone || undefined,
    avatarUrl: dbUser.avatar_url || undefined,
    createdAt: dbUser.created_at,

    username: dbUser.username || undefined,
    displayId: dbUser.display_id || undefined,
    bio: dbUser.bio || undefined,
    age: dbUser.age || undefined,
    gender: dbUser.gender || undefined,

    level: dbUser.level || undefined,
    followers: dbUser.followers || undefined,
    following: dbUser.following || undefined,
    interests: dbUser.interests || undefined,

    isOnline: dbUser.is_online,
    lastSeen: dbUser.last_seen ? new Date(dbUser.last_seen) : undefined,
    verified: dbUser.is_verified,
    isPremium: dbUser.is_premium,

    location: (dbUser.location_lat && dbUser.location_lng) ? {
      lat: dbUser.location_lat,
      lng: dbUser.location_lng,
      city: dbUser.city || undefined,
      country: dbUser.country || undefined,
    } : undefined,
  };
}

/**
 * تحويل من Frontend User إلى Database User
 * يُستخدم عند الكتابة إلى Supabase
 */
export function userToDbUser(user: User, existingDbUser?: Partial<DbUser>): Partial<DbUser> {
  const dbUser: Partial<DbUser> = {
    id: user.id,
    email: user.email,
    username: user.username || user.name?.toLowerCase().replace(/\s+/g, '_') || '',
    display_id: user.displayId || existingDbUser?.display_id || null,
    phone: user.phone || null,

    full_name: user.name || null,
    avatar_url: user.avatarUrl || null,
    bio: user.bio || null,
    gender: user.gender || null,
    country: user.location?.country || existingDbUser?.country || null,

    level: user.level || existingDbUser?.level || 1,
    followers: user.followers || existingDbUser?.followers || [],
    following: user.following || existingDbUser?.following || [],
    interests: user.interests || existingDbUser?.interests || [],

    location_lat: user.location?.lat || existingDbUser?.location_lat || null,
    location_lng: user.location?.lng || existingDbUser?.location_lng || null,
    city: user.location?.city || existingDbUser?.city || null,

    is_online: user.isOnline ?? existingDbUser?.is_online ?? false,
    last_seen: user.lastSeen?.toISOString() || existingDbUser?.last_seen || null,
    is_verified: user.verified ?? existingDbUser?.is_verified ?? false,
    is_premium: user.isPremium ?? existingDbUser?.is_premium ?? false,

    updated_at: new Date().toISOString(),
  };

  // احتفظ بالحقول الموجودة من قبل
  if (existingDbUser) {
    return {
      ...existingDbUser,
      ...dbUser,
    };
  }

  return dbUser;
}

/**
 * Profile Type - للتوافق مع ProfileService الحالي
 * سيتم دمجه تدريجياً مع DbUser
 */
export interface Profile {
  id: string;
  username: string;
  email: string;
  phone: string;
  profile_image?: string | null;
  coins: number;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at: string;
  last_login?: string | null;
  ban_reason?: string | null;
}

/**
 * تحويل من DbUser إلى Profile
 */
export function dbUserToProfile(dbUser: DbUser): Profile {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    phone: dbUser.phone || '',
    profile_image: dbUser.avatar_url,
    coins: dbUser.coins,
    is_active: !dbUser.is_banned,
    is_verified: dbUser.is_verified,
    role: 'user', // Default role - سيتم إضافة role إلى جدول users لاحقاً
    created_at: dbUser.created_at,
    last_login: dbUser.last_seen,
    ban_reason: dbUser.ban_reason,
  };
}

/**
 * تحويل من Profile إلى DbUser
 */
export function profileToDbUser(profile: Profile): Partial<DbUser> {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    phone: profile.phone || null,
    avatar_url: profile.profile_image,
    coins: profile.coins,
    is_verified: profile.is_verified,
    is_banned: !profile.is_active,
    ban_reason: profile.ban_reason || null,
    last_seen: profile.last_login,
    created_at: profile.created_at,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Validation Helpers
 */
export const UserValidation = {
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPhone(phone: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(phone); // E.164 format
  },

  isValidUsername(username: string): boolean {
    return /^[a-z0-9_]{3,30}$/.test(username);
  },

  isValidAge(dateOfBirth: string): boolean {
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age >= 13 && age <= 120;
  },
};

/**
 * Helper لإنشاء user جديد مع القيم الافتراضية
 */
export function createNewDbUser(
  id: string,
  email: string,
  username: string,
  phone?: string
): Partial<DbUser> {
  return {
    id,
    email,
    username: username.toLowerCase(),
    phone: phone || null,

    full_name: null,
    avatar_url: null,
    bio: null,
    gender: null,
    date_of_birth: null,
    country: null,
    language: 'ar', // Default to Arabic

    voice_quality: 'medium',
    total_voice_minutes: 0,

    coins: 1000, // Welcome bonus
    diamonds: 0,

    wealth_level: 1,
    total_recharge: 0,
    monthly_recharge: 0,
    total_gifts_sent: 0,
    total_gifts_received: 0,

    level: 1,
    followers: [],
    following: [],
    interests: [],

    location_lat: null,
    location_lng: null,
    city: null,

    is_online: false,
    last_seen: null,
    is_verified: false,
    is_banned: false,
    ban_reason: null,
    is_premium: false,

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
