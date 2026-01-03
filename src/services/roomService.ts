"use client";

import { RoomData } from "@/models/RoomData";
import { supabase, isSupabaseReady } from "./db/supabaseClient";

/**
 * Fetches active voice rooms from Supabase
 * PRODUCTION MODE - No demo data
 */
export async function fetchActiveRooms(): Promise<RoomData[]> {
  if (!isSupabaseReady || !supabase) {
    console.warn('⚠️ Supabase not ready - cannot fetch rooms');
    return [];
  }

  try {
    // Fetch rooms from Supabase
    const { data: rooms, error } = await supabase
      .from('voice_rooms')
      .select(`
        id,
        name,
        cover_image,
        room_type,
        max_participants,
        owner_id,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch rooms:', error);
      return [];
    }

    if (!rooms || rooms.length === 0) {
      console.log('📭 No active rooms found');
      return [];
    }

    // Fetch participant counts for each room
    const roomsWithCounts = await Promise.all(
      rooms.map(async (room) => {
        // Get participant count
        const { count } = await supabase
          .from('room_participants')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id)
          .eq('is_online', true);

        // Get host info
        const { data: host } = await supabase
          .from('users')
          .select('username, level, city')
          .eq('id', room.owner_id)
          .single();

        // Map to RoomData format
        return {
          id: room.id,
          title: room.name,
          coverImage: room.cover_image || 'https://images.unsplash.com/photo-1519682335074-1c3b3b66f2d4?q=80&w=1200&auto=format&fit=crop',
          hostName: host?.username || 'Unknown',
          hostLevel: host?.level || 1,
          listenerCount: count || 0,
          countryFlag: getCountryFlag(host?.city),
          tags: getRoomTags(room.room_type, count || 0)
        } as RoomData;
      })
    );

    console.log(`✅ Loaded ${roomsWithCounts.length} active rooms from Supabase`);
    return roomsWithCounts;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}

/**
 * Get country flag emoji based on city
 */
function getCountryFlag(city?: string): string {
  if (!city) return 'SA'; // Default to Saudi Arabia
  
  const cityToCountry: Record<string, string> = {
    'الرياض': 'SA',
    'جدة': 'SA',
    'مكة': 'SA',
    'المدينة': 'SA',
    'القاهرة': 'EG',
    'دبي': 'AE',
    'أبوظبي': 'AE',
    'بيروت': 'LB',
    'عمان': 'JO',
    'دمشق': 'SY',
    'بغداد': 'IQ',
    'صنعاء': 'YE',
    'مسقط': 'OM',
    'الكويت': 'KW',
    'المنامة': 'BH',
    'الدوحة': 'QA'
  };

  return cityToCountry[city] || 'SA';
}

/**
 * Generate room tags based on type and listener count
 */
function getRoomTags(roomType?: string, listenerCount?: number): string[] {
  const tags: string[] = [];
  
  if (listenerCount && listenerCount > 100) {
    tags.push('Popular');
  }
  
  if (roomType === 'agency') {
    tags.push('Agency');
  } else if (roomType === 'music') {
    tags.push('Music');
  } else if (roomType === 'chat') {
    tags.push('Chat');
  }
  
  return tags;
}