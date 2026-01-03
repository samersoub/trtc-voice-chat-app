"use client";

import { MusicTrack } from "@/models/MusicTrack";

export interface RoomMusicState {
  roomId: string;
  currentTrack: MusicTrack | null;
  volume: number; // 0..1
  isPlaying: boolean;
}

export interface RequestItem {
  id: string;
  track: MusicTrack;
  requesterId: string;
  votes: number;
  approved: boolean;
  played: boolean;
  createdAt: number;
}