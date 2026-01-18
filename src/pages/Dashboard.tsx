import { useNavigate } from 'react-router-dom';
import { CreditCard, Video, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to create amazing UGC videos?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-2 border-purple-200 dark:border-purple-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Credits Balance</CardTitle>
                  <CardDescription>50 credits = 1 video (12s-16s)</CardDescription>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    {profile?.credits_balance || 0}
                  </span>
                  <span className="text-2xl text-gray-600 dark:text-gray-400">credits</span>
                </div>
                <Progress value={Math.max(0, 100 - (creditsUsagePercentage || 0))} className="h-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile?.credits_used || 0} credits used this month
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => navigate('/buy-credits')} size="lg" className="flex-1 sm:flex-none">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Buy More Credits
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{profile?.total_videos_generated || 0}</span>
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${tier.color} text-white`}>{tier.label}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-500 text-white border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Generate New Video</h3>
                <p className="opacity-90">
                  Upload your product and create professional UGC content
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/generate')}
                className="whitespace-nowrap hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Videos</h2>
          {recentVideos && recentVideos.length > 0 && (
            <Button variant="ghost" onClick={() => navigate('/videos')}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {videosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-64" />
              </div>
            ))}
          </div>
        ) : recentVideos && recentVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.slice(0, 6).map((job) => (
              <VideoCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Create your first UGC video to get started
              </p>
              <Button onClick={() => navigate('/generate')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Your First Video
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
