-- Add reading progress columns to reading_history table
ALTER TABLE public.reading_history 
ADD COLUMN IF NOT EXISTS scroll_progress float DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_image_index int DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reading_history_user_chapter 
ON public.reading_history (user_id, chapter_slug);