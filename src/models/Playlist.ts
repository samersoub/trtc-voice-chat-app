"use client";

import { MusicTrack } from "@/models/MusicTrack";

export interface Playlist {
  id: string;
  name: string;
  tracks: MusicTrack[];
  isPublic?: boolean;
  vipOnly?: boolean;
  autoUpdateWeekly?: boolean;
}