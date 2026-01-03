# Supabase Setup Guide - دليل إعداد Supabase

## الخطوة 1: إنشاء مشروع Supabase جديد

1. اذهب إلى [https://app.supabase.com](https://app.supabase.com)
2. قم بتسجيل الدخول أو إنشاء حساب جديد
3. اضغط على "New Project"
4. املأ التفاصيل:
   - **Project Name**: dandana-voice-chat
   - **Database Password**: اختر كلمة مرور قوية واحفظها
   - **Region**: اختر أقرب منطقة لمستخدميك (مثل: Middle East)
5. اضغط "Create new project"

## الخطوة 2: تشغيل Schema SQL

1. بعد إنشاء المشروع، انتقل إلى **SQL Editor** من القائمة الجانبية
2. افتح ملف `supabase/schema.sql` من المشروع
3. انسخ كل المحتوى والصقه في SQL Editor
4. اضغط **Run** أو **Ctrl+Enter**
5. انتظر حتى تكتمل العملية (قد يستغرق 30-60 ثانية)

## الخطوة 3: الحصول على مفاتيح API

1. اذهب إلى **Settings** > **API** من القائمة الجانبية
2. ستجد:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: مفتاح طويل يبدأ بـ `eyJ...`
3. انسخ هذه القيم

## الخطوة 4: تحديث ملف .env

افتح ملف `.env` في جذر المشروع وحدّث:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

## الخطوة 5: إعداد Authentication

### تفعيل Email Authentication:
1. اذهب إلى **Authentication** > **Providers**
2. تأكد من تفعيل **Email**
3. احفظ التغييرات

### تفعيل Phone Authentication (اختياري):
1. في نفس الصفحة، فعّل **Phone**
2. ستحتاج إلى إعداد Twilio أو مزود SMS آخر
3. احفظ التغييرات

## الخطوة 6: إعداد Storage (للصور والملفات)

1. اذهب إلى **Storage** من القائمة
2. اضغط **Create a new bucket**
3. أنشئ Buckets التالية:
   - `avatars` (للصور الشخصية) - Public
   - `room-covers` (لأغلفة الغرف) - Public
   - `gifts` (لصور الهدايا) - Public
4. لكل bucket، اذهب إلى **Policies** وأضف:

```sql
-- Policy للقراءة (عام)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Policy للكتابة (المستخدمون المسجلون فقط)
CREATE POLICY "Authenticated users can upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

## الخطوة 7: إعداد Realtime (للتحديثات الفورية)

1. اذهب إلى **Database** > **Replication**
2. فعّل Realtime للجداول التالية:
   - ✅ `voice_rooms`
   - ✅ `room_participants`
   - ✅ `notifications`
   - ✅ `gift_transactions`

## الخطوة 8: اختبار الاتصال

1. شغّل التطبيق:
```bash
pnpm dev
```

2. افتح Console في المتصفح (F12)
3. ابحث عن رسائل مثل:
   - `✅ Supabase connected successfully`
   - أو أخطاء اتصال

## الخطوة 9: إضافة بيانات تجريبية (Demo Data)

بعد الإعداد، شغّل التطبيق وسجّل دخول أول مستخدم. سيتم:
1. إنشاء ملف المستخدم تلقائياً في جدول `users`
2. إضافة هدايا افتراضية من `gifts` table
3. إعطاء المستخدم 1000 عملة للبدء

## Troubleshooting (حل المشاكل)

### مشكلة: "Failed to connect to Supabase"
- تأكد من أن `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` صحيحة
- تأكد من إعادة تشغيل dev server بعد تحديث `.env`

### مشكلة: "RLS policy violation"
- تأكد من تشغيل كل SQL Schema بما في ذلك Policies
- تحقق من أن المستخدم مسجل دخول (authenticated)

### مشكلة: "Relation does not exist"
- تأكد من تشغيل `schema.sql` بالكامل
- تحقق من **Database** > **Tables** أن كل الجداول موجودة

## الخطوة التالية

بعد إكمال الإعداد، التطبيق سيستخدم:
- ✅ Supabase Auth بدلاً من localStorage
- ✅ PostgreSQL بدلاً من demo data
- ✅ Realtime subscriptions للتحديثات الفورية
- ✅ Storage للملفات والصور

---

**ملاحظة**: احتفظ بنسخة احتياطية من `Database Password` في مكان آمن!
