-- =====================================================
-- Payment System Schema (Stripe + PayPal)
-- نظام المدفوعات الحقيقي
-- =====================================================

-- 1. Coin Packages Table (باقات العملات)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coin_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  coins INTEGER NOT NULL,
  bonus_coins INTEGER DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_popular BOOLEAN DEFAULT false,
  is_best_value BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default packages
INSERT INTO public.coin_packages (id, name, name_ar, coins, bonus_coins, price, currency, is_popular, is_best_value, display_order)
VALUES 
  ('pkg_100', '100 Coins', '100 عملة', 100, 0, 0.99, 'USD', false, false, 1),
  ('pkg_500', '500 Coins', '500 عملة', 500, 50, 4.99, 'USD', true, false, 2),
  ('pkg_1200', '1,200 Coins', '1,200 عملة', 1200, 200, 9.99, 'USD', false, true, 3),
  ('pkg_2500', '2,500 Coins', '2,500 عملة', 2500, 500, 19.99, 'USD', false, false, 4),
  ('pkg_6500', '6,500 Coins', '6,500 عملة', 6500, 1500, 49.99, 'USD', false, false, 5),
  ('pkg_14000', '14,000 Coins', '14,000 عملة', 14000, 4000, 99.99, 'USD', false, false, 6)
ON CONFLICT (id) DO NOTHING;

-- 2. Payment Transactions Table (معاملات الدفع)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL REFERENCES public.coin_packages(id),
  
  -- Payment details
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'google_pay', 'apple_pay', 'demo')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  coins INTEGER NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  
  -- External IDs
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_session ON public.payment_transactions(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_paypal_order ON public.payment_transactions(paypal_order_id) WHERE paypal_order_id IS NOT NULL;

-- 3. Payment Refunds Table (المبالغ المستردة)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL REFERENCES public.payment_transactions(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  
  amount DECIMAL(10, 2) NOT NULL,
  coins_deducted INTEGER NOT NULL,
  reason TEXT NOT NULL,
  
  -- Admin info
  admin_id UUID REFERENCES public.users(id),
  admin_notes TEXT,
  
  -- External IDs
  stripe_refund_id TEXT,
  paypal_refund_id TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_transaction_id ON public.payment_refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_user_id ON public.payment_refunds(user_id);

-- 4. Payment Methods Table (طرق الدفع المحفوظة)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  method_type TEXT NOT NULL CHECK (method_type IN ('stripe_card', 'paypal', 'google_pay', 'apple_pay')),
  
  -- Stripe
  stripe_payment_method_id TEXT,
  stripe_customer_id TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- PayPal
  paypal_email TEXT,
  paypal_payer_id TEXT,
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON public.user_payment_methods(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_payment_methods_default ON public.user_payment_methods(user_id) WHERE is_default = true;

-- 5. Payment Webhooks Log (سجل Webhooks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source TEXT NOT NULL CHECK (source IN ('stripe', 'paypal')),
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_source ON public.payment_webhooks(source);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON public.payment_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_created_at ON public.payment_webhooks(created_at DESC);

-- =====================================================
-- Functions & Triggers
-- =====================================================

-- Function: Add coins securely after payment
CREATE OR REPLACE FUNCTION add_coins_from_payment(
  p_transaction_id TEXT,
  p_user_id UUID,
  p_coins INTEGER,
  p_payment_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction RECORD;
BEGIN
  -- Check if transaction exists and is pending
  SELECT * INTO v_transaction
  FROM public.payment_transactions
  WHERE id = p_transaction_id
    AND user_id = p_user_id
    AND status = 'processing';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;
  
  -- Check if payment already credited
  IF EXISTS (
    SELECT 1 FROM public.coin_transactions
    WHERE payment_id = p_payment_id
  ) THEN
    RAISE EXCEPTION 'Payment already credited';
  END IF;
  
  -- Add coins to user
  UPDATE public.users
  SET 
    coins = coins + p_coins,
    total_purchased = COALESCE(total_purchased, 0) + p_coins,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Create coin transaction record
  INSERT INTO public.coin_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    payment_id,
    created_at
  ) VALUES (
    p_user_id,
    p_coins,
    'purchase',
    'Coin purchase via ' || v_transaction.payment_method,
    p_payment_id,
    NOW()
  );
  
  -- Update payment transaction status
  UPDATE public.payment_transactions
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_transaction_id;
  
  RETURN TRUE;
END;
$$;

-- Function: Process refund
CREATE OR REPLACE FUNCTION process_payment_refund(
  p_transaction_id TEXT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction RECORD;
  v_refund_id UUID;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM public.payment_transactions
  WHERE id = p_transaction_id
    AND status = 'completed';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or not completed';
  END IF;
  
  -- Check if already refunded
  IF EXISTS (
    SELECT 1 FROM public.payment_refunds
    WHERE transaction_id = p_transaction_id
      AND status IN ('completed', 'processing')
  ) THEN
    RAISE EXCEPTION 'Transaction already refunded';
  END IF;
  
  -- Create refund record
  INSERT INTO public.payment_refunds (
    transaction_id,
    user_id,
    amount,
    coins_deducted,
    reason,
    admin_id,
    status,
    created_at
  ) VALUES (
    p_transaction_id,
    v_transaction.user_id,
    v_transaction.amount,
    v_transaction.coins,
    p_reason,
    p_admin_id,
    'processing',
    NOW()
  )
  RETURNING id INTO v_refund_id;
  
  -- Deduct coins from user
  UPDATE public.users
  SET 
    coins = GREATEST(0, coins - v_transaction.coins),
    updated_at = NOW()
  WHERE id = v_transaction.user_id;
  
  -- Update transaction status
  UPDATE public.payment_transactions
  SET 
    status = 'refunded',
    refunded_at = NOW()
  WHERE id = p_transaction_id;
  
  RETURN v_refund_id;
END;
$$;

-- Trigger: Update timestamp on package update
CREATE OR REPLACE FUNCTION update_coin_package_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_coin_package_timestamp ON public.coin_packages;
CREATE TRIGGER trigger_update_coin_package_timestamp
  BEFORE UPDATE ON public.coin_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_coin_package_timestamp();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Policies: coin_packages (الكل يمكنه القراءة)
CREATE POLICY "Anyone can view active packages"
  ON public.coin_packages
  FOR SELECT
  USING (is_active = true);

-- Policies: payment_transactions (المستخدم يرى معاملاته فقط)
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies: user_payment_methods
CREATE POLICY "Users can manage own payment methods"
  ON public.user_payment_methods
  FOR ALL
  USING (auth.uid() = user_id);

-- Policies: payment_refunds (المستخدم يرى استرداداته فقط)
CREATE POLICY "Users can view own refunds"
  ON public.payment_refunds
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin policies (يتطلب role = 'admin')
CREATE POLICY "Admins can manage all packages"
  ON public.coin_packages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage refunds"
  ON public.payment_refunds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- Comments (التوثيق)
-- =====================================================

COMMENT ON TABLE public.coin_packages IS 'باقات العملات المتاحة للشراء';
COMMENT ON TABLE public.payment_transactions IS 'جميع معاملات الدفع (Stripe, PayPal, etc)';
COMMENT ON TABLE public.payment_refunds IS 'المبالغ المستردة';
COMMENT ON TABLE public.user_payment_methods IS 'طرق الدفع المحفوظة للمستخدمين';
COMMENT ON TABLE public.payment_webhooks IS 'سجل Webhooks من Stripe و PayPal';

-- =====================================================
-- Views (المناظر) للإحصائيات
-- =====================================================

-- View: Payment statistics per user
CREATE OR REPLACE VIEW public.user_payment_stats AS
SELECT 
  user_id,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_transactions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
  SUM(amount) FILTER (WHERE status = 'completed') as total_spent,
  SUM(coins) FILTER (WHERE status = 'completed') as total_coins_purchased,
  MAX(completed_at) as last_purchase_date,
  MIN(completed_at) as first_purchase_date
FROM public.payment_transactions
GROUP BY user_id;

-- View: Daily revenue
CREATE OR REPLACE VIEW public.daily_revenue AS
SELECT 
  DATE(completed_at) as date,
  payment_method,
  COUNT(*) as transactions,
  SUM(amount) as revenue,
  SUM(coins) as coins_sold
FROM public.payment_transactions
WHERE status = 'completed'
GROUP BY DATE(completed_at), payment_method
ORDER BY date DESC;

-- =====================================================
-- Grants (الصلاحيات)
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON public.coin_packages TO authenticated;
GRANT SELECT, INSERT ON public.payment_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_payment_methods TO authenticated;
GRANT SELECT ON public.payment_refunds TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION add_coins_from_payment TO service_role;
GRANT EXECUTE ON FUNCTION process_payment_refund TO service_role;

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Payment System Schema created successfully!';
  RAISE NOTICE '📦 Tables: coin_packages, payment_transactions, payment_refunds, user_payment_methods, payment_webhooks';
  RAISE NOTICE '🔧 Functions: add_coins_from_payment, process_payment_refund';
  RAISE NOTICE '🔒 RLS enabled with proper policies';
  RAISE NOTICE '📊 Views: user_payment_stats, daily_revenue';
END $$;
