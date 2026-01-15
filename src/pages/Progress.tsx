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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Progress Area */}
          <div className="lg:col-cols-2 space-y-8">
            {isProcessing && (
              <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-purple-100 dark:border-purple-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center py-4">
                    <ProgressCircle percentage={job.progress_percentage} size={160} />
                  </div>
                  <div>
                    <p className="text-xl font-semibold mb-2 text-center text-purple-600 dark:text-purple-400">
                      {job.current_step || 'Initializing workflow...'}
                    </p>
                    <Progress value={job.progress_percentage} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{job.status.toUpperCase()}</span>
                      <span>{job.progress_percentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isCompleted && job.video_url && (
              <Card className="overflow-hidden border-2 border-purple-500 shadow-2xl shadow-purple-500/20">
                <CardContent className="p-0 bg-black aspect-[9/16] max-h-[600px] flex items-center justify-center">
                  <video
                    src={job.video_url}
                    controls
                    autoPlay
                    loop
                    className="h-full w-auto"
                  >
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>
            )}

            {/* Live Preview Section */}
            {(job.character_model?.image_url || job.product_analysis) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.character_model?.image_url && (
                  <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium">UGC Creator Model</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 aspect-[1/1] bg-gray-100 dark:bg-gray-800">
                      <img
                        src={job.character_model.image_url}
                        alt="AI Generated Character"
                        className="w-full h-full object-cover"
                      />
                    </CardContent>
                  </Card>
                )}
                {job.product_analysis && (
                  <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium">AI Analysis Result</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-purple-600">Audience:</p>
                        <p className="line-clamp-2 text-gray-600 dark:text-gray-400">{job.product_analysis.target_audience_summary}</p>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-purple-600">Setting:</p>
                        <p className="line-clamp-2 text-gray-600 dark:text-gray-400">{job.product_analysis.visual_vibe}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Job ID</span>
                  <span className="text-sm font-mono truncate max-w-[120px]">{job.job_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Product</span>
                  <span className="text-sm font-medium">{job.product_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Platform</span>
                  <Badge variant="outline">{job.platform.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Style</span>
                  <Badge variant="secondary">{job.ugc_type}</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium">{job.duration}s</span>
                </div>
              </CardContent>
            </Card>

            {job.character_model && (
              <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200/50 dark:border-purple-800/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1 uppercase tracking-wider">Creator Concept</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {job.character_model.age}-year-old {job.character_model.gender}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 italic">"{job.character_model.style}"</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {isFailed && job.error_message && (
              <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Error Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-800 dark:text-red-300 font-medium">{job.error_message}</p>
                  {job.credits_refunded > 0 && (
                    <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-semibold text-center uppercase tracking-wider border border-green-200 dark:border-green-800">
                      {job.credits_refunded} credits refunded
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
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
