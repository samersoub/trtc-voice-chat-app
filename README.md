# 🎙️ Voice Chat App - تطبيق المحادثات الصوتية

<div dir="rtl">

تطبيق محادثات صوتية متقدم مع ميزات اجتماعية شاملة، مبني بأحدث التقنيات وجاهز للإنتاج.

</div>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green)](https://web.dev/progressive-web-apps/)

## ✨ الميزات الرئيسية

### 🎯 الميزات الأساسية
- ✅ **غرف صوتية متقدمة** مع دعم 8 متحدثين
- ✅ **TRTC Integration** لمحادثات صوتية عالية الجودة
- ✅ **نظام رسائل فورية** مع دعم الرموز التعبيرية
- ✅ **نظام الهدايا** مع Lottie animations
- ✅ **اقتصاد افتراضي** (Coins & Diamonds)
- ✅ **مطابقة ذكية AI-powered** للمستخدمين
- ✅ **نظام الأصدقاء والمتابعة**
- ✅ **لوحة إدارة شاملة** للمسؤولين

### 🔐 الأمان والخصوصية (6 خدمات متقدمة)
1. **Rate Limiting** - حماية من DDoS والهجمات
2. **E2E Encryption** - تشفير end-to-end للرسائل (RSA + AES)
3. **AI Content Moderation** - فلترة تلقائية للمحتوى
4. **Two-Factor Authentication** - TOTP مع backup codes
5. **GDPR Compliance** - حماية البيانات الأوروبية
6. **Enhanced Session Management** - Device fingerprinting

### 🎨 تجربة المستخدم
- ✅ **Dark Mode** أنيق
- ✅ **RTL Support** للغة العربية
- ✅ **Responsive Design** لجميع الأجهزة
- ✅ **PWA Support** للتثبيت كتطبيق
- ✅ **Animations** سلسة (Tailwind + Lottie)
- ✅ **Error Boundaries** لتجربة مستقرة

### 📊 للمطورين
- ✅ **TypeScript** بدون أخطاء (0 errors)
- ✅ **Vitest** مع 90+ اختبار
- ✅ **ESLint** للجودة
- ✅ **Code Splitting** محسّن
- ✅ **Performance Utilities**
- ✅ **Analytics Ready** (Google Analytics 4)

---

## 🚀 التثبيت السريع

### المتطلبات
- Node.js 24.x
- pnpm 9.x

### الخطوات

```bash
# 1. تثبيت Dependencies
pnpm install

# 2. تشغيل التطبيق
pnpm dev

# 3. فتح المتصفح
# http://localhost:8080
```

---

## 🧪 الاختبارات

```bash
pnpm test              # تشغيل الاختبارات (watch mode)
pnpm test:ui           # تشغيل مع UI
pnpm test:coverage     # Coverage report
```

---

## 🎨 الأوامر المتاحة

```bash
pnpm dev              # Development server (:8080)
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm preview          # Preview production build
```

---

## 📁 هيكل المشروع الرئيسي

```
src/
├── components/         # React components
│   ├── ui/            # shadcn/ui (لا تعدل)
│   ├── voice/         # Voice room components
│   └── ErrorBoundary.tsx
├── services/          # 60+ خدمة
│   ├── __tests__/     # 90+ اختبار
│   ├── RateLimitService.ts
│   ├── E2EEncryptionService.ts
│   └── ...
├── hooks/             # Custom hooks
│   ├── useTrtc.ts
│   └── useAnalytics.ts
├── pages/             # 20+ صفحة
└── utils/             # Utilities
```

---

## 🔒 أمثلة الاستخدام

### Rate Limiting
```typescript
import RateLimitService from '@/services/RateLimitService';

const result = RateLimitService.checkLimit('LOGIN', userId);
if (!result.allowed) {
  alert('تجاوزت الحد المسموح');
}
```

### Content Moderation
```typescript
import AIContentModerationService from '@/services/AIContentModerationService';

const result = AIContentModerationService.moderateText('User message');
if (result.action === 'BLOCK') {
  alert('محتوى غير مسموح');
}
```

---

## 📊 الإحصائيات

| المقياس | القيمة |
|---------|--------|
| **Services** | 60+ |
| **Tests** | 90+ |
| **Security Services** | 6 |
| **TypeScript Errors** | 0 ✅ |

---

## 📞 الدعم

للتفاصيل الكاملة، راجع ملف [PRODUCTION_READY_COMPLETE.md](./PRODUCTION_READY_COMPLETE.md)

---

<div align="center">

**صُنع بـ ❤️ في السعودية 🇸🇦**

</div>
