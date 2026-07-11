
CREATE TABLE public.hackathon_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  event_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  format TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  prize_pool TEXT,
  description TEXT,
  banner_image TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hackathon_submissions TO authenticated;
GRANT ALL ON public.hackathon_submissions TO service_role;

ALTER TABLE public.hackathon_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their own submissions"
  ON public.hackathon_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view their own submissions"
  ON public.hackathon_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update submissions"
  ON public.hackathon_submissions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete submissions"
  ON public.hackathon_submissions FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER hackathon_submissions_touch_updated_at
  BEFORE UPDATE ON public.hackathon_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
