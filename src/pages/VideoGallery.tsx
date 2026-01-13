import { useState } from 'react';
import { Video, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { VideoCard } from '@/components/VideoCard';
import { useAuth } from '@/hooks/useAuth';
import { useVideoJobs } from '@/hooks/useVideoJobs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type StatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'failed';

export function VideoGallery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');

  const { data: videos, isLoading } = useVideoJobs(
    user?.id,
    statusFilter === 'all' ? undefined : statusFilter
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const { error } = await supabase.from('video_jobs').delete().eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      toast.success('Video deleted successfully');
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error(error.message || 'Failed to delete video');
    }
  };

  const sortedVideos = videos
    ? [...videos].sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else {
          return b.duration - a.duration;
        }
      })
    : [];

  const statusCounts = {
    all: videos?.length || 0,
    completed: videos?.filter((v) => v.status === 'completed').length || 0,
    processing: videos?.filter((v) => v.status === 'processing' || v.status === 'pending').length || 0,
    failed: videos?.filter((v) => v.status === 'failed').length || 0,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Videos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and download your generated UGC videos
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All ({statusCounts.all})
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed ({statusCounts.completed})
            </Button>
            <Button
              variant={statusFilter === 'processing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('processing')}
            >
              Processing ({statusCounts.processing})
            </Button>
            <Button
              variant={statusFilter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('failed')}
            >
              Failed ({statusCounts.failed})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-48"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="duration">By duration</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-80" />
              </div>
            ))}
          </div>
        ) : sortedVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos.map((job) => (
              <VideoCard key={job.id} job={job} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Video className="w-20 h-20 text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                {statusFilter === 'all' ? 'No videos yet' : `No ${statusFilter} videos`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                {statusFilter === 'all'
                  ? 'Create your first UGC video to get started'
                  : `You don't have any ${statusFilter} videos at the moment`}
              </p>
              {statusFilter !== 'all' && (
                <Button variant="outline" onClick={() => setStatusFilter('all')}>
                  View All Videos
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
