import { supabase, isSupabaseReady } from './db/supabaseClient';

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'speaker' | 'listener';
  mic_seat?: number;
  is_muted: boolean;
  joined_at: string;
  left_at?: string;
  is_online: boolean;
}

/**
 * Room Participant Service - إدارة المشاركين في الغرف الصوتية
 * 
 * Features:
 * - Join/Leave rooms with automatic participant tracking
 * - Real-time participant count updates
 * - Auto-hide empty rooms
 * - Track user online status
 */
export class RoomParticipantService {

  /**
   * إضافة مستخدم للغرفة (دخول الغرفة)
   * Join a room as a participant
   */
  static async joinRoom(roomId: string, userId: string, role: 'owner' | 'admin' | 'speaker' | 'listener' = 'listener'): Promise<boolean> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - graceful degradation');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('room_participants')
        .upsert({
          room_id: roomId,
          user_id: userId,
          role,
          is_online: true,
          is_muted: false,
          joined_at: new Date().toISOString(),
          left_at: null,
        }, {
          onConflict: 'room_id,user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('[RoomParticipant] Failed to join room:', error);
        return false;
      }

      console.log(`[RoomParticipant] User ${userId} joined room ${roomId} as ${role}`);
      return true;
    } catch (err) {
      console.error('[RoomParticipant] Exception joining room:', err);
      return false;
    }
  }

  /**
   * إزالة مستخدم من الغرفة (خروج من الغرفة)
   * Leave a room
   */
  static async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - graceful degradation');
      return false;
    }

    try {
      // نقوم بتحديث is_online بدلاً من الحذف للحفاظ على السجل
      // Update is_online instead of deleting to keep history
      const { error } = await supabase
        .from('room_participants')
        .update({
          is_online: false,
          left_at: new Date().toISOString(),
        })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) {
        console.error('[RoomParticipant] Failed to leave room:', error);
        return false;
      }

      console.log(`[RoomParticipant] User ${userId} left room ${roomId}`);

      // التحقق إذا كانت الغرفة فارغة الآن
      await this.checkAndHideEmptyRoom(roomId);

      return true;
    } catch (err) {
      console.error('[RoomParticipant] Exception leaving room:', err);
      return false;
    }
  }

  /**
   * الحصول على المستخدمين الموجودين في الغرفة
   * Get online participants in a room
   */
  static async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - returning empty array');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('room_participants')
        .select(`
          *,
          users:user_id (
            id,
            username,
            full_name,
            avatar_url,
            profile_image
          )
        `)
        .eq('room_id', roomId)
        .eq('is_online', true)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('[RoomParticipant] Failed to get participants:', error);
        return [];
      }

      return (data || []) as RoomParticipant[];
    } catch (err) {
      console.error('[RoomParticipant] Exception getting participants:', err);
      return [];
    }
  }

  /**
   * الحصول على عدد المستخدمين في الغرفة
   * Get participant count for a room
   */
  static async getParticipantCount(roomId: string): Promise<number> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - returning 0');
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .eq('is_online', true)
        .is('left_at', null);

      if (error) {
        console.error('[RoomParticipant] Failed to get count:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('[RoomParticipant] Exception getting count:', err);
      return 0;
    }
  }

  /**
   * التحقق وإخفاء الغرفة إذا كانت فارغة
   * Check and hide room if empty
   */
  private static async checkAndHideEmptyRoom(roomId: string): Promise<void> {
    if (!isSupabaseReady || !supabase) return;

    try {
      const count = await this.getParticipantCount(roomId);

      if (count === 0) {
        // إخفاء الغرفة إذا كانت فارغة
        await supabase
          .from('voice_rooms')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', roomId);

        console.log(`[RoomParticipant] Room ${roomId} hidden (empty)`);
      }
    } catch (err) {
      console.error('[RoomParticipant] Exception checking empty room:', err);
    }
  }

  /**
   * تحديث دور المستخدم في الغرفة
   * Update user role in room
   */
  static async updateRole(roomId: string, userId: string, role: 'owner' | 'admin' | 'speaker' | 'listener'): Promise<boolean> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - graceful degradation');
      return false;
    }

    try {
      const { error } = await supabase
        .from('room_participants')
        .update({ role })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) {
        console.error('[RoomParticipant] Failed to update role:', error);
        return false;
      }

      console.log(`[RoomParticipant] User ${userId} role updated to ${role} in room ${roomId}`);
      return true;
    } catch (err) {
      console.error('[RoomParticipant] Exception updating role:', err);
      return false;
    }
  }

  /**
   * تحديث حالة الميكروفون
   * Update mic mute status
   */
  static async updateMicStatus(roomId: string, userId: string, isMuted: boolean): Promise<boolean> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - graceful degradation');
      return false;
    }

    try {
      const { error } = await supabase
        .from('room_participants')
        .update({ is_muted: isMuted })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) {
        console.error('[RoomParticipant] Failed to update mic status:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[RoomParticipant] Exception updating mic status:', err);
      return false;
    }
  }

  /**
   * الاشتراك في تحديثات المشاركين real-time
   * Subscribe to real-time participant updates
   */
  static subscribeToRoomParticipants(
    roomId: string,
    onUpdate: (participants: RoomParticipant[]) => void
  ): (() => void) | null {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - subscription not available');
      return null;
    }

    const channel = supabase
      .channel(`room_participants:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // Fetch updated participants
          const participants = await this.getRoomParticipants(roomId);
          onUpdate(participants);
        }
      )
      .subscribe();

    console.log(`[RoomParticipant] Subscribed to room ${roomId} participants`);

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      console.log(`[RoomParticipant] Unsubscribed from room ${roomId} participants`);
    };
  }

  /**
   * تنظيف المستخدمين غير النشطين (للصيانة)
   * Clean up inactive participants (maintenance)
   */
  static async cleanupInactiveParticipants(olderThanMinutes: number = 30): Promise<number> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomParticipant] Supabase not ready - graceful degradation');
      return 0;
    }

    try {
      const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('room_participants')
        .update({
          is_online: false,
          left_at: new Date().toISOString(),
        })
        .eq('is_online', true)
        .lt('joined_at', cutoffTime)
        .select('room_id');

      if (error) {
        console.error('[RoomParticipant] Failed to cleanup inactive:', error);
        return 0;
      }

      const count = data?.length || 0;
      console.log(`[RoomParticipant] Cleaned up ${count} inactive participants`);

      // Check and hide empty rooms
      const uniqueRoomIds = [...new Set(data?.map(p => p.room_id) || [])];
      for (const roomId of uniqueRoomIds) {
        await this.checkAndHideEmptyRoom(roomId);
      }

      return count;
      return count;
    } catch (err) {
      console.error('[RoomParticipant] Exception cleaning up inactive:', err);
      return 0;
    }
  }

  /**
   * الانضمام إلى مقعد (تحديث رقم المقعد)
   * Join a specific seat
   */
  static async joinSeat(roomId: string, userId: string, seatNumber: number): Promise<boolean> {
    if (!isSupabaseReady || !supabase) return false;

    try {
      // First ensure user is in the room
      await this.joinRoom(roomId, userId, 'speaker');

      const { error } = await supabase
        .from('room_participants')
        .update({ mic_seat: seatNumber, role: 'speaker' })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) {
        console.error('[RoomParticipant] Failed to join seat:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[RoomParticipant] Exception joining seat:', err);
      return false;
    }
  }

  /**
   * مغادرة المقعد (العودة لكونه مستمعاً)
   * Leave seat (become listener)
   */
  static async leaveSeat(roomId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady || !supabase) return false;

    try {
      const { error } = await supabase
        .from('room_participants')
        .update({ mic_seat: null, role: 'listener' })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) {
        console.error('[RoomParticipant] Failed to leave seat:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[RoomParticipant] Exception leaving seat:', err);
      return false;
    }
  }
}
