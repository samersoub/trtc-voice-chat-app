"use client";

export type MusicSource = "spotify" | "url" | "local";

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  url?: string;
  duration?: number; // seconds
  source: MusicSource;
  thumbnail?: string;
}