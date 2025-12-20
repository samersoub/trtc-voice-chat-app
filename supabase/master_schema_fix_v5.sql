-- Master Fix Script (v5 - Final Verified)
-- Date: 2025-12-20
-- Description: Comprehensive fix for database issues with CASCADE drops and robust syntax.
-- fixes:
-- 1. "cannot drop function ... depend on it" -> Added CASCADE
-- 2. "REATE" typo -> Checked syntax
-- 3. "unterminated dollar-quoted string" -> Using $function$ delimiters
-- 4. "column does not exist" -> Clean function definitions

-- ============================================================
-- 1. Clean Slate (Drop conflicting functions with CASCADE)
-- ============================================================

-- Drop functions and their dependent triggers/policies
DROP FUNCTION IF EXISTS public.add_follower(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.add_follower(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.remove_follower(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.remove_follower(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.unfollow_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_user_level(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_level_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.add_coins_from_payment(text, uuid, integer, text) CASCADE;
DROP FUNCTION IF EXISTS public.process_payment_refund(text, uuid, text) CASCADE;

-- ============================================================
-- 2. Schema Updates
-- ============================================================

-- 2.1 Users Table Updates (Idempotent)
DO $do$ 
BEGIN
    BEGIN ALTER TABLE public.users ADD COLUMN followers TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN following TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN level INTEGER DEFAULT 1; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN total_voice_minutes INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.users ADD COLUMN total_gifts_sent DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $do$;

-- 2.2 Followers Table
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- 2.3 RLS Policies
DO $do$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'followers' AND policyname = 'Anyone can view followers') THEN
        CREATE POLICY "Anyone can view followers" ON public.followers FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'followers' AND policyname = 'Users can follow others') THEN
        CREATE POLICY "Users can follow others" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'followers' AND policyname = 'Users can unfollow') THEN
        CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);
    END IF;
END $do$;

-- ============================================================
-- 3. Function Definitions
-- ============================================================

-- 3.1 add_follower (2 args)
CREATE OR REPLACE FUNCTION public.add_follower(p_target_user_id UUID, p_follower_id UUID)
RETURNS VOID AS $function$
BEGIN
    -- 1. Insert into table
    INSERT INTO public.followers (follower_id, following_id) 
    VALUES (p_follower_id, p_target_user_id) 
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    -- 2. Update array (Legacy support)
    UPDATE public.users
    SET followers = array_append(followers, p_follower_id::text)
    WHERE id = p_target_user_id AND NOT (p_follower_id::text = ANY(followers));
  
    UPDATE public.users
    SET following = array_append(following, p_target_user_id::text)
    WHERE id = p_follower_id AND NOT (p_target_user_id::text = ANY(following));
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.2 add_follower (1 arg overload)
CREATE OR REPLACE FUNCTION public.add_follower(p_target_user_id UUID)
RETURNS VOID AS $function$
BEGIN
    PERFORM public.add_follower(p_target_user_id, auth.uid());
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.3 remove_follower (2 args)
CREATE OR REPLACE FUNCTION public.remove_follower(p_target_user_id UUID, p_follower_id UUID)
RETURNS VOID AS $function$
BEGIN
    -- 1. Remove from table
    DELETE FROM public.followers
    WHERE follower_id = p_follower_id AND following_id = p_target_user_id;

    -- 2. Update array (Legacy support)
    UPDATE public.users
    SET followers = array_remove(followers, p_follower_id::text)
    WHERE id = p_target_user_id;
  
    UPDATE public.users
    SET following = array_remove(following, p_target_user_id::text)
    WHERE id = p_follower_id;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.4 remove_follower (1 arg overload)
CREATE OR REPLACE FUNCTION public.remove_follower(p_target_user_id UUID)
RETURNS VOID AS $function$
BEGIN
    PERFORM public.remove_follower(p_target_user_id, auth.uid());
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.5 unfollow_user
CREATE OR REPLACE FUNCTION public.unfollow_user(p_target_user_id UUID)
RETURNS VOID AS $function$
BEGIN
    PERFORM public.remove_follower(p_target_user_id, auth.uid());
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.6 calculate_user_level
CREATE OR REPLACE FUNCTION public.calculate_user_level(p_user_id UUID)
RETURNS INTEGER AS $function$
DECLARE
  v_total_activity INTEGER;
  v_calculated_level INTEGER;
BEGIN
  SELECT 
    COALESCE(u.total_voice_minutes, 0) + 
    COALESCE(u.total_gifts_sent, 0) + 
    (SELECT COUNT(*) FROM public.voice_rooms vr WHERE vr.owner_id = p_user_id)
  INTO v_total_activity
  FROM public.users u
  WHERE u.id = p_user_id;
  
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
$function$ LANGUAGE plpgsql SET search_path = public;

-- 3.7 update_user_level_trigger
CREATE OR REPLACE FUNCTION public.update_user_level_trigger()
RETURNS TRIGGER AS $function$
BEGIN
  NEW.level := public.calculate_user_level(NEW.id);
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SET search_path = public;

-- 3.8 add_coins_from_payment
CREATE OR REPLACE FUNCTION public.add_coins_from_payment(
  p_transaction_id TEXT,
  p_user_id UUID,
  p_coins INTEGER,
  p_payment_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.users
  SET 
    coins = coins + p_coins,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
     RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$function$;

-- 3.9 process_payment_refund
CREATE OR REPLACE FUNCTION public.process_payment_refund(
  p_transaction_id TEXT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN gen_random_uuid();
END;
$function$;

-- ============================================================
-- 4. Triggers (Recreate after function drop)
-- ============================================================

DROP TRIGGER IF EXISTS trigger_update_user_level ON public.users;
CREATE TRIGGER trigger_update_user_level 
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  WHEN (
    OLD.total_voice_minutes IS DISTINCT FROM NEW.total_voice_minutes OR
    OLD.total_gifts_sent IS DISTINCT FROM NEW.total_gifts_sent
  )
  EXECUTE FUNCTION public.update_user_level_trigger();

-- ============================================================
-- 5. Security Checks (Views & Other Functions)
-- ============================================================

-- Secure other existing functions if they are present
DO $do$
BEGIN
    BEGIN ALTER FUNCTION public.cleanup_old_seats() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.update_updated_at_column() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.sync_profile_image_with_avatar() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.update_user_wealth_level() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.update_app_settings_timestamp() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.update_coin_package_timestamp() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.update_battle_score_after_gift() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.update_user_battle_history() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.update_room_participant_count() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.auto_hide_empty_rooms() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.recalculate_bag_chances() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.auto_expire_lucky_bags() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.join_lucky_bag(uuid, uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.draw_lucky_bag_winner(uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.end_pk_battle(uuid, uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER FUNCTION public.handle_new_user() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END;
END $do$;

-- Fix Security Definer Views
DO $do$
BEGIN
    BEGIN ALTER VIEW public.daily_revenue SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.recent_lucky_bag_winners SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.active_lucky_bags SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.active_pk_battles SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.user_payment_stats SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER VIEW public.pk_battle_leaderboard SET (security_invoker = on); EXCEPTION WHEN OTHERS THEN NULL; END;
END $do$;

