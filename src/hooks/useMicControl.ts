"use client";

import React from "react";
import { WebRTCService } from "@/services/WebRTCService";
import { AudioManager } from "@/utils/AudioManager";
import { MicService, type SeatInfo } from "@/services/MicService";
import { showError, showSuccess } from "@/utils/toast";

export function useMicControl(
  roomId: string | undefined,
  userId: string | undefined,
  audioRef: React.RefObject<HTMLAudioElement | null>,
  seats: SeatInfo[],
  onSeatsChange?: (seats: SeatInfo[]) => void
) {
  const rtcRef = React.useRef<WebRTCService | null>(null);
  const [micOn, setMicOn] = React.useState(false);

  // Helper: is current user seated
  const isUserOnSeat = React.useMemo(() => {
    if (!roomId || !userId) return false;
    return seats.some((s) => s.userId === userId);
  }, [roomId, userId, seats]);

  // Ghost mic detection: if micOn but not seated, turn off mic
  React.useEffect(() => {
    if (!roomId || !userId) return;
    if (micOn && !isUserOnSeat) {
      const rtc = (rtcRef.current ||= new WebRTCService());
      rtc.stopMic();
      if (audioRef.current) {
        AudioManager.detach(audioRef.current);
      }
      setMicOn(false);
      try {
        const updated = MicService.setSpeaking(roomId, userId, false);
        onSeatsChange?.([...updated]);
      } catch {}
      showError("Detected ghost mic. Mic muted until you take a seat.");
    }
  }, [micOn, isUserOnSeat, roomId, userId, audioRef, onSeatsChange]);

  const toggleMic = React.useCallback(async () => {
    const rtc = (rtcRef.current ||= new WebRTCService());
    if (!micOn) {
      if (!isUserOnSeat) {
        showSuccess("Take a mic first");
        return;
      }
      const stream = await rtc.getMicStream();
      if (audioRef.current) {
        AudioManager.attachStream(audioRef.current, stream);
      }
      setMicOn(true);
      if (roomId && userId) {
        const updated = MicService.setSpeaking(roomId, userId, true);
        onSeatsChange?.([...updated]);
      }
      showSuccess("Microphone On");
    } else {
      rtc.stopMic();
      if (audioRef.current) {
        AudioManager.detach(audioRef.current);
      }
      setMicOn(false);
      if (roomId && userId) {
        const updated = MicService.setSpeaking(roomId, userId, false);
        onSeatsChange?.([...updated]);
      }
      showSuccess("Microphone Off");
    }
  }, [micOn, isUserOnSeat, roomId, userId, audioRef, onSeatsChange]);

  const stopMic = React.useCallback(() => {
    const rtc = (rtcRef.current ||= new WebRTCService());
    rtc.stopMic();
    if (audioRef.current) {
      AudioManager.detach(audioRef.current);
    }
    if (micOn) setMicOn(false);
    if (roomId && userId) {
      try {
        const updated = MicService.setSpeaking(roomId, userId, false);
        onSeatsChange?.([...updated]);
      } catch {}
    }
  }, [micOn, roomId, userId, audioRef, onSeatsChange]);

  return { micOn, toggleMic, stopMic };
}