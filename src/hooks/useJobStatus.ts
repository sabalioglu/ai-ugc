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

  const queryResult = useQuery({
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
    refetchInterval: false,
  });

  // PROGRESS SIMULATION
  // Automatically increases progress to 95% over 10 minutes (600 seconds)
  // No timeout - waits indefinitely for N8N workflow completion
  useEffect(() => {
    const job = queryResult.data;
    if (!jobId || !job) return;

    // Stop simulation if actually completed or failed in DB
    if (job.status === 'completed' || job.status === 'failed') {
      return;
    }

    const intervalId = setInterval(() => {
      const createdAt = new Date(job.created_at).getTime();
      const now = Date.now();
      const elapsedSeconds = (now - createdAt) / 1000;

      // PROGRESS SIMULATION: Target 95% in 600 seconds
      if (elapsedSeconds <= 600) {
        let simulatedProgress = (elapsedSeconds / 600) * 95;
        if (simulatedProgress > 95) simulatedProgress = 95;
        if (simulatedProgress < 0) simulatedProgress = 0;

        const currentProgress = job.progress_percentage || 0;
        if (simulatedProgress > currentProgress) {
          queryClient.setQueryData(['job-status', jobId], (old: VideoJob) => ({
            ...old,
            progress_percentage: simulatedProgress,
          }));
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [jobId, queryResult.data, queryClient]);

  return queryResult;
}
