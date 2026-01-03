"use client";

import { MusicTrack } from "@/models/MusicTrack";
import { Playlist } from "@/models/Playlist";
import { RoomMusicState, RequestItem } from "@/models/RoomMusic";
import { NotificationHelper } from "@/utils/NotificationHelper";

type SpotifyConfig = { clientId: string; clientSecret: string };

type MusicCategory = { key: string; label: string; color: string };

const KEYS = {
  spotify: "music:spotify",
  roomMusic: (roomId: string) => `music:room:${roomId}`,
  requests: (roomId: string) => `music:requests:${roomId}`,
};

const CATEGORIES: MusicCategory[] = [
  { key: "pop", label: "Pop", color: "#FF6B6B" },
  { key: "hiphop", label: "HipHop", color: "#4ECDC4" },
  { key: "electronic", label: "Electronic", color: "#45B7D1" },
];

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: "default",
    name: "Default",
    isPublic: true,
    tracks: [
      { id: "t1", title: "Sunrise Drive", artist: "Nova", source: "url", duration: 180 },
      { id: "t2", title: "Night Breeze", artist: "Echo", source: "url", duration: 210 },
    ],
  },
  {
    id: "vip-exclusive",
    name: "VIP Exclusive",
    vipOnly: true,
    tracks: [
      { id: "v1", title: "Diamond Waves", artist: "Lux", source: "url", duration: 200 },
      { id: "v2", title: "Golden Pulse", artist: "Aurum", source: "url", duration: 195 },
    ],
  },
  {
    id: "trending",
    name: "Trending",
    isPublic: true,
    autoUpdateWeekly: true,
    tracks: [
      { id: "tr1", title: "City Lights", artist: "Metro", source: "url", duration: 175 },
      { id: "tr2", title: "Skyline", artist: "Urban", source: "url", duration: 165 },
    ],
  },
];

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

function ensureRoomState(roomId: string): RoomMusicState {
  const state = read<RoomMusicState>(KEYS.roomMusic(roomId), {
    roomId,
    currentTrack: null,
    volume: 0.8,
    isPlaying: false,
  });
  write(KEYS.roomMusic(roomId), state);
  return state;
}

export const MusicService = {
  // Spotify config
  setSpotifyConfig(cfg: SpotifyConfig) {
    write(KEYS.spotify, cfg);
  },
  getSpotifyConfig(): SpotifyConfig | null {
    return read<SpotifyConfig | null>(KEYS.spotify, null);
  },

  // Categories and playlists
  getCategories(): MusicCategory[] {
    return CATEGORIES.slice();
  },
  getPlaylists(): Playlist[] {
    return DEFAULT_PLAYLISTS.slice();
  },

  // Room music state
  getRoomMusic(roomId: string): RoomMusicState {
    return ensureRoomState(roomId);
  },
  setVolume(roomId: string, vol: number): RoomMusicState {
    const st = ensureRoomState(roomId);
    const next = { ...st, volume: Math.max(0, Math.min(1, vol)) };
    write(KEYS.roomMusic(roomId), next);
    return next;
  },
  play(roomId: string, track: MusicTrack): RoomMusicState {
    const st = ensureRoomState(roomId);
    const next = { ...st, currentTrack: track, isPlaying: true };
    write(KEYS.roomMusic(roomId), next);
    NotificationHelper.notify("Playing music", `${track.title} ${track.artist ? "— " + track.artist : ""}`);
    return next;
  },
  pause(roomId: string): RoomMusicState {
    const st = ensureRoomState(roomId);
    const next = { ...st, isPlaying: false };
    write(KEYS.roomMusic(roomId), next);
    return next;
  },
  skip(roomId: string): RoomMusicState {
    const st = ensureRoomState(roomId);
    const next = { ...st, currentTrack: null, isPlaying: false };
    write(KEYS.roomMusic(roomId), next);
    return next;
  },

  // Requests and voting
  getQueue(roomId: string): RequestItem[] {
    const q = read<RequestItem[]>(KEYS.requests(roomId), []);
    return q
      .slice()
      .sort((a, b) => {
        if (a.approved !== b.approved) return a.approved ? -1 : 1;
        if (a.played !== b.played) return a.played ? 1 : -1;
        return b.votes - a.votes;
      });
  },
  addRequest(roomId: string, track: MusicTrack, requesterId: string, isVip = false): RequestItem[] {
    const q = read<RequestItem[]>(KEYS.requests(roomId), []);
    const item: RequestItem = {
      id: `req_${Math.random().toString(36).slice(2, 10)}`,
      track,
      requesterId,
      votes: isVip ? 2 : 0, // VIP-first priority: +2 initial votes
      approved: false,
      played: false,
      createdAt: Date.now(),
    };
    q.push(item);
    write(KEYS.requests(roomId), q);
    NotificationHelper.notify("Song requested", `${track.title}`);
    return this.getQueue(roomId);
  },
  vote(roomId: string, requestId: string, voterId: string, threshold = 5, autoPlay = true): RequestItem[] {
    const q = read<RequestItem[]>(KEYS.requests(roomId), []);
    const idx = q.findIndex((r) => r.id === requestId);
    if (idx === -1) return q;
    q[idx].votes += 1;
    if (!q[idx].approved && q[idx].votes >= threshold) {
      q[idx].approved = true;
      if (autoPlay) {
        const st = this.play(roomId, q[idx].track);
        q[idx].played = true;
        NotificationHelper.notify("Auto-play", `${q[idx].track.title}`);
      }
    }
    write(KEYS.requests(roomId), q);
    return this.getQueue(roomId);
  },
  approve(roomId: string, requestId: string): RequestItem[] {
    const q = read<RequestItem[]>(KEYS.requests(roomId), []);
    const idx = q.findIndex((r) => r.id === requestId);
    if (idx === -1) return q;
    q[idx].approved = true;
    write(KEYS.requests(roomId), q);
    // Play immediately on approval
    const st = this.play(roomId, q[idx].track);
    q[idx].played = true;
    write(KEYS.requests(roomId), q);
    return this.getQueue(roomId);
  },
  clearQueue(roomId: string): RequestItem[] {
    write<RequestItem[]>(KEYS.requests(roomId), []);
    return [];
  },
};