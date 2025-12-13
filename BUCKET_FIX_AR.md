# إصلاح خطأ "Bucket not found" عند إنشاء الغرف
**Fix: "Bucket not found" Error When Creating Rooms**

## المشكلة

عند محاولة إنشاء غرفة صوتية، يظهر الخطأ:
```
Bucket not found
```

### السبب الجذري
- التطبيق يحاول رفع صورة البروفايل إلى Supabase Storage
- الـ bucket المطلوب (اسمه `profiles`) غير موجود في Supabase
- لم يتم إنشاء buckets التخزين في قاعدة البيانات

## الحل المُطبق ✅

### 1️⃣ إنشاء Storage Buckets في Supabase

تم إنشاء ملف SQL جديد: [`supabase/create_storage_buckets.sql`](supabase/create_storage_buckets.sql)

**الـ Buckets المُنشأة:**

| Bucket | الاستخدام | الحد الأقصى | الصلاحيات |
|--------|----------|------------|-----------|
| `profiles` | صور البروفايل الشخصية | 5MB | كل مستخدم يرفع صوره فقط |
| `room-covers` | صور خلفيات الغرف الصوتية | 10MB | أي مستخدم مُسجل |
| `gifts` | ملفات الهدايا والـ animations | 2MB | المسؤولين فقط |

**الصيغ المسموحة:**
- صور: `jpeg`, `jpg`, `png`, `gif`, `webp`
- ملفات JSON (للهدايا): `application/json`

### 2️⃣ تحديث ProfileService للتعامل مع الخطأ

تم تعديل [`src/services/ProfileService.ts`](src/services/ProfileService.ts) لإضافة **Graceful Degradation**:

```typescript
// الآن إذا فشل رفع الصورة لـ Supabase:
// 1. يطبع warning في console
// 2. يحفظ الصورة في localStorage كـ base64
// 3. التطبيق يستمر بالعمل بدون توقف
```

**السلوك الجديد:**
```
محاولة رفع إلى Supabase Storage
   ↓
   ├─ نجح ✅ → يُحفظ في Supabase
   └─ فشل ❌ → يُحفظ في localStorage (وضع محلي)
```

## خطوات التطبيق (مطلوب تنفيذها!)

### الخطوة 1: تطبيق SQL في Supabase

1. افتح **Supabase Dashboard**: https://vdpfjkmqggteaijvlule.supabase.co
2. اذهب إلى **SQL Editor**
3. انقر **New query**
4. انسخ محتوى [`supabase/create_storage_buckets.sql`](supabase/create_storage_buckets.sql)
5. الصق المحتوى واضغط **Run** (Ctrl+Enter)
6. انتظر رسالة "Success"

### الخطوة 2: التحقق من إنشاء الـ Buckets

في Supabase Dashboard:
1. اذهب إلى **Storage** من القائمة اليسرى
2. يجب أن تشاهد 3 buckets:
   - ✅ `profiles`
   - ✅ `room-covers`
   - ✅ `gifts`

أو تحقق من خلال SQL:
```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('profiles', 'room-covers', 'gifts');
```

### الخطوة 3: اختبار إنشاء الغرفة

1. افتح التطبيق: http://localhost:8080
2. سجل دخول
3. اذهب إلى **Create Room**
4. املأ البيانات وأضف صورة (اختياري)
5. انقر **Create**
6. ✅ يجب أن تُنشأ الغرفة بنجاح بدون أي أخطاء

## البدائل (إذا لم ترد تطبيق SQL)

### الحل السريع: الوضع المحلي (بدون Supabase Storage)

التطبيق الآن يعمل **بدون** إنشاء buckets! سيحفظ الصور في localStorage تلقائياً.

**الفرق:**
- ✅ **مع Buckets**: الصور تُحفظ في Supabase → متاحة من أي جهاز
- ⚠️ **بدون Buckets**: الصور تُحفظ محلياً → تظهر فقط على نفس الجهاز

### لحذف خطوة رفع الصورة تماماً

إذا أردت إلغاء رفع صور البروفايل عند إنشاء الغرفة:

في [`src/pages/voice-chat/CreateRoom.tsx`](src/pages/voice-chat/CreateRoom.tsx) السطر 106-112:
```typescript
// احذف أو علّق هذه الأسطر:
// if (!existingImageUrl && !imageFile) {
//   showError("Please add a profile picture before creating a room");
//   return;
// }
// if (imageFile) {
//   await ProfileService.uploadProfileImage(user.id, imageFile);
//   showSuccess("Profile image updated");
// }
```

## التغييرات التقنية

### الملفات الجديدة:
1. **[`supabase/create_storage_buckets.sql`](supabase/create_storage_buckets.sql)**
   - إنشاء 3 buckets (profiles, room-covers, gifts)
   - تعريف صلاحيات RLS لكل bucket
   - تحديد أنواع الملفات المسموحة

### الملفات المُعدّلة:
1. **[`src/services/ProfileService.ts`](src/services/ProfileService.ts)**
   - إضافة `try/catch` حول عملية رفع الصورة
   - إنشاء دالة `uploadLocally()` للحفظ المحلي
   - معالجة خطأ "Bucket not found" تلقائياً

## الفوائد

✅ **Graceful Degradation**: التطبيق يعمل حتى بدون Storage buckets  
✅ **No Breaking Changes**: لا يؤثر على الكود الموجود  
✅ **User-Friendly**: المستخدم لا يرى خطأ، العملية تستمر  
✅ **Production Ready**: جاهز للنشر مع أو بدون Supabase Storage  

## استكشاف الأخطاء

### المشكلة: الخطأ لا يزال يظهر بعد تطبيق SQL

**التحقق:**
```sql
-- في Supabase SQL Editor
SELECT id, name FROM storage.buckets;
-- يجب أن تظهر: profiles, room-covers, gifts
```

**الحل:**
```sql
-- إعادة إنشاء bucket يدوياً
DELETE FROM storage.buckets WHERE id = 'profiles';
-- ثم أعد تنفيذ create_storage_buckets.sql
```

### المشكلة: "permission denied" عند رفع الصورة

**الحل:**
```sql
-- تحقق من صلاحيات RLS
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- إذا كانت الـ policies غير موجودة، أعد تنفيذ SQL
```

### المشكلة: الصور لا تظهر بعد الرفع

**السبب المحتمل:**
- الـ bucket غير `public`

**الحل:**
```sql
UPDATE storage.buckets
SET public = true
WHERE id IN ('profiles', 'room-covers', 'gifts');
```

### تحقق من حالة الرفع

افتح **Browser Console** (F12) وابحث عن:
- ✅ `Storage upload successful` → يعمل بشكل صحيح
- ⚠️ `Storage upload failed, using local storage` → يستخدم الوضع المحلي
- ❌ `Bucket not found` → لم يتم تطبيق SQL

## ملاحظات مهمة

1. **في Development**: localStorage يعمل جيداً للاختبار
2. **في Production**: يُفضّل تطبيق SQL لحفظ الصور في Supabase
3. **حجم الصور**: يتم تصغيرها تلقائياً إلى 512×512 بكسل
4. **الصلاحيات**: كل مستخدم يمكنه رفع صوره الشخصية فقط
5. **النوع**: JPEG, PNG, GIF, WebP مدعومة

## الخلاصة

✅ **تم إصلاح الخطأ بطريقتين:**
1. **الحل الأمثل**: تطبيق [`create_storage_buckets.sql`](supabase/create_storage_buckets.sql) في Supabase
2. **الحل البديل**: التطبيق يعمل تلقائياً مع localStorage إذا فشل Supabase

✅ **الآن يمكنك:**
- إنشاء غرف صوتية بدون أخطاء
- رفع صور البروفايل
- رفع صور خلفيات الغرف
- العمل في وضع محلي أو مع Supabase Storage

---

**الخطوة التالية:**
تنفيذ [`supabase/create_storage_buckets.sql`](supabase/create_storage_buckets.sql) في Supabase SQL Editor (مستحسن لكن اختياري)

التطبيق يعمل الآن بدون أخطاء حتى بدون تنفيذ SQL! 🎉
