import { supabase, isSupabaseReady } from './db/supabaseClient';

/**
 * Room Cleanup Service - تنظيف الغرف الفارغة والمشاركين غير النشطين
 * 
 * Features:
 * - Auto cleanup inactive rooms
 * - Remove stale participants
 * - Hide empty rooms
 */
export class RoomCleanupService {
  
  /**
   * تنظيف الغرف الفارغة (بدون مشاركين نشطين)
   * Clean up empty rooms (no active participants)
   */
  static async cleanupEmptyRooms(): Promise<number> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomCleanup] Supabase not ready');
      return 0;
    }

    try {
      // Find rooms with no active participants
      const { data: emptyRooms, error } = await supabase
        .from('voice_rooms')
        .select('id, name, current_participants, is_active')
        .eq('current_participants', 0)
        .eq('is_active', true);

      if (error) {
        console.error('[RoomCleanup] Error finding empty rooms:', error);
        return 0;
      }

      if (!emptyRooms || emptyRooms.length === 0) {
        console.log('[RoomCleanup] No empty rooms to clean up');
        return 0;
      }

      // Mark empty rooms as inactive
      const roomIds = emptyRooms.map(r => r.id);
      const { error: updateError } = await supabase
        .from('voice_rooms')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .in('id', roomIds);

      if (updateError) {
        console.error('[RoomCleanup] Error deactivating empty rooms:', updateError);
        return 0;
      }

      console.log(`[RoomCleanup] Deactivated ${emptyRooms.length} empty rooms:`, roomIds);
      return emptyRooms.length;
    } catch (error) {
      console.error('[RoomCleanup] Exception in cleanupEmptyRooms:', error);
      return 0;
    }
  }

  /**
   * تنظيف المشاركين غير النشطين (أكثر من X دقيقة)
   * Clean up inactive participants (older than X minutes)
   */
  static async cleanupInactiveParticipants(olderThanMinutes: number = 30): Promise<number> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomCleanup] Supabase not ready');
      return 0;
    }

    try {
      const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();

      // Find participants who are still marked online but joined long ago
      const { data: staleParticipants, error: findError } = await supabase
        .from('room_participants')
        .select('id, room_id, user_id')
        .eq('is_online', true)
        .is('left_at', null)
        .lt('joined_at', cutoffTime);

      if (findError) {
        console.error('[RoomCleanup] Error finding stale participants:', findError);
        return 0;
      }

      if (!staleParticipants || staleParticipants.length === 0) {
        console.log('[RoomCleanup] No stale participants to clean up');
        return 0;
      }

      // Mark as offline
      const { error: updateError } = await supabase
        .from('room_participants')
        .update({
          is_online: false,
          left_at: new Date().toISOString()
        })
        .eq('is_online', true)
        .is('left_at', null)
        .lt('joined_at', cutoffTime);

      if (updateError) {
        console.error('[RoomCleanup] Error updating stale participants:', updateError);
        return 0;
      }

      console.log(`[RoomCleanup] Cleaned up ${staleParticipants.length} stale participants`);
      
      // After cleanup, check for empty rooms
      await this.cleanupEmptyRooms();
      
      return staleParticipants.length;
    } catch (error) {
      console.error('[RoomCleanup] Exception in cleanupInactiveParticipants:', error);
      return 0;
    }
  }

  /**
   * تنظيف الغرف القديمة جداً (أكثر من X ساعات وغير نشطة)
   * Clean up very old inactive rooms (older than X hours)
   */
  static async cleanupOldInactiveRooms(olderThanHours: number = 24): Promise<number> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomCleanup] Supabase not ready');
      return 0;
    }

    try {
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();

      const { data: oldRooms, error: findError } = await supabase
        .from('voice_rooms')
        .select('id, name')
        .eq('is_active', false)
        .lt('updated_at', cutoffTime);

      if (findError) {
        console.error('[RoomCleanup] Error finding old rooms:', findError);
        return 0;
      }

      if (!oldRooms || oldRooms.length === 0) {
        console.log('[RoomCleanup] No old rooms to delete');
        return 0;
      }

      // Delete old inactive rooms
      const roomIds = oldRooms.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('voice_rooms')
        .delete()
        .in('id', roomIds);

      if (deleteError) {
        console.error('[RoomCleanup] Error deleting old rooms:', deleteError);
        return 0;
      }

      console.log(`[RoomCleanup] Deleted ${oldRooms.length} old inactive rooms`);
      return oldRooms.length;
    } catch (error) {
      console.error('[RoomCleanup] Exception in cleanupOldInactiveRooms:', error);
      return 0;
    }
  }

  /**
   * تشغيل جميع عمليات التنظيف
   * Run all cleanup operations
   */
  static async runFullCleanup(): Promise<{
    emptyRooms: number;
    staleParticipants: number;
    oldRooms: number;
  }> {
    console.log('[RoomCleanup] Starting full cleanup...');
    
    const staleParticipants = await this.cleanupInactiveParticipants(30);
    const emptyRooms = await this.cleanupEmptyRooms();
    const oldRooms = await this.cleanupOldInactiveRooms(24);
    
    console.log('[RoomCleanup] Full cleanup completed:', {
      staleParticipants,
      emptyRooms,
      oldRooms
    });
    
    return { emptyRooms, staleParticipants, oldRooms };
  }

  /**
   * بدء cleanup تلقائي دوري
   * Start automatic periodic cleanup
   */
  static startPeriodicCleanup(intervalMinutes: number = 10): () => void {
    console.log(`[RoomCleanup] Starting periodic cleanup every ${intervalMinutes} minutes`);
    
    // Run immediately
    this.runFullCleanup();
    
    // Then run periodically
    const interval = setInterval(() => {
      this.runFullCleanup();
    }, intervalMinutes * 60 * 1000);
    
    // Return cleanup function
    return () => {
      console.log('[RoomCleanup] Stopping periodic cleanup');
      clearInterval(interval);
    };
  }

  /**
   * فرض إخفاء غرفة محددة
   * Force hide a specific room
   */
  static async forceHideRoom(roomId: string): Promise<boolean> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomCleanup] Supabase not ready');
      return false;
    }

    try {
      const { error } = await supabase
        .from('voice_rooms')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) {
        console.error('[RoomCleanup] Error hiding room:', error);
        return false;
      }

      console.log(`[RoomCleanup] Forced room ${roomId} to inactive`);
      return true;
    } catch (error) {
      console.error('[RoomCleanup] Exception in forceHideRoom:', error);
      return false;
    }
  }

  /**
   * إحصائيات الغرف
   * Room statistics
   */
  static async getRoomStatistics(): Promise<{
    totalRooms: number;
    activeRooms: number;
    inactiveRooms: number;
    emptyRooms: number;
    totalParticipants: number;
  } | null> {
    if (!isSupabaseReady || !supabase) {
      console.warn('[RoomCleanup] Supabase not ready');
      return null;
    }

    try {
      // Get room counts
      const { count: totalRooms } = await supabase
        .from('voice_rooms')
        .select('*', { count: 'exact', head: true });

      const { count: activeRooms } = await supabase
        .from('voice_rooms')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: inactiveRooms } = await supabase
        .from('voice_rooms')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false);

      const { count: emptyRooms } = await supabase
        .from('voice_rooms')
        .select('*', { count: 'exact', head: true })
        .eq('current_participants', 0);

      const { count: totalParticipants } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      const stats = {
        totalRooms: totalRooms || 0,
        activeRooms: activeRooms || 0,
        inactiveRooms: inactiveRooms || 0,
        emptyRooms: emptyRooms || 0,
        totalParticipants: totalParticipants || 0,
      };

      console.log('[RoomCleanup] Statistics:', stats);
      return stats;
    } catch (error) {
      console.error('[RoomCleanup] Exception in getRoomStatistics:', error);
      return null;
    }
  }
}
