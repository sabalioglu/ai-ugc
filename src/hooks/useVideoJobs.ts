import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VideoJob } from '@/lib/supabase';

export function useVideoJobs(
  userId: string | undefined,
  status?: 'pending' | 'processing' | 'completed' | 'failed'
) {
  return useQuery({
    queryKey: ['video-jobs', userId, status],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('video_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as VideoJob[]) || [];
    },
    enabled: !!userId,
  });
}
