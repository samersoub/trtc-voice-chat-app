// src/utils/GenerateTestUserSig.ts
import { TRTC_SDK_APP_ID, generateUserSig } from "@/config/trtcConfig";

export async function genTestUserSig(userID: string): Promise<{ userSig: string; sdkAppID: number }> {
    try {
        const userSig = generateUserSig(userID);
        return {
            userSig,
            sdkAppID: TRTC_SDK_APP_ID
        };
    } catch (error) {
        console.error("TRTC Error:", error);
        throw error;
    }
}