# إصلاح خطأ RLS: new row violates row-level security policy
**Fix: Row-Level Security Policy Violation**

## 🔴 المشكلة الجديدة

عند إنشاء غرفة صوتية، يظهر الخطأ:
```
new row violates row-level security policy for table "users"
```

### السبب الجذري

**Row-Level Security (RLS)** في Supabase يمنع المستخدمين من تحديث جدول `users` لأن:
1. ❌ RLS policies غير موجودة أو غير صحيحة
2. ❌ المستخدمون لا يملكون صلاحية `UPDATE` على بياناتهم
3. ❌ Policy لا تسمح بـ `INSERT` أو `UPDATE` للمستخدم الحالي

### لماذا يحدث هذا؟

عند إنشاء غرفة صوتية، الكود يحاول:
```typescript
// في ProfileService.ts
await supabase
  .from('users')
  .upsert({
    id: user.id,
    profile_image: imageData, // ← يحاول تحديث profile_image
    // ...
  });
```

**لكن RLS يقول:** "ممنوع! لا صلاحية لك لتحديث جدول users" ❌

---

## ✅ الحل السريع

### الخطوة 1: تطبيق fix_rls_policies.sql

**الملف:** [`supabase/fix_rls_policies.sql`](supabase/fix_rls_policies.sql) ⭐

**ماذا يفعل:**
- ✅ يفعّل RLS على جدول `users`
- ✅ ينشئ policies للسماح بـ SELECT, INSERT, UPDATE, DELETE
- ✅ يسمح لكل مستخدم بتحديث بياناته الخاصة فقط
- ✅ يضيف policy خاصة لـ Service Role

---

## 🎯 التطبيق

### في Supabase Dashboard:

1. افتح: https://vdpfjkmqggteaijvlule.supabase.co
2. اذهب إلى **SQL Editor**
3. انسخ محتوى [`fix_rls_policies.sql`](supabase/fix_rls_policies.sql)
4. الصق → **Run**
5. ✅ انتظر "Success. No rows returned"

---

## 📊 الـ Policies الجديدة

### 1. قراءة البروفايلات (SELECT)
```sql
"Users can view all profiles"
FOR SELECT TO authenticated, anon
USING (true);
```
**المعنى:** جميع المستخدمين (مُسجلين وزوار) يمكنهم رؤية البروفايلات

---

### 2. إنشاء بروفايل (INSERT)
```sql
"Users can insert their own profile"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
```
**المعنى:** المستخدمون المُسجلون يمكنهم إنشاء بياناتهم فقط (auth.uid() = id)

---

### 3. تحديث بروفايل (UPDATE) ⭐ **الأهم**
```sql
"Users can update their own profile"
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```
**المعنى:** المستخدمون يمكنهم تحديث بياناتهم الخاصة فقط

**هذا Policy يحل المشكلة!**

---

### 4. حذف بروفايل (DELETE)
```sql
"Users can delete their own profile"
FOR DELETE TO authenticated
USING (auth.uid() = id);
```
**المعنى:** المستخدمون يمكنهم حذف بياناتهم فقط

---

### 5. صلاحيات الإدارة (Service Role)
```sql
"Service role has full access"
FOR ALL TO service_role
USING (true) WITH CHECK (true);
```
**المعنى:** Service Role (المفتاح الإداري) له صلاحية كاملة

---

## 🧪 التحقق

### في SQL Editor:

```sql
-- تحقق من الـ Policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
```

**يجب أن ترى:**
```
Users can delete their own profile | DELETE | {authenticated}
Users can insert their own profile | INSERT | {authenticated}
Users can update their own profile | UPDATE | {authenticated}
Users can view all profiles        | SELECT  | {authenticated, anon}
Service role has full access       | ALL     | {service_role}
```

---

### تحقق من RLS مُفعّل:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';
```

**يجب أن ترى:**
```
users | true
```

---

## 🚀 الاختبار

بعد تطبيق SQL:

1. افتح التطبيق على **Vercel**
2. سجل دخول
3. اذهب إلى **Create Room**
4. أضف صورة بروفايل
5. املأ بيانات الغرفة
6. انقر **Create**
7. ✅ **يجب أن تُنشأ الغرفة بنجاح بدون أخطاء RLS!**

---

## 🔧 استكشاف الأخطاء

### المشكلة: الخطأ لا يزال موجوداً

**السبب المحتمل:** Policies لم تُنشأ بشكل صحيح

**الحل:**
```sql
-- احذف جميع الـ policies القديمة
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- أعد تطبيق fix_rls_policies.sql كاملاً
```

---

### المشكلة: "insufficient permissions"

**السبب:** أنت تستخدم مفتاح `anon` بدلاً من `authenticated`

**الحل:**
1. تأكد من تسجيل الدخول بنجاح
2. تحقق من أن `auth.uid()` موجود
3. في Console:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log(user?.id); // يجب أن يكون موجوداً
```

---

### المشكلة: "auth.uid() is null"

**السبب:** Session غير صالحة

**الحل:**
```typescript
// في الكود
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // أعد تسجيل الدخول
  await supabase.auth.signInWithOAuth({ provider: 'google' });
}
```

---

## 💡 ملاحظات مهمة

### الأمان:

1. ✅ **USING (auth.uid() = id)** - يضمن أن المستخدم يُحدّث بياناته فقط
2. ✅ **WITH CHECK (auth.uid() = id)** - يضمن عدم تزوير الـ id
3. ✅ **TO authenticated** - فقط المستخدمون المُسجلون
4. ✅ **Service Role** - صلاحيات كاملة للعمليات الإدارية

### الأداء:

- ✅ Policies تعمل على مستوى قاعدة البيانات
- ✅ سريعة جداً (Indexed on id)
- ✅ لا تؤثر على سرعة التطبيق

### التوافق:

- ✅ يعمل مع Google OAuth
- ✅ يعمل مع Session Persistence
- ✅ يعمل مع جميع أنواع Authentication

---

## 📝 الخطوات التالية

### إذا كان لديك جداول أخرى:

```sql
-- مثال: voice_rooms
ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all rooms"
ON public.voice_rooms FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "Users can create rooms"
ON public.voice_rooms FOR INSERT TO authenticated
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their rooms"
ON public.voice_rooms FOR UPDATE TO authenticated
USING (auth.uid() = host_id);
```

---

## ✅ الخلاصة

### المشكلة:
```
new row violates row-level security policy for table "users"
```

### السبب:
- RLS policies لا تسمح بتحديث جدول `users`
- المستخدمون لا يملكون صلاحية UPDATE

### الحل:
1. تطبيق [`fix_rls_policies.sql`](supabase/fix_rls_policies.sql)
2. إنشاء Policies للسماح بـ SELECT, INSERT, UPDATE, DELETE
3. Policy UPDATE الأساسي: `USING (auth.uid() = id)`

### النتيجة:
- ✅ المستخدمون يمكنهم تحديث بياناتهم
- ✅ الأمان محفوظ (كل مستخدم يُحدّث بياناته فقط)
- ✅ إنشاء الغرف الصوتية يعمل بدون أخطاء
- ✅ جاهز للإنتاج

---

## 🚨 ترتيب التطبيق

### يجب تطبيق SQL بهذا الترتيب:

1. ✅ **أولاً:** [`add_profile_image_column.sql`](supabase/add_profile_image_column.sql)
   - يضيف عمود profile_image

2. ✅ **ثانياً:** [`fix_rls_policies.sql`](supabase/fix_rls_policies.sql) ⭐
   - يُصلح RLS policies

3. ✅ **اختياري:** [`complete_setup.sql`](supabase/complete_setup.sql)
   - إعداد شامل (يتضمن كل شيء)

---

**🚀 طبّق fix_rls_policies.sql الآن واختبر إنشاء غرفة صوتية!**

**⚠️ مهم:** بعد تطبيق SQL، أعد تحميل صفحة Vercel لتطبيق الـ policies الجديدة.
