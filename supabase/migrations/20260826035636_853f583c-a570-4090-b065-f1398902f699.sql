REVOKE EXECUTE ON FUNCTION public.log_submission_activity() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.slugify(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.approve_hackathon_submission(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.evaluate_user_badges(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.register_for_hackathon(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.complete_participation(uuid) FROM anon, public;