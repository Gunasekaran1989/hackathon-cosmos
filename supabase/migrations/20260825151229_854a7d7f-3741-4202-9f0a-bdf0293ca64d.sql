-- Ensure slug uniqueness so slug generation can rely on it
CREATE UNIQUE INDEX IF NOT EXISTS hackathons_slug_key ON public.hackathons (slug) WHERE slug IS NOT NULL;

CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(_input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.approve_hackathon_submission(submission_id uuid, admin_notes_override text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
  _sub public.hackathon_submissions;
  _base text;
  _slug text;
  _i int := 1;
  _mode text;
  _new_id uuid;
BEGIN
  IF _admin IS NULL OR NOT public.has_role(_admin, 'admin') THEN
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

  -- Normalize format -> mode
  _mode := CASE lower(coalesce(_sub.format, ''))
    WHEN 'online' THEN 'online'
    WHEN 'virtual' THEN 'online'
    WHEN 'in-person' THEN 'in-person'
    WHEN 'offline' THEN 'in-person'
    WHEN 'hybrid' THEN 'hybrid'
    WHEN '' THEN NULL
    ELSE _sub.format
  END;

  -- Unique slug
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
    location, mode, start_date, end_date, prize_pool, slug, featured, status, tags,
    created_at, updated_at
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

  RETURN jsonb_build_object(
    'success', true,
    'hackathon_id', _new_id,
    'slug', _slug,
    'submission_id', submission_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.approve_hackathon_submission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_hackathon_submission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_hackathon_submission(uuid, text) TO service_role;