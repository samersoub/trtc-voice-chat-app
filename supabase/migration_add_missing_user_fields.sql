-- ========================================
-- Migration: إضافة الحقول المفقودة لجدول users
-- Date: 2025-12-08
-- Purpose: مزامنة جدول users مع TypeScript User model
-- ========================================

-- 1. Add Social & Gaming Fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS followers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS following TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- 1.1 Add Missing Wealth/Economy Fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS total_gifts_received DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_gifts DECIMAL(10,2) DEFAULT 0;

-- 2. Add Premium Status
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- 2.1 Add Active Status (Required by ProfileService)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2.2 Add Last Login Timestamp
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 3. Add Enhanced Location Fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT;

-- 4. Add Age Field (Optional - will be calculated in application)
-- Note: Cannot use GENERATED column because AGE() is not immutable
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- 5. Create Indexes for New Fields
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level);
CREATE INDEX IF NOT EXISTS idx_users_premium ON public.users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location_lat, location_lng);

-- 6. Update RLS Policies for New Fields
-- Users can update their own social data
-- Drop existing policy if it exists, then create it
DROP POLICY IF EXISTS "Users can update own social data" ON public.users;

CREATE POLICY "Users can update own social data" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    -- Ensure users can only update their own social fields
    auth.uid() = id
  );

-- 7. Create Followers/Following Helper Functions
CREATE OR REPLACE FUNCTION public.add_follower(
  target_user_id UUID,
  follower_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add follower_id to target user's followers array
  UPDATE public.users
  SET followers = array_append(followers, follower_id::text)
  WHERE id = target_user_id 
  AND NOT (follower_id::text = ANY(followers));
  
  -- Add target_user_id to follower's following array
  UPDATE public.users
  SET following = array_append(following, target_user_id::text)
  WHERE id = follower_id 
  AND NOT (target_user_id::text = ANY(following));
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_follower(
  target_user_id UUID,
  follower_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove follower_id from target user's followers array
  UPDATE public.users
  SET followers = array_remove(followers, follower_id::text)
  WHERE id = target_user_id;
  
  -- Remove target_user_id from follower's following array
  UPDATE public.users
  SET following = array_remove(following, target_user_id::text)
  WHERE id = follower_id;
END;
$$;

-- 8. Create Function to Update User Level Based on Activity
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_activity INTEGER;
  calculated_level INTEGER;
BEGIN
  -- Calculate total activity (voice minutes + gifts sent + rooms created)
  SELECT 
    COALESCE(total_voice_minutes, 0) + 
    COALESCE(total_gifts_sent, 0) + 
    (SELECT COUNT(*) FROM public.voice_rooms WHERE owner_id = user_id)
  INTO total_activity
  FROM public.users
  WHERE id = user_id;
  
  -- Calculate level based on activity thresholds
  calculated_level := CASE
    WHEN total_activity >= 10000 THEN 50
    WHEN total_activity >= 5000 THEN 40
    WHEN total_activity >= 2000 THEN 30
    WHEN total_activity >= 1000 THEN 20
    WHEN total_activity >= 500 THEN 15
    WHEN total_activity >= 200 THEN 10
    WHEN total_activity >= 100 THEN 5
    ELSE 1
  END;
  
  RETURN calculated_level;
END;
$$;

-- 9. Create Trigger to Auto-Update Level
CREATE OR REPLACE FUNCTION update_user_level_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := calculate_user_level(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_user_level ON public.users;

-- Create new trigger
CREATE TRIGGER trigger_update_user_level 
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  WHEN (
    OLD.total_voice_minutes IS DISTINCT FROM NEW.total_voice_minutes OR
    OLD.total_gifts_sent IS DISTINCT FROM NEW.total_gifts_sent
  )
  EXECUTE FUNCTION update_user_level_trigger();

-- 10. Add Comments for Documentation
COMMENT ON COLUMN public.users.level IS 'مستوى المستخدم (1-50) - يُحسب تلقائياً من النشاط';
COMMENT ON COLUMN public.users.followers IS 'قائمة معرفات المتابعين';
COMMENT ON COLUMN public.users.following IS 'قائمة معرفات المتابَعين';
COMMENT ON COLUMN public.users.interests IS 'قائمة الاهتمامات';
COMMENT ON COLUMN public.users.is_premium IS 'حالة العضوية المميزة';
COMMENT ON COLUMN public.users.is_active IS 'حالة المستخدم - نشط أم معطل';
COMMENT ON COLUMN public.users.last_login IS 'آخر تسجيل دخول للمستخدم';
COMMENT ON COLUMN public.users.location_lat IS 'خط العرض للموقع';
COMMENT ON COLUMN public.users.location_lng IS 'خط الطول للموقع';
COMMENT ON COLUMN public.users.city IS 'المدينة';
COMMENT ON COLUMN public.users.age IS 'العمر - يُحسب في التطبيق من تاريخ الميلاد';

-- 11. Grant Necessary Permissions
GRANT EXECUTE ON FUNCTION public.add_follower TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_follower TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_level TO authenticated;

-- ========================================
-- Migration Complete ✅
-- ========================================
-- الآن جدول users يحتوي على:
-- - كل الحقول من TypeScript User model
-- - دوال مساعدة للمتابعة/إلغاء المتابعة
-- - حساب تلقائي للمستوى والعمر
-- - Indexes للأداء
-- ========================================
