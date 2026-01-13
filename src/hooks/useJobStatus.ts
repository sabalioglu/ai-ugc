import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VideoJob } from '@/lib/supabase';

export function useJobStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: async () => {
      if (!jobId) return null;

      const { data, error } = await supabase
        .from('video_jobs')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      return data as VideoJob | null;
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      if (!data) return false;
      if (data.status === 'completed' || data.status === 'failed') {
        return false;
      }
      return 3000;
    },
  });
}
