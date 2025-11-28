// src/firebase.ts
// ربط تطبيق Vue بقاعدة بيانات Firebase Firestore

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// مفاتيح التهيئة التي تم الحصول عليها من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAzNlJ6cU8jPeU1qWnDH9QK9KsKFoF1Trps",
  authDomain: "trtc-voice-chat-app.firebaseapp.com",
  projectId: "trtc-voice-chat-app",
  storageBucket: "trtc-voice-chat-app.appspot.com",
  messagingSenderId: "188281614210",
  appId: "1:188281614210:web:2e6ef6f6215b0b77be99e",
  // يمكنك حذف measurementId لأنه غير ضروري لـ Firestore
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// الحصول على مرجع لقاعدة بيانات Firestore وتصديره للاستخدام
export const db = getFirestore(app);

// يمكنك تصدير "app" إذا أردت استخدام خدمات أخرى من Firebase لاحقاً
// export { app };