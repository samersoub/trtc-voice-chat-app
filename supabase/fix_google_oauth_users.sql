-- ============================================================
-- إصلاح مشكلة عدم ظهور المستخدمين في لوحة التحكم بعد تسجيل الدخول عبر Google
-- Fix: Users not showing in Admin Dashboard after Google OAuth
-- ============================================================

-- STEP 1: التحقق من وجود Trigger
-- Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
  AND trigger_name = 'on_auth_user_created';

-- STEP 2: حذف Trigger القديم إن وُجد
-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- STEP 3: إنشاء أو تحديث الدالة handle_new_user
-- Create or update handle_new_user function
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
    true, -- is_active
    'user', -- default role
    100, -- initial coins
    0, -- initial diamonds
    1, -- initial level
    '{}', -- empty followers array
    '{}', -- empty following array
    '{}', -- empty interests array
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

-- STEP 4: إنشاء Trigger جديد
-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 5: معالجة المستخدمين الموجودين مسبقاً (من auth.users إلى public.users)
-- Process existing auth users that don't have profiles
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

-- STEP 6: منح الصلاحيات اللازمة
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- STEP 7: التحقق من النتائج
-- Verify results
SELECT 
  'auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'public.users' as table_name,
  COUNT(*) as count
FROM public.users;

-- عرض المستخدمين الموجودين
-- Show existing users
SELECT 
  id,
  username,
  email,
  full_name,
  avatar_url,
  role,
  coins,
  is_active,
  is_verified,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- COMPLETED! الآن يجب أن يظهر جميع المستخدمين في لوحة التحكم
-- ============================================================
