-- =====================================================
-- Voice Rooms System Schema
-- =====================================================

-- 1. Voice Rooms Table
CREATE TABLE IF NOT EXISTS public.voice_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  host_id UUID NOT NULL REFERENCES public.users(id),
  host_name TEXT,
  category TEXT,
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  max_participants INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'banned', 'pending')),
  is_featured BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_voice_rooms_status ON public.voice_rooms(status);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_host ON public.voice_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_category ON public.voice_rooms(category);

-- 2. Room Participants Table
CREATE TABLE IF NOT EXISTS public.voice_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  username TEXT,
  is_mic_on BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  is_speaker BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voice_room_participants_room ON public.voice_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_participants_user ON public.voice_room_participants(user_id);

-- 3. Room Settings Table
CREATE TABLE IF NOT EXISTS public.voice_room_settings (
  room_id TEXT PRIMARY KEY REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  language TEXT,
  allow_gifts BOOLEAN DEFAULT true,
  allow_pk BOOLEAN DEFAULT true,
  allow_lucky_bag BOOLEAN DEFAULT true,
  allow_recording BOOLEAN DEFAULT false,
  background_music_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Room Bans Table
CREATE TABLE IF NOT EXISTS public.voice_room_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  reason TEXT,
  banned_by UUID REFERENCES public.users(id),
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voice_room_bans_room ON public.voice_room_bans(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_bans_user ON public.voice_room_bans(user_id);

-- 5. Room Moderators Table
CREATE TABLE IF NOT EXISTS public.voice_room_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_room_moderators_room ON public.voice_room_moderators(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_moderators_user ON public.voice_room_moderators(user_id);

-- 6. RLS Policies
ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_moderators ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.voice_rooms IS 'جدول الغرف الصوتية';
COMMENT ON TABLE public.voice_room_participants IS 'مشاركو الغرف الصوتية';
COMMENT ON TABLE public.voice_room_settings IS 'إعدادات الغرف الصوتية';
COMMENT ON TABLE public.voice_room_bans IS 'حظر المستخدمين من الغرف';
COMMENT ON TABLE public.voice_room_moderators IS 'مشرفو الغرف';

DO $$
BEGIN
  RAISE NOTICE '✅ Voice Rooms System Schema created successfully!';
END $$;
