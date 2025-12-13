-- ============================================================
-- إصلاح خطأ: new row violates row-level security policy
-- Fix: Row-Level Security Policies for users table
-- ============================================================
-- 
-- الخطأ: new row violates row-level security policy for table "users"
-- السبب: RLS policies لا تسمح للمستخدمين بتحديث بياناتهم
-- الحل: إضافة/تحديث RLS policies لجدول users
--
-- ============================================================

-- STEP 1: تفعيل RLS على جدول users (إن لم يكن مُفعّلاً)
-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- STEP 2: حذف الـ policies القديمة (إن وُجدت)
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- STEP 3: إنشاء Policies جديدة
-- Create new policies

-- 3.1: السماح للمستخدمين بقراءة جميع البيانات (للبروفايلات العامة)
-- Allow users to read all profiles (for public profiles)
CREATE POLICY "Users can view all profiles"
ON public.users
FOR SELECT
TO authenticated, anon
USING (true);

-- 3.2: السماح للمستخدمين المُسجلين بإنشاء بياناتهم الخاصة
-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3.3: السماح للمستخدمين بتحديث بياناتهم الخاصة فقط
-- Allow users to update their own data only
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3.4: السماح للمستخدمين بحذف بياناتهم الخاصة (اختياري)
-- Allow users to delete their own data (optional)
CREATE POLICY "Users can delete their own profile"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- STEP 4: إنشاء Policy خاصة للـ Service Role (للعمليات الإدارية)
-- Create policy for service role (for admin operations)
DROP POLICY IF EXISTS "Service role has full access" ON public.users;

CREATE POLICY "Service role has full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- STEP 5: التحقق من الـ Policies
-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- STEP 6: التحقق من RLS مُفعّل
-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- ============================================================
-- COMPLETED! الآن RLS policies مُعدّة بشكل صحيح
-- ============================================================
-- 
-- ملاحظات:
-- 1. SELECT: جميع المستخدمين يمكنهم رؤية البروفايلات (عامة)
-- 2. INSERT: المستخدمون المُسجلون يمكنهم إنشاء بياناتهم فقط
-- 3. UPDATE: المستخدمون يمكنهم تحديث بياناتهم فقط
-- 4. DELETE: المستخدمون يمكنهم حذف بياناتهم فقط
-- 5. Service Role: صلاحيات كاملة للعمليات الإدارية
-- 
-- الآن يمكنك إنشاء الغرف الصوتية وتحديث البروفايل بدون أخطاء RLS!
-- ============================================================
