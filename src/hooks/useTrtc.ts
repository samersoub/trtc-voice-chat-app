"use client";

import React from "react";
import TRTC from "trtc-js-sdk";
import { TRTC_SDK_APP_ID, TRTC_TEST_ROOM_ID, USERSIG_API_ENDPOINT } from "@/config/trtcConfig";
import { fetchUserSig } from "@/utils/trtcAuth";
import { showError, showSuccess } from "@/utils/toast";
import { RoomParticipantService } from "@/services/RoomParticipantService";

export type RemoteStreamItem = { id: string | number; stream: any };

export function useTrtc() {
  const clientRef = React.useRef<any>(null);
  const localStreamRef = React.useRef<any>(null);
  const joinedRef = React.useRef<boolean>(false);
  const currentRoomIdRef = React.useRef<string | null>(null);
  const currentUserIdRef = React.useRef<string | null>(null);
  const [remoteStreams, setRemoteStreams] = React.useState<RemoteStreamItem[]>([]);

  const join = React.useCallback(async (userId?: string, roomId?: string) => {
    if (joinedRef.current) {
      console.log("TRTC: Already joined; skipping.");
      return;
    }

    const currentUserID =
      userId ||
      (() => {
        const key = "trtcAnonId";
        const existing = localStorage.getItem(key);
        if (existing) return existing;
        const generated = `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
        localStorage.setItem(key, generated);
        return generated;
      })();

    console.log("TRTC: Join flow start:", { userId: currentUserID, roomId: TRTC_TEST_ROOM_ID });

    try {
      // Show endpoint being used for fetching UserSig
      showSuccess(`Requesting UserSig from: ${USERSIG_API_ENDPOINT}`);
      const userSig = await fetchUserSig(currentUserID);
      showSuccess("UserSig received");

      const client = TRTC.createClient({
        mode: "rtc",
        sdkAppId: TRTC_SDK_APP_ID,
        userId: currentUserID,
        userSig,
      });
      clientRef.current = client;

      // Diagnostics
      client.on("error", (err: any) => {
        console.error("TRTC: Client error:", err);
        showError(err?.message || "TRTC client error");
      });
      client.on("connection-state-changed", (payload: any) => {
        console.log("TRTC: Connection state:", payload);
      });
      client.on("network-quality", (event: any) => {
        console.log("TRTC: Network quality:", event);
      });
      client.on("peer-join", (event: any) => {
        console.log("TRTC: Peer joined:", event?.userId ?? event);
      });
      client.on("peer-leave", (event: any) => {
        console.log("TRTC: Peer left:", event?.userId ?? event);
      });
      client.on("mute-audio", (event: any) => {
        console.log("TRTC: Peer muted audio:", event?.userId ?? event);
      });
      client.on("unmute-audio", (event: any) => {
        console.log("TRTC: Peer unmuted audio:", event?.userId ?? event);
      });
      client.on("mute-video", (event: any) => {
        console.log("TRTC: Peer muted video:", event?.userId ?? event);
      });
      client.on("unmute-video", (event: any) => {
        console.log("TRTC: Peer unmuted video:", event?.userId ?? event);
      });

      client.on("stream-added", async (event: any) => {
        const remoteStream = event.stream;
        const id = remoteStream?.getId?.() ?? "unknown";
        console.log("TRTC: Remote stream added:", id, {
          hasAudio: remoteStream?.hasAudio?.(),
          hasVideo: remoteStream?.hasVideo?.(),
        });
        try {
          await client.subscribe(remoteStream, { audio: true, video: true });
          console.log("TRTC: Subscribe requested for remote:", id);
        } catch (err) {
          console.error("TRTC: Subscribe failed:", id, err);
          showError("Failed to subscribe remote stream");
        }
      });

      client.on("stream-subscribed", (event: any) => {
        const remoteStream = event.stream;
        const id = remoteStream?.getId?.() ?? "unknown";
        console.log("TRTC: Remote stream subscribed:", id, {
          hasAudio: remoteStream?.hasAudio?.(),
          hasVideo: remoteStream?.hasVideo?.(),
        });
        setRemoteStreams((prev) => {
          const exists = prev.some((x) => x.id === id);
          return exists ? prev : [...prev, { id, stream: remoteStream }];
        });
      });

      client.on("stream-removed", (event: any) => {
        const remoteStream = event.stream;
        const id = remoteStream?.getId?.() ?? "unknown";
        console.log("TRTC: Remote stream removed:", id);
        try {
          remoteStream.stop?.();
        } catch {}
        setRemoteStreams((prev) => prev.filter((x) => x.id !== id));
      });

      const targetRoomId = roomId || TRTC_TEST_ROOM_ID;
      
      console.log("TRTC: Attempting to join room:", targetRoomId, "with user:", currentUserID);
      
      await client.join({ roomId: targetRoomId });
      joinedRef.current = true;
      currentRoomIdRef.current = targetRoomId;
      currentUserIdRef.current = currentUserID;
      
      console.log("TRTC: Join success:", targetRoomId);
      showSuccess(`Joined TRTC room ${targetRoomId}`);

      // Track participant in database (mark as listener initially)
      const joined = await RoomParticipantService.joinRoom(targetRoomId, currentUserID, 'listener');
      if (joined) {
        console.log(`[TRTC] User ${currentUserID} added to room ${targetRoomId} participants`);
      } else {
        console.warn(`[TRTC] Failed to add user to room participants (graceful degradation)`);
      }

      const localStream = TRTC.createStream({ audio: true, video: true });
      localStreamRef.current = localStream;
      console.log("TRTC: Init local stream...");
      await localStream.initialize();
      console.log("TRTC: Local stream initialized:", {
        audio: localStream.hasAudio?.(),
        video: localStream.hasVideo?.(),
      });

      await client.publish(localStream);
      console.log("TRTC: Publish success.");
      showSuccess("Published local audio/video");
    } catch (err: any) {
      console.error("TRTC: Join/Publish failed", err);
      showError(err?.message || "Failed to join/publish TRTC");
    }
  }, []);

  const leave = React.useCallback(async () => {
    const c = clientRef.current;
    const roomId = currentRoomIdRef.current;
    const userId = currentUserIdRef.current;
    
    if (c) {
      try {
        const ls = localStreamRef.current;
        if (ls) {
          try {
            c.unpublish?.(ls);
          } catch {}
          try {
            ls.stop?.();
            ls.close?.();
          } catch {}
          localStreamRef.current = null;
        }
        void c.leave?.();
      } catch {}
      clientRef.current = null;
    }
    
    // Remove participant from database
    if (roomId && userId) {
      await RoomParticipantService.leaveRoom(roomId, userId);
    }
    
    joinedRef.current = false;
    currentRoomIdRef.current = null;
    currentUserIdRef.current = null;
    setRemoteStreams([]);
    console.log("TRTC: Left room and cleaned up.");
  }, []);

  return {
    joined: joinedRef.current,
    localStream: localStreamRef.current,
    remoteStreams,
    join,
    leave,
  };
}