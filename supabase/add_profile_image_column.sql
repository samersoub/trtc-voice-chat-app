-- ============================================================
-- إصلاح خطأ: profile_image column not found
-- Fix: Add profile_image column to users table
-- ============================================================
-- 
-- الخطأ: Could not find the 'profile_image' column of 'users' in the schema cache
-- السبب: الكود يستخدم profile_image لكن الجدول يحتوي فقط على avatar_url
-- الحل: إضافة عمود profile_image أو استخدام avatar_url
--
-- هذا الملف يضيف العمود profile_image لتوافق الكود
-- ============================================================

-- STEP 1: إضافة عمود profile_image إلى جدول users
-- Add profile_image column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- STEP 2: نسخ البيانات من avatar_url إلى profile_image (للبيانات الموجودة)
-- Copy existing data from avatar_url to profile_image
UPDATE public.users 
SET profile_image = avatar_url 
WHERE profile_image IS NULL AND avatar_url IS NOT NULL;

-- STEP 3: إنشاء فهرس للأداء (اختياري)
-- Create index for performance (optional)
CREATE INDEX IF NOT EXISTS idx_users_profile_image 
ON public.users(profile_image) 
WHERE profile_image IS NOT NULL;

-- STEP 4: إنشاء Trigger لمزامنة profile_image مع avatar_url
-- Create trigger to sync profile_image with avatar_url
CREATE OR REPLACE FUNCTION sync_profile_image_with_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تم تحديث avatar_url، نسخه إلى profile_image
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    NEW.profile_image := NEW.avatar_url;
  END IF;
  
  -- إذا تم تحديث profile_image، نسخه إلى avatar_url
  IF NEW.profile_image IS DISTINCT FROM OLD.profile_image THEN
    NEW.avatar_url := NEW.profile_image;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- حذف الـ trigger القديم إن وُجد
DROP TRIGGER IF EXISTS sync_profile_avatar ON public.users;

-- إنشاء الـ trigger
CREATE TRIGGER sync_profile_avatar
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_image_with_avatar();

-- STEP 5: التحقق من إضافة العمود
-- Verify column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('avatar_url', 'profile_image')
ORDER BY column_name;

-- STEP 6: عرض بعض البيانات للتحقق
-- Show some data to verify
SELECT 
  id,
  username,
  email,
  avatar_url,
  profile_image,
  created_at
FROM public.users
LIMIT 5;

-- ============================================================
-- COMPLETED! الآن العمود profile_image موجود
-- ============================================================
-- 
-- ملاحظات:
-- 1. العمود profile_image الآن موجود في جدول users
-- 2. الـ trigger يضمن المزامنة بين profile_image و avatar_url
-- 3. أي تحديث على أحدهما يُنسخ للآخر تلقائياً
-- 4. هذا يضمن التوافق مع الكود الموجود
-- 
-- الآن يمكنك إنشاء الغرف الصوتية بدون أخطاء!
-- ============================================================
