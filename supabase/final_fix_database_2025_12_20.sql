-- ============================================================
-- Master Fix Script (v7 - Final Compatibility Mode)
-- Description: Uses single-quoted function bodies to bypass Dashboard parsing errors.
-- ============================================================

-- 1. CLEANUP (Drop everything first)
DROP FUNCTION IF EXISTS public.add_follower(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.add_follower(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.remove_follower(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.remove_follower(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.unfollow_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_user_level(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_level_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.add_coins_from_payment(text, uuid, integer, text) CASCADE;
DROP FUNCTION IF EXISTS public.process_payment_refund(text, uuid, text) CASCADE;

-- 2. CREATE TABLE
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- 3. UPDATE USERS TABLE (New Columns)
DO '
BEGIN
    BEGIN ALTER TABLE public.users ADD COLUMN followers TEXT[] DEFAULT ''{}''; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN following TEXT[] DEFAULT ''{}''; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN level INTEGER DEFAULT 1; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN total_voice_minutes INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN total_gifts_sent DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
END;
';

-- 4. CREATE FUNCTIONS (Using Single Quotes for Body)

-- add_follower (2 args)
CREATE OR REPLACE FUNCTION public.add_follower(arg_target_id UUID, arg_follower_id UUID)
RETURNS VOID AS '
BEGIN
    INSERT INTO public.followers (follower_id, following_id) 
    VALUES (arg_follower_id, arg_target_id) 
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    UPDATE public.users
    SET followers = array_append(followers, arg_follower_id::text)
    WHERE id = arg_target_id AND NOT (arg_follower_id::text = ANY(followers));
  
    UPDATE public.users
    SET following = array_append(following, arg_target_id::text)
    WHERE id = arg_follower_id AND NOT (arg_target_id::text = ANY(following));
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- add_follower (1 arg)
CREATE OR REPLACE FUNCTION public.add_follower(arg_target_id UUID)
RETURNS VOID AS '
BEGIN
    PERFORM public.add_follower(arg_target_id, auth.uid());
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- remove_follower (2 args)
CREATE OR REPLACE FUNCTION public.remove_follower(arg_target_id UUID, arg_follower_id UUID)
RETURNS VOID AS '
BEGIN
    DELETE FROM public.followers
    WHERE follower_id = arg_follower_id AND following_id = arg_target_id;

    UPDATE public.users
    SET followers = array_remove(followers, arg_follower_id::text)
    WHERE id = arg_target_id;
  
    UPDATE public.users
    SET following = array_remove(following, arg_target_id::text)
    WHERE id = arg_follower_id;
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- remove_follower (1 arg)
CREATE OR REPLACE FUNCTION public.remove_follower(arg_target_id UUID)
RETURNS VOID AS '
BEGIN
    PERFORM public.remove_follower(arg_target_id, auth.uid());
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- unfollow_user
CREATE OR REPLACE FUNCTION public.unfollow_user(arg_target_id UUID)
RETURNS VOID AS '
BEGIN
    PERFORM public.remove_follower(arg_target_id, auth.uid());
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- calculate_user_level
CREATE OR REPLACE FUNCTION public.calculate_user_level(arg_user_id UUID)
RETURNS INTEGER AS '
DECLARE
  v_total_activity INTEGER;
  v_calculated_level INTEGER;
BEGIN
  SELECT 
    COALESCE(u.total_voice_minutes, 0) + 
    COALESCE(u.total_gifts_sent, 0) + 
    (SELECT COUNT(*) FROM public.voice_rooms vr WHERE vr.owner_id = arg_user_id)
  INTO v_total_activity
  FROM public.users u
  WHERE u.id = arg_user_id;
  
  v_calculated_level := CASE
    WHEN v_total_activity >= 10000 THEN 50
    WHEN v_total_activity >= 5000 THEN 40
    WHEN v_total_activity >= 2000 THEN 30
    WHEN v_total_activity >= 1000 THEN 20
    WHEN v_total_activity >= 500 THEN 15
    WHEN v_total_activity >= 200 THEN 10
    WHEN v_total_activity >= 100 THEN 5
    ELSE 1
  END;
  
  RETURN v_calculated_level;
END;
' LANGUAGE plpgsql;

-- update_user_level_trigger
CREATE OR REPLACE FUNCTION public.update_user_level_trigger()
RETURNS TRIGGER AS '
BEGIN
  NEW.level := public.calculate_user_level(NEW.id);
  RETURN NEW;
END;
' LANGUAGE plpgsql;

-- add_coins_from_payment
CREATE OR REPLACE FUNCTION public.add_coins_from_payment(
  arg_transaction_id TEXT,
  arg_user_id UUID,
  arg_coins INTEGER,
  arg_payment_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS '
BEGIN
  UPDATE public.users
  SET 
    coins = coins + arg_coins,
    updated_at = NOW()
  WHERE id = arg_user_id;
  
  IF NOT FOUND THEN
     RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
';

-- process_payment_refund
CREATE OR REPLACE FUNCTION public.process_payment_refund(
  arg_transaction_id TEXT,
  arg_admin_id UUID,
  arg_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS '
BEGIN
  RETURN gen_random_uuid();
END;
';

-- 5. RE-CREATE TRIGGERS
DROP TRIGGER IF EXISTS trigger_update_user_level ON public.users;
CREATE TRIGGER trigger_update_user_level 
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  WHEN (
    OLD.total_voice_minutes IS DISTINCT FROM NEW.total_voice_minutes OR
    OLD.total_gifts_sent IS DISTINCT FROM NEW.total_gifts_sent
  )
  EXECUTE FUNCTION public.update_user_level_trigger();

-- 6. SECURITY UPDATES (Search Path)
ALTER FUNCTION public.add_follower(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.add_follower(uuid) SET search_path = public;
ALTER FUNCTION public.remove_follower(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.remove_follower(uuid) SET search_path = public;
ALTER FUNCTION public.unfollow_user(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_user_level(uuid) SET search_path = public;
ALTER FUNCTION public.update_user_level_trigger() SET search_path = public;
ALTER FUNCTION public.add_coins_from_payment(text, uuid, integer, text) SET search_path = public;
ALTER FUNCTION public.process_payment_refund(text, uuid, text) SET search_path = public;

-- 7. SECURITY UPDATES (Views)
DO '
BEGIN
    BEGIN ALTER VIEW public.daily_revenue SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.recent_lucky_bag_winners SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.active_lucky_bags SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.active_pk_battles SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.user_payment_stats SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.pk_battle_leaderboard SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
END;
';
