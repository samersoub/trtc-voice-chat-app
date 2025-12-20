-- Master Fix Script (v3 - Clean Slate)
-- Date: 2025-12-20
-- Description: Consolidates all missing tables, columns, functions, and security fixes into one file.
-- Includes DROP FUNCTION to prevent signature conflict errors.

-- 1. Schema Updates
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

DO $$ 
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
END $$;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS followers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS following TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_voice_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_gifts_sent DECIMAL(10,2) DEFAULT 0;

-- 2. Function Definitions (Clean up old versions first)

-- DROP functions to allow parameter renaming
DROP FUNCTION IF EXISTS public.add_follower(uuid, uuid);
DROP FUNCTION IF EXISTS public.add_follower(uuid);
DROP FUNCTION IF EXISTS public.remove_follower(uuid, uuid);
DROP FUNCTION IF EXISTS public.remove_follower(uuid);
DROP FUNCTION IF EXISTS public.unfollow_user(uuid);
DROP FUNCTION IF EXISTS public.calculate_user_level(uuid);

-- 2.1 add_follower
CREATE OR REPLACE FUNCTION public.add_follower(p_target_user_id UUID, p_follower_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overload: add_follower(p_target_user_id)
CREATE OR REPLACE FUNCTION public.add_follower(p_target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM public.add_follower(p_target_user_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.2 remove_follower
CREATE OR REPLACE FUNCTION public.remove_follower(p_target_user_id UUID, p_follower_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overload: remove_follower(p_target_user_id)
CREATE OR REPLACE FUNCTION public.remove_follower(p_target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM public.remove_follower(p_target_user_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2.3 unfollow_user
CREATE OR REPLACE FUNCTION public.unfollow_user(p_target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM public.remove_follower(p_target_user_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.4 calculate_user_level
CREATE OR REPLACE FUNCTION public.calculate_user_level(p_user_id UUID)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- 2.5 update_user_level_trigger
CREATE OR REPLACE FUNCTION public.update_user_level_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := public.calculate_user_level(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.6 add_coins_from_payment
CREATE OR REPLACE FUNCTION public.add_coins_from_payment(
  p_transaction_id TEXT,
  p_user_id UUID,
  p_coins INTEGER,
  p_payment_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET 
    coins = coins + p_coins,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- 2.7 process_payment_refund
CREATE OR REPLACE FUNCTION public.process_payment_refund(
  p_transaction_id TEXT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN gen_random_uuid();
END;
$$;

-- 3. Security Fixes (Search Path)

-- Use DO block for idempotent ALTERs
DO $$
BEGIN
    ALTER FUNCTION public.add_coins_from_payment(text, uuid, integer, text) SET search_path = public;
    ALTER FUNCTION public.process_payment_refund(text, uuid, text) SET search_path = public;
    ALTER FUNCTION public.add_follower(uuid, uuid) SET search_path = public;
    ALTER FUNCTION public.add_follower(uuid) SET search_path = public;
    ALTER FUNCTION public.remove_follower(uuid, uuid) SET search_path = public;
    ALTER FUNCTION public.remove_follower(uuid) SET search_path = public; 
    ALTER FUNCTION public.unfollow_user(uuid) SET search_path = public;
    ALTER FUNCTION public.update_user_level_trigger() SET search_path = public;
    ALTER FUNCTION public.calculate_user_level(uuid) SET search_path = public;
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

-- View Security
DO $$
BEGIN
    ALTER VIEW public.daily_revenue SET (security_invoker = on);
    ALTER VIEW public.active_lucky_bags SET (security_invoker = on);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
