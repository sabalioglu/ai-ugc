import { Play, Download, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatRelativeTime } from '@/lib/utils';
import type { VideoJob } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  job: VideoJob;
  onDelete?: (id: string) => void;
}

export function VideoCard({ job, onDelete }: VideoCardProps) {
  const navigate = useNavigate();

  const statusConfig = {
    completed: { variant: 'success' as const, label: 'Completed' },
    processing: { variant: 'warning' as const, label: 'Processing' },
    pending: { variant: 'secondary' as const, label: 'Pending' },
    failed: { variant: 'destructive' as const, label: 'Failed' },
  };

  const status = statusConfig[job.status];

  const handleDownload = async () => {
    if (job.video_url) {
      const a = document.createElement('a');
      a.href = job.video_url;
      a.download = `${job.product_name}-ugc-video.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div
        className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 cursor-pointer"
        onClick={() => navigate(`/progress/${job.job_id}`)}
      >
        {job.thumbnail_url ? (
          <img
            src={job.thumbnail_url}
            alt={job.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-16 h-16 text-purple-600 opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Play className="w-12 h-12 text-white" />
        </div>
        <Badge
          variant={status.variant}
          className="absolute top-2 right-2"
        >
          {status.label}
        </Badge>
        {job.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {job.duration}s
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{job.product_name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {job.ugc_type} • {job.target_audience}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {formatRelativeTime(job.created_at)}
        </p>
        {job.character_model && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Character: {job.character_model.age}yo {job.character_model.gender}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => navigate(`/progress/${job.job_id}`)}
        >
          View
        </Button>
        {job.status === 'completed' && job.video_url && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(job.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
