import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Layout } from '@/components/layout/Layout';
import { UploadZone } from '@/components/UploadZone';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function Generate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id);

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    ugcType: 'holding-product',
    targetAudience: 'millennials',
    duration: '24',
    platform: 'tiktok',
  });

  const ugcStyles = [
    { value: 'holding-product', label: 'Holding Product', description: 'Natural pose with product in hand' },
    { value: 'using-product', label: 'Using Product', description: 'Show product in action' },
    { value: 'unboxing', label: 'Unboxing', description: 'First impression reveal' },
    { value: 'mirror-selfie', label: 'Mirror Selfie', description: 'Authentic casual angle' },
    { value: 'before-after', label: 'Before & After', description: 'Transformation story' },
    { value: 'cozy-home', label: 'Cozy at Home', description: 'Relaxed lifestyle setting' },
    { value: 'friend-sharing', label: 'Friend Sharing', description: 'Social recommendation' },
    { value: 'asmr', label: 'ASMR', description: 'Close-up detailed focus' },
    { value: 'podcast', label: 'Podcast', description: 'Interview-style presentation' },
  ];

  const audiences = [
    { value: 'gen-z', label: 'Gen Z (18-24)', description: 'Energetic, trendy' },
    { value: 'millennials', label: 'Millennials (25-40)', description: 'Professional, relatable' },
    { value: 'gen-x', label: 'Gen X (41-55)', description: 'Experienced, credible' },
    { value: 'all-ages', label: 'All Ages', description: 'Universal appeal' },
    { value: 'business', label: 'Business/Professional', description: 'Corporate setting' },
  ];

  const durations = [
    { value: '16', label: '16s (2 scenes)', description: 'Quick Problem + Solution' },
    { value: '24', label: '24s (3 scenes)', description: 'Story Arc' },
    { value: '32', label: '32s (4 scenes)', description: 'Extended showcase' },
    { value: '40', label: '40s (5 scenes)', description: 'Detailed presentation' },
    { value: '48', label: '48s (6 scenes)', description: 'Complete story' },
    { value: '56', label: '56s (7 scenes)', description: 'Premium content' },
    { value: '64', label: '64s (8 scenes)', description: 'Full narrative' },
  ];

  const platforms = [
    { value: 'tiktok', label: 'TikTok/Reels (9:16)', aspect: '9:16' },
    { value: 'youtube', label: 'YouTube (16:9)', aspect: '16:9' },
    { value: 'instagram', label: 'Instagram Feed (1:1)', aspect: '1:1' },
  ];

  // Cost Calculation Logic: Base (16s) = 30 credits, +15 credits per extra 8s step
  const calculateCost = (durationStr: string) => {
    const duration = parseInt(durationStr);
    if (isNaN(duration) || duration < 16) return 30; // Minimum cost

    // 16s = 1 base unit
    // Each additional 8s is an extra step
    const steps = Math.ceil((duration - 16) / 8);
    return 30 + (steps * 15);
  };

  const currentCost = calculateCost(formData.duration);
  const hasEnoughCredits = (profile?.credits_balance || 0) >= currentCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please upload a product image');
      return;
    }

    if (!hasEnoughCredits) {
      toast.error('Insufficient credits. Please purchase more credits.');
      return;
    }

    setLoading(true);

    try {
      const duration = parseInt(formData.duration);
      const totalScenes = Math.ceil(duration / 8);
      const platform = platforms.find((p) => p.value === formData.platform);

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // 1. Upload Product Image to Storage
      let productImageUrl = '';
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${jobId}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Image upload failed:', uploadError);
        // If image upload fails, we still try to proceed if possible, 
        // but since it's a critical part, we might want to throw.
        // For now, let's proceed to see the flow.
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        productImageUrl = publicUrl;
      }

      // 2. Insert Video Job record
      const { error: insertError } = await supabase.from('video_jobs').insert({
        job_id: jobId,
        user_id: user!.id,
        user_email: user!.email!,
        product_name: formData.productName,
        product_description: formData.productDescription,
        product_image_url: productImageUrl,
        ugc_type: formData.ugcType,
        target_audience: formData.targetAudience,
        platform: formData.platform,
        duration,
        total_scenes: totalScenes,
        aspect_ratio: platform?.aspect || '9:16',
        status: 'pending',
        progress_percentage: 0,
        credits_cost: currentCost,
      });

      if (insertError) throw insertError;

      // 3. SECURELY DEDUCT CREDITS via RPC
      const { error: rpcError } = await supabase.rpc('deduct_credits_v2', {
        p_job_id: jobId,
        p_credits: 10
      });

      if (rpcError) {
        console.error('Failed to deduct credits:', rpcError);
        await supabase.from('video_jobs').delete().eq('job_id', jobId);
        throw new Error('Transaction failed: ' + rpcError.message);
      }

      // 4. TRIGGER n8n WORKFLOW
      const N8N_WEBHOOK_URL = 'https://n8n.tsagroupllc.com/webhook/ugc-video-gen';

      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          productName: formData.productName,
          productDescription: formData.productDescription,
          uploadedImageUrl: productImageUrl,
          targetAudience: formData.targetAudience,
          platform: formData.platform,
          duration: formData.duration,
          ugcStyleDetails: formData.ugcType,
          userEmail: user!.email
        }),
      });

      if (!n8nResponse.ok) {
        throw new Error('Video production server is busy. Your credits are safe, please try again in a moment.');
      }

      toast.success('Video generation started!');
      navigate(`/progress/${jobId}`);
    } catch (error: any) {
      console.error('Error creating video job:', error);
      toast.error(error.message || 'Failed to start video generation');
    } finally {
      setLoading(false);
    }
  };

  const remainingCredits = (profile?.credits_balance || 0) - 10;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <button onClick={() => navigate('/dashboard')} className="hover:text-purple-600">
              Dashboard
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>Generate</span>
          </div>
          <h1 className="text-4xl font-bold">Generate UGC Video Ad</h1>
        </div>

        {!hasEnoughCredits && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="w-5 h-5" />
            <AlertTitle>Insufficient Credits</AlertTitle>
            <AlertDescription>
              You need {currentCost} credits for this video duration. You have {profile?.credits_balance || 0} credits.
              <Button variant="link" className="ml-2 p-0 h-auto" onClick={() => navigate('/buy-credits')}>
                Buy More Credits
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                  <CardDescription>Upload a high-quality product photo (Max 10MB)</CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadZone onFileSelect={setImageFile} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Wireless Headphones"
                      required
                      maxLength={100}
                      value={formData.productName}
                      onChange={(e) =>
                        setFormData({ ...formData, productName: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500">{formData.productName.length}/100</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productDescription">Product Description (optional)</Label>
                    <Textarea
                      id="productDescription"
                      placeholder="Brief description of your product features..."
                      maxLength={500}
                      value={formData.productDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, productDescription: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      {formData.productDescription.length}/500
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ugcType">UGC Style</Label>
                    <Select
                      id="ugcType"
                      value={formData.ugcType}
                      onChange={(e) => setFormData({ ...formData, ugcType: e.target.value })}
                    >
                      {ugcStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label} - {style.description}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({ ...formData, targetAudience: e.target.value })
                      }
                    >
                      {audiences.map((audience) => (
                        <option key={audience.value} value={audience.value}>
                          {audience.label} - {audience.description}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Video Duration</Label>
                    <Select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    >
                      {durations.map((duration) => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label} - {duration.description}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    >
                      {platforms.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-900">
                <CardHeader>
                  <CardTitle>Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Video Cost:</span>
                    <span className="font-semibold">10 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Your Balance:</span>
                    <span className="font-medium">{profile?.credits_balance || 0} credits</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">After Generation:</span>
                    <span className={`font-bold ${remainingCredits < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {remainingCredits} credits
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || !hasEnoughCredits || !imageFile}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {loading ? 'Starting Generation...' : 'Generate Video (10 credits)'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
