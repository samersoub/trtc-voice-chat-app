-- Fix missing followers table and functions
-- Date: 2025-12-20
-- Description: Creates the missing followers table and related functions to fix the 'function remove_follower does not exist' error.

-- 1. Create Followers Table
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can see who follows whom
CREATE POLICY "Anyone can view followers" ON public.followers FOR SELECT USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others" ON public.followers 
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow others (remove their own follow)
CREATE POLICY "Users can unfollow" ON public.followers 
    FOR DELETE USING (auth.uid() = follower_id);

-- Users can remove followers (remove someone from following them)
CREATE POLICY "Users can remove followers" ON public.followers 
    FOR DELETE USING (auth.uid() = following_id);


-- 2. Implement Missing Functions

-- Function: remove_follower
-- Description: Allows a user to remove a specific follower (block them from following).
-- Usage: supabase.rpc('remove_follower', { target_user_id: 'UUID' })
CREATE OR REPLACE FUNCTION public.remove_follower(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.followers
    WHERE follower_id = target_user_id AND following_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: unfollow_user
-- Description: Allows a user to unfollow someone.
-- Usage: supabase.rpc('unfollow_user', { target_user_id: 'UUID' })
CREATE OR REPLACE FUNCTION public.unfollow_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.followers
    WHERE follower_id = auth.uid() AND following_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: follow_user
-- Description: Allows a user to follow someone.
-- Usage: supabase.rpc('follow_user', { target_user_id: 'UUID' })
CREATE OR REPLACE FUNCTION public.follow_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.followers (follower_id, following_id)
    VALUES (auth.uid(), target_user_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_followers_count
CREATE OR REPLACE FUNCTION public.get_followers_count(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count FROM public.followers WHERE following_id = target_user_id;
    RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_following_count
CREATE OR REPLACE FUNCTION public.get_following_count(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count FROM public.followers WHERE follower_id = target_user_id;
    RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions (just in case)
GRANT ALL ON TABLE public.followers TO authenticated;
GRANT ALL ON TABLE public.followers TO service_role;
