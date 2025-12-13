"use client";

export type SeatInfo = {
  index: number;
  userId?: string;
  name?: string;
  muted: boolean;
  locked: boolean;
  speaking: boolean;
};

function key(roomId: string) {
  return `voice:seats:${roomId}`;
}

import { RoomSettingsService } from "@/services/RoomSettingsService";

function defaults(): SeatInfo[] {
  const count = 10; // fallback if roomId not known here
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    muted: false,
    locked: false,
    speaking: false,
  }));
}

function read(roomId: string): SeatInfo[] {
  const raw = localStorage.getItem(key(roomId));
  const max = RoomSettingsService.getSettings(roomId).maxSpeakers;
  if (!raw) {
    const base = Array.from({ length: max }, (_, i) => ({
      index: i,
      muted: false,
      locked: false,
      speaking: false,
    }));
    return base;
  }
  try {
    const seats = JSON.parse(raw) as SeatInfo[];
    // ensure at least max seats
    const arr = [...seats];
    while (arr.length < max) {
      arr.push({ index: arr.length, muted: false, locked: false, speaking: false });
    }
    return arr.slice(0, max);
  } catch {
    const base = Array.from({ length: max }, (_, i) => ({
      index: i,
      muted: false,
      locked: false,
      speaking: false,
    }));
    return base;
  }
}

function write(roomId: string, seats: SeatInfo[]) {
  const max = RoomSettingsService.getSettings(roomId).maxSpeakers;
  localStorage.setItem(key(roomId), JSON.stringify(seats.slice(0, max)));
}

function findByUser(seats: SeatInfo[], userId: string) {
  return seats.find((s) => s.userId === userId);
}

export const MicService = {
  getSeats(roomId: string): SeatInfo[] {
    return read(roomId);
  },
  
  /**
   * Remove user from mic seat (kick)
   */
  removeUser(roomId: string, userId: string): SeatInfo[] {
    const seats = read(roomId);
    const seat = findByUser(seats, userId);
    if (!seat) throw new Error("User not found on mic");
    
    seat.userId = undefined;
    seat.name = undefined;
    seat.speaking = false;
    seat.muted = false;
    
    write(roomId, seats);
    
    // Log the kick action
    const logKey = `activity:kicks:${roomId}`;
    const kicks = JSON.parse(localStorage.getItem(logKey) || "[]");
    kicks.push({
      userId,
      timestamp: new Date().toISOString(),
      roomId
    });
    localStorage.setItem(logKey, JSON.stringify(kicks.slice(-100))); // Keep last 100
    
    return seats;
  },
  
  putOnMic(roomId: string, userId: string, name?: string, targetIndex?: number): SeatInfo[] {
    const seats = read(roomId);
    
    // CRITICAL FIX: Always remove user from ALL other seats first
    // This prevents the "ghost user" bug where user appears on multiple seats
    seats.forEach((seat) => {
      if (seat.userId === userId) {
        seat.userId = undefined;
        seat.name = undefined;
        seat.speaking = false;
        seat.muted = false;
      }
    });
    
    // Choose target seat
    const idx =
      typeof targetIndex === "number" && targetIndex >= 0 && targetIndex < seats.length
        ? targetIndex
        : seats.findIndex((s) => !s.locked && !s.userId);
    
    if (idx === -1) throw new Error("No available seats");
    
    const seat = seats[idx];
    if (seat.locked || seat.userId) throw new Error("Seat is not available");
    
    // Assign user to new seat
    seat.userId = userId;
    seat.name = name ?? "Guest";
    seat.speaking = false;
    seat.muted = false;
    
    write(roomId, seats);
    return seats;
  },
  leaveMic(roomId: string, userId: string): SeatInfo[] {
    const seats = read(roomId);
    const seat = findByUser(seats, userId);
    if (!seat) throw new Error("You are not on the mic");
    seat.userId = undefined;
    seat.name = undefined;
    seat.speaking = false;
    seat.muted = false;
    write(roomId, seats);
    return seats;
  },
  kick(roomId: string, targetUserId: string): SeatInfo[] {
    const seats = read(roomId);
    const seat = findByUser(seats, targetUserId);
    if (!seat) throw new Error("User is not on the mic");
    seat.userId = undefined;
    seat.name = undefined;
    seat.speaking = false;
    seat.muted = false;
    write(roomId, seats);
    return seats;
  },
  mute(roomId: string, targetUserId: string, muted: boolean): SeatInfo[] {
    const seats = read(roomId);
    const seat = findByUser(seats, targetUserId);
    if (!seat) throw new Error("User is not on the mic");
    seat.muted = muted;
    if (muted) seat.speaking = false;
    write(roomId, seats);
    return seats;
  },
  lockSeat(roomId: string, index: number, locked: boolean): SeatInfo[] {
    const seats = read(roomId);
    const seat = seats[index];
    if (!seat) throw new Error("Seat not found");
    seat.locked = locked;
    if (locked) {
      seat.userId = undefined;
      seat.name = undefined;
      seat.speaking = false;
      seat.muted = false;
    }
    write(roomId, seats);
    return seats;
  },
  move(roomId: string, userId: string, toIndex: number): SeatInfo[] {
    const seats = read(roomId);
    if (toIndex < 0 || toIndex >= seats.length) throw new Error("Invalid target");
    const dest = seats[toIndex];
    if (dest.locked || dest.userId) throw new Error("Seat unavailable");
    const src = findByUser(seats, userId);
    if (!src) throw new Error("User not on the mic");
    dest.userId = src.userId;
    dest.name = src.name;
    dest.muted = src.muted;
    dest.speaking = src.speaking;
    src.userId = undefined;
    src.name = undefined;
    src.muted = false;
    src.speaking = false;
    write(roomId, seats);
    return seats;
  },
  setSpeaking(roomId: string, userId: string, speaking: boolean): SeatInfo[] {
    const seats = read(roomId);
    const seat = findByUser(seats, userId);
    if (!seat) throw new Error("User not on the mic");
    seat.speaking = speaking;
    write(roomId, seats);
    return seats;
  },
};