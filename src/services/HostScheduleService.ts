"use client";

export type HostSchedule = {
  hostId: string;
  daysOfWeek: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
  note?: string;
};

const KEY = (hostId: string) => `host:schedule:${hostId}`;

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

export const HostScheduleService = {
  get(hostId: string): HostSchedule {
    return read<HostSchedule>(KEY(hostId), { hostId, daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"], note: "" });
  },
  set(hostId: string, schedule: HostSchedule) {
    write(KEY(hostId), schedule);
    return schedule;
  },
};