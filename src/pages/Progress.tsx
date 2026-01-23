import { useParams, useNavigate } from 'react-router-dom';
import { Download, Copy, Sparkles, AlertCircle, CheckCircle, XCircle, Clock, Video, Image as ImageIcon, FileText, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/layout/Layout';
import { ProgressCircle } from '@/components/ProgressCircle';
import { useJobStatus } from '@/hooks/useJobStatus';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'analyze', label: 'Product Analysis', icon: Sparkles },
  { id: 'character', label: 'Creator Profile', icon: ImageIcon },
  { id: 'script', label: 'Scene Scripting', icon: FileText },
  { id: 'video', label: 'AI Video Generation', icon: Video },
  { id: 'finalize', label: 'Final Edit & Assembly', icon: Wand2 },
];

function LiveTimeline({ currentStep, progress }: { currentStep?: string; progress: number }) {
  const getStepStatus = (stepId: string) => {
    // Logic to determine which step we are on based on the current_step string from n8n
    if (stepId === 'analyze') {
      if (progress > 5) return 'completed';
      return 'active';
    }
    if (stepId === 'character') {
      if (progress > 25) return 'completed';
      if (progress > 5) return 'active';
      return 'pending';
    }
    if (stepId === 'script') {
      if (progress > 45) return 'completed';
      if (progress > 25) return 'active';
      return 'pending';
    }
    if (stepId === 'video') {
      if (progress > 85) return 'completed';
      if (progress > 45) return 'active';
      return 'pending';
    }
    if (stepId === 'finalize') {
      if (progress >= 100) return 'completed';
      if (progress > 85) return 'active';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="space-y-4">
      {STEPS.map((step, index) => {
        const status = getStepStatus(step.id);
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative flex items-center gap-4">
            {index !== STEPS.length - 1 && (
              <div
                className={cn(
                  "absolute left-[18px] top-[40px] w-[2px] h-[30px] transition-colors duration-500",
                  status === 'completed' ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                status === 'completed' ? "bg-green-500 border-green-500 text-white" :
                  status === 'active' ? "border-purple-500 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse" :
                    "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
              )}
            >
              {status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "text-sm font-semibold transition-colors duration-500",
                status === 'completed' ? "text-green-600 dark:text-green-400" :
                  status === 'active' ? "text-purple-600 dark:text-purple-400" :
                    "text-gray-500"
              )}>
                {step.label}
              </span>
              {status === 'active' && (
                <span className="text-[10px] text-purple-400 animate-pulse font-medium uppercase tracking-wider">
                  Processing...
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJobStatus(jobId);

  const handleDownload = async () => {
    if (job?.video_url) {
      window.open(job.video_url, '_blank');
      toast.success('Download link opened!');
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
          <div className="text-center relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative z-10">
              <div className="animate-spin w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-6 shadow-[0_0_30px_rgba(147,51,234,0.3)]" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium animate-pulse">Syncing with AI Engines...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout showFooter={false}>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto border-dashed border-2">
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                The requested session could not be located. It may have expired or was incorrectly referenced.
              </p>
              <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
                Return to Command Center
              </Button>
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
      <div className="container mx-auto px-4 py-12 max-w-6xl relative">
        {/* Background glow effects */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-3 py-1">
                  SESSION: {job.job_id.slice(-6).toUpperCase()}
                </Badge>
                {isProcessing && (
                  <Badge className="bg-green-500 text-white border-none animate-pulse px-3 py-1 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE UPDATES
                  </Badge>
                )}
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {isProcessing ? 'Workflow in Progress' :
                  isCompleted ? 'Cinematic Ready' : 'Operation Halted'}
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
                {isProcessing ? "Our AI agents are currently processing your request through multiple production pipelines." :
                  isCompleted ? "Your high-conversion UGC video is ready for distribution." :
                    "We've encountered a system interruption. See technical details below."}
              </p>
            </div>

            {isCompleted && job.video_url && (
              <div className="flex gap-4">
                <Button size="lg" onClick={handleDownload} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30">
                  <Download className="w-5 h-5 mr-2" />
                  Download Master
                </Button>
                <Button size="lg" variant="outline" onClick={handleCopyUrl} className="bg-white/50 backdrop-blur-sm">
                  <Copy className="w-5 h-5 mr-2" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Progress & Visuals */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Panel */}
              {isProcessing && (
                <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-purple-100/50 dark:border-purple-900/50 shadow-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      Live Status Monitor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-center gap-8 py-8">
                    <div className="flex-shrink-0">
                      <ProgressCircle percentage={job.progress_percentage} size={180} />
                    </div>
                    <div className="flex-grow space-y-6 w-full text-center md:text-left">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {job.current_step || 'Initializing environment...'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {Math.round(job.progress_percentage)}% of high-fidelity processing complete.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Progress value={job.progress_percentage} className="h-3 bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-1000" />
                        </Progress>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                          <span>Start</span>
                          <span>Optimization Phase</span>
                          <span>Complete</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Main Result: Video or Error */}
              {isCompleted && job.video_url && (
                <>
                  <Card className="overflow-hidden bg-black border-none shadow-[0_30px_80px_-20px_rgba(168,85,247,0.4)] rounded-3xl group">
                    <div className="aspect-[9/16] relative flex items-center justify-center max-h-[700px]">
                      <video
                        src={job.video_url}
                        controls
                        autoPlay
                        loop
                        className="h-full w-auto transition-transform duration-700"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </Card>

                  {/* Video Segments Grid */}
                  {job.scene_videos && job.scene_videos.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Video Segments ({job.scene_videos.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {job.scene_videos.map((segment) => (
                          <Card key={segment.scene_number} className="overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-purple-100/50 dark:border-purple-900/50">
                            <CardHeader className="p-3 border-b border-gray-100/50 dark:border-gray-800/50">
                              <CardTitle className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                                Segment {segment.scene_number}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 aspect-[9/16] relative group">
                              <video
                                src={segment.video_url}
                                controls
                                className="w-full h-full object-cover"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isFailed && (
                <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 overflow-hidden">
                  <div className="p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-600">
                      <XCircle className="w-12 h-12" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Generation Terminated</h2>
                      <p className="text-red-700 dark:text-red-400 mb-6 font-medium">
                        {job.error_message || "An unexpected system error occurred within the AI delivery pipeline."}
                      </p>
                      <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/50 text-left">
                        <div className="flex items-center gap-2 mb-2 text-red-600 font-bold uppercase tracking-wider text-[10px]">
                          <AlertCircle className="w-3 h-3" />
                          System Logs
                        </div>
                        <code className="text-xs break-all opacity-80">
                          ERRORCODE_502: PIPELINE_SYNC_FAILURE_{job.job_id.slice(0, 8)}
                        </code>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Emerging Assets Grid */}
              {(job.character_model?.image_url || job.product_analysis) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.character_model?.image_url && (
                    <Card className="overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-purple-100/50 dark:border-purple-900/50 animate-in zoom-in-95 duration-700">
                      <CardHeader className="p-3 border-b border-gray-100/50 dark:border-gray-800/50">
                        <CardTitle className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Creator Persona</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 aspect-square relative group">
                        <img
                          src={job.character_model.image_url}
                          alt="AI Creator"
                          className="w-full h-full object-cover"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {job.start_frame_url && (
                    <Card className="overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-blue-100/50 dark:border-blue-900/50 animate-in zoom-in-95 duration-700 delay-100">
                      <CardHeader className="p-3 border-b border-gray-100/50 dark:border-gray-800/50">
                        <CardTitle className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Opening Scene</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 aspect-video relative group">
                        <img
                          src={job.start_frame_url}
                          alt="Start Frame"
                          className="w-full h-full object-cover"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {job.end_frame_url && (
                    <Card className="overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-blue-100/50 dark:border-blue-900/50 animate-in zoom-in-95 duration-700 delay-200">
                      <CardHeader className="p-3 border-b border-gray-100/50 dark:border-gray-800/50">
                        <CardTitle className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Closing Scene</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 aspect-video relative group">
                        <img
                          src={job.end_frame_url}
                          alt="End Frame"
                          className="w-full h-full object-cover"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {job.product_analysis && (
                    <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-purple-100/50 dark:border-purple-900/50 animate-in translate-y-4 duration-700 md:col-span-2">
                      <CardHeader className="p-3 border-b border-gray-100/50 dark:border-gray-800/50">
                        <CardTitle className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">AI Strategic insights</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-2 bg-purple-100/30 dark:bg-purple-900/20 rounded-lg border border-purple-200/30 dark:border-purple-800/20">
                            <p className="text-[9px] font-bold text-purple-600 uppercase mb-1">Target Persona</p>
                            <p className="text-xs font-medium leading-relaxed">{job.product_analysis.target_audience_summary || "Defining ideal buyer profile..."}</p>
                          </div>
                          <div className="p-2 bg-blue-100/30 dark:bg-blue-900/20 rounded-lg border border-blue-200/30 dark:border-blue-800/20">
                            <p className="text-[9px] font-bold text-blue-600 uppercase mb-1">Visual Direction</p>
                            <p className="text-xs font-medium leading-relaxed">{job.product_analysis.visual_vibe || "Setting atmospheric parameters..."}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Live Timeline & Details */}
            <div className="space-y-8">
              {/* Timeline Monitor */}
              <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-gray-500 font-bold">Live Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveTimeline currentStep={job.current_step} progress={job.progress_percentage} />
                </CardContent>
              </Card>

              {/* Data Snapshot */}
              <Card className="bg-gray-50/50 dark:bg-black/20 border-none">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-xs text-gray-500 font-medium">PROJECT NAME</span>
                    <span className="text-sm font-bold truncate max-w-[150px]">{job.product_name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-xs text-gray-500 font-medium">FORMAT</span>
                    <Badge variant="outline" className="text-[10px]">{job.platform.toUpperCase()} ({job.aspect_ratio})</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">EST. LENGTH</span>
                    <span className="text-sm font-bold">{job.duration} SECONDS</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Footer */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/generate')}
                  variant={isCompleted ? "outline" : "default"}
                  size="lg"
                  className="w-full h-14 font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate New Ad
                </Button>
                {(isCompleted || isFailed) && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/videos')}
                    className="w-full text-gray-500 hover:text-purple-600 h-12"
                  >
                    View Project History
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

