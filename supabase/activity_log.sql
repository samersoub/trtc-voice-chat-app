-- =====================================================
-- Activity Log & Site Settings Schema
-- =====================================================

-- 1. Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);

-- 2. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  value_json JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- 3. RLS Policies
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.activity_log IS 'سجل النشاطات (Activity Log)';
COMMENT ON TABLE public.site_settings IS 'إعدادات الموقع العامة (Site Settings)';

DO $$
BEGIN
  RAISE NOTICE '✅ Activity Log & Site Settings Schema created successfully!';
END $$;
