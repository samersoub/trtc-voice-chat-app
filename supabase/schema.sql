-- Dandana Voice Chat App - Supabase Database Schema
-- تاريخ: 2025-12-07
-- وصف: جداول قاعدة البيانات الكاملة للتطبيق

-- ==============================================
-- 1. Users Table (المستخدمون)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  country TEXT,
  language TEXT DEFAULT 'ar',
  
  -- Voice Chat Info
  voice_quality TEXT DEFAULT 'good',
  total_voice_minutes INTEGER DEFAULT 0,
  
  -- Economy
  coins INTEGER DEFAULT 0,
  diamonds INTEGER DEFAULT 0,
  
  -- Wealth System
  wealth_level INTEGER DEFAULT 1,
  total_recharge DECIMAL(10,2) DEFAULT 0,
  total_gifts_sent DECIMAL(10,2) DEFAULT 0,
  monthly_recharge DECIMAL(10,2) DEFAULT 0,
  monthly_gifts DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_is_online ON public.users(is_online);
CREATE INDEX idx_users_wealth_level ON public.users(wealth_level);

-- ==============================================
-- 2. Gifts Table (الهدايا)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.gifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  price INTEGER NOT NULL,
  reward_diamonds INTEGER DEFAULT 0,
  categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default gifts
INSERT INTO public.gifts (id, name, name_ar, icon, price, reward_diamonds, categories) VALUES
  ('rose', 'Rose', 'وردة', '🌹', 10, 5, ARRAY['romantic', 'basic']),
  ('car', 'Luxury Car', 'سيارة فخمة', '🚗', 500, 250, ARRAY['luxury', 'premium']),
  ('dragon', 'Golden Dragon', 'تنين ذهبي', '🐉', 1000, 500, ARRAY['legendary', 'premium'])
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 3. Gift Transactions Table (معاملات الهدايا)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  gift_id TEXT REFERENCES public.gifts(id),
  quantity INTEGER DEFAULT 1,
  total_cost INTEGER NOT NULL,
  room_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gift_transactions_sender ON public.gift_transactions(sender_id);
CREATE INDEX idx_gift_transactions_receiver ON public.gift_transactions(receiver_id);
CREATE INDEX idx_gift_transactions_room ON public.gift_transactions(room_id);

-- ==============================================
-- 4. Voice Rooms Table (غرف الصوت)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.voice_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room_type TEXT CHECK (room_type IN ('public', 'private', 'password')) DEFAULT 'public',
  password TEXT,
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  allows_gifts BOOLEAN DEFAULT TRUE,
  allows_messages BOOLEAN DEFAULT TRUE,
  
  -- Stats
  total_messages INTEGER DEFAULT 0,
  total_gifts_received DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_rooms_owner ON public.voice_rooms(owner_id);
CREATE INDEX idx_voice_rooms_active ON public.voice_rooms(is_active);

-- ==============================================
-- 5. Room Participants Table (المشاركون في الغرف)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'speaker', 'listener')) DEFAULT 'listener',
  mic_seat INTEGER CHECK (mic_seat >= 0 AND mic_seat <= 8),
  is_muted BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user ON public.room_participants(user_id);

-- ==============================================
-- 6. Coin Transactions Table (معاملات العملات)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'gift_sent', 'gift_received', 'reward', 'admin_adjustment')) NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT, -- للربط مع معاملات أخرى
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coin_transactions_user ON public.coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_type ON public.coin_transactions(transaction_type);

-- ==============================================
-- 7. Wealth Level History (تاريخ مستويات الثروة)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.wealth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  old_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  total_wealth DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wealth_history_user ON public.wealth_history(user_id);

-- ==============================================
-- 8. Notifications Table (الإشعارات)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('gift', 'system', 'room', 'follow', 'level_up')) NOT NULL,
  icon TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- ==============================================
-- 9. Activity Logs Table (سجلات النشاط)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at);

-- ==============================================
-- 10. Row Level Security (RLS) Policies
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wealth_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Gifts policies (read-only for users)
CREATE POLICY "Anyone can view gifts" ON public.gifts FOR SELECT USING (is_active = true);

-- Gift transactions policies
CREATE POLICY "Users can view own transactions" ON public.gift_transactions FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create transactions" ON public.gift_transactions FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Voice rooms policies
CREATE POLICY "Anyone can view active rooms" ON public.voice_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can update their rooms" ON public.voice_rooms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can create rooms" ON public.voice_rooms FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================
-- 11. Functions & Triggers
-- ==============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_rooms_updated_at BEFORE UPDATE ON public.voice_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update user wealth level automatically
CREATE OR REPLACE FUNCTION update_user_wealth_level()
RETURNS TRIGGER AS $$
DECLARE
  total_wealth DECIMAL(10,2);
  new_level INTEGER;
  old_level INTEGER;
BEGIN
  -- Calculate total wealth
  total_wealth := NEW.total_recharge + NEW.total_gifts_sent;
  old_level := NEW.wealth_level;
  
  -- Determine new level based on wealth thresholds
  new_level := CASE
    WHEN total_wealth >= 10000000 THEN 10  -- أسطورة الثروة
    WHEN total_wealth >= 5000000 THEN 9    -- إمبراطور
    WHEN total_wealth >= 1000000 THEN 8    -- ملك الثروة
    WHEN total_wealth >= 500000 THEN 7     -- أرستقراطي
    WHEN total_wealth >= 100000 THEN 6     -- مليونير
    WHEN total_wealth >= 50000 THEN 5      -- ثري
    WHEN total_wealth >= 10000 THEN 4      -- ناجح
    WHEN total_wealth >= 5000 THEN 3       -- صاعد
    WHEN total_wealth >= 1000 THEN 2       -- متقدم
    ELSE 1                                  -- مبتدئ
  END;
  
  NEW.wealth_level := new_level;
  
  -- Log level change
  IF old_level != new_level THEN
    INSERT INTO public.wealth_history (user_id, old_level, new_level, total_wealth, reason)
    VALUES (NEW.id, old_level, new_level, total_wealth, 'Automatic level update');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wealth_level BEFORE UPDATE ON public.users
  FOR EACH ROW 
  WHEN (OLD.total_recharge IS DISTINCT FROM NEW.total_recharge OR 
        OLD.total_gifts_sent IS DISTINCT FROM NEW.total_gifts_sent)
  EXECUTE FUNCTION update_user_wealth_level();

-- ==============================================
-- 12. App Settings Table (إعدادات التطبيق)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- General Info
  app_name TEXT DEFAULT 'Voice Chat App',
  app_logo_url TEXT,
  support_email TEXT,
  support_phone TEXT,
  
  -- Feature Toggles
  enable_voice_chat BOOLEAN DEFAULT TRUE,
  enable_gifts BOOLEAN DEFAULT TRUE,
  enable_matching BOOLEAN DEFAULT TRUE,
  enable_music_rooms BOOLEAN DEFAULT TRUE,
  enable_agencies BOOLEAN DEFAULT TRUE,
  enable_store BOOLEAN DEFAULT TRUE,
  enable_games BOOLEAN DEFAULT FALSE,
  
  -- Limits & Rules
  min_age INTEGER DEFAULT 18,
  max_username_length INTEGER DEFAULT 30,
  max_bio_length INTEGER DEFAULT 500,
  max_room_capacity INTEGER DEFAULT 100,
  max_daily_gifts_per_user INTEGER DEFAULT 50,
  
  -- Economy
  default_signup_coins INTEGER DEFAULT 1000,
  default_signup_diamonds INTEGER DEFAULT 0,
  coin_to_diamond_ratio INTEGER DEFAULT 100,
  gift_commission_percentage INTEGER DEFAULT 10,
  
  -- Security & Verification
  require_phone_verification BOOLEAN DEFAULT FALSE,
  require_email_verification BOOLEAN DEFAULT FALSE,
  enable_two_factor_auth BOOLEAN DEFAULT FALSE,
  min_password_length INTEGER DEFAULT 6,
  
  -- Moderation
  auto_ban_threshold INTEGER DEFAULT 5,
  profanity_filter_enabled BOOLEAN DEFAULT TRUE,
  require_profile_image BOOLEAN DEFAULT FALSE,
  
  -- Notifications
  enable_push_notifications BOOLEAN DEFAULT TRUE,
  enable_email_notifications BOOLEAN DEFAULT TRUE,
  enable_sms_notifications BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  track_user_activity BOOLEAN DEFAULT TRUE,
  track_gift_analytics BOOLEAN DEFAULT TRUE,
  track_room_analytics BOOLEAN DEFAULT TRUE,
  
  -- Maintenance
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  
  -- Social Media
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  
  -- Legal
  terms_url TEXT,
  privacy_url TEXT,
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  
  CONSTRAINT single_row_only CHECK (id = 1)
);

-- Insert default settings
INSERT INTO public.app_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT
  TO public
  USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update app settings"
  ON public.app_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND (username = 'admin' OR email LIKE '%@admin.%')
    )
  );

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_app_settings_timestamp BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION update_app_settings_timestamp();

-- ==============================================
-- 13. Initial Demo Data
-- ==============================================

-- Insert demo users (تأكد من تشغيل هذا بعد إعداد Auth)
-- سيتم إضافة البيانات التجريبية من خلال التطبيق

COMMENT ON TABLE public.users IS 'جدول المستخدمين - يحتوي على كافة بيانات المستخدمين';
COMMENT ON TABLE public.gifts IS 'جدول الهدايا - كتالوج الهدايا المتاحة';
COMMENT ON TABLE public.gift_transactions IS 'معاملات الهدايا - سجل إرسال واستقبال الهدايا';
COMMENT ON TABLE public.voice_rooms IS 'غرف الصوت - الغرف الصوتية المتاحة';
COMMENT ON TABLE public.room_participants IS 'المشاركون في الغرف - من في أي غرفة';
COMMENT ON TABLE public.coin_transactions IS 'معاملات العملات - سجل كافة التعاملات المالية';
COMMENT ON TABLE public.wealth_history IS 'تاريخ الثروة - تتبع تغيرات مستوى الثروة';
COMMENT ON TABLE public.notifications IS 'الإشعارات - إشعارات المستخدمين';
COMMENT ON TABLE public.activity_logs IS 'سجلات النشاط - تسجيل كافة الأنشطة';
COMMENT ON TABLE public.app_settings IS 'إعدادات التطبيق - الإعدادات العامة للتطبيق بالكامل';
