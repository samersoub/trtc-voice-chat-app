# 🚀 Quick Start Guide

دليل سريع لبدء العمل على المشروع في 5 دقائق!

## ✅ التحقق من المتطلبات

```bash
# Node.js version (يجب أن يكون 24.x)
node --version

# pnpm version
pnpm --version
```

إذا لم يكن مثبتاً:
```bash
# تثبيت pnpm
npm install -g pnpm
```

---

## 📦 التثبيت

```bash
# 1. تثبيت جميع الحزم
pnpm install

# 2. تشغيل التطبيق
pnpm dev
```

التطبيق الآن يعمل على: **http://localhost:8080**

---

## 🧪 تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
pnpm test

# تشغيل مع واجهة UI
pnpm test:ui

# تقرير Coverage
pnpm test:coverage
```

---

## 🏗️ البناء للإنتاج

```bash
# بناء للإنتاج
pnpm build

# معاينة البناء
pnpm preview
```

---

## 📝 المهام الشائعة

### إضافة مكون جديد
```bash
# المكونات توجد في:
src/components/

# shadcn/ui components (لا تعدل):
src/components/ui/
```

### إضافة خدمة جديدة
```bash
# الخدمات توجد في:
src/services/

# مثال:
src/services/MyNewService.ts
```

### إضافة صفحة جديدة
```bash
# الصفحات توجد في:
src/pages/

# لا تنسى إضافتها في App.tsx:
<Route path="/my-page" element={<MyPage />} />
```

### إضافة hook جديد
```bash
# الـ hooks توجد في:
src/hooks/

# مثال:
src/hooks/useMyHook.ts
```

---

## 🔧 التكوين السريع

### 1. TRTC (الغرف الصوتية)
ملف: `src/config/trtcConfig.ts`
```typescript
export const TRTC_SDK_APP_ID = 200297772;
```

### 2. Supabase (اختياري)
ملف: `.env`
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### 3. Analytics (اختياري)
ملف: `src/App.tsx`
```typescript
initializeAnalytics('G-XXXXXXXXXX');
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: Dependencies لا تثبت
```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### المشكلة: Port 8080 مستخدم
```bash
# غيّر Port في vite.config.ts:
server: {
  port: 3000  # أي رقم تريده
}
```

### المشكلة: TypeScript errors
```bash
# نظف cache وأعد البناء
rm -rf node_modules/.vite
pnpm dev
```

---

## 📚 الموارد المفيدة

- [الدليل الكامل](./README.md)
- [التحسينات النهائية](./PRODUCTION_READY_COMPLETE.md)
- [دليل الأمان](./SECURITY_PRIVACY_GUIDE.md)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 💡 نصائح للمطورين الجدد

1. ✅ **لا تعدل `src/components/ui/`** - هذه مكونات shadcn/ui، بدلاً من ذلك اصنع wrapper
2. ✅ **استخدم TypeScript** - التطبيق بدون أخطاء TypeScript
3. ✅ **اتبع ESLint** - شغّل `pnpm lint` قبل الـ commit
4. ✅ **اكتب اختبارات** - للميزات الجديدة
5. ✅ **استخدم useLocale** - للـ i18n (عربي/إنجليزي)

---

## 🎯 الخطوات التالية

بعد التثبيت، جرّب:

1. ✅ تصفح التطبيق على http://localhost:8080
2. ✅ شغّل الاختبارات: `pnpm test:ui`
3. ✅ اقرأ الكود في `src/services/` لفهم البنية
4. ✅ جرّب إضافة مكون جديد
5. ✅ ابدأ بتطوير ميزة جديدة!

---

**هل تحتاج مساعدة؟**
افتح issue على GitHub أو راجع الملفات الأخرى في المشروع.

**Happy Coding! 💻**
