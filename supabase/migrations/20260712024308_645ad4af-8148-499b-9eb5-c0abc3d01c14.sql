ALTER TABLE public.hackathon_submissions
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS published_hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE SET NULL;