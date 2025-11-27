/**
 * TRTC Application ID (This is safe to expose)
 */
export const TRTC_SDK_APP_ID = 200297772;

/**
 * A fixed Room ID for initial testing
 */
export const TRTC_TEST_ROOM_ID = 10086;

/**
 * Secure backend endpoint that returns a UserSig for a given userId.
 * Uses the same domain as the deployed app to avoid stale caches.
 */
export const USERSIG_API_ENDPOINT = "https://trtc-sig-service.vercel.app/api/generate-sig";