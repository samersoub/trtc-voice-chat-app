// src/utils/trtcAuth.ts
import { genTestUserSig } from "./GenerateTestUserSig";

/**
 * جلب الـ UserSig للمستخدم.
 * نعتمد الآن على الدالة التي تتصل بالـ API الناجح.
 */
export async function fetchUserSig(userId: string): Promise<string> {
  try {
    // استدعاء الدالة التي تجلب التوقيع من الـ API
    const sigData = await genTestUserSig(userId);

    if (sigData && sigData.userSig) {
      console.log(`TRTC: UserSig received successfully for: ${userId}`);
      return sigData.userSig;
    }

    throw new Error("UserSig received is empty");
  } catch (error) {
    console.error("TRTC Auth Error:", error);
    throw error;
  }
}