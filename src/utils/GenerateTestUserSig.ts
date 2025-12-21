// src/utils/GenerateTestUserSig.ts (أو المسار الموجود عندك)

import { TRTC_SDK_APP_ID, TRTC_SECRET_KEY } from "@/config/trtcConfig";
import LibGenerateTestUserSig from "./LibGenerateTestUserSig";

export async function genTestUserSig(userID: string): Promise<{ userSig: string; sdkAppID: number }> {
    // التأكد من تحويل SDKAppID إلى رقم صحيح قبل استخدامه
    const appId = Number(TRTC_SDK_APP_ID);
    const secretKey = String(TRTC_SECRET_KEY).trim(); // إزالة أي مسافات مخفية

    if (secretKey.includes("PLEASE_REPLACE") || secretKey === "") {
        console.error("TRTC Error: Missing Secret Key");
        return { userSig: "dummy", sdkAppID: appId };
    }

    // استخدام القيم المحققة والمحولة
    const generator = new LibGenerateTestUserSig(appId, secretKey, 604800);
    const userSig = await generator.genTestUserSig(userID);

    return {
        userSig,
        sdkAppID: appId,
    };
}