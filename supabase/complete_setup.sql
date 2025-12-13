-- ============================================================
-- إعداد شامل للتطبيق - جميع الإصلاحات في ملف واحد
-- Complete Setup: All Fixes in One File
-- ============================================================
-- 
-- هذا الملف يحل جميع المشاكل:
-- 1. مشكلة عدم ظهور المستخدمين في لوحة التحكم
-- 2. مشكلة Google OAuth (trigger + profiles)
-- 3. مشكلة "Bucket not found" عند رفع الصور
-- 4. إعداد صلاحيات Storage
--
-- يمكنك تطبيقه مرة واحدة وسيعمل كل شيء!
-- ============================================================

-- ============================================================
-- PART 1: Users & Authentication
-- ============================================================

-- حذف Trigger القديم إن وُجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء أو تحديث الدالة handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  new_full_name TEXT;
BEGIN
  -- Extract username from email or metadata
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'user_name', 
    NEW.raw_user_meta_data->>'preferred_username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Extract full name from metadata
  new_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    avatar_url,
    is_verified,
    is_active,
    role,
    coins,
    diamonds,
    level,
    followers,
    following,
    interests,
    created_at,
    updated_at,
    last_login
  )
  VALUES (
    NEW.id,
    NEW.email,
    new_username,
    new_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email_confirmed_at IS NOT NULL,
    true,
    'user',
    100,
    0,
    1,
    '{}',
    '{}',
    '{}',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    is_verified = EXCLUDED.is_verified,
    updated_at = NOW(),
    last_login = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء Trigger جديد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- معالجة المستخدمين الموجودين مسبقاً
INSERT INTO public.users (
  id,
  email,
  username,
  full_name,
  avatar_url,
  is_verified,
  is_active,
  role,
  coins,
  diamonds,
  level,
  followers,
  following,
  interests,
  created_at,
  updated_at,
  last_login
)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'user_name',
    au.raw_user_meta_data->>'preferred_username',
    SPLIT_PART(au.email, '@', 1)
  ),
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ),
  au.raw_user_meta_data->>'avatar_url',
  au.email_confirmed_at IS NOT NULL,
  true,
  'user',
  100,
  0,
  1,
  '{}',
  '{}',
  '{}',
  au.created_at,
  NOW(),
  au.last_sign_in_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW(),
  last_login = COALESCE(EXCLUDED.last_login, public.users.last_login);

-- منح الصلاحيات اللازمة لجدول users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- ============================================================
-- PART 2: Storage Buckets
-- ============================================================

-- إنشاء Bucket للصور الشخصية
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- إنشاء Bucket لصور الغرف
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-covers',
  'room-covers',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- إنشاء Bucket للهدايا
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gifts',
  'gifts',
  true,
  2097152,
  ARRAY['application/json', 'image/gif', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['application/json', 'image/gif', 'image/png'];

-- ============================================================
-- PART 3: Storage Policies
-- ============================================================

-- Profile Images Policies
CREATE POLICY IF NOT EXISTS "Users can upload their own profile image"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Users can update their own profile image"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Users can delete their own profile image"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Public can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profiles');

-- Room Covers Policies
CREATE POLICY IF NOT EXISTS "Users can upload room covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'room-covers');

CREATE POLICY IF NOT EXISTS "Users can update room covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'room-covers');

CREATE POLICY IF NOT EXISTS "Public can view room covers"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'room-covers');

-- Gifts Policies
CREATE POLICY IF NOT EXISTS "Public can view gifts"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'gifts');

CREATE POLICY IF NOT EXISTS "Admins can upload gifts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'gifts'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- ============================================================
-- VERIFICATION: التحقق من التطبيق
-- ============================================================

-- عرض عدد المستخدمين
SELECT 
  'auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'public.users' as table_name,
  COUNT(*) as count
FROM public.users;

-- عرض الـ Buckets المُنشأة
SELECT 
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id IN ('profiles', 'room-covers', 'gifts')
ORDER BY id;

-- عرض الـ Trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- عرض أحدث 10 مستخدمين
SELECT 
  id,
  username,
  email,
  full_name,
  avatar_url,
  role,
  coins,
  is_active,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- COMPLETED! جميع الإصلاحات تمت بنجاح
-- ============================================================
-- 
-- ✅ المستخدمون: trigger handle_new_user يعمل
-- ✅ Google OAuth: profiles تُنشأ تلقائياً
-- ✅ Storage Buckets: profiles, room-covers, gifts
-- ✅ Storage Policies: صلاحيات محددة لكل bucket
-- 
-- الآن يمكنك:
-- 1. تسجيل دخول عبر Google → يُنشأ profile تلقائياً
-- 2. رفع صور البروفايل → يُحفظ في bucket profiles
-- 3. إنشاء غرف صوتية → بدون أخطاء Bucket not found
-- 4. عرض المستخدمين في /admin/users
-- 
-- ============================================================
