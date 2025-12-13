/**
 * Real-time Sync Service
 * Manages real-time synchronization with Supabase for Phase 1 features
 */

import { supabase, isSupabaseReady } from './db/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

type SyncCallback = (event: string, payload: Record<string, unknown>) => void;

export interface RealtimeSyncConfig {
  userId: string;
  onThemeChange?: SyncCallback;
  onEffectChange?: SyncCallback;
  onMissionUpdate?: SyncCallback;
  onWheelSpin?: SyncCallback;
}

class RealtimeSyncServiceClass {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Map<string, SyncCallback[]> = new Map();

  /**
   * Initialize real-time sync for a user
   */
  async initialize(config: RealtimeSyncConfig): Promise<void> {
    if (!isSupabaseReady || !supabase) {
      console.warn('Supabase not ready - real-time sync disabled');
      return;
    }

    const { userId, onThemeChange, onEffectChange, onMissionUpdate, onWheelSpin } = config;

    // Subscribe to room themes changes
    if (onThemeChange) {
      this.subscribeToThemes(userId, onThemeChange);
    }

    // Subscribe to voice effects changes
    if (onEffectChange) {
      this.subscribeToEffects(userId, onEffectChange);
    }

    // Subscribe to mission updates
    if (onMissionUpdate) {
      this.subscribeToMissions(userId, onMissionUpdate);
    }

    // Subscribe to wheel spins
    if (onWheelSpin) {
      this.subscribeToWheelSpins(userId, onWheelSpin);
    }
  }

  /**
   * Subscribe to theme changes
   */
  private subscribeToThemes(userId: string, callback: SyncCallback): void {
    if (!supabase) return;

    const channelName = `themes:${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_room_themes',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Theme change detected:', payload);
          callback(payload.eventType, payload.new);
          
          // Update localStorage for immediate UI update
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new as Record<string, unknown>;
            const storageKey = data.room_id 
              ? `active_room_theme_${userId}_${data.room_id}`
              : `active_room_theme_${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(data.theme_id));
          }
        }
      )
      .subscribe((status) => {
        console.log(`Theme subscription status: ${status}`);
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Subscribe to voice effect changes
   */
  private subscribeToEffects(userId: string, callback: SyncCallback): void {
    if (!supabase) return;

    const channelName = `effects:${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_voice_effects',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Voice effect change detected:', payload);
          callback(payload.eventType, payload.new);
          
          // Update localStorage
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new as Record<string, unknown>;
            localStorage.setItem(
              `voice_effects_active_${userId}`,
              JSON.stringify(data.effect_id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log(`Effect subscription status: ${status}`);
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Subscribe to mission updates
   */
  private subscribeToMissions(userId: string, callback: SyncCallback): void {
    if (!supabase) return;

    const channelName = `missions:${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_daily_missions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Mission update detected:', payload);
          callback(payload.eventType, payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`Mission subscription status: ${status}`);
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Subscribe to lucky wheel spins
   */
  private subscribeToWheelSpins(userId: string, callback: SyncCallback): void {
    if (!supabase) return;

    const channelName = `wheel:${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_lucky_wheel_spins',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New wheel spin detected:', payload);
          callback(payload.eventType, payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`Wheel subscription status: ${status}`);
      });

    this.channels.set(channelName, channel);
  }

  /**
   * Broadcast presence (user is online in a room)
   */
  async broadcastPresence(roomId: string, userId: string, userData: Record<string, unknown>): Promise<void> {
    if (!supabase) return;

    const channelName = `room:${roomId}`;
    
    let channel = this.channels.get(channelName);
    
    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
    }

    await channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel!.presenceState();
        console.log('Presence sync:', state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel!.track({
            user_id: userId,
            online_at: new Date().toISOString(),
            ...userData
          });
        }
      });
  }

  /**
   * Listen to room presence changes
   */
  onPresenceChange(roomId: string, callback: (presences: Record<string, unknown>) => void): void {
    if (!supabase) return;

    const channelName = `room:${roomId}`;
    let channel = this.channels.get(channelName);
    
    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
    }

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel!.presenceState();
      callback(state);
    });
  }

  /**
   * Cleanup - unsubscribe from all channels
   */
  cleanup(): void {
    this.channels.forEach((channel, name) => {
      console.log(`Unsubscribing from ${name}`);
      channel.unsubscribe();
    });
    this.channels.clear();
    this.callbacks.clear();
  }

  /**
   * Unsubscribe from specific channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  /**
   * Get active channels count
   */
  getActiveChannelsCount(): number {
    return this.channels.size;
  }

  /**
   * Check if subscribed to a channel
   */
  isSubscribed(channelName: string): boolean {
    return this.channels.has(channelName);
  }
}

export const RealtimeSyncService = new RealtimeSyncServiceClass();
