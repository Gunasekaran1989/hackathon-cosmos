-- 1. Profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}'::text[];

-- 2. Participations
CREATE TABLE IF NOT EXISTS public.user_hackathon_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  participation_status text NOT NULL DEFAULT 'registered',
  role text,
  registered_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, hackathon_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_hackathon_participations TO authenticated;
GRANT ALL ON public.user_hackathon_participations TO service_role;
ALTER TABLE public.user_hackathon_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own participations" ON public.user_hackathon_participations
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own participations" ON public.user_hackathon_participations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own participations" ON public.user_hackathon_participations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own participations" ON public.user_hackathon_participations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER participations_touch_updated_at BEFORE UPDATE ON public.user_hackathon_participations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  category text NOT NULL DEFAULT 'participation',
  criteria_type text NOT NULL,
  criteria_value integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.badges TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active badges are viewable by everyone" ON public.badges
  FOR SELECT USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert badges" ON public.badges
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update badges" ON public.badges
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete badges" ON public.badges
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. User badges (no direct inserts by users)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, badge_id)
);

GRANT SELECT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own badges" ON public.user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 5. Activity
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_activity TO authenticated;
GRANT ALL ON public.user_activity TO service_role;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own activity" ON public.user_activity
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS user_activity_user_created_idx ON public.user_activity (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS participations_user_idx ON public.user_hackathon_participations (user_id);

-- 6. Seed badges
INSERT INTO public.badges (name, slug, description, icon, category, criteria_type, criteria_value) VALUES
  ('First Explorer', 'first-explorer', 'Registered for your first hackathon.', 'compass', 'participation', 'participations', 1),
  ('Active Participant', 'active-participant', 'Participated in 3 hackathons.', 'activity', 'engagement', 'participations', 3),
  ('Hackathon Explorer', 'hackathon-explorer', 'Participated in 5 hackathons.', 'map', 'participation', 'participations', 5),
  ('Hackathon Veteran', 'hackathon-veteran', 'Participated in 10 hackathons.', 'shield', 'participation', 'participations', 10),
  ('First Contributor', 'first-contributor', 'Submitted your first hackathon to HackGlobe.', 'upload', 'contribution', 'submissions', 1),
  ('Community Contributor', 'community-contributor', 'Had 5 hackathon submissions approved.', 'users', 'contribution', 'approved_submissions', 5),
  ('Hackathon Curator', 'hackathon-curator', 'Had 10 hackathon submissions approved.', 'library', 'contribution', 'approved_submissions', 10),
  ('Early Adopter', 'early-adopter', 'Joined HackGlobe in its earliest days.', 'sparkles', 'engagement', 'early_adopter', 1),
  ('Rising Hacker', 'rising-hacker', 'Participated in 5 hackathons with at least one approved contribution.', 'trending-up', 'milestone', 'rising_hacker', 5),
  ('HackGlobe Champion', 'hackglobe-champion', 'Reached 10 participations and 5 approved contributions.', 'trophy', 'milestone', 'champion', 10)
ON CONFLICT (slug) DO NOTHING;

-- 7. Badge evaluation engine
CREATE OR REPLACE FUNCTION public.evaluate_user_badges(_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target uuid := coalesce(_user_id, auth.uid());
  _participations int;
  _submissions int;
  _approved int;
  _early boolean;
  _b public.badges;
  _new jsonb := '[]'::jsonb;
  _qualifies boolean;
BEGIN
  IF _target IS NULL THEN
    RAISE EXCEPTION 'No user specified' USING ERRCODE = '22023';
  END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> _target AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO _participations FROM public.user_hackathon_participations
   WHERE user_id = _target AND participation_status <> 'cancelled';
  SELECT count(*) INTO _submissions FROM public.hackathon_submissions WHERE user_id = _target;
  SELECT count(*) INTO _approved FROM public.hackathon_submissions
   WHERE user_id = _target AND lower(status) = 'approved';
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _target AND p.created_at < now() - interval '0 second'
      AND (SELECT count(*) FROM public.profiles) <= 100
  ) INTO _early;

  FOR _b IN SELECT * FROM public.badges WHERE active LOOP
    _qualifies := CASE _b.criteria_type
      WHEN 'participations' THEN _participations >= _b.criteria_value
      WHEN 'submissions' THEN _submissions >= _b.criteria_value
      WHEN 'approved_submissions' THEN _approved >= _b.criteria_value
      WHEN 'early_adopter' THEN _early
      WHEN 'rising_hacker' THEN _participations >= _b.criteria_value AND _approved >= 1
      WHEN 'champion' THEN _participations >= _b.criteria_value AND _approved >= 5
      ELSE false
    END;

    IF _qualifies THEN
      INSERT INTO public.user_badges (user_id, badge_id, metadata)
      VALUES (_target, _b.id, jsonb_build_object('participations', _participations, 'approved_submissions', _approved))
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      IF FOUND THEN
        _new := _new || jsonb_build_object('slug', _b.slug, 'name', _b.name);
        INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
        VALUES (_target, 'badge_earned', 'badge', _b.id, jsonb_build_object('name', _b.name, 'slug', _b.slug));
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('new_badges', _new, 'participations', _participations,
    'submissions', _submissions, 'approved_submissions', _approved);
END;
$$;

REVOKE ALL ON FUNCTION public.evaluate_user_badges(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.evaluate_user_badges(uuid) TO authenticated;

-- 8. Registration function
CREATE OR REPLACE FUNCTION public.register_for_hackathon(_hackathon_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _title text;
  _pid uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  SELECT title INTO _title FROM public.hackathons WHERE id = _hackathon_id AND status = 'approved';
  IF _title IS NULL THEN
    RAISE EXCEPTION 'Hackathon not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.user_hackathon_participations (user_id, hackathon_id, participation_status)
  VALUES (_uid, _hackathon_id, 'registered')
  ON CONFLICT (user_id, hackathon_id) DO NOTHING
  RETURNING id INTO _pid;

  IF _pid IS NOT NULL THEN
    INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
    VALUES (_uid, 'hackathon_registered', 'hackathon', _hackathon_id, jsonb_build_object('title', _title));
  END IF;

  RETURN jsonb_build_object('already_registered', _pid IS NULL,
    'badges', public.evaluate_user_badges(_uid));
END;
$$;

REVOKE ALL ON FUNCTION public.register_for_hackathon(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.register_for_hackathon(uuid) TO authenticated;

-- 9. Complete participation
CREATE OR REPLACE FUNCTION public.complete_participation(_hackathon_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid(); _title text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.user_hackathon_participations
    SET participation_status = 'completed', completed_at = now()
    WHERE user_id = _uid AND hackathon_id = _hackathon_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Participation not found' USING ERRCODE = 'P0002';
  END IF;
  SELECT title INTO _title FROM public.hackathons WHERE id = _hackathon_id;
  INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
  VALUES (_uid, 'hackathon_completed', 'hackathon', _hackathon_id, jsonb_build_object('title', _title));
  RETURN public.evaluate_user_badges(_uid);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_participation(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_participation(uuid) TO authenticated;

-- 10. Submission activity + badge triggers
CREATE OR REPLACE FUNCTION public.log_submission_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
    VALUES (NEW.user_id, 'submission_created', 'submission', NEW.id, jsonb_build_object('event_name', NEW.event_name));
    PERFORM public.evaluate_user_badges(NEW.user_id);
  ELSIF TG_OP = 'UPDATE' AND lower(coalesce(NEW.status,'')) <> lower(coalesce(OLD.status,'')) THEN
    IF lower(NEW.status) = 'approved' THEN
      INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
      VALUES (NEW.user_id, 'submission_approved', 'submission', NEW.id, jsonb_build_object('event_name', NEW.event_name));
    ELSIF lower(NEW.status) = 'rejected' THEN
      INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
      VALUES (NEW.user_id, 'submission_rejected', 'submission', NEW.id, jsonb_build_object('event_name', NEW.event_name));
    END IF;
    PERFORM public.evaluate_user_badges(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS submissions_activity_insert ON public.hackathon_submissions;
CREATE TRIGGER submissions_activity_insert AFTER INSERT ON public.hackathon_submissions
  FOR EACH ROW EXECUTE FUNCTION public.log_submission_activity();

DROP TRIGGER IF EXISTS submissions_activity_update ON public.hackathon_submissions;
CREATE TRIGGER submissions_activity_update AFTER UPDATE ON public.hackathon_submissions
  FOR EACH ROW EXECUTE FUNCTION public.log_submission_activity();