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

      // Transform video_url_1, video_url_2, etc. into scene_videos array for each job
      const transformedData = (data || []).map((job: any) => {
        const sceneVideos = [];
        for (let i = 1; i <= 8; i++) {
          const videoUrl = job[`video_url_${i}`];
          if (videoUrl) {
            sceneVideos.push({
              scene_number: i,
              video_url: videoUrl,
            });
          }
        }

        return {
          ...job,
          scene_videos: sceneVideos.length > 0 ? sceneVideos : undefined,
        };
      });

      return (transformedData as VideoJob[]) || [];
    },
    enabled: !!userId,
  });
}
