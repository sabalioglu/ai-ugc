/*
  # Enable Realtime for video_jobs table

  This migration enables Supabase Realtime subscriptions for the video_jobs table.

  This is required for the frontend to receive real-time updates when the N8N
  backend updates job progress, status, and current_step fields.

  The publication is set with replica identity FULL to ensure all column values
  are available in the realtime payload.
*/

-- Set replica identity to FULL to include all columns in realtime payload
ALTER TABLE video_jobs REPLICA IDENTITY FULL;

-- Add video_jobs to the supabase_realtime publication
-- This enables real-time subscriptions for this table
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'video_jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE video_jobs;
  END IF;
END
$$;
