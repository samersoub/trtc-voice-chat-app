# إصلاح مشكلة Google OAuth Redirect
**Fix Google OAuth Redirect Issue**

## المشكلة
بعد المصادقة عبر Google، يتم التوجيه إلى `localhost:3000` بدلاً من `localhost:8080` أو Vercel URL.

## الحل

### 1. تحديث Site URL في Supabase

1. **افتح Supabase Dashboard**: https://vdpfjkmqggteaijvlule.supabase.co
2. اذهب إلى **Authentication** → **URL Configuration**
3. حدث **Site URL** إلى:
   ```
   http://localhost:8080
   ```
   
4. أضف **Redirect URLs** التالية (كل واحد في سطر منفصل):
   ```
   http://localhost:8080/**
   http://localhost:8080/auth/callback
   https://trtc-voice-chat-app.vercel.app/**
   https://trtc-voice-chat-app.vercel.app/auth/callback
   ```

5. احفظ التغييرات

### 2. تحديث Google Cloud Console

1. افتح [Google Cloud Console](https://console.cloud.google.com/)
2. اذهب إلى **APIs & Services** → **Credentials**
3. اختر OAuth 2.0 Client ID الخاص بك
4. في **Authorized redirect URIs**، أضف:
   ```
   https://vdpfjkmqggteaijvlule.supabase.co/auth/v1/callback
   http://localhost:8080/auth/callback
   https://trtc-voice-chat-app.vercel.app/auth/callback
   ```

5. احفظ التغييرات

### 3. تحديث .env (تم ✅)

تم تحديث ملف `.env` ليحتوي على:
```env
VITE_APP_URL=http://localhost:8080
VITE_PRODUCTION_URL=https://trtc-voice-chat-app.vercel.app
```

### 4. أعد تشغيل التطبيق

```bash
# أوقف التطبيق (Ctrl+C)
# ثم شغله من جديد
pnpm dev
```

## كيفية العمل الآن

الكود الآن يكتشف تلقائياً البيئة:

```typescript
// في Development (localhost)
redirectTo: http://localhost:8080/auth/callback

// في Production (Vercel)
redirectTo: https://trtc-voice-chat-app.vercel.app/auth/callback
```

## اختبار التكامل

### في Development:
1. افتح: http://localhost:8080/auth/login
2. اضغط على زر Google
3. سجل دخول عبر Google
4. **يجب** أن يتم توجيهك إلى: `http://localhost:8080/auth/callback`
5. ثم إلى الصفحة الرئيسية: `http://localhost:8080/`

### في Production (Vercel):
1. افتح: https://trtc-voice-chat-app.vercel.app/auth/login
2. اضغط على زر Google
3. سجل دخول عبر Google
4. **يجب** أن يتم توجيهك إلى: `https://trtc-voice-chat-app.vercel.app/auth/callback`
5. ثم إلى الصفحة الرئيسية: `https://trtc-voice-chat-app.vercel.app/`

## إعدادات Vercel

عند رفع التطبيق على Vercel، أضف Environment Variables:

```env
VITE_SUPABASE_URL=https://vdpfjkmqggteaijvlule.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_TRTC_SDK_APP_ID=20029772
VITE_TRTC_SECRET_KEY=3c27e1af...
VITE_APP_URL=https://trtc-voice-chat-app.vercel.app
VITE_PRODUCTION_URL=https://trtc-voice-chat-app.vercel.app
```

## استكشاف الأخطاء

### المشكلة: لا يزال يتم التوجيه إلى localhost:3000
**الحل**: 
1. امسح cache المتصفح (Ctrl+Shift+Delete)
2. أعد تشغيل التطبيق: `pnpm dev`
3. تأكد من تحديث Site URL في Supabase

### المشكلة: "redirect_uri_mismatch"
**الحل**: 
1. تأكد من إضافة جميع Redirect URIs في Google Console:
   - `https://vdpfjkmqggteaijvlule.supabase.co/auth/v1/callback`
   - `http://localhost:8080/auth/callback`
   - `https://trtc-voice-chat-app.vercel.app/auth/callback`

### المشكلة: Token في URL لكن لا يتم الدخول
**الحل**: 
1. افتح Developer Console (F12)
2. تحقق من أخطاء في GoogleCallback.tsx
3. تأكد من تنفيذ `fix_authentication.sql` في Supabase

## الملفات المعدّلة

- ✅ `.env` - إضافة VITE_APP_URL و VITE_PRODUCTION_URL
- ✅ `src/services/AuthService.ts` - تحديث signInWithGoogle() للكشف التلقائي عن البيئة

---

**الآن جرب تسجيل الدخول عبر Google مرة أخرى!** 🎉
