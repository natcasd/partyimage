-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'party-images', 
  'party-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- Storage policies
CREATE POLICY "Authenticated users can upload images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'party-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'party-images');

CREATE POLICY "Users can delete their own images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'party-images' AND 
  auth.uid()::text = split_part(name, '/', 1)
);

-- Update images table
ALTER TABLE images 
  DROP COLUMN image_url,
  ADD COLUMN storage_path TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_images_storage_path ON images(storage_path);