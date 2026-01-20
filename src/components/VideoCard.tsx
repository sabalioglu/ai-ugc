import { Play, Download, Trash2, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
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
    completed: { variant: 'success' as const, label: 'COMPLETED', color: 'text-green-600 border-green-200 bg-green-50' },
    processing: { variant: 'warning' as const, label: 'SYNTHESIZING', color: 'text-studio-purple border-studio-purple/20 bg-studio-purple/5' },
    pending: { variant: 'secondary' as const, label: 'QUEUED', color: 'text-studio-text-muted border-studio-border bg-studio-surface' },
    failed: { variant: 'destructive' as const, label: 'FAILED', color: 'text-red-600 border-red-200 bg-red-50' },
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

  const getAspectRatioClass = () => {
    if (job.aspect_ratio === '9:16') return 'aspect-[9/16]';
    if (job.aspect_ratio === '1:1') return 'aspect-square';
    return 'aspect-video';
  };

  return (
    <Card className="studio-glass-card border-studio-border bg-white overflow-hidden group hover:border-studio-purple/30 transition-all duration-500 shadow-sm hover:shadow-xl">
      <div
        className={`relative ${getAspectRatioClass()} bg-studio-surface cursor-pointer overflow-hidden`}
        onClick={() => navigate(`/progress/${job.job_id}`)}
      >
        {job.video_url ? (
          <video
            src={job.video_url}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
            onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
            muted
            loop
          />
        ) : job.thumbnail_url ? (
          <>
            <img
              src={job.thumbnail_url}
              alt={job.product_name}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-studio-neon-lime flex items-center justify-center shadow-xl">
                <Play className="w-8 h-8 text-black fill-current ml-1" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-studio-surface">
            <Clock className="w-12 h-12 text-studio-text-muted mb-4 animate-pulse" />
            <span className="text-xs font-black tracking-widest text-studio-text-muted uppercase">Synthesizing...</span>
          </div>
        )}

        <Badge
          variant="outline"
          className={`absolute top-4 right-4 text-[10px] font-black tracking-widest px-3 py-1 rounded-sm border shadow-sm ${status.color}`}
        >
          {status.label}
        </Badge>

        {job.duration > 0 && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-studio-text-main text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-studio-border shadow-sm">
            <Clock className="w-3.5 h-3.5 text-studio-purple" />
            {job.duration}S
          </div>
        )}
      </div>

      <CardContent className="p-6 bg-white">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-xl text-studio-text-main mb-1 truncate tracking-tighter uppercase leading-tight">
              {job.product_name}
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className="text-[10px] font-black text-studio-text-muted tracking-widest uppercase bg-studio-surface px-2 py-0.5 rounded">
                {job.ugc_type}
              </span>
              <span className="text-[10px] font-black text-studio-purple tracking-widest uppercase bg-studio-purple/5 px-2 py-0.5 rounded">
                @{job.target_audience}
              </span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-studio-text-muted tracking-widest uppercase whitespace-nowrap bg-studio-surface px-2 py-1 rounded">
            {formatRelativeTime(job.created_at)}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            size="sm"
            className="flex-1 bg-studio-surface hover:bg-studio-surface-alt text-studio-text-main border-studio-border text-[10px] font-black tracking-widest uppercase h-11 rounded-xl shadow-sm transition-all active:scale-95"
            onClick={() => navigate(`/progress/${job.job_id}`)}
          >
            Inspect Asset
          </Button>
          {job.status === 'completed' && job.video_url && (
            <Button
              size="sm"
              variant="outline"
              className="border-studio-border text-studio-text-main hover:bg-studio-neon-lime hover:border-studio-neon-lime transition-all h-11 w-11 p-0 rounded-xl shadow-sm active:scale-90"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(job.id)}
              className="text-studio-text-muted hover:text-red-600 hover:bg-red-50 h-11 w-11 p-0 transition-colors rounded-xl active:scale-90"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
