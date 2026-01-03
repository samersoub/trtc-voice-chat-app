"use client";

import { MicService } from "@/services/MicService";
import { MusicService } from "@/services/MusicService";
import { NotificationHelper } from "@/utils/NotificationHelper";

export type ReportType = "voice-abuse" | "music-spam" | "harassment" | "technical";

export interface ReportItem {
  id: string;
  roomId: string;
  type: ReportType;
  priority: "low" | "medium" | "high" | "critical";
  description?: string;
  targetUserId?: string;
  reporterId: string;
  createdAt: number;
  autoActionApplied?: boolean;
}

const KEY = (roomId: string) => `reports:${roomId}`;

function read(roomId: string): ReportItem[] {
  const raw = localStorage.getItem(KEY(roomId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReportItem[];
  } catch {
    return [];
  }
}

function write(roomId: string, data: ReportItem[]) {
  localStorage.setItem(KEY(roomId), JSON.stringify(data));
}

export const ReportService = {
  list(roomId: string): ReportItem[] {
    return read(roomId).slice().sort((a, b) => b.createdAt - a.createdAt);
  },
  submit(
    roomId: string,
    reporterId: string,
    type: ReportType,
    opts?: { description?: string; targetUserId?: string }
  ): ReportItem[] {
    const id = `rep_${Math.random().toString(36).slice(2, 10)}`;
    const item: ReportItem = {
      id,
      roomId,
      type,
      description: opts?.description,
      targetUserId: opts?.targetUserId,
      reporterId,
      priority:
        type === "harassment"
          ? "critical"
          : type === "voice-abuse"
          ? "high"
          : type === "music-spam"
          ? "medium"
          : "low",
      createdAt: Date.now(),
      autoActionApplied: false,
    };
    const list = read(roomId);
    list.push(item);
    write(roomId, list);

    // Auto actions
    if (type === "voice-abuse" && opts?.targetUserId) {
      MicService.mute(roomId, opts.targetUserId, true);
      item.autoActionApplied = true;
      NotificationHelper.notify("Auto-moderation", `Muted user ${opts.targetUserId}`);
    } else if (type === "music-spam") {
      MusicService.skip(roomId);
      item.autoActionApplied = true;
      NotificationHelper.notify("Auto-moderation", "Skipped current track due to music spam report");
    } else if (type === "harassment" && opts?.targetUserId) {
      MicService.kick(roomId, opts.targetUserId);
      item.autoActionApplied = true;
      NotificationHelper.notify("Auto-moderation", `Kicked user ${opts.targetUserId}`);
    } else if (type === "technical") {
      NotificationHelper.notify("Report received", "Technical issue reported");
    }

    const updated = read(roomId).map((r) => (r.id === id ? item : r));
    write(roomId, updated);
    return this.list(roomId);
  },
  clear(roomId: string) {
    write(roomId, []);
  },
};