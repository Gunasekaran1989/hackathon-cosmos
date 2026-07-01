
CREATE TABLE public.hackathons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  organizer text NOT NULL,
  description text,
  banner_image text,
  country text,
  city text,
  start_date date NOT NULL,
  end_date date,
  prize_pool numeric,
  tags text[] DEFAULT '{}',
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hackathons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hackathons TO authenticated;
GRANT ALL ON public.hackathons TO service_role;

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hackathons are viewable by everyone"
  ON public.hackathons FOR SELECT
  USING (true);

CREATE TRIGGER trg_hackathons_updated_at
  BEFORE UPDATE ON public.hackathons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.hackathons (title, organizer, description, country, city, start_date, end_date, prize_pool, tags) VALUES
('GlobalAI Summit Hack 2026', 'OpenForge', 'Build with frontier LLMs across agents, RAG and multimodal.', 'USA', 'San Francisco', '2026-07-12', '2026-07-14', 250000, ARRAY['AI','GenAI','Trending']),
('ETHWave Berlin', 'ChainLabs', 'Europe''s premier Web3 builder weekend.', 'Germany', 'Berlin', '2026-08-02', '2026-08-04', 180000, ARRAY['Web3','Trending']),
('CloudNative Asia Build', 'CNCF', 'Kubernetes, service mesh and platform engineering.', 'Singapore', 'Singapore', '2026-09-20', '2026-09-22', 120000, ARRAY['Cloud','Enterprise']),
('DEF Shield Cyber Jam', 'Sentinel', 'Offensive and defensive security CTF + build track.', 'UK', 'London', '2026-06-28', '2026-06-30', 90000, ARRAY['Cybersecurity']),
('Kaggle DataQuest Global', 'Kaggle', 'Two-week data science marathon on real datasets.', 'USA', 'Online', '2026-07-25', '2026-08-08', 300000, ARRAY['Data Science','AI','New']),
('UniHack Tokyo', 'TodaiTech', 'University-only 48h build sprint.', 'Japan', 'Tokyo', '2026-10-10', '2026-10-12', 50000, ARRAY['Student','AI','Web3']),
('GenAI Builders Brazil', 'LatamAI', 'Ship GenAI apps for LATAM markets.', 'Brazil', 'São Paulo', '2026-09-05', '2026-09-07', 75000, ARRAY['GenAI','AI']),
('ClimateHack Nairobi', 'GreenGrid', 'Climate tech for African cities.', 'Kenya', 'Nairobi', '2026-11-14', '2026-11-16', 60000, ARRAY['Climate']);
