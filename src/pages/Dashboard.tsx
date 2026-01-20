import { useNavigate } from 'react-router-dom';
import { CreditCard, Video, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/layout/Layout';
import { VideoCard } from '@/components/VideoCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useVideoJobs } from '@/hooks/useVideoJobs';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const { data: recentVideos, isLoading: videosLoading } = useVideoJobs(user?.id);

  if (profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  const creditsUsagePercentage = profile
    ? (profile.credits_used / (profile.credits_used + profile.credits_balance)) * 100
    : 0;

  const tierConfig = {
    free: { label: 'Free', color: 'bg-gray-500' },
    pro: { label: 'Pro', color: 'bg-purple-600' },
    enterprise: { label: 'Enterprise', color: 'bg-blue-600' },
  };

  const tier = tierConfig[profile?.subscription_tier as keyof typeof tierConfig || 'free'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-16 animate-studio-fade">
          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter leading-none text-studio-text-main">
            STUDIO <span className="text-studio-purple">CENTRAL</span>
          </h1>
          <p className="text-studio-text-muted text-2xl font-light tracking-tight max-w-2xl">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Agent'}. Your creative suite is initialized and ready.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <Card className="lg:col-span-2 studio-glass-card border-studio-border bg-white shadow-xl shadow-black/5">
            <CardHeader className="pb-4 pt-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tighter uppercase text-studio-text-main">Available Resources</CardTitle>
                  <CardDescription className="text-studio-text-muted font-medium">Render units for high-fidelity production</CardDescription>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-studio-neon-lime/10 border border-studio-neon-lime/20 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-studio-text-main" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-8xl font-black text-studio-text-main tracking-tighter">
                    {profile?.credits_balance || 0}
                  </span>
                  <span className="text-xl text-studio-purple font-black tracking-widest uppercase">Units</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black tracking-widest text-studio-text-muted uppercase">
                    <span>Performance Efficiency</span>
                    <span className="text-studio-purple">{Math.round(100 - creditsUsagePercentage)}% Reserved</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (creditsUsagePercentage || 0))} className="h-3 bg-studio-surface" />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <Button onClick={() => navigate('/buy-credits')} size="lg" className="studio-neon-button h-16 px-12 text-lg shadow-lg">
                    ACQUIRE RESOURCES
                  </Button>
                  <div className="flex items-center px-6 py-2 rounded-xl bg-studio-surface border border-studio-border text-sm font-bold text-studio-text-muted">
                    {profile?.credits_used || 0} units deployed historically
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <div className="studio-glass-card p-10 flex flex-col justify-between group cursor-pointer border-studio-border bg-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-black tracking-widest text-studio-text-muted uppercase">Asset Output</span>
                <Video className="w-6 h-6 text-studio-text-muted group-hover:text-studio-purple transition-colors" />
              </div>
              <div>
                <span className="text-6xl font-black text-studio-text-main tracking-tighter block mb-2">
                  {profile?.total_videos_generated || 0}
                </span>
                <p className="text-studio-text-muted text-base font-bold uppercase tracking-wider">Production Volume</p>
              </div>
            </div>

            <div className="studio-glass-card p-10 flex flex-col justify-between group cursor-pointer border-studio-border bg-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-black tracking-widest text-studio-text-muted uppercase">Service Level</span>
                <Zap className="w-6 h-6 text-studio-text-muted group-hover:text-studio-purple transition-colors" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-5xl font-black text-studio-purple tracking-tighter block mb-2 uppercase">
                    {tier.label}
                  </span>
                  <p className="text-studio-text-muted text-base font-bold uppercase tracking-wider">Studio Tier</p>
                </div>
                <ArrowRight className="w-8 h-8 text-black/10 group-hover:text-studio-purple group-hover:translate-x-2 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Production Trigger */}
        <div className="mb-20 relative group cursor-pointer" onClick={() => navigate('/generate')}>
          <div className="absolute -inset-1 bg-gradient-to-r from-studio-neon-lime to-studio-purple opacity-10 group-hover:opacity-20 rounded-3xl blur-xl transition duration-700" />
          <div className="relative bg-white border border-studio-border rounded-3xl p-10 md:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-studio-neon-lime/5 rounded-full blur-3xl -mr-64 -mt-64 transition-transform group-hover:scale-125 duration-1000" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-studio-purple/5 border border-studio-purple/10 text-studio-purple text-xs font-black tracking-widest uppercase mb-6">
                  Ready for synthesis
                </div>
                <h3 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter leading-[0.9] text-studio-text-main">
                  START A NEW <br /><span className="text-studio-purple">PRODUCTION</span>
                </h3>
                <p className="text-2xl text-studio-text-muted font-light max-w-xl tracking-tight leading-relaxed">
                  Harness advanced neural models to generate cinematic visual narratives from product parameters.
                </p>
              </div>

              <Button
                size="lg"
                className="studio-neon-button h-24 px-16 text-2xl shadow-xl hover:shadow-studio-neon-lime/30 transform transition-all hover:scale-105 active:scale-95"
              >
                LAUNCH STUDIO
                <ArrowRight className="w-10 h-10 ml-6 stroke-[3px]" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex items-end justify-between border-b border-studio-border pb-8">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-studio-text-main uppercase">Production Archive</h2>
              <p className="text-studio-text-muted text-lg font-medium">Historical assets successfully rendered by the engine.</p>
            </div>
            {recentVideos && recentVideos.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => navigate('/videos')}
                className="text-studio-purple hover:text-studio-purple hover:bg-studio-purple/5 font-black tracking-widest text-sm h-12 px-8 uppercase"
              >
                Explore Archive
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-studio-surface aspect-[16/9] animate-pulse rounded-2xl shadow-sm" />
              ))}
            </div>
          ) : recentVideos && recentVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {recentVideos.slice(0, 6).map((job) => (
                <VideoCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-studio-surface/50 border border-dashed border-studio-text-muted/20 py-24 rounded-3xl flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mb-8 border border-studio-border">
                <Video className="w-12 h-12 text-studio-text-muted" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter text-studio-text-main mb-3 uppercase">Empty Repository</h3>
              <p className="text-studio-text-muted mb-12 max-w-md tracking-tight text-xl leading-relaxed">
                No production cycles detected. Initiate your first synthesis to begin populating the archive.
              </p>
              <Button onClick={() => navigate('/generate')} className="studio-neon-button h-16 px-12 text-lg shadow-xl">
                <Sparkles className="w-6 h-6 mr-3" />
                COMMENCE SYNTHESIS
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
