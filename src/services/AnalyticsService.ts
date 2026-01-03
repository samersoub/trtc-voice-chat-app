"use client";

type AnalyticsEvent = {
  name: string;
  meta?: Record<string, any>;
  at: number;
};

const KEY = "analytics:events";

function read(): AnalyticsEvent[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

function write(events: AnalyticsEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(events));
}

export const AnalyticsService = {
  track(name: string, meta?: Record<string, any>) {
    const events = read();
    events.push({ name, meta, at: Date.now() });
    write(events);
  },
  getAll(): AnalyticsEvent[] {
    return read();
  },
  clear() {
    write([]);
  },
};