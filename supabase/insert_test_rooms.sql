-- Insert Test Voice Rooms for Production Testing
-- Run this AFTER you have created at least one user account

-- INSTRUCTIONS:
-- 1. Register a user account in the app first
-- 2. Get your user ID from the users table (SELECT id, username FROM users;)
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual user UUID
-- 4. Run this script in Supabase SQL Editor

-- Example rooms with Arabic names
INSERT INTO public.voice_rooms (id, name, description, cover_image, owner_id, room_type, max_participants, is_active) VALUES
  (
    'room-1',
    'غرفة الأصدقاء',
    'غرفة للأصدقاء والمحادثات الممتعة',
    'https://images.unsplash.com/photo-1519682335074-1c3b3b66f2d4?q=80&w=1200&auto=format&fit=crop',
    'YOUR_USER_ID_HERE'::UUID,
    'public',
    8,
    true
  ),
  (
    'room-2',
    'ليالي السمر',
    'غرفة للسهر والأحاديث الشيقة',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    'YOUR_USER_ID_HERE'::UUID,
    'public',
    8,
    true
  ),
  (
    'room-3',
    'مجلس الحكمة',
    'غرفة للنقاشات الجادة والثقافية',
    'https://images.unsplash.com/photo-1519608425001-54df7bff3f63?q=80&w=1200&auto=format&fit=crop',
    'YOUR_USER_ID_HERE'::UUID,
    'public',
    8,
    true
  ),
  (
    'room-4',
    'عالم الموسيقى',
    'غرفة لعشاق الموسيقى والغناء',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
    'YOUR_USER_ID_HERE'::UUID,
    'public',
    8,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cover_image = EXCLUDED.cover_image,
  is_active = EXCLUDED.is_active;

-- Verify rooms were created
SELECT id, name, owner_id, is_active FROM public.voice_rooms;
