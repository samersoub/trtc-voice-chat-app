"use client";

export type RoomType = "social" | "party" | "vip-exclusive";

export interface RoomSettings {
  roomId: string;
  type: RoomType;
  maxSpeakers: number;
  maxListeners: number;
  moderatorsLimit: number;
  // UI / feature toggles
  hideReports?: boolean;
  showSeatFrames?: boolean; // whether seat avatars have decorative frames
  chatFormatting?: "compact" | "formatted";
  entryNotifications?: boolean;
}

const KEY = (roomId: string) => `room:settings:${roomId}`;

const TYPE_LIMITS: Record<RoomType, number> = {
  social: 2,
  party: 3,
  "vip-exclusive": 5,
};

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const RoomSettingsService = {
  getSettings(roomId: string): RoomSettings {
    const fallback: RoomSettings = {
      roomId,
      type: "social",
      maxSpeakers: 10,
      maxListeners: 100,
      moderatorsLimit: TYPE_LIMITS["social"],
      hideReports: false,
      showSeatFrames: true,
      chatFormatting: "compact",
      entryNotifications: true,
    };
    const s = read<RoomSettings>(KEY(roomId), fallback);
    // Normalize limit based on type if missing
    if (!s.moderatorsLimit || s.moderatorsLimit < 1) {
      s.moderatorsLimit = TYPE_LIMITS[s.type];
      write(KEY(roomId), s);
    }
    return s;
  },
  setRoomType(roomId: string, type: RoomType) {
    const s = this.getSettings(roomId);
    s.type = type;
    s.moderatorsLimit = TYPE_LIMITS[type];
    write(KEY(roomId), s);
    return s;
  },
  configure(roomId: string, opts: Partial<Omit<RoomSettings, "roomId" | "type">>) {
    const s = this.getSettings(roomId);
    if (typeof opts.maxSpeakers === "number") s.maxSpeakers = Math.max(1, Math.min(64, opts.maxSpeakers));
    if (typeof opts.maxListeners === "number") s.maxListeners = Math.max(1, Math.min(10000, opts.maxListeners));
    if (typeof opts.moderatorsLimit === "number") s.moderatorsLimit = Math.max(1, Math.min(100, opts.moderatorsLimit));
    write(KEY(roomId), s);
    return s;
  },
};