-- 1. Private schema for elevated-privilege logic
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

-- 2. has_role moved out of the exposed API schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 3. Recreate policies to use private.has_role
DROP POLICY "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Approved hackathons are viewable by everyone" ON public.hackathons;
CREATE POLICY "Approved hackathons are viewable by everyone" ON public.hackathons FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can insert hackathons" ON public.hackathons;
CREATE POLICY "Admins can insert hackathons" ON public.hackathons FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can update hackathons" ON public.hackathons;
CREATE POLICY "Admins can update hackathons" ON public.hackathons FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can delete hackathons" ON public.hackathons;
CREATE POLICY "Admins can delete hackathons" ON public.hackathons FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Users view their own submissions" ON public.hackathon_submissions;
CREATE POLICY "Users view their own submissions" ON public.hackathon_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins update submissions" ON public.hackathon_submissions;
CREATE POLICY "Admins update submissions" ON public.hackathon_submissions FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins delete submissions" ON public.hackathon_submissions;
CREATE POLICY "Admins delete submissions" ON public.hackathon_submissions FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Users view own participations" ON public.user_hackathon_participations;
CREATE POLICY "Users view own participations" ON public.user_hackathon_participations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY "Active badges are viewable by everyone" ON public.badges;
CREATE POLICY "Active badges are viewable by everyone" ON public.badges FOR SELECT
  USING (active OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins insert badges" ON public.badges;
CREATE POLICY "Admins insert badges" ON public.badges FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins update badges" ON public.badges;
CREATE POLICY "Admins update badges" ON public.badges FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins delete badges" ON public.badges;
CREATE POLICY "Admins delete badges" ON public.badges FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Users view own badges" ON public.user_badges;
CREATE POLICY "Users view own badges" ON public.user_badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY "Users view own activity" ON public.user_activity;
CREATE POLICY "Users view own activity" ON public.user_activity FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

-- 4. Profiles: no public enumeration
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.profiles FROM anon;

-- 5. Move privileged workflow functions to the private schema
CREATE OR REPLACE FUNCTION private.evaluate_user_badges(_user_id uuid DEFAULT auth.uid())
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  _target uuid := coalesce(_user_id, auth.uid());
  _participations int; _submissions int; _approved int; _early boolean;
  _b public.badges; _new jsonb := '[]'::jsonb; _qualifies boolean;
BEGIN
  IF _target IS NULL THEN
    RAISE EXCEPTION 'No user specified' USING ERRCODE = '22023';
  END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> _target AND NOT private.has_role(auth.uid(), 'admin') THEN
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
$function$;
GRANT EXECUTE ON FUNCTION private.evaluate_user_badges(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.register_for_hackathon(_hackathon_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _uid uuid := auth.uid(); _title text; _pid uuid;
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

  RETURN jsonb_build_object('already_registered', _pid IS NULL, 'badges', private.evaluate_user_badges(_uid));
END;
$function$;
GRANT EXECUTE ON FUNCTION private.register_for_hackathon(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.complete_participation(_hackathon_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
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
  RETURN private.evaluate_user_badges(_uid);
END;
$function$;
GRANT EXECUTE ON FUNCTION private.complete_participation(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.approve_hackathon_submission(submission_id uuid, admin_notes_override text DEFAULT NULL::text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  _admin uuid := auth.uid();
  _sub public.hackathon_submissions;
  _base text; _slug text; _i int := 1; _mode text; _new_id uuid;
BEGIN
  IF _admin IS NULL OR NOT private.has_role(_admin, 'admin') THEN
    RAISE EXCEPTION 'Permission denied: admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _sub FROM public.hackathon_submissions WHERE id = submission_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found' USING ERRCODE = 'P0002';
  END IF;

  IF lower(_sub.status) = 'approved' OR _sub.published_hackathon_id IS NOT NULL THEN
    RAISE EXCEPTION 'Submission has already been approved' USING ERRCODE = 'P0001';
  END IF;

  IF coalesce(trim(_sub.event_name), '') = '' OR coalesce(trim(_sub.organizer), '') = '' THEN
    RAISE EXCEPTION 'Missing required fields: event name and organizer' USING ERRCODE = 'P0001';
  END IF;
  IF _sub.start_date IS NULL THEN
    RAISE EXCEPTION 'Missing required field: start date' USING ERRCODE = 'P0001';
  END IF;

  _mode := CASE lower(coalesce(_sub.format, ''))
    WHEN 'online' THEN 'online'
    WHEN 'virtual' THEN 'online'
    WHEN 'in-person' THEN 'in-person'
    WHEN 'offline' THEN 'in-person'
    WHEN 'hybrid' THEN 'hybrid'
    WHEN '' THEN NULL
    ELSE _sub.format
  END;

  _base := public.slugify(_sub.event_name);
  IF _base = '' THEN _base := 'hackathon'; END IF;
  _slug := _base;
  WHILE EXISTS (SELECT 1 FROM public.hackathons WHERE slug = _slug) LOOP
    _i := _i + 1;
    _slug := _base || '-' || _i;
    IF _i > 50 THEN
      _slug := _base || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
      EXIT;
    END IF;
  END LOOP;

  INSERT INTO public.hackathons (
    title, organizer, description, short_description, banner_image, website_url, registration_url,
    location, mode, start_date, end_date, prize_pool, slug, featured, status, tags, created_at, updated_at
  ) VALUES (
    _sub.event_name, _sub.organizer, _sub.description, left(coalesce(_sub.description, ''), 160),
    _sub.banner_image, _sub.website, _sub.website,
    _sub.location, _mode, _sub.start_date, _sub.end_date, _sub.prize_pool, _slug, false, 'approved', '{}'::text[],
    now(), now()
  )
  RETURNING id INTO _new_id;

  UPDATE public.hackathon_submissions
  SET status = 'approved',
      published_hackathon_id = _new_id,
      reviewed_at = now(),
      reviewed_by = _admin,
      rejection_reason = NULL,
      admin_notes = coalesce(nullif(trim(coalesce(admin_notes_override, '')), ''), nullif(trim(coalesce(admin_notes, '')), ''), 'Approved'),
      updated_at = now()
  WHERE id = submission_id;

  RETURN jsonb_build_object('success', true, 'hackathon_id', _new_id, 'slug', _slug, 'submission_id', submission_id);
END;
$function$;
GRANT EXECUTE ON FUNCTION private.approve_hackathon_submission(uuid, text) TO authenticated, service_role;

-- 6. Triggers now call the private helpers
CREATE OR REPLACE FUNCTION public.log_submission_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
    VALUES (NEW.user_id, 'submission_created', 'submission', NEW.id, jsonb_build_object('event_name', NEW.event_name));
    PERFORM private.evaluate_user_badges(NEW.user_id);
  ELSIF TG_OP = 'UPDATE' AND lower(coalesce(NEW.status,'')) <> lower(coalesce(OLD.status,'')) THEN
    IF lower(NEW.status) = 'approved' THEN
      INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
      VALUES (NEW.user_id, 'submission_approved', 'submission', NEW.id, jsonb_build_object('event_name', NEW.event_name));
    ELSIF lower(NEW.status) = 'rejected' THEN
      INSERT INTO public.user_activity (user_id, activity_type, entity_type, entity_id, metadata)
      VALUES (NEW.user_id, 'submission_rejected', 'submission', NEW.id, jsonb_build_object('event_name', NEW.event_name));
    END IF;
    PERFORM private.evaluate_user_badges(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- 7a. Storage: scope user uploads to their own folder, move admin checks to private.has_role
DROP POLICY "Users upload banners" ON storage.objects;
CREATE POLICY "Users upload own banner files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'banners'
    AND (storage.foldername(name))[1] IN ('avatars', 'submissions')
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
DROP POLICY "Admins upload banners" ON storage.objects;
CREATE POLICY "Admins upload banners" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins update banners" ON storage.objects;
CREATE POLICY "Admins update banners" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins delete banners" ON storage.objects;
CREATE POLICY "Admins delete banners" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND private.has_role(auth.uid(), 'admin'));

-- 7b. Drop the publicly exposed SECURITY DEFINER functions and expose thin invoker wrappers
DROP FUNCTION public.approve_hackathon_submission(uuid, text);
DROP FUNCTION public.register_for_hackathon(uuid);
DROP FUNCTION public.complete_participation(uuid);
DROP FUNCTION public.evaluate_user_badges(uuid);
DROP FUNCTION public.has_role(uuid, public.app_role);

CREATE OR REPLACE FUNCTION public.register_for_hackathon(_hackathon_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'public' AS $$
  SELECT private.register_for_hackathon(_hackathon_id)
$$;
REVOKE ALL ON FUNCTION public.register_for_hackathon(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_for_hackathon(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_participation(_hackathon_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'public' AS $$
  SELECT private.complete_participation(_hackathon_id)
$$;
REVOKE ALL ON FUNCTION public.complete_participation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_participation(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_hackathon_submission(submission_id uuid, admin_notes_override text DEFAULT NULL::text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'public' AS $$
  SELECT private.approve_hackathon_submission(submission_id, admin_notes_override)
$$;
REVOKE ALL ON FUNCTION public.approve_hackathon_submission(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_hackathon_submission(uuid, text) TO authenticated;