import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VideoJob } from '@/lib/supabase';

export function useJobStatus(jobId: string | undefined) {
  const queryClient = useQueryClient();

  // Subscribing to realtime updates
  useEffect(() => {
    if (!jobId) return;

    console.log('[useJobStatus] Subscription initialized for job:', jobId);

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
    refetchInterval: false,
  });

  // Debug logging
  useEffect(() => {
    if (queryResult.data) {
      console.log('[useJobStatus] Current status:', queryResult.data.status, 'Progress:', queryResult.data.progress_percentage);
    }
  }, [queryResult.data?.status, queryResult.data?.progress_percentage]);



  return queryResult;
}
