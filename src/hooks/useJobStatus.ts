import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VideoJob } from '@/lib/supabase';

export function useJobStatus(jobId: string | undefined) {
  const queryClient = useQueryClient();

  // Subscribing to realtime updates
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`job-status:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_jobs',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Manually update the query cache with the new data
          queryClient.setQueryData(['job-status', jobId], payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, queryClient]);

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
    // Polling is no longer needed as we use Realtime, 
    // but we can keep a slow fallback just in case or set it to false
    refetchInterval: false,
  });
}

