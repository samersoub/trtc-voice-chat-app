// src/config/trtcConfig.ts

// 1. قم بتغيير الرقم إلى 20031795
export const TRTC_SDK_APP_ID = Number(import.meta.env.VITE_TRTC_SDK_APP_ID) || 20031795;

export const TRTC_TEST_ROOM_ID = Number(import.meta.env.VITE_TRTC_TEST_ROOM_ID) || 10086;

// 2. قم باستبدال النص الطويل بالمفتاح السري الجديد
export const TRTC_SECRET_KEY = import.meta.env.VITE_TRTC_SECRET_KEY || "17fd0c3daf9ec5b966c1946854683bd77bf2bf303dbc25d902464f2528dbffb";

export const USERSIG_API_ENDPOINT = import.meta.env.VITE_USERSIG_API_ENDPOINT || "";