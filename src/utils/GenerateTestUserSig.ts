// src/utils/GenerateTestUserSig.ts

export async function genTestUserSig(userID: string): Promise<{ userSig: string; sdkAppID: number }> {
    try {
        // نطلب التوقيع من الـ API الذي نجح في المتصفح
        // أضفنا timestamp (&t=...) لضمان جلب توقيع جديد كل مرة
        const response = await fetch(`/api/generate-sig?userId=${userID}&t=${Date.now()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch UserSig from API');
        }

        const data = await response.json();

        if (!data.userSig) {
            throw new Error('UserSig is missing in response');
        }

        return {
            userSig: data.userSig,
            sdkAppID: 20031795
        };
    } catch (error) {
        console.error("TRTC API Error:", error);
        // في حال فشل الـ API، لا نرسل توقيعاً فارغاً بل نطلق خطأ
        throw error;
    }
}