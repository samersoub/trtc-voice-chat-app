import { ChatRoom } from "@/models/ChatRoom";
import { supabase, isSupabaseReady, safe } from "@/services/db/supabaseClient";

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
    // Get existing local rooms
    const existingRooms = readRooms();
    const existingIds = new Set(existingRooms.map(r => r.id));
    
    // Map DB rooms
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
    
    // Merge: keep existing local rooms and add new DB rooms
    const mergedRooms = [...existingRooms];
    for (const dbRoom of dbRooms) {
      if (!existingIds.has(dbRoom.id)) {
        mergedRooms.push(dbRoom);
      } else {
        // Update existing room data from DB
        const idx = mergedRooms.findIndex(r => r.id === dbRoom.id);
        if (idx !== -1) {
          mergedRooms[idx] = { ...mergedRooms[idx], ...dbRoom };
        }
      }
    }
    
    writeRooms(mergedRooms);
  } catch {
    // ignore mapping errors
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

export const VoiceChatService = {
  listRooms(): ChatRoom[] {
    void hydrateRoomsFromDB();
    return readRooms();
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