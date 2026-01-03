"use client";

export type ActivityLog = {
  id: string;
  actorId: string; // admin user id
  userId?: string; // target user id
  action: string;
  meta?: Record<string, any>;
  at: number;
};

const KEY = "activity.logs";

function read(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivityLog[]) : [];
  } catch {
    return [];
  }
}

function write(items: ActivityLog[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function uid() {
  return `act_${Math.random().toString(36).slice(2, 10)}`;
}

export const ActivityLogService = {
  log(actorId: string, action: string, userId?: string, meta?: Record<string, any>) {
    const items = read();
    const entry: ActivityLog = { id: uid(), actorId, userId, action, meta, at: Date.now() };
    items.push(entry);
    write(items);
    window.dispatchEvent(new CustomEvent<ActivityLog>("activity:log", { detail: entry }));
    return entry;
  },
  listAll(): ActivityLog[] {
    return read().sort((a, b) => b.at - a.at);
  },
  listByUser(userId: string): ActivityLog[] {
    return this.listAll().filter((l) => l.userId === userId);
  },
  clear() {
    write([]);
  },
};