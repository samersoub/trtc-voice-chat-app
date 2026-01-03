"use client";

import type { SeatInfo } from "@/services/MicService";

export type GuestSeat = {
  index: number;
  userId?: string;
  name?: string;
  muted: boolean;
  locked: boolean;
  speaking: boolean;
};

// Maps seats to 8 guest seats (display indices 1..8 map to internal 0..7)
export function mapSeatsToGuests(seats: SeatInfo[]): GuestSeat[] {
  return Array.from({ length: 8 }, (_, i) => {
    const s = seats[i];
    return {
      index: i + 1,
      userId: s?.userId,
      name: s?.userId ? s.name || "User" : undefined,
      muted: !!s?.muted,
      locked: !!s?.locked,
      speaking: !!s?.speaking,
    };
  });
}