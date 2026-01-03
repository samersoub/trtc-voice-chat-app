"use client";

type RecordingState = {
  active: boolean;
  mode?: "companion" | "cdn";
  startedAt?: number;
  stoppedAt?: number;
  submittedForReviewAt?: number;
};

function key(roomId: string) {
  return `voice:recording:${roomId}`;
}

function read(roomId: string): RecordingState {
  const raw = localStorage.getItem(key(roomId));
  if (!raw) return { active: false };
  try {
    return JSON.parse(raw) as RecordingState;
  } catch {
    return { active: false };
  }
}

function write(roomId: string, data: RecordingState) {
  localStorage.setItem(key(roomId), JSON.stringify(data));
}

export const RecordingService = {
  status(roomId: string): RecordingState {
    return read(roomId);
  },
  start(roomId: string, mode: "companion" | "cdn") {
    const state: RecordingState = { active: true, mode, startedAt: Date.now(), stoppedAt: undefined };
    write(roomId, state);
    return state;
  },
  stop(roomId: string) {
    const state = read(roomId);
    state.active = false;
    state.stoppedAt = Date.now();
    write(roomId, state);
    return state;
  },
  submitForReview(roomId: string) {
    const state = read(roomId);
    state.submittedForReviewAt = Date.now();
    write(roomId, state);
    return state;
  },
};