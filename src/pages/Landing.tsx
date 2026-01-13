import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  Wand2,
  Video as VideoIcon,
  Check,
  Users,
  Palette,
  Zap,
  Globe,
  Bot,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Palette,
      title: '9 UGC Styles',
      description: 'From unboxing to testimonials, choose the perfect style for your product',
    },
    {
      icon: Users,
      title: '5 Target Audiences',
      description: 'AI selects the perfect creator persona for your demographic',
    },
    {
      icon: Zap,
      title: 'Fast Generation',
      description: 'Get your professional UGC video in just 2-3 minutes',
    },
    {
      icon: Globe,
      title: 'Multi-Platform Export',
      description: 'Optimized for TikTok, Instagram Reels, and YouTube',
    },
    {
      icon: Bot,
      title: 'AI-Powered Characters',
      description: 'Realistic virtual creators that look and feel authentic',
    },
    {
      icon: Target,
      title: 'Professional Quality',
      description: 'Production-ready videos with no editing required',
    },
  ];

  const pricingPlans = [
    {
      name: 'FREE',
      price: '$0',
      period: '/month',
      description: 'Perfect for testing',
      credits: '10 credits (1 video)',
      features: [
        '16-64s videos',
        'All UGC styles',
        'All platforms (9:16, 16:9, 1:1)',
        'Standard processing',
        'Community support',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'PRO',
      price: '$49',
      period: '/month',
      description: 'For growing brands',
      credits: '100 credits (10 videos)',
      features: [
        'Everything in Free',
        'Priority processing',
        'Webhook notifications',
        'Advanced analytics',
        'Email support',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'ENTERPRISE',
      price: '$299',
      period: '/month',
      description: 'For agencies & teams',
      credits: '1000 credits (100 videos)',
      features: [
        'Everything in Pro',
        'API access',
        'Unlimited duration',
        'Custom branding',
        'Dedicated support',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: 'Upload product image',
      description: 'Simply drag and drop your product photo',
    },
    {
      icon: Wand2,
      title: 'AI generates video',
      description: 'Our AI creates a video with a realistic creator',
    },
    {
      icon: VideoIcon,
      title: 'Download & share',
      description: 'Get your video ready for TikTok and Reels',
    },
  ];

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered UGC Video Generator
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Create Authentic{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                UGC Ads
              </span>{' '}
              in Minutes with AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your product. AI generates professional UGC-style video ads.
              Perfect for TikTok, Instagram Reels, and YouTube.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free - Get 1 Video
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                View Examples
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              No credit card required • 10 free credits
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to create professional UGC videos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-purple-600 to-blue-500 hidden md:block" style={{ display: index === 2 ? 'none' : 'block' }} />
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to create authentic UGC videos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-purple-500 hover:shadow-xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your needs. 10 credits = 1 video.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? 'border-2 border-purple-600 shadow-2xl scale-105'
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-2">
                    {plan.credits}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => navigate('/auth')}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Amazing UGC Videos?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of brands creating authentic video content with AI
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="text-lg px-8">
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
        </div>
      </section>
    </Layout>
  );
}
