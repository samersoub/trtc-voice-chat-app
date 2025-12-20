/**
 * TRTC Application ID
 * يحاول القراءة من متغيرات البيئة أولاً، وإذا لم يجدها يستخدم الرقم المباشر
 */
export const TRTC_SDK_APP_ID = Number(import.meta.env.VITE_TRTC_SDK_APP_ID) || 20031766;

/**
 * A fixed Room ID for initial testing
 */
export const TRTC_TEST_ROOM_ID = 10086;

/**
 * TRTC Secret Key (Client-side generation for testing only)
 * ملاحظة: في بيئة الإنتاج يفضل دائماً التوليد من جهة السيرفر
 */
export const TRTC_SECRET_KEY = import.meta.env.VITE_TRTC_SECRET_KEY || "e76d25df660fd21c030faadeb1e619c5d3b2785e49f30f914b125c8a7a86bab2";

/**
 * USERSIG_API_ENDPOINT
 * نتركه فارغاً لإجبار التطبيق على استخدام التوليد المحلي (Client-side) كما هو مخطط حالياً
 */
export const USERSIG_API_ENDPOINT = "";