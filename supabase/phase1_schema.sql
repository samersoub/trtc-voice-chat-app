-- Phase 1 Features Supabase Schema
-- User preferences and selections for Phase 1 features

-- ===================================================================
-- User Room Themes Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.user_room_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  room_id TEXT, -- NULL means default theme for all rooms
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_room_theme UNIQUE(user_id, room_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_room_themes_user_id ON public.user_room_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_room_themes_theme_id ON public.user_room_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_user_room_themes_active ON public.user_room_themes(user_id, is_active);

-- ===================================================================
-- User Voice Effects Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.user_voice_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  effect_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_voice_effects_user_id ON public.user_voice_effects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_voice_effects_effect_id ON public.user_voice_effects(effect_id);

-- ===================================================================
-- Daily Missions Progress Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.user_daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  mission_type TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_mission_date UNIQUE(user_id, mission_type, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_missions_user_date ON public.user_daily_missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_missions_unclaimed ON public.user_daily_missions(user_id, completed, claimed);

-- ===================================================================
-- Lucky Wheel Spins Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.user_lucky_wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prize_id TEXT NOT NULL,
  prize_type TEXT NOT NULL, -- 'coins', 'gift', 'badge', etc.
  prize_value INTEGER,
  prize_name TEXT,
  spin_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_user_date ON public.user_lucky_wheel_spins(user_id, spin_date);

-- Daily spin counter
CREATE TABLE IF NOT EXISTS public.user_wheel_stats (
  user_id TEXT PRIMARY KEY,
  spins_today INTEGER DEFAULT 0,
  last_spin_date DATE DEFAULT CURRENT_DATE,
  total_spins INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Friend Recommendations Viewed Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.user_friend_recommendations_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  recommended_user_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_recommendation UNIQUE(user_id, recommended_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friend_recs_user_id ON public.user_friend_recommendations_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_recs_viewed_at ON public.user_friend_recommendations_viewed(viewed_at);

-- ===================================================================
-- Row Level Security (RLS)
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_room_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_voice_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lucky_wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wheel_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_friend_recommendations_viewed ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data

-- Room Themes Policies
CREATE POLICY "Users can view their own themes"
  ON public.user_room_themes FOR SELECT
  USING (user_id = current_user);

CREATE POLICY "Users can insert their own themes"
  ON public.user_room_themes FOR INSERT
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update their own themes"
  ON public.user_room_themes FOR UPDATE
  USING (user_id = current_user);

-- Voice Effects Policies
CREATE POLICY "Users can view their own effects"
  ON public.user_voice_effects FOR SELECT
  USING (user_id = current_user);

CREATE POLICY "Users can insert their own effects"
  ON public.user_voice_effects FOR INSERT
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update their own effects"
  ON public.user_voice_effects FOR UPDATE
  USING (user_id = current_user);

-- Daily Missions Policies
CREATE POLICY "Users can view their own missions"
  ON public.user_daily_missions FOR SELECT
  USING (user_id = current_user);

CREATE POLICY "Users can insert their own missions"
  ON public.user_daily_missions FOR INSERT
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update their own missions"
  ON public.user_daily_missions FOR UPDATE
  USING (user_id = current_user);

-- Lucky Wheel Policies
CREATE POLICY "Users can view their own spins"
  ON public.user_lucky_wheel_spins FOR SELECT
  USING (user_id = current_user);

CREATE POLICY "Users can insert their own spins"
  ON public.user_lucky_wheel_spins FOR INSERT
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can view their wheel stats"
  ON public.user_wheel_stats FOR SELECT
  USING (user_id = current_user);

CREATE POLICY "Users can update their wheel stats"
  ON public.user_wheel_stats FOR UPDATE
  USING (user_id = current_user);

-- Friend Recommendations Policies
CREATE POLICY "Users can view their own viewed recommendations"
  ON public.user_friend_recommendations_viewed FOR SELECT
  USING (user_id = current_user);

CREATE POLICY "Users can insert their viewed recommendations"
  ON public.user_friend_recommendations_viewed FOR INSERT
  WITH CHECK (user_id = current_user);

-- ===================================================================
-- Functions for automatic updated_at
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_user_room_themes_updated_at
  BEFORE UPDATE ON public.user_room_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_voice_effects_updated_at
  BEFORE UPDATE ON public.user_voice_effects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_daily_missions_updated_at
  BEFORE UPDATE ON public.user_daily_missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wheel_stats_updated_at
  BEFORE UPDATE ON public.user_wheel_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- Sample Data (Optional)
-- ===================================================================

-- No sample data needed - tables will be populated by user actions
