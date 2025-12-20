-- Fix User Defined Function Security (Search Path Mutable)
-- Prevents malicious users from hijacking the search path

ALTER FUNCTION public.cleanup_old_seats() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.sync_profile_image_with_avatar() SET search_path = public;

ALTER FUNCTION public.update_user_wealth_level() SET search_path = public;
ALTER FUNCTION public.update_app_settings_timestamp() SET search_path = public;
ALTER FUNCTION public.update_coin_package_timestamp() SET search_path = public;
ALTER FUNCTION public.add_coins_from_payment(uuid, integer, text, jsonb) SET search_path = public;
ALTER FUNCTION public.process_payment_refund(text, text) SET search_path = public;
ALTER FUNCTION public.update_user_level_trigger() SET search_path = public;
ALTER FUNCTION public.add_follower(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_user_level(integer) SET search_path = public;
ALTER FUNCTION public.update_battle_score_after_gift() SET search_path = public;
ALTER FUNCTION public.update_user_battle_history() SET search_path = public;
ALTER FUNCTION public.update_room_participant_count() SET search_path = public;
ALTER FUNCTION public.auto_hide_empty_rooms() SET search_path = public;
ALTER FUNCTION public.recalculate_bag_chances() SET search_path = public;
ALTER FUNCTION public.auto_expire_lucky_bags() SET search_path = public;
ALTER FUNCTION public.join_lucky_bag(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.draw_lucky_bag_winner(uuid) SET search_path = public;
ALTER FUNCTION public.end_pk_battle(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Fix Security Definer Views
-- Makes views check permissions of the invoking user (Standard RLS) instead of view creator

ALTER VIEW public.daily_revenue SET (security_invoker = on);
ALTER VIEW public.recent_lucky_bag_winners SET (security_invoker = on);
ALTER VIEW public.active_lucky_bags SET (security_invoker = on);
ALTER VIEW public.active_pk_battles SET (security_invoker = on);
ALTER VIEW public.user_payment_stats SET (security_invoker = on);
ALTER VIEW public.pk_battle_leaderboard SET (security_invoker = on);
