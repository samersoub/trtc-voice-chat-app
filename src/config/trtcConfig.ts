/**
 * TRTC Application ID (This is safe to expose)
 */
export const TRTC_SDK_APP_ID = 20031766;

/**
 * A fixed Room ID for initial testing
 */
export const TRTC_TEST_ROOM_ID = 10086;

/**
 * Secure backend endpoint that returns a UserSig for a given userId.
 * Now using the app's own API endpoint for better reliability.
 */
// export const USERSIG_API_ENDPOINT = "/api/generate-sig";

/**
 * TRTC Secret Key (Client-side generation for testing only)
 * WARNING: Exposing this in production is insecure.
 */
export const TRTC_SECRET_KEY = "";
export const USERSIG_API_ENDPOINT = "/api/generate-sig"; // Enable API generation