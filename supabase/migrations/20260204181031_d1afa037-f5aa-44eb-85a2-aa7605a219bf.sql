-- Create storage bucket for trade chart images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-charts', 'trade-charts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for study attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-attachments', 'study-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for trade-charts bucket
CREATE POLICY "Users can view trade chart images"
ON storage.objects FOR SELECT
USING (bucket_id = 'trade-charts');

CREATE POLICY "Authenticated users can upload trade charts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trade-charts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own trade charts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own trade charts"
ON storage.objects FOR DELETE
USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for study-attachments bucket
CREATE POLICY "Users can view study attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-attachments');

CREATE POLICY "Authenticated users can upload study attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own study attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own study attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'study-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add chart_images column to trades table for storing image URLs
ALTER TABLE trades ADD COLUMN IF NOT EXISTS chart_images jsonb DEFAULT '[]'::jsonb;