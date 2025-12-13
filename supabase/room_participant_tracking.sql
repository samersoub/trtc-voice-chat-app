-- ============================================================
-- نظام تتبع المستخدمين وإخفاء الغرف الفارغة
-- Room Participant Tracking & Auto-Hide Empty Rooms
-- ============================================================
-- 
-- الميزات:
-- 1. تتبع المستخدمين الموجودين في كل غرفة
-- 2. إخفاء الغرفة تلقائياً عند خروج صاحبها أو خلوها
-- 3. تحديث عدد المستخدمين real-time
-- 4. Trigger لتحديث is_active تلقائياً
--
-- ============================================================

-- STEP 1: تحديث جدول voice_rooms لإضافة current_participants (إن لم يكن موجوداً)
-- Update voice_rooms table
ALTER TABLE public.voice_rooms 
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;

-- STEP 2: تحديث جدول room_participants (إن لم يكن موجوداً، أنشئه)
-- Create or update room_participants table
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'speaker', 'listener')) DEFAULT 'listener',
  mic_seat INTEGER CHECK (mic_seat >= 0 AND mic_seat <= 8),
  is_muted BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT TRUE,
  
  UNIQUE(room_id, user_id)
);

-- إضافة العمود is_online إذا لم يكن موجوداً (للجداول الموجودة مسبقاً)
-- Add is_online column if it doesn't exist (for existing tables)
ALTER TABLE public.room_participants 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT TRUE;

-- إنشاء Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_online ON public.room_participants(is_online) WHERE is_online = TRUE;

-- STEP 3: إنشاء Function لتحديث عدد المستخدمين
-- Function to update participant count
CREATE OR REPLACE FUNCTION update_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  -- حساب عدد المستخدمين النشطين في الغرفة
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.voice_rooms
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.room_participants
      WHERE room_id = NEW.room_id 
        AND is_online = TRUE
        AND left_at IS NULL
    ),
    updated_at = NOW()
    WHERE id = NEW.room_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.voice_rooms
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.room_participants
      WHERE room_id = OLD.room_id 
        AND is_online = TRUE
        AND left_at IS NULL
    ),
    updated_at = NOW()
    WHERE id = OLD.room_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: إنشاء Trigger لتحديث عدد المستخدمين
-- Create trigger for participant count update
DROP TRIGGER IF EXISTS trigger_update_participant_count ON public.room_participants;
CREATE TRIGGER trigger_update_participant_count
  AFTER INSERT OR UPDATE OR DELETE ON public.room_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_room_participant_count();

-- STEP 5: إنشاء Function لإخفاء الغرفة عند خلوها
-- Function to auto-hide empty rooms
CREATE OR REPLACE FUNCTION auto_hide_empty_rooms()
RETURNS TRIGGER AS $$
DECLARE
  owner_online BOOLEAN;
  participant_count INTEGER;
BEGIN
  -- حساب عدد المستخدمين النشطين
  SELECT COUNT(*) INTO participant_count
  FROM public.room_participants
  WHERE room_id = NEW.room_id 
    AND is_online = TRUE
    AND left_at IS NULL;
  
  -- التحقق إذا كان صاحب الغرفة موجوداً
  SELECT EXISTS(
    SELECT 1
    FROM public.room_participants rp
    INNER JOIN public.voice_rooms vr ON vr.id = rp.room_id
    WHERE rp.room_id = NEW.room_id
      AND rp.user_id = vr.owner_id
      AND rp.is_online = TRUE
      AND rp.left_at IS NULL
  ) INTO owner_online;
  
  -- إخفاء الغرفة إذا:
  -- 1. الغرفة فارغة تماماً (participant_count = 0)
  -- 2. أو صاحب الغرفة غير موجود
  IF participant_count = 0 OR owner_online = FALSE THEN
    UPDATE public.voice_rooms
    SET is_active = FALSE,
        updated_at = NOW()
    WHERE id = NEW.room_id;
    
    RAISE NOTICE 'Room % hidden: participants=%, owner_online=%', NEW.room_id, participant_count, owner_online;
  ELSE
    -- إظهار الغرفة إذا كان هناك مستخدمون
    UPDATE public.voice_rooms
    SET is_active = TRUE,
        updated_at = NOW()
    WHERE id = NEW.room_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: إنشاء Trigger لإخفاء الغرف الفارغة
-- Create trigger for auto-hiding empty rooms
DROP TRIGGER IF EXISTS trigger_auto_hide_empty_rooms ON public.room_participants;
CREATE TRIGGER trigger_auto_hide_empty_rooms
  AFTER INSERT OR UPDATE OR DELETE ON public.room_participants
  FOR EACH ROW
  EXECUTE FUNCTION auto_hide_empty_rooms();

-- STEP 7: تفعيل RLS على جدول room_participants
-- Enable RLS on room_participants
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- حذف Policies القديمة
DROP POLICY IF EXISTS "Anyone can view room participants" ON public.room_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON public.room_participants;
DROP POLICY IF EXISTS "Service role has full access to participants" ON public.room_participants;

-- إنشاء Policies جديدة
CREATE POLICY "Anyone can view room participants"
ON public.room_participants
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can join rooms"
ON public.room_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
ON public.room_participants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
ON public.room_participants
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to participants"
ON public.room_participants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- STEP 8: تحديث current_participants لجميع الغرف الموجودة
-- Update current_participants for all existing rooms
UPDATE public.voice_rooms vr
SET current_participants = (
  SELECT COUNT(*)
  FROM public.room_participants rp
  WHERE rp.room_id = vr.id
    AND rp.is_online = TRUE
    AND rp.left_at IS NULL
);

-- STEP 9: إخفاء الغرف الفارغة الموجودة
-- Hide existing empty rooms
UPDATE public.voice_rooms
SET is_active = FALSE
WHERE id NOT IN (
  SELECT DISTINCT room_id
  FROM public.room_participants
  WHERE is_online = TRUE
    AND left_at IS NULL
);

-- STEP 10: التحقق من النتائج
-- Verify results
SELECT 
  vr.id,
  vr.name,
  vr.owner_id,
  vr.is_active,
  vr.current_participants,
  (
    SELECT COUNT(*)
    FROM public.room_participants rp
    WHERE rp.room_id = vr.id
      AND rp.is_online = TRUE
      AND rp.left_at IS NULL
  ) as actual_count
FROM public.voice_rooms vr
ORDER BY vr.created_at DESC
LIMIT 10;

-- ============================================================
-- COMPLETED! نظام التتبع جاهز
-- ============================================================
-- 
-- الميزات المُفعّلة:
-- 1. ✅ تتبع المستخدمين في room_participants
-- 2. ✅ تحديث current_participants تلقائياً
-- 3. ✅ إخفاء الغرف الفارغة تلقائياً (is_active = false)
-- 4. ✅ إخفاء الغرف عند خروج صاحبها
-- 5. ✅ Real-time updates عبر Triggers
-- 6. ✅ RLS policies للأمان
-- 
-- الاستخدام:
-- عند دخول مستخدم للغرفة:
--   INSERT INTO room_participants (room_id, user_id, is_online) VALUES (...)
-- 
-- عند خروج مستخدم:
--   UPDATE room_participants SET is_online = FALSE, left_at = NOW() WHERE ...
--   أو DELETE FROM room_participants WHERE ...
-- 
-- ✅ current_participants سيتم تحديثه تلقائياً
-- ✅ is_active سيتم تحديثه تلقائياً
-- ============================================================
