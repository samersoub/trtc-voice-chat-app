"use client";

import { supabase, isSupabaseReady, safe } from "@/services/db/supabaseClient";
import { resizeImage } from "@/utils/image";

export type Profile = {
  id: string;
  username: string;
  email: string;
  phone: string;

  // Profile fields (matching users table)
  full_name?: string | null;
  display_id?: string | null; // Premium ID
  avatar_url?: string | null;
  profile_image?: string | null; // For backward compatibility
  bio?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  date_of_birth?: string | null;
  age?: number | null;
  country?: string | null;
  language?: string;

  // Voice chat fields
  voice_quality?: string;
  total_voice_minutes?: number;

  // Economy
  coins: number;
  diamonds?: number;

  // Wealth system
  wealth_level?: number;
  total_recharge?: number;
  monthly_recharge?: number;
  total_gifts_sent?: number;
  total_gifts_received?: number;

  // Social & Gaming (NEW)
  level?: number;
  followers?: string[];
  following?: string[];
  interests?: string[];

  // Location (NEW)
  location_lat?: number | null;
  location_lng?: number | null;
  city?: string | null;

  // Status
  is_online?: boolean;
  last_seen?: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_banned?: boolean;
  ban_reason?: string | null;
  is_premium?: boolean;

  // Metadata
  role: string;
  created_at: string;
  updated_at?: string;
  last_login?: string | null;
};

const LOCAL_KEY = "profiles";

// Demo data for when Supabase is not configured
const DEMO_PROFILES: Profile[] = [
  {
    id: "demo-1",
    username: "admin",
    email: "admin@example.com",
    phone: "+1234567890",
    full_name: "Admin User",
    avatar_url: null,
    language: "ar",
    voice_quality: "high",
    total_voice_minutes: 0,
    coins: 1000,
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
    is_active: true,
    is_verified: true,
    role: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    ban_reason: null
  },
  {
    id: "demo-2",
    username: "user1",
    email: "user1@example.com",
    phone: "+1234567891",
    full_name: "Demo User 1",
    avatar_url: null,
    language: "ar",
    voice_quality: "medium",
    total_voice_minutes: 0,
    coins: 500,
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
    is_active: true,
    is_verified: true,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    ban_reason: null
  },
  {
    id: "demo-3",
    username: "user2",
    email: "user2@example.com",
    phone: "+1234567892",
    full_name: "Demo User 2",
    avatar_url: null,
    language: "ar",
    voice_quality: "medium",
    total_voice_minutes: 0,
    coins: 250,
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
    is_active: true,
    is_verified: false,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    ban_reason: null
  }
];

function readLocal(): Profile[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      return JSON.parse(raw) as Profile[];
    }
    // Return demo data if localStorage is empty
    return DEMO_PROFILES;
  } catch {
    return DEMO_PROFILES;
  }
}

function writeLocal(items: Profile[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export const ProfileService = {
  async upsertProfile(p: Profile): Promise<Profile> {
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .upsert(p)
          .select()
          .single();

        // إذا كان الخطأ RLS violation، استخدم localStorage فقط
        if (error) {
          if (error.code === '42501' || error.message.includes('row-level security')) {
            console.warn('[ProfileService] RLS violation, using localStorage fallback:', error.message);
            // Fallback to localStorage
            const all = readLocal();
            const idx = all.findIndex((x) => x.id === p.id);
            if (idx >= 0) all[idx] = p;
            else all.push(p);
            writeLocal(all);
            return p;
          }
          throw new Error(error.message);
        }

        return data as Profile;
      } catch (err: any) {
        console.warn('[ProfileService] Supabase upsert failed, using localStorage:', err.message);
        // Fallback to localStorage on any error
        const all = readLocal();
        const idx = all.findIndex((x) => x.id === p.id);
        if (idx >= 0) all[idx] = p;
        else all.push(p);
        writeLocal(all);
        return p;
      }
    }
    const all = readLocal();
    const idx = all.findIndex((x) => x.id === p.id);
    if (idx >= 0) all[idx] = p;
    else all.push(p);
    writeLocal(all);
    return p;
  },

  async getByUserId(id: string): Promise<Profile | null> {
    let dbProfile: Profile | null = null;
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
      if (!error && data) dbProfile = data as Profile;
    }

    // Always check local for overrides/fallbacks
    const local = readLocal().find((p) => p.id === id) || null;

    if (dbProfile && local) {
      // Merge: Local overrides DB (assuming local is 'unsynced changes')
      return { ...dbProfile, ...local };
    }

    return dbProfile || local;
  },

  async getByUsername(username: string): Promise<Profile | null> {
    let dbProfile: Profile | null = null;
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
      if (!error && data) dbProfile = data as Profile;
    }

    const local = readLocal().find((p) => p.username === username) || null;

    if (dbProfile && local) {
      return { ...dbProfile, ...local };
    }
    return dbProfile || local;
  },

  async listAll(): Promise<Profile[]> {
    let dbProfiles: Profile[] = [];
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          dbProfiles = data as Profile[];
        }
      } catch (err) {
        console.warn("Failed to fetch users from Supabase:", err);
      }
    }

    const localProfiles = readLocal();

    // Create a map of local profiles for faster lookup
    const localMap = new Map(localProfiles.map(p => [p.id, p]));

    // Merge DB profiles with Local overrides
    const mergedProfiles = dbProfiles.map(dbP => {
      const localP = localMap.get(dbP.id);
      if (localP) {
        return { ...dbP, ...localP };
      }
      return dbP;
    });

    // Optionally add local-only profiles (if created offline/demo)
    // Filter out locals that were already merged
    const dbIds = new Set(dbProfiles.map(p => p.id));
    const localOnly = localProfiles.filter(p => !dbIds.has(p.id));

    return [...mergedProfiles, ...localOnly];
  },

  async toggleActive(id: string): Promise<Profile | null> {
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = { ...current, is_active: !current.is_active };
    return await this.upsertProfile(updated);
  },

  async updateLastLogin(id: string): Promise<void> {
    const current = await this.getByUserId(id);
    if (!current) return;
    const updated = { ...current, last_login: new Date().toISOString() };
    await this.upsertProfile(updated);
  },

  async updateCoins(id: string, delta: number): Promise<Profile | null> {
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = { ...current, coins: Math.max(0, (current.coins || 0) + delta) };
    return await this.upsertProfile(updated);
  },

  async updateLevel(id: string, level: number): Promise<Profile | null> {
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = { ...current, level: Math.max(1, level) };
    return await this.upsertProfile(updated);
  },

  /**
   * Ban user - sets is_active to false and stores ban reason
   */
  async banUser(id: string, reason: string): Promise<Profile | null> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase
        .from("users")
        .update({
          is_active: false,
          is_banned: true,
          ban_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    }

    // Local fallback
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = {
      ...current,
      is_active: false,
      role: current.role === 'admin' ? 'admin' : 'banned' // Don't ban admins
    };
    return await this.upsertProfile(updated);
  },

  /**
   * Unban user - reactivates account
   */
  /**
   * Update user's cover image
   */
  async updateCoverImage(userId: string, coverImageData: string): Promise<Profile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    // Store in localStorage (for demo mode)
    const coverKey = `profile:cover:${userId}`;
    localStorage.setItem(coverKey, coverImageData);

    // TODO: Upload to Supabase Storage in production
    // if (isSupabaseReady && supabase) {
    //   const { data, error } = await supabase.storage
    //     .from('covers')
    //     .upload(`${userId}/cover.jpg`, coverImageData);
    // }

    return profile;
  },

  /**
   * Update user's profile image
   */
  async updateProfileImage(userId: string, imageData: string): Promise<Profile | null> {
    const profile = await this.getByUserId(userId);
    if (!profile) return null;

    // Resize image for optimal performance
    const resized = await resizeImage(imageData, 400, 400);

    const updated = { ...profile, profile_image: resized };
    return await this.upsertProfile(updated);

    // TODO: Upload to Supabase Storage in production
    // if (isSupabaseReady && supabase) {
    //   const { data, error } = await supabase.storage
    //     .from('avatars')
    //     .upload(`${userId}/avatar.jpg`, resized);
    // }
  },

  /**
   * Get user's cover image
   */
  getCoverImage(userId: string): string | null {
    const coverKey = `profile:cover:${userId}`;
    return localStorage.getItem(coverKey);
  },

  async unbanUser(id: string): Promise<Profile | null> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase
        .from("users")
        .update({
          is_active: true,
          is_banned: false,
          ban_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    }

    // Local fallback
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = {
      ...current,
      is_active: true,
      role: current.role === 'banned' ? 'user' : current.role
    };
    return await this.upsertProfile(updated);
  },

  /**
   * Update user role (admin, user, host, moderator)
   */
  async updateRole(id: string, role: 'admin' | 'user' | 'host' | 'moderator'): Promise<Profile | null> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase
        .from("users")
        .update({
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    }

    // Local fallback
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = { ...current, role };
    return await this.upsertProfile(updated);
  },

  /**
   * Delete user account permanently
   */
  async deleteUser(id: string): Promise<boolean> {
    if (isSupabaseReady && supabase) {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
      return true;
    }

    // Local fallback
    const all = readLocal();
    const filtered = all.filter(p => p.id !== id);
    writeLocal(filtered);
    return true;
  },

  /**
   * Update user verification status
   */
  async verifyUser(id: string, verified: boolean): Promise<Profile | null> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase
        .from("users")
        .update({
          is_verified: verified,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    }

    // Local fallback
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = { ...current, is_verified: verified };
    return await this.upsertProfile(updated);
  },

  /**
   * Update user profile (full update)
   */
  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const current = await this.getByUserId(id);
    if (!current) return null;
    const updated = { ...current, ...updates };
    return await this.upsertProfile(updated);
  },

  async uploadProfileImage(userId: string, file: File): Promise<string | null> {
    if (!file) return null;

    // Local fallback function for when Supabase is unavailable or bucket doesn't exist
    const uploadLocally = async () => {
      const resized = await resizeImage(file, 512, 512, 0.9);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(resized);
      });
      const prof = await this.getByUserId(userId);
      if (prof) {
        await this.upsertProfile({ ...prof, profile_image: dataUrl });
      }
      return dataUrl;
    };

    if (!(isSupabaseReady && supabase)) {
      return await uploadLocally();
    }

    try {
      // Resize client-side for performance
      const resized = await resizeImage(file, 512, 512, 0.9);
      const path = `${userId}/${Date.now()}_${resized.name}`;
      const { error: upErr } = await supabase.storage.from("profiles").upload(path, resized, {
        upsert: true,
        contentType: resized.type || "image/*",
      });

      // If bucket doesn't exist, fallback to local storage
      if (upErr) {
        console.warn(`Storage upload failed (${upErr.message}), using local storage`);
        return await uploadLocally();
      }

      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      const url = data?.publicUrl || null;
      if (url) {
        const prof = await this.getByUserId(userId);
        if (prof) {
          await this.upsertProfile({ ...prof, profile_image: url });
        }
      }
      return url;
    } catch (err: any) {
      console.warn(`Storage error: ${err.message}, using local storage`);
      return await uploadLocally();
    }
  },
};

export default ProfileService;