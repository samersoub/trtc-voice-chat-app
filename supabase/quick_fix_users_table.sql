-- Quick Fix: Add Missing Columns to Users Table
-- نفذ هذا السكريبت في Supabase SQL Editor الآن!

-- Add all missing columns in one command
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS followers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS following TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS total_gifts_received DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_gifts DECIMAL(10,2) DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level);
CREATE INDEX IF NOT EXISTS idx_users_premium ON public.users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN (
    'level', 'followers', 'following', 'interests',
    'is_premium', 'is_active', 'last_login',
    'location_lat', 'location_lng', 'city', 'age',
    'total_gifts_received', 'monthly_gifts'
  )
ORDER BY column_name;
