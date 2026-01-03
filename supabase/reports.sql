-- =====================================================
-- Reports & Moderation System Schema
-- =====================================================

-- 1. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.users(id),
  reported_user UUID REFERENCES public.users(id),
  reported_room TEXT REFERENCES public.voice_rooms(id),
  reported_message TEXT,
  report_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user);
CREATE INDEX IF NOT EXISTS idx_reports_reported_room ON public.reports(reported_room);

-- 2. RLS Policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.reports IS 'جدول الشكاوى والتقارير (Reports)';

DO $$
BEGIN
  RAISE NOTICE '✅ Reports & Moderation System Schema created successfully!';
END $$;
