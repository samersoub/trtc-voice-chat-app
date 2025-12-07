"use client";

import { supabase, isSupabaseReady } from "@/services/db/supabaseClient";

export type AppSettings = {
  // General Settings
  app_name: string;
  app_logo_url?: string;
  support_email: string;
  support_phone?: string;
  
  // Features Toggles
  enable_voice_chat: boolean;
  enable_gifts: boolean;
  enable_matching: boolean;
  enable_music_rooms: boolean;
  enable_agencies: boolean;
  enable_store: boolean;
  enable_games: boolean;
  
  // Limits & Rules
  min_age: number;
  max_username_length: number;
  max_bio_length: number;
  max_room_capacity: number;
  max_daily_gifts_per_user: number;
  
  // Economy
  default_signup_coins: number;
  default_signup_diamonds: number;
  coin_to_diamond_ratio: number; // How many coins = 1 diamond
  gift_commission_percentage: number; // % taken by platform
  
  // Verification & Security
  require_phone_verification: boolean;
  require_email_verification: boolean;
  enable_two_factor_auth: boolean;
  min_password_length: number;
  
  // Content Moderation
  auto_ban_threshold: number; // Number of reports before auto-ban
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
  maintenance_message?: string;
  
  // Social Media Links
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  
  // Legal
  terms_url?: string;
  privacy_url?: string;
  
  // Updated timestamp
  updated_at?: string;
  updated_by?: string;
};

const STORAGE_KEY = "app_settings";

const DEFAULT_SETTINGS: AppSettings = {
  // General
  app_name: "Voice Chat App",
  support_email: "support@voicechat.app",
  
  // Features
  enable_voice_chat: true,
  enable_gifts: true,
  enable_matching: true,
  enable_music_rooms: true,
  enable_agencies: true,
  enable_store: true,
  enable_games: false,
  
  // Limits
  min_age: 18,
  max_username_length: 30,
  max_bio_length: 500,
  max_room_capacity: 100,
  max_daily_gifts_per_user: 50,
  
  // Economy
  default_signup_coins: 1000,
  default_signup_diamonds: 0,
  coin_to_diamond_ratio: 100,
  gift_commission_percentage: 10,
  
  // Security
  require_phone_verification: false,
  require_email_verification: false,
  enable_two_factor_auth: false,
  min_password_length: 6,
  
  // Moderation
  auto_ban_threshold: 5,
  profanity_filter_enabled: true,
  require_profile_image: false,
  
  // Notifications
  enable_push_notifications: true,
  enable_email_notifications: true,
  enable_sms_notifications: false,
  
  // Analytics
  track_user_activity: true,
  track_gift_analytics: true,
  track_room_analytics: true,
  
  // Maintenance
  maintenance_mode: false,
};

function readLocal(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeLocal(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const AppSettingsService = {
  /**
   * Get current app settings
   */
  async getSettings(): Promise<AppSettings> {
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("*")
          .single();
        
        if (error) {
          console.warn("Failed to fetch app settings from DB, using local:", error.message);
          return readLocal();
        }
        
        // Merge with defaults to ensure all fields exist
        return { ...DEFAULT_SETTINGS, ...data };
      } catch (e) {
        console.warn("Error fetching app settings:", e);
        return readLocal();
      }
    }
    
    return readLocal();
  },

  /**
   * Update app settings
   */
  async updateSettings(updates: Partial<AppSettings>, updatedBy?: string): Promise<AppSettings> {
    const current = await this.getSettings();
    const newSettings: AppSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    };

    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .upsert(newSettings)
          .select()
          .single();
        
        if (error) {
          console.warn("Failed to update app settings in DB:", error.message);
          writeLocal(newSettings);
          return newSettings;
        }
        
        writeLocal(data);
        return data;
      } catch (e) {
        console.warn("Error updating app settings:", e);
        writeLocal(newSettings);
        return newSettings;
      }
    }
    
    writeLocal(newSettings);
    return newSettings;
  },

  /**
   * Reset to default settings
   */
  async resetToDefaults(): Promise<AppSettings> {
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .upsert(DEFAULT_SETTINGS)
          .select()
          .single();
        
        if (!error && data) {
          writeLocal(data);
          return data;
        }
      } catch (e) {
        console.warn("Error resetting app settings:", e);
      }
    }
    
    writeLocal(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  /**
   * Check if app is in maintenance mode
   */
  async isMaintenanceMode(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.maintenance_mode;
  },

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(feature: keyof Pick<AppSettings, 
    'enable_voice_chat' | 'enable_gifts' | 'enable_matching' | 
    'enable_music_rooms' | 'enable_agencies' | 'enable_store' | 'enable_games'>
  ): Promise<boolean> {
    const settings = await this.getSettings();
    return settings[feature] || false;
  },

  /**
   * Get a specific setting value
   */
  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.getSettings();
    return settings[key];
  },
};
