// src/utils/GenerateTestUserSig.ts

export async function genTestUserSig(userID: string): Promise<{ userSig: string; sdkAppID: number }> {
    try {
        // نطلب التوقيع من ملف الـ API الذي أصلحناه سابقاً
        const response = await fetch(`/api/generate-sig?userId=${userID}`);

        if (!response.ok) {
            throw new Error('Failed to fetch UserSig from API');
        }

        const data = await response.json();

        return {
            userSig: data.userSig,
            sdkAppID: 20031795 // رقم تطبيقك الجديد الصحيح
        };
    } catch (error) {
        console.error("TRTC Error:", error);
        return { userSig: "", sdkAppID: 20031795 };
    }
}