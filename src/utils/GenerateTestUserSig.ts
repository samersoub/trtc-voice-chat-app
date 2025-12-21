// src/utils/GenerateTestUserSig.ts
import { TRTC_SDK_APP_ID, USERSIG_API_ENDPOINT } from "@/config/trtcConfig";

export async function genTestUserSig(userID: string): Promise<{ userSig: string; sdkAppID: number }> {
    try {
        const response = await fetch(`${USERSIG_API_ENDPOINT}?userId=${userID}&t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch UserSig');
        }

        const data = await response.json();

        return {
            userSig: data.userSig,
            sdkAppID: TRTC_SDK_APP_ID
        };
    } catch (error) {
        console.error("TRTC Error:", error);
        throw error;
    }
}