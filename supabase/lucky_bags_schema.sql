-- =====================================================
-- Lucky Bags System Schema
-- نظام الحقائب المفاجئة (Lucky Bags)
-- =====================================================

-- 1. Lucky Bag Templates Table (قوالب الحقائب)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lucky_bag_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT NOT NULL,
  
  price INTEGER NOT NULL,
  min_reward INTEGER NOT NULL,
  max_reward INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  
  gradient_color TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO public.lucky_bag_templates (id, name, name_ar, icon, price, min_reward, max_reward, max_participants, gradient_color, display_order)
VALUES 
  ('bronze_bag', 'Bronze Bag', 'حقيبة برونزية', '🎒', 100, 50, 200, 10, 'from-orange-600 to-amber-600', 1),
  ('silver_bag', 'Silver Bag', 'حقيبة فضية', '💼', 500, 250, 1000, 15, 'from-gray-400 to-gray-600', 2),
  ('gold_bag', 'Gold Bag', 'حقيبة ذهبية', '👜', 2000, 1000, 5000, 20, 'from-yellow-500 to-amber-600', 3),
  ('diamond_bag', 'Diamond Bag', 'حقيبة ماسية', '💎', 10000, 5000, 25000, 30, 'from-cyan-400 to-blue-600', 4),
  ('supreme_bag', 'Supreme Bag', 'الحقيبة الملكية', '👑', 50000, 30000, 150000, 50, 'from-purple-600 to-pink-600', 5)
ON CONFLICT (id) DO NOTHING;

-- 2. Lucky Bags Table (الحقائب النشطة)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lucky_bags (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES public.lucky_bag_templates(id),
  
  creator_id UUID NOT NULL REFERENCES public.users(id),
  creator_name TEXT NOT NULL,
  
  -- Bag settings
  total_price INTEGER NOT NULL,
  min_reward INTEGER NOT NULL,
  max_reward INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  
  -- Current state
  current_funds INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filling', 'ready', 'drawn', 'expired')),
  
  -- Winner info
  winner_id UUID REFERENCES public.users(id),
  winner_name TEXT,
  actual_reward INTEGER,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  drawn_at TIMESTAMPTZ,
  
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lucky_bags_room ON public.lucky_bags(room_id);
CREATE INDEX IF NOT EXISTS idx_lucky_bags_status ON public.lucky_bags(status);
CREATE INDEX IF NOT EXISTS idx_lucky_bags_creator ON public.lucky_bags(creator_id);
CREATE INDEX IF NOT EXISTS idx_lucky_bags_active ON public.lucky_bags(status) WHERE status IN ('open', 'filling', 'ready');
CREATE INDEX IF NOT EXISTS idx_lucky_bags_created_at ON public.lucky_bags(created_at DESC);

-- 3. Lucky Bag Participants Table (المشاركون)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lucky_bag_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id TEXT NOT NULL REFERENCES public.lucky_bags(id) ON DELETE CASCADE,
  
  user_id UUID NOT NULL REFERENCES public.users(id),
  username TEXT NOT NULL,
  avatar TEXT,
  
  amount_paid INTEGER NOT NULL,
  win_chance DECIMAL(5, 2) NOT NULL DEFAULT 0, -- Percentage (0-100)
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(bag_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lucky_bag_participants_bag ON public.lucky_bag_participants(bag_id);
CREATE INDEX IF NOT EXISTS idx_lucky_bag_participants_user ON public.lucky_bag_participants(user_id);

-- 4. Lucky Bag History (تاريخ الفائزين)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lucky_bag_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  
  winner_id UUID NOT NULL REFERENCES public.users(id),
  winner_name TEXT NOT NULL,
  winner_avatar TEXT,
  
  reward_amount INTEGER NOT NULL,
  total_participants INTEGER NOT NULL,
  total_funds INTEGER NOT NULL,
  
  drawn_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lucky_bag_winners_winner ON public.lucky_bag_winners(winner_id);
CREATE INDEX IF NOT EXISTS idx_lucky_bag_winners_room ON public.lucky_bag_winners(room_id);
CREATE INDEX IF NOT EXISTS idx_lucky_bag_winners_drawn_at ON public.lucky_bag_winners(drawn_at DESC);

-- 5. User Lucky Bag Stats (إحصائيات المستخدم)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_lucky_bag_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  
  bags_created INTEGER DEFAULT 0,
  bags_participated INTEGER DEFAULT 0,
  bags_won INTEGER DEFAULT 0,
  
  total_spent INTEGER DEFAULT 0,
  total_winnings INTEGER DEFAULT 0,
  
  biggest_win INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_lucky_bag_stats_winnings ON public.user_lucky_bag_stats(total_winnings DESC);
CREATE INDEX IF NOT EXISTS idx_user_lucky_bag_stats_win_rate ON public.user_lucky_bag_stats(win_rate DESC);

-- =====================================================
-- Functions
-- =====================================================

-- Function: Join lucky bag
CREATE OR REPLACE FUNCTION join_lucky_bag(
  p_bag_id TEXT,
  p_user_id UUID,
  p_username TEXT,
  p_avatar TEXT,
  p_amount INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_bag RECORD;
  v_participant_id UUID;
  v_result JSONB;
BEGIN
  -- Get bag info
  SELECT * INTO v_bag
  FROM public.lucky_bags
  WHERE id = p_bag_id
    AND status = 'open'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bag not available';
  END IF;
  
  -- Check if bag is full
  IF v_bag.participant_count >= v_bag.max_participants THEN
    RAISE EXCEPTION 'Bag is full';
  END IF;
  
  -- Check if user already joined
  IF EXISTS (
    SELECT 1 FROM public.lucky_bag_participants
    WHERE bag_id = p_bag_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Already joined this bag';
  END IF;
  
  -- Check user balance
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_user_id AND coins >= p_amount
  ) THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;
  
  -- Deduct coins from user
  UPDATE public.users
  SET coins = coins - p_amount
  WHERE id = p_user_id;
  
  -- Add participant
  INSERT INTO public.lucky_bag_participants (
    bag_id, user_id, username, avatar, amount_paid
  ) VALUES (
    p_bag_id, p_user_id, p_username, p_avatar, p_amount
  )
  RETURNING id INTO v_participant_id;
  
  -- Update bag
  UPDATE public.lucky_bags
  SET 
    current_funds = current_funds + p_amount,
    participant_count = participant_count + 1,
    status = CASE 
      WHEN participant_count + 1 >= max_participants THEN 'ready'
      ELSE 'filling'
    END
  WHERE id = p_bag_id;
  
  -- Recalculate win chances
  PERFORM recalculate_bag_chances(p_bag_id);
  
  -- Update user stats
  INSERT INTO public.user_lucky_bag_stats (user_id, bags_participated, total_spent)
  VALUES (p_user_id, 1, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET
    bags_participated = user_lucky_bag_stats.bags_participated + 1,
    total_spent = user_lucky_bag_stats.total_spent + p_amount,
    updated_at = NOW();
  
  v_result := jsonb_build_object(
    'success', true,
    'participant_id', v_participant_id,
    'bag_status', (SELECT status FROM public.lucky_bags WHERE id = p_bag_id)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Recalculate win chances
CREATE OR REPLACE FUNCTION recalculate_bag_chances(p_bag_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_total_investment INTEGER;
BEGIN
  -- Get total investment
  SELECT SUM(amount_paid) INTO v_total_investment
  FROM public.lucky_bag_participants
  WHERE bag_id = p_bag_id;
  
  IF v_total_investment > 0 THEN
    -- Update chances
    UPDATE public.lucky_bag_participants
    SET win_chance = (amount_paid::DECIMAL / v_total_investment) * 100
    WHERE bag_id = p_bag_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Draw winner
CREATE OR REPLACE FUNCTION draw_lucky_bag_winner(p_bag_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_bag RECORD;
  v_winner RECORD;
  v_reward INTEGER;
  v_random DECIMAL;
  v_cumulative DECIMAL := 0;
  v_result JSONB;
BEGIN
  -- Get bag info
  SELECT * INTO v_bag
  FROM public.lucky_bags
  WHERE id = p_bag_id
    AND status IN ('ready', 'filling');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bag not ready for draw';
  END IF;
  
  IF v_bag.participant_count = 0 THEN
    -- No participants, refund creator
    UPDATE public.users
    SET coins = coins + v_bag.total_price
    WHERE id = v_bag.creator_id;
    
    UPDATE public.lucky_bags
    SET status = 'expired'
    WHERE id = p_bag_id;
    
    RETURN jsonb_build_object('success', false, 'reason', 'no_participants');
  END IF;
  
  -- Generate random number for winner selection
  v_random := RANDOM() * 100;
  
  -- Select winner based on weighted probability
  FOR v_winner IN 
    SELECT * FROM public.lucky_bag_participants
    WHERE bag_id = p_bag_id
    ORDER BY win_chance DESC
  LOOP
    v_cumulative := v_cumulative + v_winner.win_chance;
    EXIT WHEN v_cumulative >= v_random;
  END LOOP;
  
  -- Calculate actual reward
  v_reward := v_bag.min_reward + FLOOR(RANDOM() * (v_bag.max_reward - v_bag.min_reward + 1));
  
  -- Award coins to winner
  UPDATE public.users
  SET coins = coins + v_reward
  WHERE id = v_winner.user_id;
  
  -- Update bag
  UPDATE public.lucky_bags
  SET 
    status = 'drawn',
    winner_id = v_winner.user_id,
    winner_name = v_winner.username,
    actual_reward = v_reward,
    drawn_at = NOW()
  WHERE id = p_bag_id;
  
  -- Save to winners history
  INSERT INTO public.lucky_bag_winners (
    bag_id, template_id, room_id,
    winner_id, winner_name, winner_avatar,
    reward_amount, total_participants, total_funds
  ) VALUES (
    p_bag_id, v_bag.template_id, v_bag.room_id,
    v_winner.user_id, v_winner.username, v_winner.avatar,
    v_reward, v_bag.participant_count, v_bag.current_funds
  );
  
  -- Update winner stats
  INSERT INTO public.user_lucky_bag_stats (user_id, bags_won, total_winnings, biggest_win)
  VALUES (v_winner.user_id, 1, v_reward, v_reward)
  ON CONFLICT (user_id) DO UPDATE SET
    bags_won = user_lucky_bag_stats.bags_won + 1,
    total_winnings = user_lucky_bag_stats.total_winnings + v_reward,
    biggest_win = GREATEST(user_lucky_bag_stats.biggest_win, v_reward),
    win_rate = CASE 
      WHEN user_lucky_bag_stats.bags_participated > 0
      THEN ((user_lucky_bag_stats.bags_won + 1)::DECIMAL / user_lucky_bag_stats.bags_participated) * 100
      ELSE 0
    END,
    updated_at = NOW();
  
  v_result := jsonb_build_object(
    'success', true,
    'winner_id', v_winner.user_id,
    'winner_name', v_winner.username,
    'reward', v_reward
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-expire bags after time limit
CREATE OR REPLACE FUNCTION auto_expire_lucky_bags()
RETURNS VOID AS $$
BEGIN
  UPDATE public.lucky_bags
  SET status = 'expired'
  WHERE status IN ('open', 'filling')
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.lucky_bag_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_bag_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_bag_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lucky_bag_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active templates" ON public.lucky_bag_templates;
CREATE POLICY "Anyone can view active templates"
  ON public.lucky_bag_templates
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active bags" ON public.lucky_bags;
CREATE POLICY "Anyone can view active bags"
  ON public.lucky_bags
  FOR SELECT
  USING (status IN ('open', 'filling', 'ready', 'drawn'));

DROP POLICY IF EXISTS "Users can create bags" ON public.lucky_bags;
CREATE POLICY "Users can create bags"
  ON public.lucky_bags
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Anyone can view participants" ON public.lucky_bag_participants;
CREATE POLICY "Anyone can view participants"
  ON public.lucky_bag_participants
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can view winners" ON public.lucky_bag_winners;
CREATE POLICY "Anyone can view winners"
  ON public.lucky_bag_winners
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_lucky_bag_stats;
CREATE POLICY "Users can view own stats"
  ON public.user_lucky_bag_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- Views
-- =====================================================

-- View: Active bags in rooms
CREATE OR REPLACE VIEW public.active_lucky_bags AS
SELECT 
  b.*,
  t.name as template_name,
  t.name_ar as template_name_ar,
  t.icon as template_icon,
  u.username as creator_username
FROM public.lucky_bags b
JOIN public.lucky_bag_templates t ON t.id = b.template_id
JOIN public.users u ON u.id = b.creator_id
WHERE b.status IN ('open', 'filling', 'ready')
ORDER BY b.created_at DESC;

-- View: Recent winners
CREATE OR REPLACE VIEW public.recent_lucky_bag_winners AS
SELECT 
  w.*,
  t.name as template_name,
  t.icon as template_icon
FROM public.lucky_bag_winners w
JOIN public.lucky_bag_templates t ON t.id = w.template_id
ORDER BY w.drawn_at DESC
LIMIT 50;

-- =====================================================
-- Grants
-- =====================================================

GRANT SELECT ON public.lucky_bag_templates TO authenticated;
GRANT SELECT, INSERT ON public.lucky_bags TO authenticated;
GRANT SELECT ON public.lucky_bag_participants TO authenticated;
GRANT SELECT ON public.lucky_bag_winners TO authenticated;
GRANT SELECT ON public.user_lucky_bag_stats TO authenticated;
GRANT EXECUTE ON FUNCTION join_lucky_bag TO authenticated;
GRANT EXECUTE ON FUNCTION draw_lucky_bag_winner TO service_role;

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Lucky Bags System Schema created successfully!';
  RAISE NOTICE '📦 Tables: lucky_bag_templates, lucky_bags, lucky_bag_participants, lucky_bag_winners, user_lucky_bag_stats';
  RAISE NOTICE '🔧 Functions: join_lucky_bag, draw_lucky_bag_winner, recalculate_bag_chances';
  RAISE NOTICE '📊 Views: active_lucky_bags, recent_lucky_bag_winners';
END $$;
