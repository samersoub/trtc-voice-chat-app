import { ChatRoom } from "@/models/ChatRoom";
import { supabase, isSupabaseReady, safe } from "@/services/db/supabaseClient";
import { TRTC } from "trtc-js-sdk";

const KEY = "voice:rooms";

function readRooms(): ChatRoom[] {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as ChatRoom[]) : [];
}

function writeRooms(rooms: ChatRoom[]) {
  localStorage.setItem(KEY, JSON.stringify(rooms));
}

async function hydrateRoomsFromDB() {
  if (!isSupabaseReady || !supabase) return;
  const { data, error } = await supabase.from("voice_rooms").select("*").eq('is_active', true).order("created_at", { ascending: false });
  if (error || !data) return;
  try {
    // Map DB rooms (only active rooms)
    const dbRooms = (data as any[]).map((r) => ({
      id: r.id,
      name: r.name,
      isPrivate: r.room_type === 'private',
      hostId: r.owner_id,
      participants: [r.owner_id],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      description: r.description || undefined,
      country: undefined,
      background: r.cover_image || undefined,
      moderators: [r.owner_id],
    })) as ChatRoom[];
    
    // Replace localStorage with DB data (DB is source of truth)
    writeRooms(dbRooms);
    console.log(`[VoiceChatService] Hydrated ${dbRooms.length} active rooms from DB`);
  } catch (e) {
    console.error('[VoiceChatService] Failed to hydrate rooms:', e);
  }
}

function syncUpsertRoom(room: ChatRoom) {
  if (!isSupabaseReady || !supabase) return;
  void safe(
    supabase.from("voice_rooms").upsert({
      id: room.id,
      name: room.name,
      room_type: room.isPrivate ? 'private' : 'public',
      owner_id: room.hostId,
      description: room.description ?? null,
      cover_image: room.background ?? null,
      is_active: true,
      created_at: room.createdAt,
      updated_at: room.updatedAt,
    })
  );
}

function syncDeleteRoom(id: string) {
  if (!isSupabaseReady || !supabase) return;
  void safe(supabase.from("voice_rooms").delete().eq("id", id));
}

const SDKAppID = 20031795;
const SecretKey = process.env.TRTC_SECRET_KEY;

function generateUserSig(userId: string): string {
  if (!SecretKey) {
    throw new Error("TRTC SecretKey is not defined in environment variables.");
  }

  const expireTime = 604800; // 7 days
  const currentTime = Math.floor(Date.now() / 1000);

  const sigData = {
    userId,
    expireTime,
    currentTime,
    SDKAppID,
  };

  const sigString = JSON.stringify(sigData);
  const hash = require("crypto").createHmac("sha256", SecretKey).update(sigString).digest("hex");

  return hash;
}

export const VoiceChatService = {
  listRooms(): ChatRoom[] {
    void hydrateRoomsFromDB();
    return readRooms();
  },
  
  async getUserRoom(userId: string): Promise<ChatRoom | null> {
    // البحث عن غرفة المستخدم (نشطة أو غير نشطة)
    if (!isSupabaseReady || !supabase) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from("voice_rooms")
        .select("*")
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) {
        console.log('[VoiceChatService] No existing room found for user:', userId);
        return null;
      }
      
      const room: ChatRoom = {
        id: data.id,
        name: data.name,
        isPrivate: data.room_type === 'private',
        hostId: data.owner_id,
        participants: [data.owner_id],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        description: data.description || undefined,
        country: undefined,
        background: data.cover_image || undefined,
        moderators: [data.owner_id],
      };
      
      console.log('[VoiceChatService] Found existing room:', room.id, 'is_active:', data.is_active);
      return room;
    } catch (err) {
      console.error('[VoiceChatService] Error finding user room:', err);
      return null;
    }
  },
  
  async reactivateRoom(room: ChatRoom): Promise<ChatRoom> {
    // إعادة تفعيل الغرفة الموجودة
    room.updatedAt = new Date().toISOString();
    room.participants = [room.hostId];
    
    const rooms = readRooms();
    const idx = rooms.findIndex(r => r.id === room.id);
    if (idx !== -1) {
      rooms[idx] = room;
    } else {
      rooms.push(room);
    }
    writeRooms(rooms);
    
    // تحديث في DB مع is_active = true
    if (isSupabaseReady && supabase) {
      await safe(
        supabase.from("voice_rooms").upsert({
          id: room.id,
          name: room.name,
          room_type: room.isPrivate ? 'private' : 'public',
          owner_id: room.hostId,
          description: room.description ?? null,
          cover_image: room.background ?? null,
          is_active: true, // ⭐ إعادة تفعيل
          updated_at: room.updatedAt,
        })
      );
      console.log('[VoiceChatService] Room reactivated:', room.id);
    }
    
    return room;
  },
  
  createRoom(name: string, isPrivate: boolean, hostId: string, country: string, description?: string, background?: string): ChatRoom {
    const room: ChatRoom = {
      id: crypto.randomUUID(),
      name,
      isPrivate,
      hostId,
      participants: [hostId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description,
      country,
      background,
      moderators: [hostId],
    };
    const rooms = readRooms();
    rooms.push(room);
    writeRooms(rooms);
    syncUpsertRoom(room);
    return room;
  },
  updateRoomHost(id: string, hostId: string): ChatRoom {
    const rooms = readRooms();
    const idx = rooms.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Room not found");
    const room = rooms[idx];
    room.hostId = hostId;
    if (!room.participants.includes(hostId)) {
      room.participants.push(hostId);
    }
    room.updatedAt = new Date().toISOString();
    rooms[idx] = room;
    writeRooms(rooms);
    syncUpsertRoom(room);
    return room;
  },
  getRoom(id: string): ChatRoom | undefined {
    void hydrateRoomsFromDB();
    return readRooms().find(r => r.id === id);
  },
  saveRoom(room: ChatRoom) {
    const rooms = readRooms();
    const idx = rooms.findIndex((r) => r.id === room.id);
    if (idx === -1) {
      rooms.push(room);
    } else {
      rooms[idx] = room;
    }
    writeRooms(rooms);
    syncUpsertRoom(room);
    return room;
  },
  joinRoom(id: string, userId: string): ChatRoom {
    const rooms = readRooms();
    const idx = rooms.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Room not found");
    const room = rooms[idx];
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      room.updatedAt = new Date().toISOString();
      rooms[idx] = room;
      writeRooms(rooms);
      syncUpsertRoom(room);
    }
    return room;
  },
  leaveRoom(id: string, userId: string): ChatRoom {
    const rooms = readRooms();
    const idx = rooms.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Room not found");
    const room = rooms[idx];
    room.participants = room.participants.filter(p => p !== userId);
    room.updatedAt = new Date().toISOString();
    rooms[idx] = room;
    writeRooms(rooms);
    syncUpsertRoom(room);
    return room;
  },
  deleteRoom(id: string) {
    const rooms = readRooms().filter(r => r.id !== id);
    writeRooms(rooms);
    syncDeleteRoom(id);
  },
};