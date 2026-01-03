import { supabase } from '@/lib/supabase';
import { Room, RoomParticipant, MicRequest } from '@/types/room';

export class RoomService {
  static async createRoom(roomName: string, adminId: string): Promise<Room> {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name: roomName,
        admin_id: adminId,
        room_code: roomCode,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async joinRoom(roomId: string, userId: string): Promise<RoomParticipant> {
    // Check if user is already in room
    const { data: existing } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: userId,
        mic_status: 'none',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async getRoomByCode(roomCode: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        admin:users!rooms_admin_id_fkey(*)
      `)
      .eq('room_code', roomCode)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  static async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    const { data, error } = await supabase
      .from('room_participants')
      .select(`
        *,
        user:users(*)
      `)
      .eq('room_id', roomId);

    if (error) throw error;
    return data || [];
  }

  static async raiseHand(userId: string, roomId: string): Promise<MicRequest> {
    // First update participant status
    await supabase
      .from('room_participants')
      .update({ mic_status: 'requested' })
      .eq('user_id', userId)
      .eq('room_id', roomId);

    // Create mic request
    const { data, error } = await supabase
      .from('mic_requests')
      .insert({
        user_id: userId,
        room_id: roomId,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async grantMic(adminId: string, userId: string, roomId: string): Promise<void> {
    // Check if admin owns the room
    const { data: room } = await supabase
      .from('rooms')
      .select('admin_id')
      .eq('id', roomId)
      .single();

    if (!room || room.admin_id !== adminId) {
      throw new Error('Unauthorized: Only room admin can grant mic access');
    }

    // Check current mic holders (max 2)
    const { data: currentMicHolders } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('mic_status', 'granted');

    if (currentMicHolders && currentMicHolders.length >= 2) {
      throw new Error('Maximum 2 users can have mic access at once');
    }

    // Grant mic access
    await supabase
      .from('room_participants')
      .update({ mic_status: 'granted' })
      .eq('user_id', userId)
      .eq('room_id', roomId);

    // Update mic request
    await supabase
      .from('mic_requests')
      .update({ status: 'approved' })
      .eq('user_id', userId)
      .eq('room_id', roomId)
      .eq('status', 'pending');
  }

  static async revokeMic(adminId: string, userId: string, roomId: string): Promise<void> {
    // Check if admin owns the room
    const { data: room } = await supabase
      .from('rooms')
      .select('admin_id')
      .eq('id', roomId)
      .single();

    if (!room || room.admin_id !== adminId) {
      throw new Error('Unauthorized: Only room admin can revoke mic access');
    }

    // Revoke mic access
    await supabase
      .from('room_participants')
      .update({ mic_status: 'none' })
      .eq('user_id', userId)
      .eq('room_id', roomId);
  }

  static async getPendingMicRequests(roomId: string): Promise<MicRequest[]> {
    const { data, error } = await supabase
      .from('mic_requests')
      .select(`
        *,
        user:users(*)
      `)
      .eq('room_id', roomId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static subscribeToRoomUpdates(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mic_requests',
          filter: `room_id=eq.${roomId}`,
        },
        callback
      )
      .subscribe();
  }
}