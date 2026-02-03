import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VideoJob } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Auto-refresh interval when realtime updates aren't being received (1 minute)
const AUTO_REFRESH_INTERVAL_MS = 60000;
// Timeout to detect if realtime is actually delivering updates (30 seconds)
const REALTIME_ACTIVITY_TIMEOUT_MS = 30000;

export function useJobStatus(jobId: string | undefined) {
  const queryClient = useQueryClient();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const lastRealtimeUpdateRef = useRef<number>(0);

  // Transform video_url fields into scene_videos array
  const transformJobData = useCallback((data: any): VideoJob => {
    const sceneVideos = [];
    for (let i = 1; i <= 8; i++) {
      const videoUrl = data[`video_url_${i}`];
      if (videoUrl) {
        sceneVideos.push({
          scene_number: i,
          video_url: videoUrl,
        });
      }
    }
    return {
      ...data,
      scene_videos: sceneVideos.length > 0 ? sceneVideos : undefined,
    } as VideoJob;
  }, []);

  // Subscribing to realtime updates
  useEffect(() => {
    if (!jobId) return;

    console.log('[useJobStatus] Initializing realtime subscription for job:', jobId);

    let channel: RealtimeChannel | null = null;

    const setupChannel = () => {
      channel = supabase
        .channel(`job-status:${jobId}`, {
          config: {
            presence: { key: jobId },
          },
        })
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'video_jobs',
            filter: `job_id=eq.${jobId}`, // Keep filter
          },
          (payload) => {
            console.log('[useJobStatus] Realtime update received:', {
              status: payload.new.status,
              progress: payload.new.progress_percentage,
              step: payload.new.current_step,
            });

            // Track that we received a realtime update
            lastRealtimeUpdateRef.current = Date.now();
            setIsRealtimeActive(true);

            // Merge with existing data to preserve all fields
            queryClient.setQueryData(['job-status', jobId], (old: VideoJob | null) => {
              if (!old) return transformJobData(payload.new);

              // Merge new data with old, preserving all fields
              const merged = transformJobData({ ...old, ...payload.new });

              // If status changed to completed, trigger a full refetch to ensure data integrity
              if (payload.new.status === 'completed' && old.status !== 'completed') {
                console.log('[useJobStatus] Job completed! Triggering full refetch...');
                queryClient.invalidateQueries({ queryKey: ['job-status', jobId] });
              }

              return merged;
            });
          }
        )
        .subscribe((status, err) => {
          console.log('[useJobStatus] Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsRealtimeConnected(true);
            console.log('[useJobStatus] Successfully subscribed to realtime updates');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsRealtimeConnected(false);
            console.error('[useJobStatus] Subscription error:', err);
          } else if (status === 'CLOSED') {
            setIsRealtimeConnected(false);
            console.log('[useJobStatus] Channel closed');
          }
        });
    };

    setupChannel();

    return () => {
      if (channel) {
        console.log('[useJobStatus] Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [jobId, queryClient, transformJobData]);

  // Auto-refresh fallback monitor
  useEffect(() => {
    if (!jobId) return;

    const checkRealtimeActivity = () => {
      const timeSinceLastUpdate = Date.now() - lastRealtimeUpdateRef.current;

      // If we haven't received any realtime updates in 30 seconds and job is still processing,
      // mark realtime as inactive so polling kicks in
      if (isRealtimeConnected && timeSinceLastUpdate > REALTIME_ACTIVITY_TIMEOUT_MS) {
        console.log('[useJobStatus] Realtime appears stale, marking as inactive');
        setIsRealtimeActive(false);
      }
    };

    // Check realtime activity every 10 seconds
    const activityCheckInterval = setInterval(checkRealtimeActivity, 10000);

    return () => {
      clearInterval(activityCheckInterval);
    };
  }, [jobId, isRealtimeConnected]);

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
      if (data) return transformJobData(data);
      return data as VideoJob | null;
    },
    enabled: !!jobId,
    // Polling strategy:
    // 1. If realtime is connected AND actively receiving updates, don't poll
    // 2. If realtime is connected but inactive (no updates in 30s), poll every minute as fallback
    // 3. If realtime is not connected at all, poll every 5 seconds
    refetchInterval: (query) => {
      const data = query.state.data;
      // Don't poll if job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }

      // If realtime is connected and actively delivering updates, no polling needed
      if (isRealtimeConnected && isRealtimeActive) {
        return false;
      }

      // If realtime is connected but not active (stale), poll every 1 minute as safety net
      if (isRealtimeConnected && !isRealtimeActive) {
        console.log('[useJobStatus] Realtime stale, using 1-minute auto-refresh fallback');
        return AUTO_REFRESH_INTERVAL_MS;
      }

      // If realtime is not connected, poll every 5 seconds as primary fallback
      return 5000;
    },
    refetchOnWindowFocus: true,
  });

  // Debug logging
  useEffect(() => {
    if (queryResult.data) {
      const realtimeStatus = isRealtimeConnected
        ? (isRealtimeActive ? 'active' : 'stale (auto-refresh)')
        : 'polling';
      console.log('[useJobStatus] Current status:', queryResult.data.status, 'Progress:', queryResult.data.progress_percentage, 'Realtime:', realtimeStatus);
    }
  }, [queryResult.data?.status, queryResult.data?.progress_percentage, isRealtimeConnected, isRealtimeActive]);

  return { ...queryResult, isRealtimeConnected, isRealtimeActive };
}
