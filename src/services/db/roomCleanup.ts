import { supabase, isSupabaseReady } from './supabaseClient';

/**
 * تنظيف جميع المقاعد القديمة من الغرفة
 */
export async function cleanupRoomSeats(roomId: string) {
  if (!isSupabaseReady || !supabase) {
    console.warn('Supabase not ready');
    return { success: false, error: 'Supabase not ready' };
  }

  try {
    console.log('🧹 Cleaning up all seats in room:', roomId);
    
    const { error } = await supabase
      .from('voice_room_seats')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      console.error('Failed to cleanup seats:', error);
      return { success: false, error };
    }

    console.log('✅ Room seats cleaned');
    return { success: true };
  } catch (error) {
    console.error('Error cleaning room:', error);
    return { success: false, error };
  }
}

/**
 * تنظيف المقاعد القديمة (أقدم من ساعتين)
 */
export async function cleanupOldSeats() {
  if (!isSupabaseReady || !supabase) {
    return { success: false, error: 'Supabase not ready' };
  }

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('voice_room_seats')
      .delete()
      .lt('joined_at', twoHoursAgo);

    if (error) {
      console.error('Failed to cleanup old seats:', error);
      return { success: false, error };
    }

    console.log('✅ Old seats cleaned');
    return { success: true };
  } catch (error) {
    console.error('Error cleaning old seats:', error);
    return { success: false, error };
  }
}

/**
 * إزالة مستخدم من جميع المقاعد في الغرفة
 */
export async function removeUserFromSeats(roomId: string, userId: string) {
  if (!isSupabaseReady || !supabase) {
    return { success: false, error: 'Supabase not ready' };
  }

  try {
    const { error } = await supabase
      .from('voice_room_seats')
      .delete()
      .match({ room_id: roomId, user_id: userId });

    if (error) {
      console.error('Failed to remove user from seats:', error);
      return { success: false, error };
    }

    console.log('✅ User removed from seats');
    return { success: true };
  } catch (error) {
    console.error('Error removing user:', error);
    return { success: false, error };
  }
}
