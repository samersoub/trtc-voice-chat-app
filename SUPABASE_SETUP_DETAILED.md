# 🎯 دليل إنشاء قاعدة البيانات من الصفر - خطوة بخطوة

## 📋 قبل البدء
تأكد أنك:
- ✅ حذفت قاعدة البيانات القديمة
- ✅ مشروعك في Supabase جاهز ونشط
- ✅ عندك اتصال بالإنترنت

---

## المرحلة الأولى: الوصول إلى SQL Editor

### الخطوة 1️⃣: فتح Supabase Dashboard
1. افتح المتصفح
2. اذهب إلى: **https://supabase.com/dashboard**
3. سجل دخول إذا لم تكن مسجلاً
4. اضغط على مشروعك: **"dandana-voice-chat"**

### الخطوة 2️⃣: فتح SQL Editor
1. في القائمة الجانبية **اليسرى**، ابحث عن:
   ```
   🔧 SQL Editor
   ```
2. اضغط عليها
3. ستفتح صفحة فيها مربع كبير فارغ (محرر SQL)

### الخطوة 3️⃣: إنشاء استعلام جديد
1. في الزاوية اليمنى العليا، اضغط **"+ New query"**
2. سيظهر محرر SQL جديد فارغ

---

## المرحلة الثانية: إنشاء الجداول

### الخطوة 4️⃣: نسخ كود SQL

**⚠️ مهم جداً: انسخ الكود التالي كاملاً (من السطر الأول إلى الأخير)**

```sql
-- ===================================================================
-- STEP 1: Create Tables
-- ===================================================================

-- Table 1: voice_room_seats (المقاعد)
CREATE TABLE IF NOT EXISTS public.voice_room_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  user_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  user_level INTEGER DEFAULT 1,
  vip_level INTEGER DEFAULT 0,
  is_speaking BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, seat_number)
);

-- Table 2: voice_room_messages (الرسائل)
CREATE TABLE IF NOT EXISTS public.voice_room_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  gift_icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id 
  ON public.voice_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_created_at 
  ON public.voice_room_messages(created_at);

-- ===================================================================
-- STEP 2: Enable Row Level Security (RLS)
-- ===================================================================

ALTER TABLE public.voice_room_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_messages ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 3: Create Policies (الصلاحيات)
-- ===================================================================

-- Policies for voice_room_seats
DROP POLICY IF EXISTS "Anyone can view seats" ON public.voice_room_seats;
CREATE POLICY "Anyone can view seats" 
  ON public.voice_room_seats 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can join seats" ON public.voice_room_seats;
CREATE POLICY "Users can join seats" 
  ON public.voice_room_seats 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their seat" ON public.voice_room_seats;
CREATE POLICY "Users can update their seat" 
  ON public.voice_room_seats 
  FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Users can leave seats" ON public.voice_room_seats;
CREATE POLICY "Users can leave seats" 
  ON public.voice_room_seats 
  FOR DELETE 
  USING (true);

-- Policies for voice_room_messages
DROP POLICY IF EXISTS "Anyone can view messages" ON public.voice_room_messages;
CREATE POLICY "Anyone can view messages" 
  ON public.voice_room_messages 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can send messages" ON public.voice_room_messages;
CREATE POLICY "Users can send messages" 
  ON public.voice_room_messages 
  FOR INSERT 
  WITH CHECK (true);

-- ===================================================================
-- STEP 4: Create Function for auto-updating timestamps
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- STEP 5: Create Trigger
-- ===================================================================

DROP TRIGGER IF EXISTS update_voice_room_seats_updated_at ON public.voice_room_seats;
CREATE TRIGGER update_voice_room_seats_updated_at
  BEFORE UPDATE ON public.voice_room_seats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- STEP 6: Grant Permissions
-- ===================================================================

GRANT ALL ON public.voice_room_seats TO anon, authenticated;
GRANT ALL ON public.voice_room_messages TO anon, authenticated;

-- ===================================================================
-- SUCCESS! Tables created successfully
-- ===================================================================
```

### الخطوة 5️⃣: تنفيذ الكود

**📝 الآن اتبع بدقة:**

1. **انسخ** الكود السابق كاملاً (اضغط Ctrl+A ثم Ctrl+C في المربع أعلاه)

2. **الصق** في محرر SQL في Supabase (اضغط Ctrl+V)

3. **تأكد** أن كل الكود ظهر بشكل صحيح

4. **اضغط** زر **"RUN"** الأخضر في الزاوية اليمنى السفلى
   - أو اضغط `Ctrl + Enter`

5. **انتظر** 5-10 ثواني

6. **شاهد النتيجة:**
   - ✅ إذا ظهرت رسالة **"Success"** باللون الأخضر → ممتاز!
   - ❌ إذا ظهر خطأ باللون الأحمر → أرسل لي نص الخطأ

---

## المرحلة الثالثة: التحقق من الجداول

### الخطوة 6️⃣: التحقق من إنشاء الجداول

1. في القائمة الجانبية اليسرى، اضغط على:
   ```
   📊 Database
   ```

2. ثم اضغط على:
   ```
   📋 Tables
   ```

3. **يجب أن ترى الجدولين التاليين:**
   - ✅ `voice_room_seats`
   - ✅ `voice_room_messages`

4. **إذا ظهرا** → ممتاز! انتقل للخطوة التالية
5. **إذا لم يظهرا** → أخبرني فوراً

---

## المرحلة الرابعة: تفعيل Realtime

### الخطوة 7️⃣: تفعيل Realtime على الجداول

**⚠️ هذه الخطوة مهمة جداً للمزامنة في الوقت الفعلي**

1. في القائمة الجانبية اليسرى، اضغط على:
   ```
   📊 Database
   ```

2. ثم اضغط على:
   ```
   🔄 Replication
   ```

3. ستظهر صفحة بها جدول كبير

4. **ابحث عن الجدول الأول:** `voice_room_seats`
   - في نفس صف الجدول، ستجد مفتاح تبديل (Toggle/Switch)
   - **اضغط عليه** حتى يتحول إلى اللون **الأخضر** أو **الأزرق**

5. **ابحث عن الجدول الثاني:** `voice_room_messages`
   - **اضغط على المفتاح** حتى يتحول إلى اللون **الأخضر** أو **الأزرق**

6. **تأكد** أن المفتاحين الآن مفعلين ✅

---

## المرحلة الخامسة: اختبار قاعدة البيانات

### الخطوة 8️⃣: إضافة بيانات تجريبية

**لنتأكد أن كل شيء يعمل:**

1. ارجع إلى **SQL Editor**

2. أنشئ استعلام جديد (**+ New query**)

3. انسخ والصق الكود التالي:

```sql
-- Test: Insert sample seat data
INSERT INTO public.voice_room_seats (
  room_id, 
  seat_number, 
  user_id, 
  user_name, 
  user_avatar,
  is_speaking,
  is_muted
) VALUES (
  '343645',
  1,
  'test_user_1',
  'عمر',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
  true,
  false
);

-- Test: Insert sample message
INSERT INTO public.voice_room_messages (
  room_id,
  user_id,
  user_name,
  message,
  message_type
) VALUES (
  '343645',
  'test_user_1',
  'عمر',
  'مرحباً! هذه رسالة تجريبية 🎉',
  'text'
);

-- Check the data
SELECT * FROM public.voice_room_seats;
SELECT * FROM public.voice_room_messages;
```

4. **اضغط RUN**

5. **النتيجة المتوقعة:**
   - سترى في الأسفل جدولين
   - الأول يحتوي على مقعد واحد
   - الثاني يحتوي على رسالة واحدة

6. **إذا رأيت البيانات** → ممتاز! قاعدة البيانات تعمل! ✅

---

## المرحلة السادسة: تنظيف البيانات التجريبية

### الخطوة 9️⃣: حذف البيانات التجريبية

**الآن لنحذف البيانات التجريبية:**

1. في **SQL Editor**، أنشئ استعلام جديد

2. انسخ والصق:

```sql
-- Clean up test data
DELETE FROM public.voice_room_seats WHERE user_id = 'test_user_1';
DELETE FROM public.voice_room_messages WHERE user_id = 'test_user_1';

-- Verify deletion
SELECT COUNT(*) as seats_count FROM public.voice_room_seats;
SELECT COUNT(*) as messages_count FROM public.voice_room_messages;
```

3. **اضغط RUN**

4. **يجب أن ترى:**
   - `seats_count: 0`
   - `messages_count: 0`

---

## 🎉 تهانينا! قاعدة البيانات جاهزة!

### ✅ ما أنجزناه:

- [x] إنشاء جدول `voice_room_seats` (20 مقعد لكل غرفة)
- [x] إنشاء جدول `voice_room_messages` (الرسائل النصية)
- [x] تفعيل Row Level Security (الأمان)
- [x] إنشاء Policies (الصلاحيات)
- [x] تفعيل Realtime (المزامنة الفورية)
- [x] اختبار قاعدة البيانات

---

## 🚀 الخطوة التالية: ربط التطبيق

### الخطوة 🔟: تحديث متغيرات البيئة في Vercel

1. اذهب إلى **Vercel Dashboard**
2. اختر مشروعك
3. اذهب إلى **Settings** → **Environment Variables**
4. تأكد من وجود:
   ```
   VITE_SUPABASE_URL=https://ectyhtkhhcpjdgzrgngе.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_TFVl23dFrapFPQ501Ccf7A_oER-7q3G
   ```
5. إذا لم تكن موجودة، أضفها
6. **Redeploy** التطبيق

---

## 🧪 اختبار نهائي

### الخطوة 1️⃣1️⃣: اختبر التطبيق

**محلياً:**
```bash
pnpm dev
```
ثم افتح: http://localhost:8080/voice/rooms/343645/join

**على Vercel:**
افتح: https://your-app.vercel.app/voice/rooms/343645/join

**اختبر:**
1. افتح الغرفة في متصفحين مختلفين
2. اجلس على مقعد في المتصفح الأول
3. يجب أن ترى المقعد محجوز في المتصفح الثاني فوراً! ✨
4. اكتب رسالة في أحد المتصفحين
5. يجب أن تظهر في الآخر فوراً! ✨

---

## ❓ في حال وجود مشاكل

### المشكلة: خطأ عند تنفيذ SQL
**الحل:**
1. اقرأ رسالة الخطأ جيداً
2. أرسلها لي كاملة
3. لا تقلق، يمكن إعادة المحاولة

### المشكلة: الجداول لا تظهر
**الحل:**
1. أعد تحميل الصفحة (F5)
2. تأكد أنك في مشروعك الصحيح
3. جرب تنفيذ الكود مرة أخرى

### المشكلة: Realtime لا يعمل
**الحل:**
1. تأكد من تفعيل المفاتيح في Replication
2. أعد تحميل الصفحة
3. تأكد من إضافة المتغيرات في Vercel

---

## 📝 ملاحظات مهمة

1. **لا تحذف الجداول مرة أخرى** إلا إذا كنت متأكداً
2. **احتفظ بنسخة** من كود SQL في مكان آمن
3. **البيانات التجريبية** تُستخدم للاختبار فقط
4. **Realtime يجب أن يكون مفعّل** دائماً

---

## 🎊 الخلاصة

الآن لديك:
✅ قاعدة بيانات نظيفة وجديدة  
✅ جداول محسنة للأداء  
✅ Realtime مفعّل  
✅ جاهزة للاختبار مع أصدقائك  

**استمتع بتطبيقك! 🚀**
