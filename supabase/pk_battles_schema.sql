-- =====================================================
-- PK Battles System Schema
-- نظام المعارك الصوتية (PK Battles)
-- =====================================================

-- 1. PK Battles Table (جدول المعارك)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pk_battles (
  id TEXT PRIMARY KEY,
  battle_type TEXT NOT NULL CHECK (battle_type IN ('quick', 'standard', 'ranked')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'countdown', 'active', 'finished', 'cancelled')),
  
  -- Room 1 Info
  room1_id TEXT NOT NULL,
  room1_name TEXT NOT NULL,
  room1_host_id UUID NOT NULL REFERENCES public.users(id),
  room1_host_name TEXT NOT NULL,
  room1_score INTEGER DEFAULT 0,
  room1_supporters INTEGER DEFAULT 0,
  
  -- Room 2 Info
  room2_id TEXT,
  room2_name TEXT,
  room2_host_id UUID REFERENCES public.users(id),
  room2_host_name TEXT,
  room2_score INTEGER DEFAULT 0,
  room2_supporters INTEGER DEFAULT 0,
  
  -- Battle Settings
  duration_seconds INTEGER NOT NULL,
  
  -- Winner Info
  winner_id UUID REFERENCES public.users(id),
  winner_room_id TEXT,
  
  -- Rewards
  winner_coins INTEGER,
  winner_diamonds INTEGER,
  loser_coins INTEGER,
  loser_diamonds INTEGER,
  
  -- Timing
  countdown_start_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  
  -- Stats
  total_gifts_value INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES public.users(id),
  invited_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pk_battles_status ON public.pk_battles(status);
CREATE INDEX IF NOT EXISTS idx_pk_battles_room1_host ON public.pk_battles(room1_host_id);
CREATE INDEX IF NOT EXISTS idx_pk_battles_room2_host ON public.pk_battles(room2_host_id);
CREATE INDEX IF NOT EXISTS idx_pk_battles_created_at ON public.pk_battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pk_battles_active ON public.pk_battles(status) WHERE status IN ('active', 'countdown');

-- 2. PK Battle Invites Table (دعوات المعارك)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pk_battle_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id TEXT NOT NULL REFERENCES public.pk_battles(id) ON DELETE CASCADE,
  
  from_room_id TEXT NOT NULL,
  from_host_id UUID NOT NULL REFERENCES public.users(id),
  from_host_name TEXT NOT NULL,
  
  to_room_id TEXT NOT NULL,
  to_host_id UUID NOT NULL REFERENCES public.users(id),
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pk_battle_invites_battle ON public.pk_battle_invites(battle_id);
CREATE INDEX IF NOT EXISTS idx_pk_battle_invites_to_host ON public.pk_battle_invites(to_host_id);
CREATE INDEX IF NOT EXISTS idx_pk_battle_invites_status ON public.pk_battle_invites(status);

-- 3. PK Battle Gifts Table (الهدايا المرسلة أثناء المعركة)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pk_battle_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id TEXT NOT NULL REFERENCES public.pk_battles(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  
  sender_id UUID NOT NULL REFERENCES public.users(id),
  sender_name TEXT NOT NULL,
  
  gift_id TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_value INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_value INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pk_battle_gifts_battle ON public.pk_battle_gifts(battle_id);
CREATE INDEX IF NOT EXISTS idx_pk_battle_gifts_room ON public.pk_battle_gifts(battle_id, room_id);
CREATE INDEX IF NOT EXISTS idx_pk_battle_gifts_sender ON public.pk_battle_gifts(sender_id);

-- 4. PK Battle History (سجل المعارك للمستخدمين)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pk_battle_history (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  total_battles INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  
  total_gifts_received INTEGER DEFAULT 0,
  total_gifts_sent INTEGER DEFAULT 0,
  
  highest_score INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  
  rank INTEGER DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pk_battle_history_rank ON public.pk_battle_history(rank);
CREATE INDEX IF NOT EXISTS idx_pk_battle_history_wins ON public.pk_battle_history(wins DESC);

-- =====================================================
-- Functions
-- =====================================================

-- Function: Update battle score after gift
CREATE OR REPLACE FUNCTION update_battle_score_after_gift()
RETURNS TRIGGER AS $$
BEGIN
  -- Update battle scores
  IF NEW.room_id = (SELECT room1_id FROM public.pk_battles WHERE id = NEW.battle_id) THEN
    UPDATE public.pk_battles
    SET 
      room1_score = room1_score + NEW.total_value,
      total_gifts_value = total_gifts_value + NEW.total_value,
      updated_at = NOW()
    WHERE id = NEW.battle_id;
  ELSE
    UPDATE public.pk_battles
    SET 
      room2_score = room2_score + NEW.total_value,
      total_gifts_value = total_gifts_value + NEW.total_value,
      updated_at = NOW()
    WHERE id = NEW.battle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_battle_score
  AFTER INSERT ON public.pk_battle_gifts
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_score_after_gift();

-- Function: Update user battle history
CREATE OR REPLACE FUNCTION update_user_battle_history(
  p_user_id UUID,
  p_battle_id TEXT,
  p_is_winner BOOLEAN,
  p_is_draw BOOLEAN,
  p_gifts_received INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.pk_battle_history (
    user_id,
    total_battles,
    wins,
    losses,
    draws,
    total_gifts_received,
    current_streak,
    updated_at
  ) VALUES (
    p_user_id,
    1,
    CASE WHEN p_is_winner THEN 1 ELSE 0 END,
    CASE WHEN NOT p_is_winner AND NOT p_is_draw THEN 1 ELSE 0 END,
    CASE WHEN p_is_draw THEN 1 ELSE 0 END,
    p_gifts_received,
    CASE WHEN p_is_winner THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_battles = pk_battle_history.total_battles + 1,
    wins = pk_battle_history.wins + CASE WHEN p_is_winner THEN 1 ELSE 0 END,
    losses = pk_battle_history.losses + CASE WHEN NOT p_is_winner AND NOT p_is_draw THEN 1 ELSE 0 END,
    draws = pk_battle_history.draws + CASE WHEN p_is_draw THEN 1 ELSE 0 END,
    total_gifts_received = pk_battle_history.total_gifts_received + p_gifts_received,
    highest_score = GREATEST(pk_battle_history.highest_score, p_gifts_received),
    current_streak = CASE 
      WHEN p_is_winner THEN pk_battle_history.current_streak + 1
      ELSE 0
    END,
    win_streak = GREATEST(
      pk_battle_history.win_streak,
      CASE WHEN p_is_winner THEN pk_battle_history.current_streak + 1 ELSE 0 END
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: End battle and determine winner
CREATE OR REPLACE FUNCTION end_pk_battle(
  p_battle_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_battle RECORD;
  v_result JSONB;
BEGIN
  -- Get battle info
  SELECT * INTO v_battle
  FROM public.pk_battles
  WHERE id = p_battle_id
    AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Battle not found or not active';
  END IF;
  
  -- Determine winner
  IF v_battle.room1_score > v_battle.room2_score THEN
    v_battle.winner_id := v_battle.room1_host_id;
    v_battle.winner_room_id := v_battle.room1_id;
  ELSIF v_battle.room2_score > v_battle.room1_score THEN
    v_battle.winner_id := v_battle.room2_host_id;
    v_battle.winner_room_id := v_battle.room2_id;
  END IF;
  
  -- Update battle
  UPDATE public.pk_battles
  SET 
    status = 'finished',
    winner_id = v_battle.winner_id,
    winner_room_id = v_battle.winner_room_id,
    end_time = NOW(),
    updated_at = NOW()
  WHERE id = p_battle_id;
  
  -- Update histories
  PERFORM update_user_battle_history(
    v_battle.room1_host_id,
    p_battle_id,
    v_battle.winner_id = v_battle.room1_host_id,
    v_battle.winner_id IS NULL,
    v_battle.room1_score
  );
  
  PERFORM update_user_battle_history(
    v_battle.room2_host_id,
    p_battle_id,
    v_battle.winner_id = v_battle.room2_host_id,
    v_battle.winner_id IS NULL,
    v_battle.room2_score
  );
  
  -- Return result
  v_result := jsonb_build_object(
    'battle_id', p_battle_id,
    'winner_id', v_battle.winner_id,
    'room1_score', v_battle.room1_score,
    'room2_score', v_battle.room2_score
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.pk_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pk_battle_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pk_battle_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pk_battle_history ENABLE ROW LEVEL SECURITY;

-- Policies: pk_battles
CREATE POLICY "Anyone can view active battles"
  ON public.pk_battles
  FOR SELECT
  USING (status IN ('active', 'countdown', 'finished'));

CREATE POLICY "Hosts can create battles"
  ON public.pk_battles
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Hosts can update own battles"
  ON public.pk_battles
  FOR UPDATE
  USING (
    auth.uid() = room1_host_id 
    OR auth.uid() = room2_host_id
  );

-- Policies: pk_battle_invites
CREATE POLICY "Users can view own invites"
  ON public.pk_battle_invites
  FOR SELECT
  USING (
    auth.uid() = from_host_id 
    OR auth.uid() = to_host_id
  );

CREATE POLICY "Hosts can send invites"
  ON public.pk_battle_invites
  FOR INSERT
  WITH CHECK (auth.uid() = from_host_id);

CREATE POLICY "Recipients can respond to invites"
  ON public.pk_battle_invites
  FOR UPDATE
  USING (auth.uid() = to_host_id);

-- Policies: pk_battle_gifts
CREATE POLICY "Users can view battle gifts"
  ON public.pk_battle_gifts
  FOR SELECT
  USING (true);

CREATE POLICY "Users can send battle gifts"
  ON public.pk_battle_gifts
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policies: pk_battle_history
CREATE POLICY "Users can view own history"
  ON public.pk_battle_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard"
  ON public.pk_battle_history
  FOR SELECT
  USING (true);

-- =====================================================
-- Views
-- =====================================================

-- View: PK Battle Leaderboard
CREATE OR REPLACE VIEW public.pk_battle_leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY wins DESC, total_battles DESC) as rank,
  h.user_id,
  u.username,
  u.avatar,
  u.level,
  h.wins,
  h.losses,
  h.draws,
  CASE 
    WHEN (h.wins + h.losses) > 0 
    THEN ROUND((h.wins::DECIMAL / (h.wins + h.losses)) * 100, 2)
    ELSE 0
  END as win_rate,
  h.total_gifts_received as total_score,
  h.win_streak
FROM public.pk_battle_history h
JOIN public.users u ON u.id = h.user_id
WHERE h.total_battles > 0
ORDER BY h.wins DESC, h.total_battles DESC
LIMIT 100;

-- View: Active battles
CREATE OR REPLACE VIEW public.active_pk_battles AS
SELECT 
  b.*,
  u1.username as room1_host_username,
  u2.username as room2_host_username
FROM public.pk_battles b
LEFT JOIN public.users u1 ON u1.id = b.room1_host_id
LEFT JOIN public.users u2 ON u2.id = b.room2_host_id
WHERE b.status IN ('active', 'countdown')
ORDER BY b.created_at DESC;

-- =====================================================
-- Grants
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON public.pk_battles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pk_battle_invites TO authenticated;
GRANT SELECT, INSERT ON public.pk_battle_gifts TO authenticated;
GRANT SELECT ON public.pk_battle_history TO authenticated;
GRANT EXECUTE ON FUNCTION end_pk_battle TO service_role;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE public.pk_battles IS 'جدول المعارك الصوتية بين الغرف';
COMMENT ON TABLE public.pk_battle_invites IS 'دعوات المعارك';
COMMENT ON TABLE public.pk_battle_gifts IS 'الهدايا المرسلة أثناء المعارك';
COMMENT ON TABLE public.pk_battle_history IS 'سجل المعارك لكل مستخدم';

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ PK Battles System Schema created successfully!';
  RAISE NOTICE '📦 Tables: pk_battles, pk_battle_invites, pk_battle_gifts, pk_battle_history';
  RAISE NOTICE '🔧 Functions: update_battle_score_after_gift, update_user_battle_history, end_pk_battle';
  RAISE NOTICE '📊 Views: pk_battle_leaderboard, active_pk_battles';
END $$;
