-- =====================================================
-- Gifts & Economy System Schema
-- =====================================================

-- 1. Gifts Table
CREATE TABLE IF NOT EXISTS public.gifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  icon_url TEXT,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Gift Transactions Table
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id TEXT NOT NULL REFERENCES public.gifts(id),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  receiver_id UUID REFERENCES public.users(id),
  room_id TEXT,
  quantity INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender ON public.gift_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver ON public.gift_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_room ON public.gift_transactions(room_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_battle ON public.gift_transactions(battle_id);

-- 3. Coin/Diamond Transactions Table
CREATE TABLE IF NOT EXISTS public.economy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type TEXT NOT NULL CHECK (type IN ('coin', 'diamond')),
  amount INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  reason TEXT,
  related_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_economy_transactions_user ON public.economy_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_type ON public.economy_transactions(type);

-- 4. RLS Policies
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_transactions ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.gifts IS 'جدول الهدايا الافتراضية';
COMMENT ON TABLE public.gift_transactions IS 'سجل إرسال واستلام الهدايا';
COMMENT ON TABLE public.economy_transactions IS 'سجل معاملات العملات والماس';

DO $$
BEGIN
  RAISE NOTICE '✅ Gifts & Economy System Schema created successfully!';
END $$;
