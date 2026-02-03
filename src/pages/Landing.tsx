import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Palette,
  Zap,
  Target,
  Play,
  ArrowRight,
  Upload,
  FileText,
  MousePointer,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import portfolioData from '../portfolio.json';
import '../studio.css';

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGoliMuted, setIsGoliMuted] = useState(true);

  const features = [
    {
      icon: Palette,
      title: '9 Studio Styles',
      description: 'From hyper-realistic cinematic to high-impact TikTok hooks.',
    },
    {
      icon: Users,
      title: 'Global Actor Library',
      description: 'Access a diverse fleet of AI agents for any demographic.',
    },
    {
      icon: Zap,
      title: 'Instant Production',
      description: 'Your vision, rendered in professional quality within minutes.',
    },
    {
      icon: Target,
      title: 'Conversion Focused',
      description: 'Engineered for high CTR and maximum audience engagement.',
    },
  ];

  const stats = [
    { label: 'CTR BOOST', value: '+32.4%' },
    { label: 'COST REDUCTION', value: '78%' },
    { label: 'AVG PRODUCTION', value: '8 Min' },
  ];

  const recentCreations = [
    "Skincare Ad #412 Generated",
    "Finance Promo #109 Rendered",
    "Gaming Hook #883 Active",
    "E-comm UGC #552 Completed",
    "Travel Cinematic #301 Generated",
    "Food Reel #992 Active",
    "App Showcase #214 Completed"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 bg-white">
        {/* Background Ethereal Elements */}
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-studio-neon-lime/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-studio-purple/5 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />

        {/* Floating Side Assets (Arcads Style) - Balanced 2 Left, 2 Right */}
        {/* Left Side - Video 1: BeardAD */}
        <div className="absolute left-[4%] top-[15%] hidden xl:block w-44 studio-float studio-rotate-left z-20">
          <div className="studio-card-9-16 rounded-2xl border border-studio-border bg-studio-surface shadow-2xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-700 hover:scale-105 group">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/BeardAD_muted.webm" type="video/webm" />
            </video>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white font-black text-[10px] tracking-widest">+42% ROAS</div>
            </div>
          </div>
        </div>

        <div className="absolute left-[10%] bottom-[12%] hidden xl:block w-48 studio-float studio-rotate-right animation-delay-3000 z-10">
          <div className="studio-card-9-16 rounded-2xl border border-studio-border bg-studio-surface shadow-2xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-700 hover:scale-105 group">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/Candle.webm" type="video/webm" />
            </video>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white font-black text-[10px] tracking-widest">GLOBAL REACH</div>
            </div>
          </div>
        </div>

        {/* Right Side - Video 2: ProteinAd */}
        <div className="absolute right-[4%] top-[20%] hidden xl:block w-52 studio-float studio-rotate-right animation-delay-1000 z-20">
          <div className="studio-card-9-16 rounded-2xl border border-studio-border bg-studio-surface shadow-2xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-700 hover:scale-105 group">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/ProteinAd_muted.webm" type="video/webm" />
            </video>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white font-black text-[10px] tracking-widest">3.8x CONV</div>
            </div>
          </div>
        </div>

        {/* Right Side Bottom - Video 3: GoliAd */}
        <div className="absolute right-[10%] bottom-[15%] hidden xl:block w-44 studio-float studio-rotate-left animation-delay-2000 z-10">
          <div className="studio-card-9-16 rounded-2xl border border-studio-border bg-studio-surface shadow-2xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-700 hover:scale-105 group">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/GoliAd_muted.webm" type="video/webm" />
            </video>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white font-black text-[10px] tracking-widest">5.2% CTR</div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-30">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-9xl font-black mb-10 tracking-tighter leading-[0.85] text-studio-text-main">
              GENERATE ADS<br />
              <span className="studio-italic-serif text-studio-purple">that convert</span>
            </h1>

            <p className="text-xl md:text-2xl text-studio-text-muted mb-6 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
              Create high-performing video ads in minutes with AI. <br className="hidden md:block" />
              No actors, no equipment, no hassle.
            </p>

            <div className="mb-10 flex items-center justify-center gap-2">
              <div className="h-[1px] w-8 bg-studio-border" />
              <p className="text-sm md:text-base font-black text-studio-purple/80 tracking-widest uppercase animate-pulse">
                For less than the price of a cup of coffee
              </p>
              <div className="h-[1px] w-8 bg-studio-border" />
            </div>

            <div className="flex flex-col items-center gap-6 mb-20">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="studio-neon-button text-xl px-12 h-18 shadow-2xl group"
              >
                {user ? 'ENTER STUDIO' : 'START FOR FREE'}
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="text-[10px] font-black text-studio-text-muted tracking-[0.2em] uppercase opacity-60">
                No credit card required • Join 2,000+ creators
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto border-t border-studio-border pt-12 items-center relative">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-studio-neon-lime/10 rounded-full blur-[80px] pointer-events-none" />
              {stats.map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-4xl md:text-5xl font-black text-studio-text-main mb-1 tracking-tighter italic group-hover:text-studio-purple transition-colors">{stat.value}</div>
                  <div className="text-[10px] font-black text-studio-text-muted tracking-widest uppercase opacity-70">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-b border-studio-border relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-4 relative z-10">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-studio-text-main uppercase">
              How It <span className="studio-italic-serif">Works</span>
            </h2>
            <p className="text-studio-text-muted text-lg font-medium tracking-tight leading-relaxed mb-12">
              All you need to do is upload your product photo and AI handles the rest.
              AI will create characters according to your target audience, and here you go—your ad is ready.
            </p>
          </div>

          {/* Simple Steps - 2 rows of 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { step: '01', icon: Upload, title: 'Upload Product Image', desc: 'Drop your photo, AI will analyze and create best angle for UGC' },
              { step: '02', icon: FileText, title: 'Describe Your Product', desc: 'Tell us what makes it special' },
              { step: '03', icon: MousePointer, title: 'Choose Your Style', desc: 'Pick from 9 studio-quality styles' },
              { step: '04', icon: Users, title: 'Select Target Audience', desc: 'Who are you speaking to?' },
              { step: '05', icon: Clock, title: 'Pick Duration & Format', desc: 'From TikTok teaser to full story' },
              { step: '06', icon: CheckCircle, title: 'Generate & Download', desc: 'Your AI ad ready in minutes' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex gap-4 items-start p-5 bg-studio-surface/50 rounded-xl border border-studio-border/50 hover:border-studio-purple/20 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-studio-purple text-white rounded-lg flex items-center justify-center font-black text-sm">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-studio-text-main mb-1 uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-studio-text-muted font-medium">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Comparison Section */}
      <section className="py-20 bg-studio-surface border-y border-studio-border relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-studio-purple/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Title with Down Arrow */}
          <div className="text-center mb-12 relative">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-studio-text-main uppercase">
              See The <span className="studio-italic-serif">Result</span>
            </h2>
            <p className="text-studio-text-muted text-lg font-medium tracking-tight max-w-2xl mx-auto mb-8">
              Transform static product photos into engaging AI-powered video ads
            </p>
            {/* Down Arrow */}
            <div className="flex justify-center">
              <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
                <path d="M20 5 L20 50" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 4" />
                <path d="M10 40 L20 50 L30 40" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          </div>
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 mt-16 px-6">
            {/* Before: Static Photo - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-48 md:w-64 z-10"
            >
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-studio-border bg-white shadow-xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/product-images/a4c95f56-4af2-4c74-b681-c1bf51782291/job_1768411532862_2jia18.jpg"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Static Product"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                  <span className="text-white text-[9px] font-black tracking-widest uppercase">Before: Photo</span>
                </div>
              </div>

              {/* Premium Curvy Red Arrow (Mockup Style) */}
              <div className="absolute -right-16 md:-right-24 top-1/2 -translate-y-1/2 hidden md:block z-20 pointer-events-none">
                <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_4px_12px_rgba(255,100,100,0.4)]">
                  <path d="M10 30C30 10 70 10 90 35" stroke="#FF4D4D" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12" className="animate-[dash_2s_linear_infinite]" />
                  <path d="M82 38L90 35L85 27" stroke="#FF4D4D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>

            {/* After: AI Video - Right Side (Main) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[360px] md:max-w-[420px] z-0"
            >
              <div
                className="relative aspect-[9/16] rounded-[40px] overflow-hidden border-8 border-white bg-studio-text-main shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] cursor-pointer group"
                onClick={() => setIsGoliMuted(!isGoliMuted)}
              >
                <video
                  autoPlay
                  muted={isGoliMuted}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                >
                  <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/GoliAd.mp4" type="video/mp4" />
                </video>

                {/* After AI Generated Label - Top Center */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-studio-purple animate-pulse" />
                  <span className="text-studio-text-main text-[9px] font-black tracking-widest uppercase">
                    After: AI Generated AD
                  </span>
                </div>

                {/* Center Tap to Unmute Button */}
                {isGoliMuted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-2xl p-6 rounded-full shadow-2xl border border-white/40 transform group-hover:scale-110 transition-transform duration-500">
                      <Play className="w-8 h-8 text-studio-purple fill-current ml-1" />
                    </div>
                    <div className="mt-8 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white text-[10px] font-black tracking-[0.3em] uppercase">
                      Tap for Sound
                    </div>
                  </div>
                )}

                {/* Status indicator when unmuted */}
                {!isGoliMuted && (
                  <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 z-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1 h-4 bg-studio-neon-lime rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                    <span className="text-white text-[9px] font-black tracking-widest uppercase">HD Audio On</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Ads Section - With Sound */}
      <section id="portfolio" className="py-20 bg-gradient-to-b from-white to-studio-surface relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-studio-neon-lime/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-6 md:px-4 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-studio-text-main uppercase">
              Featured <span className="studio-italic-serif">Productions</span>
            </h2>
            <p className="text-studio-text-muted text-xl font-medium tracking-tight">
              Real AI-generated ads with sound. Click play to experience the full production quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                url: 'https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/BeardAD.mp4',
                title: 'Beard Care Premium',
                category: 'Beauty & Grooming',
                metric: '+42% ROAS'
              },
              {
                url: 'https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/ProteinAd.mp4',
                title: 'Protein Supplement',
                category: 'Health & Fitness',
                metric: '3.8x CONV'
              },
              {
                url: 'https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/A_vertical_UGC-style_video_showcasing_scented_cand-1769020475212.mp4',
                title: 'Scented Candles',
                category: 'Home & Lifestyle',
                metric: '4.1% CTR'
              },
              {
                url: 'https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/featured_campaign_1770130415611.mp4',
                title: 'Anker Earbuds',
                category: 'Tech Gadgets',
                metric: 'BEST SELLER'
              }
            ].map((ad, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group"
              >
                <div className="bg-white border border-studio-border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px]">
                  <div className="relative aspect-[9/16] bg-studio-surface overflow-hidden">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover bg-studio-surface"
                    >
                      <source src={ad.url} type="video/mp4" />
                    </video>

                    {/* Metric Badge */}
                    <div className="absolute top-4 right-4 bg-studio-neon-lime px-4 py-2 rounded-full shadow-lg z-10 pointer-events-none">
                      <span className="text-black text-[10px] font-black tracking-widest uppercase">
                        {ad.metric}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-black tracking-tighter text-studio-text-main mb-2 uppercase">
                      {ad.title}
                    </h3>
                    <p className="text-[10px] font-black tracking-widest text-studio-text-muted uppercase">
                      {ad.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Capabilities */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-studio-purple/5 rounded-full blur-[120px] -mt-40 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-studio-text-main uppercase">
              The <span className="studio-italic-serif">Synthesis</span> Engine
            </h2>
            <p className="text-studio-text-muted text-xl font-medium tracking-tight">
              Sophisticated neural modules designed to engineer high-impact visual assets for global brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-studio-surface border border-studio-border p-10 rounded-[40px] hover:bg-white hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 group cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-studio-border group-hover:border-studio-purple/30 group-hover:bg-studio-purple/5 transition-all shadow-sm">
                  <feature.icon className="w-7 h-7 text-studio-text-main group-hover:text-studio-purple transition-colors" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter text-studio-text-main uppercase">{feature.title}</h3>
                <p className="text-studio-text-muted leading-relaxed font-medium text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Production Marquee (Arcads Style Social Proof) */}
      <div className="bg-studio-text-main py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-studio-text-main via-transparent to-studio-text-main z-10 pointer-events-none" />
        <Marquee gradient={false} speed={40}>
          {recentCreations.map((item, i) => (
            <div key={i} className="flex items-center gap-4 mx-12">
              <div className="w-2 h-2 rounded-full bg-studio-neon-lime animate-pulse" />
              <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">{item}</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* CTA Section - Redesigned as Integrated Full-Width Section */}
      <section className="py-40 bg-gradient-to-b from-white to-studio-surface text-center relative overflow-hidden">
        {/* Background Ethereal elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-studio-purple/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-studio-neon-lime/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 md:px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-6xl md:text-[10rem] font-black mb-12 tracking-tighter leading-[0.8] text-studio-text-main">
              READY TO<br />
              <span className="studio-italic-serif text-studio-purple">scale?</span>
            </h2>

            <p className="text-lg md:text-3xl mb-16 text-studio-text-muted max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              Join the vanguard of digital creators. Generate your first high-performance AI production in minutes.
            </p>

            <div className="flex flex-col items-center gap-8">
              <Button
                size="lg"
                onClick={() => navigate('/pricing')}
                className="studio-neon-button text-3xl px-20 h-24 shadow-[0_20px_60px_rgba(204,255,0,0.3)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto group"
              >
                SEE PRICING
                <ArrowRight className="w-10 h-10 ml-6 group-hover:translate-x-2 transition-transform" />
              </Button>

              <div className="flex flex-col items-center gap-4">
                <div className="text-studio-text-muted/60 text-xs font-black tracking-[0.3em] uppercase">
                  NO CREDIT CARD REQUIRED • INSTANT ACCESS
                </div>

                {/* Visual trust signals */}
                <div className="flex gap-4 opacity-50 grayscale mt-4">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" alt="Mastercard" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="PayPal" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Decorative Assets (Subtle) */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[10%] bottom-[20%] hidden lg:block w-32 h-32 border border-studio-border rounded-full opacity-20"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-[15%] top-[15%] hidden lg:block w-24 h-24 border border-studio-purple/20 rounded-[40px] rotate-45 opacity-20"
        />
      </section>
    </Layout >
  );
}
