/*
  # Create UGC Video Generator Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, not null) - User email
      - `full_name` (text) - User's full name
      - `credits_balance` (integer, default 10) - Available credits
      - `credits_used` (integer, default 0) - Total credits used
      - `subscription_tier` (text, default 'free') - Subscription level: free, pro, enterprise
      - `total_videos_generated` (integer, default 0) - Count of generated videos
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `video_jobs`
      - `id` (uuid, primary key) - Internal database ID
      - `job_id` (text, unique, not null) - External job ID from n8n
      - `user_id` (uuid, not null) - References user_profiles.id
      - `user_email` (text, not null) - User email for reference
      - `product_name` (text, not null) - Product name
      - `product_description` (text) - Optional product description
      - `product_image_url` (text) - Uploaded product image URL
      - `ugc_type` (text, not null) - UGC style selected
      - `target_audience` (text, not null) - Target audience type
      - `platform` (text, not null) - Platform (TikTok/Reels, YouTube, Instagram)
      - `duration` (integer, not null) - Video duration in seconds
      - `total_scenes` (integer, not null) - Number of scenes
      - `aspect_ratio` (text, not null) - Video aspect ratio
      - `product_category` (text) - AI-detected product category
      - `product_analysis` (jsonb) - AI analysis results
      - `character_model` (jsonb) - Selected character details (age, gender, style)
      - `status` (text, default 'pending') - Job status: pending, processing, completed, failed
      - `progress_percentage` (integer, default 0) - Progress 0-100
      - `current_step` (text) - Current processing step description
      - `video_url` (text) - Final video URL
      - `thumbnail_url` (text) - Video thumbnail URL
      - `error_message` (text) - Error details if failed
      - `credits_cost` (integer, default 10) - Credits charged
      - `credits_refunded` (integer, default 0) - Credits refunded if failed
      - `created_at` (timestamptz) - Job creation timestamp
      - `started_at` (timestamptz) - Processing start time
      - `completed_at` (timestamptz) - Completion timestamp

  2. Security
    - Enable RLS on both tables
    - user_profiles: Users can only read/update their own profile
    - video_jobs: Users can only access their own video jobs
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  credits_balance integer DEFAULT 10 NOT NULL,
  credits_used integer DEFAULT 0 NOT NULL,
  subscription_tier text DEFAULT 'free' NOT NULL CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  total_videos_generated integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create video_jobs table
CREATE TABLE IF NOT EXISTS video_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  product_name text NOT NULL,
  product_description text,
  product_image_url text,
  ugc_type text NOT NULL,
  target_audience text NOT NULL,
  platform text NOT NULL,
  duration integer NOT NULL,
  total_scenes integer NOT NULL,
  aspect_ratio text NOT NULL,
  product_category text,
  product_analysis jsonb,
  character_model jsonb,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_percentage integer DEFAULT 0 NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_step text,
  video_url text,
  thumbnail_url text,
  error_message text,
  credits_cost integer DEFAULT 10 NOT NULL,
  credits_refunded integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  started_at timestamptz,
  completed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id ON video_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_created_at ON video_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_jobs_job_id ON video_jobs(job_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for video_jobs
CREATE POLICY "Users can view own video jobs"
  ON video_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video jobs"
  ON video_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video jobs"
  ON video_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own video jobs"
  ON video_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();