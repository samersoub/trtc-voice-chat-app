-- ============================================================
-- إنشاء Storage Buckets لرفع الصور
-- Create Storage Buckets for Image Upload
-- ============================================================
-- هذا الملف يُحل خطأ "Bucket not found" عند رفع الصور
-- This file fixes "Bucket not found" error when uploading images

-- STEP 1: إنشاء Bucket للصور الشخصية (Profile Images)
-- Create bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,  -- Public bucket (الصور متاحة للجميع)
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- STEP 2: إنشاء Bucket لصور خلفيات الغرف (Room Covers)
-- Create bucket for room cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-covers',
  'room-covers',
  true,
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- STEP 3: إنشاء Bucket للهدايا (Gifts/Lottie animations)
-- Create bucket for gift animations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gifts',
  'gifts',
  true,
  2097152,  -- 2MB max file size
  ARRAY['application/json', 'image/gif', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['application/json', 'image/gif', 'image/png'];

-- STEP 4: منح صلاحيات الرفع لجميع المستخدمين المُسجلين
-- Grant upload permissions to authenticated users

-- Policy: Allow authenticated users to upload their own profile images
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
CREATE POLICY "Users can upload their own profile image"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own profile images
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
CREATE POLICY "Users can update their own profile image"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own profile images
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
CREATE POLICY "Users can delete their own profile image"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to profile images
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
CREATE POLICY "Public can view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Policy: Allow authenticated users to upload room covers
DROP POLICY IF EXISTS "Users can upload room covers" ON storage.objects;
CREATE POLICY "Users can upload room covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'room-covers');

-- Policy: Allow authenticated users to update room covers
DROP POLICY IF EXISTS "Users can update room covers" ON storage.objects;
CREATE POLICY "Users can update room covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'room-covers');

-- Policy: Allow public read access to room covers
DROP POLICY IF EXISTS "Public can view room covers" ON storage.objects;
CREATE POLICY "Public can view room covers"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'room-covers');

-- Policy: Allow public read access to gifts
DROP POLICY IF EXISTS "Public can view gifts" ON storage.objects;
CREATE POLICY "Public can view gifts"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gifts');

-- Policy: Only admins can upload gifts
DROP POLICY IF EXISTS "Admins can upload gifts" ON storage.objects;
CREATE POLICY "Admins can upload gifts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gifts'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- STEP 5: التحقق من إنشاء الـ Buckets
-- Verify buckets are created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('profiles', 'room-covers', 'gifts')
ORDER BY id;

-- STEP 6: عرض Policies المُنشأة
-- Show created policies
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- ============================================================
-- COMPLETED! الآن يمكنك رفع الصور بدون خطأ "Bucket not found"
-- ============================================================
-- 
-- ملاحظات مهمة:
-- - صور البروفايل: يمكن لكل مستخدم رفع وتعديل صوره فقط
-- - صور الغرف: يمكن لأي مستخدم مُسجل رفعها
-- - الهدايا: يمكن للمسؤولين فقط رفعها
-- - جميع الصور متاحة للعرض العام
-- ============================================================
