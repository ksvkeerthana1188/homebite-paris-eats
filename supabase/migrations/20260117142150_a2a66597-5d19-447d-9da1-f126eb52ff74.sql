-- Create storage bucket for meal images
INSERT INTO storage.buckets (id, name, public) VALUES ('meal-images', 'meal-images', true);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create policies for meal images bucket
CREATE POLICY "Anyone can view meal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-images');

CREATE POLICY "Authenticated users can upload meal images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meal-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own meal images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own meal images"
ON storage.objects FOR DELETE
USING (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);