# إصلاح خطأ: profile_image column not found
**Fix: "Could not find the 'profile_image' column" Error**

## 🔴 المشكلة

عند إنشاء غرفة صوتية، يظهر الخطأ:
```
Could not find the 'profile_image' column of 'users' in the schema cache
```

### السبب الجذري

**Schema Mismatch**: الكود يحاول حفظ البيانات في عمود `profile_image` لكن جدول `users` في Supabase يحتوي فقط على `avatar_url`.

```typescript
// الكود في ProfileService.ts يستخدم:
profile_image: "data:image/png;base64,..." // ❌ العمود غير موجود

// بينما schema Supabase يحتوي على:
avatar_url: "https://..." // ✅ موجود
```

---

## ✅ الحل

### الخيار 1: إضافة عمود profile_image (موصى به)

**الملف:** [`supabase/add_profile_image_column.sql`](supabase/add_profile_image_column.sql) ⭐

هذا الملف:
1. ✅ يضيف عمود `profile_image` إلى جدول `users`
2. ✅ ينسخ البيانات من `avatar_url` إلى `profile_image`
3. ✅ يُنشئ trigger للمزامنة التلقائية بين العمودين

**التطبيق:**

1. افتح **Supabase Dashboard**: https://vdpfjkmqggteaijvlule.supabase.co
2. اذهب إلى **SQL Editor**
3. انسخ محتوى [`add_profile_image_column.sql`](supabase/add_profile_image_column.sql)
4. الصق → **Run**
5. ✅ تم! المشكلة حُلّت

---

### الخيار 2: استخدام complete_setup.sql المُحدّث

**الملف:** [`supabase/complete_setup.sql`](supabase/complete_setup.sql) (تم تحديثه)

الآن يحتوي على **PART 0** الذي يُصلح هذه المشكلة تلقائياً.

**التطبيق:**

1. افتح **Supabase SQL Editor**
2. انسخ محتوى [`complete_setup.sql`](supabase/complete_setup.sql) الكامل
3. الصق → **Run**
4. ✅ يُصلح جميع المشاكل دفعة واحدة!

---

## 🎯 ما يقوم به الحل

### 1. إضافة العمود

```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;
```

### 2. نسخ البيانات الموجودة

```sql
UPDATE public.users 
SET profile_image = avatar_url 
WHERE profile_image IS NULL AND avatar_url IS NOT NULL;
```

### 3. المزامنة التلقائية

```sql
CREATE TRIGGER sync_profile_avatar
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_image_with_avatar();
```

**الفائدة:**
- إذا تم تحديث `avatar_url` → يُنسخ إلى `profile_image` تلقائياً
- إذا تم تحديث `profile_image` → يُنسخ إلى `avatar_url` تلقائياً
- ✅ التوافق الكامل مع الكود الموجود

---

## 📊 قبل وبعد

### قبل الإصلاح:

```sql
-- جدول users
id | username | email | avatar_url | ... 
```

**النتيجة:** ❌ `profile_image column not found`

### بعد الإصلاح:

```sql
-- جدول users
id | username | email | avatar_url | profile_image | ...
                       ↓            ↓
                       (مُزامن تلقائياً)
```

**النتيجة:** ✅ إنشاء الغرف يعمل بنجاح!

---

## 🧪 التحقق من الإصلاح

### في Supabase SQL Editor:

```sql
-- تحقق من وجود العمود
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('avatar_url', 'profile_image');
  
-- تحقق من الـ Trigger
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'sync_profile_avatar';

-- عرض بعض البيانات
SELECT id, username, avatar_url, profile_image
FROM public.users
LIMIT 5;
```

---

## 🚀 الاختبار

بعد تطبيق SQL:

1. افتح التطبيق على **Vercel**
2. سجل دخول
3. اذهب إلى **Create Room**
4. أضف صورة بروفايل
5. انقر **Create**
6. ✅ **يجب أن تُنشأ الغرفة بنجاح بدون أخطاء!**

---

## 🔧 استكشاف الأخطاء

### المشكلة: الخطأ لا يزال موجوداً

**السبب المحتمل:** SQL لم يُنفّذ بنجاح

**الحل:**
```sql
-- تأكد من تنفيذ ALTER TABLE
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- إذا فشل، تحقق من الصلاحيات
SHOW search_path;
```

### المشكلة: البيانات غير مُزامنة

**الحل:**
```sql
-- أعد تشغيل المزامنة اليدوية
UPDATE public.users 
SET profile_image = avatar_url 
WHERE avatar_url IS NOT NULL;
```

### المشكلة: الـ Trigger لا يعمل

**الحل:**
```sql
-- احذف وأعد إنشاء الـ Trigger
DROP TRIGGER IF EXISTS sync_profile_avatar ON public.users;
DROP FUNCTION IF EXISTS sync_profile_image_with_avatar();

-- ثم أعد تنفيذ الكود من SQL file
```

---

## 💡 ملاحظات مهمة

### للنشر على Vercel:

1. ✅ **يجب تطبيق SQL في Supabase أولاً** قبل النشر
2. ✅ Vercel يستخدم نفس قاعدة البيانات Supabase
3. ✅ التغييرات تظهر فوراً بعد تطبيق SQL
4. ✅ لا حاجة لإعادة نشر التطبيق على Vercel

### التوافق:

- ✅ **avatar_url**: يُستخدم من Supabase Auth و Google OAuth
- ✅ **profile_image**: يُستخدم في الكود الداخلي
- ✅ **Trigger**: يضمن المزامنة بينهما
- ✅ **لا تعارض**: كلا العمودين يعملان معاً

---

## 📝 الملفات

### تم إنشاؤها:
- ✅ [`supabase/add_profile_image_column.sql`](supabase/add_profile_image_column.sql) - إصلاح مُستقل

### تم تحديثها:
- ✅ [`supabase/complete_setup.sql`](supabase/complete_setup.sql) - يتضمن الإصلاح الآن

---

## ✅ الخلاصة

### المشكلة:
```
Could not find the 'profile_image' column of 'users' in the schema cache
```

### السبب:
- الكود يستخدم `profile_image`
- Supabase يحتوي على `avatar_url` فقط

### الحل:
1. تطبيق [`add_profile_image_column.sql`](supabase/add_profile_image_column.sql)
2. أو تطبيق [`complete_setup.sql`](supabase/complete_setup.sql) المُحدّث

### النتيجة:
- ✅ العمود `profile_image` موجود الآن
- ✅ مُزامن تلقائياً مع `avatar_url`
- ✅ إنشاء الغرف الصوتية يعمل بدون أخطاء
- ✅ جاهز للنشر على Vercel

---

**🚀 طبّق SQL الآن واختبر إنشاء غرفة صوتية!**

**⚠️ مهم:** طبّق SQL في **Supabase Dashboard** أولاً قبل اختبار التطبيق على Vercel.
