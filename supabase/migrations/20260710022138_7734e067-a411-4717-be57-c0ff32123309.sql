-- Public read for banner images
CREATE POLICY "Public read banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Admin write
CREATE POLICY "Admins upload banners"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update banners"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete banners"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

-- Authenticated users can upload their submissions too (public Submit form when logged in)
CREATE POLICY "Users upload banners"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'banners');

-- Anonymous submissions also need upload
CREATE POLICY "Anon upload banners"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'banners');
