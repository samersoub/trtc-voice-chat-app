# إعداد Environment Variables في Vercel

## 🔐 خطوات تأمين مفاتيح TRTC

### 1. افتح Vercel Dashboard
1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك (dandana أو اسم المشروع)
3. اضغط على **Settings**

### 2. أضف Environment Variables
1. في القائمة الجانبية، اضغط على **Environment Variables**
2. أضف المتغيرات التالية:

#### المتغير الأول: TRTC_SDK_APP_ID
- **Name**: `TRTC_SDK_APP_ID`
- **Value**: `20029772`
- **Environment**: اختر جميع البيئات (Production, Preview, Development)
- اضغط **Save**

#### المتغير الثاني: TRTC_SECRET_KEY
- **Name**: `TRTC_SECRET_KEY`
- **Value**: انسخ المفتاح السري من TRTC Console (https://console.trtc.io)
- **Environment**: اختر جميع البيئات (Production, Preview, Development)
- اضغط **Save**

### 3. أعد Deploy المشروع
بعد إضافة المتغيرات:
```bash
# في Terminal
git add .
git commit -m "secure: Remove hardcoded TRTC keys"
git push
```

أو من Vercel Dashboard:
- اذهب إلى **Deployments**
- اضغط **Redeploy** على آخر deployment

---

## 🔍 التحقق من نجاح الإعداد

### 1. تحقق من Vercel Logs
1. اذهب إلى **Deployments**
2. اختر أحدث deployment
3. اضغط على **Functions** → `generate-sig`
4. تحقق من Logs:
   - ✅ يجب أن ترى: `Generating UserSig for userId: ...`
   - ✅ يجب أن ترى: `UserSig generated successfully`
   - ❌ إذا رأيت: `Missing TRTC credentials` → المتغيرات غير موجودة

### 2. اختبر من التطبيق
1. افتح التطبيق
2. افتح Console (F12)
3. ادخل إلى Voice Room
4. تحقق من Logs:
   ```
   TRTC: Join flow start
   UserSig received
   TRTC: Connection state: CONNECTED
   ```

---

## ⚠️ أمان مهم

### ✅ افعل:
- احفظ `TRTC_SECRET_KEY` في Vercel Environment Variables فقط
- لا تشارك `TRTC_SECRET_KEY` مع أحد
- استخدم `.gitignore` لمنع رفع `.env` إلى Git

### ❌ لا تفعل:
- لا تضع `TRTC_SECRET_KEY` في الكود مباشرة
- لا ترفع ملف `.env` إلى GitHub
- لا تشارك لقطات شاشة تحتوي على المفتاح السري

---

## 📋 ملخص التغييرات

### الملفات المعدلة:
1. **api/generate-sig.js** ✅
   - أزلنا القيم الافتراضية الثابتة
   - أصبح يعتمد 100% على Environment Variables

2. **.env.example** ✅
   - أضفنا `TRTC_SDK_APP_ID` و `TRTC_SECRET_KEY`
   - وثقنا كيفية الحصول على المفاتيح

3. **.gitignore** ✅
   - أضفنا حماية لملفات `.env*`

### ما تحتاج فعله:
1. ✅ إضافة Environment Variables في Vercel
2. ✅ إعادة Deploy المشروع
3. ✅ اختبار Voice Chat للتأكد من عمله

---

**تم! 🎉 مفاتيحك الآن آمنة ومحمية**
