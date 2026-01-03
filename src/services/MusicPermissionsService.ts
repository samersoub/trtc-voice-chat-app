"use client";

import { AuthService } from "@/services/AuthService";
import { VoiceChatService } from "@/services/VoiceChatService";
import { RoomSettingsService } from "@/services/RoomSettingsService";

export type MusicRole = "owner" | "moderator" | "speaker" | "listener";

// Simple in-memory moderators map (demo)
const MODS = new Map<string, Set<string>>(); // roomId -> moderator userIds

export const MusicPermissionsService = {
  addModerator(roomId: string, userId: string) {
    const s = MODS.get(roomId) || new Set<string>();
    const limit = RoomSettingsService.getSettings(roomId).moderatorsLimit;
    if (s.size >= limit) {
      // limit reached: do nothing
      return;
    }
    s.add(userId);
    MODS.set(roomId, s);
    try {
      // Persist to room metadata as well for visibility
      const room = VoiceChatService.getRoom(roomId);
      if (room) {
        room.moderators = Array.from(new Set([...(room.moderators || []), userId]));
        VoiceChatService.saveRoom(room);
      }
    } catch {}
  },
  removeModerator(roomId: string, userId: string) {
    const s = MODS.get(roomId);
    if (s) {
      s.delete(userId);
      MODS.set(roomId, s);
    }
    try {
      const room = VoiceChatService.getRoom(roomId);
      if (room) {
        room.moderators = (room.moderators || []).filter((u) => u !== userId);
        VoiceChatService.saveRoom(room);
      }
    } catch {}
  },
  listModerators(roomId: string): string[] {
    return Array.from(MODS.get(roomId) ?? []);
  },
  getModeratorLimit(roomId: string): number {
    return RoomSettingsService.getSettings(roomId).moderatorsLimit;
  },
  getRole(roomId: string, userId?: string): MusicRole {
    const uid = userId ?? AuthService.getCurrentUser()?.id;
    const room = roomId ? VoiceChatService.getRoom(roomId) : undefined;
    if (uid && room && room.hostId === uid) return "owner";
    if (uid && MODS.get(roomId)?.has(uid)) return "moderator";
    // Simplified: treat participants as speakers; others as listeners
    if (uid && room?.participants?.includes(uid)) return "speaker";
    return "listener";
  },
  canControl(roomId: string, userId?: string): boolean {
    const r = this.getRole(roomId, userId);
    return r === "owner" || r === "moderator";
  },
  canApprove(roomId: string, userId?: string): boolean {
    const r = this.getRole(roomId, userId);
    return r === "owner" || r === "moderator";
  },
  canRequest(roomId: string, userId?: string): boolean {
    const r = this.getRole(roomId, userId);
    return r === "owner" || r === "moderator" || r === "speaker" || r === "listener";
  },
  canVote(roomId: string, userId?: string): boolean {
    return this.canRequest(roomId, userId);
  },
};