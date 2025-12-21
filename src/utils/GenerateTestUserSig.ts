import { TRTC_SDK_APP_ID, TRTC_SECRET_KEY } from "@/config/trtcConfig";
import LibGenerateTestUserSig from "./LibGenerateTestUserSig";

/**
 * Generate a UserSig locally for testing purposes.
 * This simulates the backend logic.
 */
export async function genTestUserSig(userID: string): Promise<{ userSig: string; sdkAppID: number }> {
    if (TRTC_SECRET_KEY.includes("PLEASE_REPLACE") || TRTC_SECRET_KEY === "") {
        console.error("TRTC Error: Using placeholder or empty Secret Key. Please update src/config/trtcConfig.ts");
        return { userSig: "dummy_sig_replace_secret_key", sdkAppID: TRTC_SDK_APP_ID };
    }

    // Ensure SDKAppID is a valid number
    if (typeof TRTC_SDK_APP_ID !== 'number' || TRTC_SDK_APP_ID <= 0) {
        console.error("TRTC Error: Invalid SDKAppID. Check src/config/trtcConfig.ts");
    }

    const generator = new LibGenerateTestUserSig(TRTC_SDK_APP_ID, TRTC_SECRET_KEY, 604800);
    const userSig = await generator.genTestUserSig(userID);
    return {
        userSig,
        sdkAppID: TRTC_SDK_APP_ID,
    };
}
