import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yiwezubimkzkqxzbfodn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpd2V6dWJpbWt6a3F4emJmb2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTc3MDgsImV4cCI6MjA4MzQzMzcwOH0.Eovc-Om11OEVJ5ZV8Txoc2VLSRsRundivdVtvDTKFu4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  credits_balance: number;
  credits_used: number;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  total_videos_generated: number;
  created_at: string;
  updated_at: string;
}

export interface VideoJob {
  id: string;
  job_id: string;
  user_id: string;
  user_email: string;
  product_name: string;
  product_description?: string;
  product_image_url?: string;
  ugc_type: string;
  target_audience: string;
  platform: string;
  duration: number;
  total_scenes: number;
  aspect_ratio: string;
  product_category?: string;
  product_analysis?: any;
  character_model?: {
    age: number;
    gender: string;
    style: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  current_step?: string;
  video_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  credits_cost: number;
  credits_refunded: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      video_jobs: {
        Row: VideoJob;
        Insert: Omit<VideoJob, 'id' | 'created_at'>;
        Update: Partial<Omit<VideoJob, 'id' | 'created_at'>>;
      };
    };
  };
}
