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
  const { data, error } = await supabase.from("chat_rooms").select("*").order("createdAt", { ascending: false });
  if (error || !data) return;
  try {
    const rooms = (data as any[]).map((r) => ({
      id: r.id,
      name: r.name,
      isPrivate: !!r.isPrivate,
      hostId: r.hostId,
      participants: Array.isArray(r.participants) ? r.participants : [],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      description: r.description || undefined,
      country: r.country || undefined,
    })) as ChatRoom[];
    writeRooms(rooms);
  } catch {
    // ignore mapping errors
  }
}

function syncUpsertRoom(room: ChatRoom) {
  if (!isSupabaseReady || !supabase) return;
  void safe(
    supabase.from("chat_rooms").upsert({
      id: room.id,
      name: room.name,
      isPrivate: room.isPrivate,
      hostId: room.hostId,
      participants: room.participants,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      description: room.description ?? null,
      country: room.country ?? null,
    })
  );
}

function syncDeleteRoom(id: string) {
  if (!isSupabaseReady || !supabase) return;
  void safe(supabase.from("chat_rooms").delete().eq("id", id));
}

export const VoiceChatService = {
  listRooms(): ChatRoom[] {
    void hydrateRoomsFromDB();
    return readRooms();
  },
  createRoom(name: string, isPrivate: boolean, hostId: string, country: string, description?: string): ChatRoom {
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