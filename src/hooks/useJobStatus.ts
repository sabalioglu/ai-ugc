import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VideoJob } from '@/lib/supabase';
import { toast } from 'sonner';

export function useJobStatus(jobId: string | undefined) {
  const queryClient = useQueryClient();
<<<<<<< HEAD
=======
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
>>>>>>> c14f9e5 (fix(realtime): robust subscription logic and UI badges)

  // Subscribing to realtime updates
  useEffect(() => {
    if (!jobId) return;

<<<<<<< HEAD
    console.log('[useJobStatus] Subscription initialized for job:', jobId);
=======
    console.log('🔌 Connecting to Realtime for Job:', jobId);
>>>>>>> c14f9e5 (fix(realtime): robust subscription logic and UI badges)

    const channel = supabase
      .channel(`job-status:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_jobs',
          filter: `job_id=eq.${jobId}`, // Keep filter, it should work with unique column
        },
        (payload) => {
<<<<<<< HEAD
          console.log('[useJobStatus] Realtime update received:', payload);

          // Merge with existing data to preserve all fields
          queryClient.setQueryData(['job-status', jobId], (old: VideoJob | null) => {
            if (!old) return payload.new as VideoJob;

            // Merge new data with old, preserving all fields
            const merged = { ...old, ...payload.new };

            // If status changed to completed, trigger a full refetch to ensure data integrity
            if (payload.new.status === 'completed' && old.status !== 'completed') {
              console.log('[useJobStatus] Job completed! Triggering full refetch...');
              queryClient.invalidateQueries({ queryKey: ['job-status', jobId] });
            }

            return merged as VideoJob;
          });
=======
          console.log('⚡ Realtime Update:', payload.new);
          // Optimistic update
          queryClient.setQueryData(['job-status', jobId], payload.new);

          if (payload.new.status === 'completed') {
            toast.success('Video generation completed!');
          }
>>>>>>> c14f9e5 (fix(realtime): robust subscription logic and UI badges)
        }
      )
      .subscribe((status) => {
        console.log('🔌 Realtime Status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 Disconnecting Realtime');
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

      // Transform video_url_1, video_url_2, etc. into scene_videos array
      if (data) {
        const sceneVideos = [];
        for (let i = 1; i <= 8; i++) {
          const videoUrl = (data as any)[`video_url_${i}`];
          if (videoUrl) {
            sceneVideos.push({
              scene_number: i,
              video_url: videoUrl,
            });
          }
        }

        // Add scene_videos to the data object
        return {
          ...data,
          scene_videos: sceneVideos.length > 0 ? sceneVideos : undefined,
        } as VideoJob;
      }

      return data as VideoJob | null;
    },
    enabled: !!jobId,
    refetchInterval: 2000, // Faster polling (2s) as fallback
    refetchOnWindowFocus: true,
  });

<<<<<<< HEAD
  // Debug logging
=======
  // PROGRESS SIMULATION & TIMEOUT CHECK
>>>>>>> c14f9e5 (fix(realtime): robust subscription logic and UI badges)
  useEffect(() => {
    if (queryResult.data) {
      console.log('[useJobStatus] Current status:', queryResult.data.status, 'Progress:', queryResult.data.progress_percentage);
    }
  }, [queryResult.data?.status, queryResult.data?.progress_percentage]);


<<<<<<< HEAD
=======
      // TIMEOUT CHECK: 15 minutes
      if (elapsedSeconds > 900) {
        setIsTimedOut(true);
        queryClient.setQueryData(['job-status', jobId], (old: VideoJob) => ({
          ...old,
          status: 'failed',
          error_message: 'The operation timed out. Please try again.',
          progress_percentage: 100
        }));
        clearInterval(intervalId);
        return;
      }

      // PROGRESS SIMULATION
      // Only simulate if real progress is lagging behind simulated "expected" progress
      // But respect real updates if they jump ahead
      if (elapsedSeconds <= 600) {
        let simulatedProgress = (elapsedSeconds / 600) * 95;
        if (simulatedProgress > 95) simulatedProgress = 95;

        // Ensure we don't overwrite real data if real data is higher?
        // Actually, we should only update IF status is 'processing'
        // and if simulated is > current. 
        // CAUTION: This might fight with Realtime updates if we are not careful.
        // Let's only update if we haven't received a Realtime update in X seconds?
        // Simpler: Just update if simulated > current

        const currentProgress = job.progress_percentage || 0;
        if (simulatedProgress > currentProgress && job.status !== 'completed') {
          // We do NOT setQueryData here because it overwrites real data from polling/realtime
          // Instead, we should just let the UI handle smooth interpolation or ONLY update if 
          // we want to fake it. 
          // If N8N is updating, we want N8N values.
          // Commenting out simulation to prioritize Real Truth from DB for debugging.
          // queryClient.setQueryData(...) 
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [jobId, queryResult.data, queryClient]);
>>>>>>> c14f9e5 (fix(realtime): robust subscription logic and UI badges)

  return { ...queryResult, isConnected };
}
