-- ===================================================================
-- Fix: إزالة جميع المقاعد القديمة وإعادة إنشاء الجدول نظيفاً
-- ===================================================================

-- 1. حذف جميع البيانات القديمة من الجداول
TRUNCATE TABLE public.voice_room_seats CASCADE;
TRUNCATE TABLE public.voice_room_messages CASCADE;

-- 2. إعادة تعيين الـ sequences (إذا كانت موجودة)
-- لا حاجة لهذا لأننا نستخدم UUID

-- 3. تأكيد أن الـ UNIQUE constraint موجود
-- (يجب أن يكون موجوداً بالفعل من السكريبت الأصلي)

-- 4. إضافة index على room_id لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_room_seats_room_id 
  ON public.voice_room_seats(room_id);
CREATE INDEX IF NOT EXISTS idx_room_seats_user_id 
  ON public.voice_room_seats(user_id);

-- 5. إضافة دالة لتنظيف المقاعد القديمة تلقائياً
CREATE OR REPLACE FUNCTION cleanup_old_seats()
RETURNS void AS $$
BEGIN
  -- حذف المقاعد الأقدم من ساعتين
  DELETE FROM public.voice_room_seats
  WHERE joined_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- 6. جدولة التنظيف التلقائي (يتطلب pg_cron extension)
-- إذا كان pg_cron مفعل، قم بتشغيل:
-- SELECT cron.schedule('cleanup-old-seats', '0 * * * *', 'SELECT cleanup_old_seats()');

-- تم! الآن يمكنك استخدام التطبيق بدون مشاكل
SELECT 'Database cleaned and ready!' as status;
