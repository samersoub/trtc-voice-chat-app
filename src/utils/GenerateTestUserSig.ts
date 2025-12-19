import { TRTC_SDK_APP_ID, TRTC_SECRET_KEY } from "@/config/trtcConfig";
import LibGenerateTestUserSig from "./LibGenerateTestUserSig";

/**
 * Generate a UserSig locally for testing purposes.
 * This simulates the backend logic.
 */
export async function genTestUserSig(userID: string): Promise<{ userSig: string; sdkAppID: number }> {
    if (TRTC_SECRET_KEY.includes("PLEASE_REPLACE")) {
        console.error("TRTC Error: Using placeholder Secret Key. Please update src/config/trtcConfig.ts");
        // Return a dummy sig so app doesn't crash immediately, though TRTC will reject it.
        return { userSig: "dummy_sig_replace_secret_key", sdkAppID: TRTC_SDK_APP_ID };
    }

    const generator = new LibGenerateTestUserSig(TRTC_SDK_APP_ID, TRTC_SECRET_KEY, 604800);
    const userSig = await generator.genTestUserSig(userID);
    return {
        userSig,
        sdkAppID: TRTC_SDK_APP_ID,
    };
}
