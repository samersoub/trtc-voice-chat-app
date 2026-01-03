# 📋 دليل الربط الخارجي الشامل
# Complete External Integration Guide

> **الهدف**: ربط جميع الأنظمة الجديدة (المدفوعات، معارك PK، الحقائب المفاجئة) بقواعد البيانات Supabase والخدمات الخارجية (Stripe، PayPal)

---

## 📑 جدول المحتويات

1. [إعداد قاعدة البيانات Supabase](#1-إعداد-قاعدة-البيانات-supabase)
2. [إعداد حساب Stripe](#2-إعداد-حساب-stripe)
3. [إعداد حساب PayPal](#3-إعداد-حساب-paypal)
4. [نشر Supabase Edge Functions](#4-نشر-supabase-edge-functions)
5. [تكوين متغيرات البيئة](#5-تكوين-متغيرات-البيئة)
6. [اختبار الأنظمة](#6-اختبار-الأنظمة)
7. [المراقبة والصيانة](#7-المراقبة-والصيانة)

---

## 1. إعداد قاعدة البيانات Supabase

### الخطوة 1: تسجيل الدخول إلى Supabase

1. اذهب إلى [https://supabase.com](https://supabase.com)
2. سجل الدخول إلى حسابك
3. اختر مشروعك أو أنشئ مشروع جديد

### الخطوة 2: تنفيذ ملفات SQL

يوجد 3 ملفات SQL يجب تنفيذها بالترتيب:

#### أ) Payment System Schema

```bash
# المسار
supabase/payment_system_schema.sql
```

**خطوات التنفيذ:**
1. افتح Supabase Dashboard
2. اذهب إلى **SQL Editor** من القائمة الجانبية
3. اضغط **+ New query**
4. انسخ محتوى ملف `payment_system_schema.sql` كاملاً
5. الصق في المحرر واضغط **Run**
6. يجب أن ترى رسالة نجاح: "✅ Payment System Schema created successfully!"

**ما يتم إنشاؤه:**
- ✅ 5 جداول: `coin_packages`, `payment_transactions`, `payment_refunds`, `user_payment_methods`, `payment_webhooks`
- ✅ 2 دالات: `add_coins_from_payment()`, `process_payment_refund()`
- ✅ RLS Policies لحماية البيانات
- ✅ Views للإحصائيات: `user_payment_stats`, `daily_revenue`
- ✅ 6 باقات عملات افتراضية (من $0.99 إلى $99.99)

#### ب) PK Battles Schema

```bash
# المسار
supabase/pk_battles_schema.sql
```

**خطوات التنفيذ:**
1. افتح نافذة SQL جديدة
2. انسخ محتوى `pk_battles_schema.sql`
3. الصق و Run
4. تحقق من رسالة النجاح

**ما يتم إنشاؤه:**
- ✅ 4 جداول: `pk_battles`, `pk_battle_invites`, `pk_battle_gifts`, `pk_battle_history`
- ✅ 3 دالات: `update_battle_score_after_gift()`, `update_user_battle_history()`, `end_pk_battle()`
- ✅ Triggers تلقائية لتحديث النقاط
- ✅ Views: `pk_battle_leaderboard`, `active_pk_battles`

#### ج) Lucky Bags Schema

```bash
# المسار
supabase/lucky_bags_schema.sql
```

**خطوات التنفيذ:**
1. افتح نافذة SQL جديدة
2. انسخ محتوى `lucky_bags_schema.sql`
3. الصق و Run
4. تحقق من النجاح

**ما يتم إنشاؤه:**
- ✅ 5 جداول: `lucky_bag_templates`, `lucky_bags`, `lucky_bag_participants`, `lucky_bag_winners`, `user_lucky_bag_stats`
- ✅ 5 قوالب حقائب افتراضية (Bronze إلى Supreme)
- ✅ 3 دالات: `join_lucky_bag()`, `draw_lucky_bag_winner()`, `recalculate_bag_chances()`
- ✅ Views: `active_lucky_bags`, `recent_lucky_bag_winners`

### الخطوة 3: التحقق من إنشاء الجداول

```sql
-- في SQL Editor، نفذ هذا الاستعلام للتحقق
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'coin_packages',
    'payment_transactions',
    'pk_battles',
    'lucky_bags'
  );
```

يجب أن ترى 4 جداول على الأقل.

---

## 2. إعداد حساب Stripe

### الخطوة 1: إنشاء حساب Stripe

1. اذهب إلى [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. أنشئ حساب جديد أو سجل دخول
3. أكمل معلومات الشركة/المشروع

### الخطوة 2: الحصول على API Keys

1. في Stripe Dashboard، اذهب إلى **Developers** → **API keys**
2. انسخ المفاتيح التالية:

```
Publishable key (يبدأ بـ pk_test_... في وضع Test)
Secret key (يبدأ بـ sk_test_... في وضع Test)
```

⚠️ **مهم**: لا تشارك `Secret key` أبداً في الكود الأمامي!

### الخطوة 3: إعداد Webhook

1. في Stripe Dashboard → **Developers** → **Webhooks**
2. اضغط **+ Add endpoint**
3. أدخل URL للـ Webhook (سنحصل عليه بعد نشر Edge Function):

```
https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
```

4. اختر الأحداث التالية للاستماع إليها:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`

5. اضغط **Add endpoint**
6. انسخ **Signing secret** (يبدأ بـ `whsec_...`)

### الخطوة 4: تفعيل Payment Methods

1. اذهب إلى **Settings** → **Payment methods**
2. فعّل:
   - ✅ Cards (Visa, Mastercard)
   - ✅ Apple Pay (اختياري)
   - ✅ Google Pay (اختياري)

### الخطوة 5: إعداد الإنتاج (Production Mode)

عندما تكون جاهزاً للإطلاق:

1. اذهب إلى **Settings** → **Account details**
2. أكمل جميع المعلومات المطلوبة
3. قدم وثائق التحقق إذا طُلب منك
4. اضغط **Activate your account**
5. احصل على Production API keys من نفس المكان (ستبدأ بـ `pk_live_` و `sk_live_`)

---

## 3. إعداد حساب PayPal

### الخطوة 1: إنشاء حساب PayPal Developer

1. اذهب إلى [https://developer.paypal.com](https://developer.paypal.com)
2. سجل الدخول أو أنشئ حساب
3. اذهب إلى **Dashboard**

### الخطوة 2: إنشاء App

1. اذهب إلى **My Apps & Credentials**
2. تحت **Sandbox** (للتطوير)، اضغط **Create App**
3. أدخل اسم التطبيق (مثل: "Voice Chat Payments")
4. اضغط **Create App**

### الخطوة 3: الحصول على Credentials

في صفحة التطبيق، انسخ:

```
Client ID (للواجهة الأمامية)
Secret (للخلفية - لا تشاركه!)
```

### الخطوة 4: إعداد Webhook

1. في نفس صفحة التطبيق، scroll لأسفل إلى **Webhooks**
2. اضغط **Add Webhook**
3. أدخل URL:

```
https://[your-project-ref].supabase.co/functions/v1/paypal-webhook
```

4. اختر Event types:
   - ✅ `PAYMENT.CAPTURE.COMPLETED`
   - ✅ `PAYMENT.CAPTURE.DENIED`
   - ✅ `PAYMENT.CAPTURE.PENDING`
   - ✅ `PAYMENT.CAPTURE.REFUNDED`

5. اضغط **Save**
6. انسخ **Webhook ID**

### الخطوة 5: اختبار في Sandbox

PayPal يوفر حسابات اختبار:

1. اذهب إلى **Sandbox** → **Accounts**
2. ستجد حسابين: Business و Personal
3. استخدم Personal account للاختبار (الإيميل وكلمة المرور موجودة في التفاصيل)

### الخطوة 6: الانتقال للإنتاج

عندما تكون جاهزاً:

1. اذهب إلى **My Apps & Credentials**
2. اختر **Live** بدلاً من Sandbox
3. أنشئ App جديد
4. احصل على Live Client ID و Secret
5. أعد إعداد Webhooks

---

## 4. نشر Supabase Edge Functions

### الخطوة 1: تثبيت Supabase CLI

#### على Windows:

```powershell
# استخدم Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

أو استخدم npm:

```bash
npm install -g supabase
```

#### على Mac:

```bash
brew install supabase/tap/supabase
```

### الخطوة 2: تسجيل الدخول

```bash
supabase login
```

سيفتح المتصفح لتسجيل الدخول.

### الخطوة 3: ربط المشروع

```bash
# في مجلد المشروع
cd c:\Users\omar\Desktop\wandering-narwhal-twirl

# ربط المشروع
supabase link --project-ref [your-project-ref]
```

للحصول على `project-ref`:
1. افتح Supabase Dashboard
2. اذهب إلى **Settings** → **General**
3. انسخ **Reference ID**

### الخطوة 4: تكوين Secrets

```bash
# Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# PayPal secrets
supabase secrets set PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

### الخطوة 5: نشر Functions

```bash
# نشر Stripe webhook
supabase functions deploy stripe-webhook

# نشر PayPal webhook
supabase functions deploy paypal-webhook
```

### الخطوة 6: التحقق من النشر

```bash
# قائمة بجميع Functions
supabase functions list
```

يجب أن ترى:
- ✅ `stripe-webhook`
- ✅ `paypal-webhook`

### الخطوة 7: الحصول على URLs

بعد النشر، URLs ستكون:

```
https://[project-ref].supabase.co/functions/v1/stripe-webhook
https://[project-ref].supabase.co/functions/v1/paypal-webhook
```

استخدم هذه URLs في:
- ✅ Stripe Webhook settings
- ✅ PayPal Webhook settings

---

## 5. تكوين متغيرات البيئة

### الخطوة 1: إنشاء ملف `.env.local`

في جذر المشروع، أنشئ ملف `.env.local`:

```bash
# في PowerShell
New-Item -Path ".env.local" -ItemType File
```

### الخطوة 2: ملء المتغيرات

افتح `.env.local` وأضف:

```env
# ===================================
# Supabase Configuration
# ===================================
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ===================================
# Stripe Configuration
# ===================================
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key

# ===================================
# PayPal Configuration
# ===================================
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# ===================================
# TRTC Configuration (موجود مسبقاً)
# ===================================
VITE_TRTC_SDK_APP_ID=200297772
VITE_USERSIG_API_ENDPOINT=https://trtc-sig-service.vercel.app/api/generate-sig
```

### الخطوة 3: للحصول على Supabase Keys

1. في Supabase Dashboard
2. **Settings** → **API**
3. انسخ:
   - Project URL
   - `anon` `public` key

### الخطوة 4: تحديث Production Environment

عند نشر على Vercel:

1. اذهب إلى Vercel Dashboard
2. اختر مشروعك
3. **Settings** → **Environment Variables**
4. أضف جميع المتغيرات أعلاه
5. احفظ وأعد النشر

---

## 6. اختبار الأنظمة

### أ) اختبار Payment System

#### 1. اختبار Stripe في Test Mode

استخدم بطاقات الاختبار:

```
نجاح: 4242 4242 4242 4242
فشل: 4000 0000 0000 0002
يتطلب 3D Secure: 4000 0025 0000 3155

Expiry: أي تاريخ مستقبلي
CVC: أي 3 أرقام
ZIP: أي رمز بريدي
```

#### 2. اختبار PayPal في Sandbox

1. افتح التطبيق في المتصفح
2. اختر PayPal كوسيلة دفع
3. استخدم Sandbox Personal account للدفع
4. تحقق من إضافة العملات للحساب

#### 3. التحقق من Webhooks

في Stripe Dashboard:
1. **Developers** → **Webhooks**
2. اختر endpoint الخاص بك
3. اذهب إلى **Events** tab
4. يجب أن ترى الأحداث تصل بنجاح

### ب) اختبار PK Battles

```sql
-- في SQL Editor، أنشئ معركة تجريبية
INSERT INTO public.pk_battles (
  id, battle_type, status,
  room1_id, room1_name, room1_host_id, room1_host_name,
  duration_seconds, created_by, created_at
) VALUES (
  'test_battle_1',
  'quick',
  'waiting',
  'room_1',
  'Test Room 1',
  'your-user-uuid',
  'Test Host',
  300,
  'your-user-uuid',
  NOW()
);

-- تحقق
SELECT * FROM public.pk_battles WHERE id = 'test_battle_1';
```

### ج) اختبار Lucky Bags

```sql
-- إنشاء حقيبة تجريبية
INSERT INTO public.lucky_bags (
  id, room_id, template_id,
  creator_id, creator_name,
  total_price, min_reward, max_reward, max_participants,
  expires_at
) VALUES (
  'test_bag_1',
  'room_1',
  'bronze_bag',
  'your-user-uuid',
  'Test Creator',
  100, 50, 200, 10,
  NOW() + INTERVAL '1 hour'
);

-- تحقق
SELECT * FROM public.lucky_bags WHERE id = 'test_bag_1';
```

### د) اختبار Edge Functions محلياً

```bash
# في مجلد المشروع
# ابدأ Supabase محلياً
supabase start

# اختبر function
supabase functions serve stripe-webhook

# في نافذة أخرى، أرسل طلب اختبار
curl -X POST http://localhost:54321/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 7. المراقبة والصيانة

### أ) مراقبة المدفوعات

#### 1. Dashboard SQL Queries

```sql
-- إحصائيات يومية
SELECT * FROM public.daily_revenue
ORDER BY transaction_date DESC
LIMIT 30;

-- أكثر المستخدمين إنفاقاً
SELECT 
  u.username,
  ups.total_spent,
  ups.transaction_count
FROM public.user_payment_stats ups
JOIN public.users u ON u.id = ups.user_id
ORDER BY ups.total_spent DESC
LIMIT 20;

-- معاملات فاشلة
SELECT *
FROM public.payment_transactions
WHERE status = 'failed'
ORDER BY created_at DESC;
```

#### 2. Stripe Dashboard

- مراقبة المدفوعات: **Payments** → **Overview**
- معدل النجاح: **Reports** → **Payments**
- Disputes: **Payments** → **Disputes**

#### 3. PayPal Dashboard

- معاملات: **Activity**
- تقارير: **Reports** → **Statements**

### ب) مراقبة Webhooks

#### تحقق من صحة Webhooks

```sql
-- آخر webhooks واردة
SELECT 
  provider,
  event_type,
  status,
  created_at
FROM public.payment_webhooks
ORDER BY created_at DESC
LIMIT 50;

-- webhooks فاشلة
SELECT *
FROM public.payment_webhooks
WHERE status = 'failed'
ORDER BY created_at DESC;
```

#### Logs في Supabase

```bash
# عرض logs لـ Edge Function
supabase functions logs stripe-webhook --tail

# أو في Dashboard
# Project → Edge Functions → [function name] → Logs
```

### ج) Alerts وإشعارات

#### إنشاء Database Webhook للتنبيهات

في Supabase Dashboard:

1. **Database** → **Webhooks**
2. **Create a new hook**
3. أعد اختيار:
   - Table: `payment_transactions`
   - Events: INSERT
   - HTTP request to: your-monitoring-service-url

### د) Backup استراتيجية

#### 1. Automatic Backups (Supabase)

- Supabase يأخذ backups تلقائية يومياً
- في **Settings** → **Database** تحقق من إعدادات Backup

#### 2. Manual Exports

```bash
# تصدير جداول المدفوعات
supabase db dump > backup_$(date +%Y%m%d).sql

# استعادة
supabase db reset
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## 🚨 نقاط مهمة - CRITICAL

### 1. الأمان (Security)

- ❌ **لا تشارك `Secret Keys` أبداً**
- ✅ استخدم `.env.local` محلياً (مضاف في `.gitignore`)
- ✅ استخدم Environment Variables في Vercel
- ✅ جميع الجداول محمية بـ RLS policies
- ✅ استخدم HTTPS فقط في الإنتاج

### 2. Testing قبل الإطلاق

- ✅ اختبر جميع سيناريوهات الدفع (نجاح، فشل، refund)
- ✅ تحقق من Webhooks تعمل
- ✅ اختبر معركة PK كاملة
- ✅ اختبر Lucky Bag مع عدة مستخدمين
- ✅ تحقق من RLS policies (جرب الوصول بدون تسجيل دخول)

### 3. الانتقال للإنتاج (Production)

عند الجاهزية:

1. ✅ غيّر Stripe من Test إلى Live mode
2. ✅ غيّر PayPal من Sandbox إلى Live
3. ✅ حدّث جميع API keys في `.env.local` و Vercel
4. ✅ حدّث Webhook URLs
5. ✅ راجع جميع RLS policies
6. ✅ فعّل monitoring و alerts
7. ✅ جهّز خطة للدعم الفني

### 4. الامتثال القانوني (Compliance)

- ✅ أضف Terms of Service
- ✅ أضف Privacy Policy
- ✅ أضف Refund Policy
- ✅ تحقق من PCI DSS compliance (Stripe/PayPal يساعدون)
- ✅ التزم بقوانين حماية البيانات في بلدك

---

## 📞 الدعم والمساعدة

### Stripe Support
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com

### PayPal Support
- Documentation: https://developer.paypal.com/docs
- Support: https://developer.paypal.com/support

### Supabase Support
- Documentation: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

---

## ✅ Checklist النهائي

قبل الإطلاق، تأكد من:

### Database
- [ ] جميع SQL schemas منفذة بنجاح
- [ ] جميع الجداول موجودة
- [ ] RLS policies مفعّلة على جميع الجداول
- [ ] Functions تعمل بدون أخطاء

### Stripe
- [ ] حساب Stripe مفعّل
- [ ] API keys محفوظة في Environment Variables
- [ ] Webhook endpoint مضاف
- [ ] Payment methods مفعّلة
- [ ] اختبارات نجحت في Test mode

### PayPal
- [ ] حساب PayPal Developer جاهز
- [ ] App منشأ
- [ ] Client ID محفوظ
- [ ] Webhook endpoint مضاف
- [ ] اختبارات نجحت في Sandbox

### Edge Functions
- [ ] Supabase CLI مثبت
- [ ] Functions منشورة
- [ ] Secrets مضبوطة
- [ ] Logs تظهر بدون أخطاء
- [ ] Webhooks تستجيب بنجاح

### Frontend
- [ ] جميع Environment Variables مضبوطة
- [ ] StripeService يعمل
- [ ] PayPalService يعمل
- [ ] PKBattleService متصل بالـ Database
- [ ] LuckyBagService متصل بالـ Database
- [ ] UI تظهر كل الميزات

### Testing
- [ ] دفع ناجح عبر Stripe
- [ ] دفع ناجح عبر PayPal
- [ ] Webhooks تصل وتعالج بنجاح
- [ ] العملات تضاف للحساب بعد الدفع
- [ ] معركة PK كاملة تعمل
- [ ] Lucky Bag يسحب فائز بنجاح

---

## 🎉 تهانينا!

إذا أكملت جميع الخطوات أعلاه، تطبيقك الآن:

- ✅ نظام دفع حقيقي يعمل
- ✅ معارك PK صوتية تفاعلية
- ✅ نظام Lucky Bags مع احتمالات موزونة
- ✅ قاعدة بيانات آمنة ومحمية
- ✅ Webhooks تلقائية للتحقق من المدفوعات
- ✅ جاهز للإطلاق التجاري!

**الخطوة التالية:** تطوير واجهات المستخدم (UI) للميزات الجديدة وتحسين تجربة المستخدم.
