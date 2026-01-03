// src/config/trtcConfig.ts

export const TRTC_SDK_APP_ID = 20031795;

export const TRTC_SECRET_KEY = "17fd0c3daf9ec5b966c1946854683bd77bf2b2f303dbc25d902464f2528dbffb";
export const TRTC_TEST_ROOM_ID = 10086;

export const generateUserSig = (userId: string): string => {
  const expireTime = 604800; // 7 days
  const currentTime = Math.floor(Date.now() / 1000);

  const sigData = {
    userId,
    expireTime,
    currentTime,
    SDKAppID: TRTC_SDK_APP_ID,
  };

  const sigString = JSON.stringify(sigData);
  const hash = require("crypto").createHmac("sha256", TRTC_SECRET_KEY).update(sigString).digest("hex");

  return hash;
};