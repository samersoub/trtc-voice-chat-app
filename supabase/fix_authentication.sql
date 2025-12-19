-- ============================================================
-- FIX: Authentication & Registration Issues
-- حل جميع مشاكل التسجيل والدخول
-- ============================================================

-- STEP 1: Add Missing Columns to Users Table
-- ============================================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS followers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS following TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS total_gifts_received DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_gifts DECIMAL(10,2) DEFAULT 0;

-- STEP 2: Fix RLS Policies for Users Table
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own social data" ON public.users;

-- 1. Allow anyone to read user profiles (important for listing users)
CREATE POLICY "Enable read access for all users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users during registration"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for service role"
  ON public.users FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for admins"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );


CREATE TABLE IF NOT EXISTS public.voice_room_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  user_level INTEGER DEFAULT 1,
  vip_level INTEGER,
  is_speaking BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(room_id, seat_number)
);

ALTER TABLE public.voice_room_seats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view room seats" ON public.voice_room_seats;
DROP POLICY IF EXISTS "Users can manage their own seats" ON public.voice_room_seats;

CREATE POLICY "Enable read access for all users"
  ON public.voice_room_seats FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.voice_room_seats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for seat owners"
  ON public.voice_room_seats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for seat owners"
  ON public.voice_room_seats FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);


CREATE TABLE IF NOT EXISTS public.voice_room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'gift', 'system')),
  gift_icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.voice_room_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view room messages" ON public.voice_room_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.voice_room_messages;

CREATE POLICY "Enable read access for all users"
  ON public.voice_room_messages FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.voice_room_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);


CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level);
CREATE INDEX IF NOT EXISTS idx_users_premium ON public.users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_voice_room_seats_room ON public.voice_room_seats(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_seats_user ON public.voice_room_seats(user_id);

CREATE INDEX IF NOT EXISTS idx_voice_room_messages_room ON public.voice_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_messages_user ON public.voice_room_messages(user_id);


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table when a new auth.users entry is created
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    avatar_url,
    is_verified,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email_confirmed_at IS NOT NULL,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    is_verified = EXCLUDED.is_verified,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.voice_room_seats TO authenticated;
GRANT ALL ON public.voice_room_messages TO authenticated;


SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN (
    'level', 'followers', 'following', 'interests',
    'is_premium', 'is_active', 'last_login', 'role',
    'location_lat', 'location_lng', 'city', 'age',
    'total_gifts_received', 'monthly_gifts'
  )
ORDER BY column_name;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

