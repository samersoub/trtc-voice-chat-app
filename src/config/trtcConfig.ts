// src/config/trtcConfig.ts

// Get env vars with fallbacks for local dev (BUT PREFER ENV VARS)
// Note: In Vite, use import.meta.env.VITE_...
export const TRTC_SDK_APP_ID = Number(import.meta.env.VITE_TRTC_SDK_APP_ID) || 20031766;

export const TRTC_TEST_ROOM_ID = Number(import.meta.env.VITE_TRTC_TEST_ROOM_ID) || 10086;

// SECURITY WARNING: Never commit the secret key to public repos.
// It is here as a fallback for local testing only.
export const TRTC_SECRET_KEY = import.meta.env.VITE_TRTC_SECRET_KEY || "e76d25df660fd21c030faadeb1e619c5d3b2785e49f30f914b125c8a7a86bab2";

export const USERSIG_API_ENDPOINT = import.meta.env.VITE_USERSIG_API_ENDPOINT || "";