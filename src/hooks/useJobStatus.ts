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

  // MOCK DATA SIMULATION
  useEffect(() => {
    // Only run if we have a job and it is at 40% (Character generated)
    // We will simulate the next steps for a smooth demo.
    const currentData = queryClient.getQueryData<VideoJob>(['job-status', jobId]);

    if (jobId && currentData && currentData.progress_percentage === 40) {
      console.log('Starting mock simulation sequence...');

      // Step 1: Simulate 60% (Start/End Frames) after 2 seconds
      const timer1 = setTimeout(() => {
        console.log('Simulating 60% progress...');
        queryClient.setQueryData(['job-status', jobId], (old: VideoJob) => ({
          ...old,
          progress_percentage: 60,
          current_step: "Start and end frames created!",
          start_frame_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          end_frame_url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }));
      }, 3000);

      // Step 2: Simulate 75% (Script generated) after another 3 seconds
      const timer2 = setTimeout(() => {
        console.log('Simulating 75% progress...');
        queryClient.setQueryData(['job-status', jobId], (old: VideoJob) => ({
          ...old,
          progress_percentage: 75,
          current_step: "Video script generated!"
        }));
      }, 6000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [jobId, queryClient]); // Re-run when jobId changes, or we can add dependency on data if needed, but be careful of loops

}

