-- Add attachments column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;