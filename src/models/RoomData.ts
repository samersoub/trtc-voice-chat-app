"use client";

export interface RoomData {
  id: string;
  title: string;
  coverImage: string;
  hostName: string;
  hostLevel: number;
  listenerCount: number;
  countryFlag: string; // ISO code like "JO", "SY", "TR"
  tags: string[];
  // ADDED: Optional structured fields to separate host and guests
  host?: {
    id: string;
    name: string;
    avatarUrl?: string;
    flagCode?: string;
    title?: string;
  };
  guests?: Array<{
    index: number; // 1..8
    userId?: string;
    name?: string;
    avatarUrl?: string;
    muted?: boolean;
    locked?: boolean;
    speaking?: boolean;
  }>;
  capacity?: number; // default 9 (1 host + 8 guests)
}