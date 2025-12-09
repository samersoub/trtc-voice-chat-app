"use client";

import { supabase, isSupabaseReady, safe } from "@/services/db/supabaseClient";
import { resizeImage } from "@/utils/image";

export type Profile = {
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
};

const LOCAL_KEY = "profiles";

function readLocal(): Profile[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: Profile[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export const ProfileService = {
  async upsertProfile(p: Profile): Promise<Profile> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(p)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Profile;
    }
    const all = readLocal();
    const idx = all.findIndex((x) => x.id === p.id);
    if (idx >= 0) all[idx] = p;
    else all.push(p);
    writeLocal(all);
    return p;
  },

  async getByUserId(id: string): Promise<Profile | null> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (error) return null;
      return data as Profile;
    }
    return readLocal().find((p) => p.id === id) || null;
  },

  async getByUsername(username: string): Promise<Profile | null> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single();
      if (error) return null;
      return data as Profile;
    }
    return readLocal().find((p) => p.username === username) || null;
  },

  async listAll(): Promise<Profile[]> {
    if (isSupabaseReady && supabase) {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []) as Profile[];
    }
    return readLocal();
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
    if (!(isSupabaseReady && supabase)) {
      // Local fallback: store a base64 data URL in profile_image
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
    }
    // Resize client-side for performance
    const resized = await resizeImage(file, 512, 512, 0.9);
    const path = `${userId}/${Date.now()}_${resized.name}`;
    const { error: upErr } = await supabase.storage.from("profiles").upload(path, resized, {
      upsert: true,
      contentType: resized.type || "image/*",
    });
    if (upErr) throw new Error(upErr.message);
    const { data } = supabase.storage.from("profiles").getPublicUrl(path);
    const url = data?.publicUrl || null;
    if (url) {
      const prof = await this.getByUserId(userId);
      if (prof) {
        await this.upsertProfile({ ...prof, profile_image: url });
      }
    }
    return url;
  },
};

export default ProfileService;