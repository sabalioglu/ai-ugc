import { useParams, useNavigate } from 'react-router-dom';
import { Download, Copy, Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/layout/Layout';
import { ProgressCircle } from '@/components/ProgressCircle';
import { useJobStatus } from '@/hooks/useJobStatus';
import { toast } from 'sonner';

export function ProgressPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJobStatus(jobId);

  const handleDownload = async () => {
    if (job?.video_url) {
      const a = document.createElement('a');
      a.href = job.video_url;
      a.download = `${job.product_name}-ugc-video.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started!');
    }
  };

  const handleCopyUrl = () => {
    if (job?.video_url) {
      navigator.clipboard.writeText(job.video_url);
      toast.success('Video URL copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading job status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout showFooter={false}>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find the video generation job you're looking for.
              </p>
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isProcessing = job.status === 'pending' || job.status === 'processing';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {isProcessing && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Generating Your Video...</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              This usually takes 2-3 minutes
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Video is Ready!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your UGC video has been successfully generated
            </p>
          </div>
        )}

        {isFailed && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Generation Failed</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We encountered an error while generating your video
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {isProcessing && (
            <div className="lg:col-span-2 flex justify-center mb-8">
              <ProgressCircle percentage={job.progress_percentage} size={200} />
            </div>
          )}

          {isProcessing && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium">{job.current_step || 'Initializing...'}</p>
                <Progress value={job.progress_percentage} className="h-2" />
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{job.progress_percentage}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {isCompleted && job.video_url && (
            <Card className="lg:col-span-2">
              <CardContent className="p-0">
                <video
                  src={job.video_url}
                  controls
                  poster={job.thumbnail_url}
                  className="w-full rounded-t-lg"
                >
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Product Name</p>
                <p className="font-semibold">{job.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">UGC Style</p>
                <Badge variant="secondary">{job.ugc_type}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Target Audience</p>
                <Badge variant="secondary">{job.target_audience}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                <p className="font-semibold">{job.duration}s</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Platform</p>
                <Badge variant="secondary">{job.aspect_ratio}</Badge>
              </div>
            </CardContent>
          </Card>

          {job.character_model && (
            <Card>
              <CardHeader>
                <CardTitle>UGC Creator</CardTitle>
                <CardDescription>AI-generated character for your video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Character Type</p>
                  <p className="font-semibold">
                    {job.character_model.age}-year-old {job.character_model.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Style</p>
                  <p className="font-semibold">{job.character_model.style}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isFailed && job.error_message && (
            <Card className="lg:col-span-2 border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-500">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{job.error_message}</p>
                {job.credits_refunded > 0 && (
                  <Badge variant="success">
                    {job.credits_refunded} credits have been refunded to your account
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {isCompleted && job.video_url && (
            <>
              <Button size="lg" onClick={handleDownload}>
                <Download className="w-5 h-5 mr-2" />
                Download Video
              </Button>
              <Button size="lg" variant="outline" onClick={handleCopyUrl}>
                <Copy className="w-5 h-5 mr-2" />
                Copy URL
              </Button>
            </>
          )}
          <Button
            size="lg"
            variant={isCompleted ? 'outline' : 'default'}
            onClick={() => navigate('/generate')}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Another
          </Button>
          {(isCompleted || isFailed) && (
            <Button size="lg" variant="ghost" onClick={() => navigate('/videos')}>
              View All Videos
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
