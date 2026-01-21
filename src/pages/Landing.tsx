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
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'AI Ads', 'Cinematic', 'Social Content'];
  const [isGoliMuted, setIsGoliMuted] = useState(true);

  const filteredPortfolio = activeCategory === 'All'
    ? portfolioData.slice(0, 5)
    : portfolioData.filter(item => item.category === activeCategory).slice(0, 5);

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
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            >
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/BeardAD.MOV" type="video/quicktime" />
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/BeardAD.MOV" type="video/mp4" />
            </video>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white font-black text-[10px] tracking-widest">+42% ROAS</div>
            </div>
          </div>
        </div>

        <div className="absolute left-[10%] bottom-[12%] hidden xl:block w-48 studio-float studio-rotate-right animation-delay-3000 z-10">
          <div className="studio-card-9-16 rounded-2xl border border-studio-border bg-studio-surface shadow-2xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-700 hover:scale-105">
            <img src={portfolioData[3].thumbnail} className="w-full h-full object-cover" alt="" fetchPriority="high" decoding="async" />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white font-black text-[10px] tracking-widest">GLOBAL REACH</div>
            </div>
          </div>
        </div>

        {/* Right Side - Video 2: ProteinAd */}
        <div className="absolute right-[4%] top-[20%] hidden xl:block w-52 studio-float studio-rotate-right animation-delay-1000 z-20">
          <div className="studio-card-9-16 rounded-2xl border border-studio-border bg-studio-surface shadow-2xl overflow-hidden grayscale-[0.3] hover:grayscale-0 transition-all duration-700 hover:scale-105 group">
            <video
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            >
              <source src="https://res.cloudinary.com/dlnh3x5ki/video/upload/v1768991010/ProteinAd_dmodrr.mov" type="video/quicktime" />
              <source src="https://res.cloudinary.com/dlnh3x5ki/video/upload/v1768991010/ProteinAd_dmodrr.mov" type="video/mp4" />
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
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            >
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/GoliAd.MOV" type="video/quicktime" />
              <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/GoliAd.MOV" type="video/mp4" />
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

      {/* Before & After Comparison Section */}
      <section className="py-16 bg-studio-surface border-y border-studio-border relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-studio-purple/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="relative max-w-4xl mx-auto flex items-center justify-center gap-8 md:gap-12">
            {/* Before: Static Photo - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-32 md:w-40"
            >
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-studio-border bg-white shadow-lg">
                <img
                  src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/product-images/a4c95f56-4af2-4c74-b681-c1bf51782291/job_1768411532862_2jia18.jpg"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Static Product"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                  <span className="text-white text-[8px] font-black tracking-widest uppercase">Before: Photo</span>
                </div>
              </div>
            </motion.div>

            {/* After: AI Video - Right Side (Main) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[360px] md:max-w-[420px]"
            >
              <div
                className="relative aspect-[9/16] rounded-[32px] overflow-hidden border-4 border-studio-purple/20 bg-studio-text-main shadow-[0_32px_64px_-16px_rgba(111,0,255,0.2)] cursor-pointer group"
                onClick={() => setIsGoliMuted(!isGoliMuted)}
              >
                <video
                  autoPlay
                  muted={isGoliMuted}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                >
                  <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/GoliAd.MOV" type="video/quicktime" />
                  <source src="https://yiwezubimkzkqxzbfodn.supabase.co/storage/v1/object/public/Videos/GoliAd.MOV" type="video/mp4" />
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
                    <div className="bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/20">
                      <span className="text-white text-xs font-black tracking-widest uppercase">Tap to Unmute</span>
                    </div>
                  </div>
                )}

                {/* Bottom Right - Tap for Sound Button */}
                {isGoliMuted && (
                  <div className="absolute bottom-6 right-6 z-20">
                    <div className="bg-black/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-2">
                      <Play className="w-4 h-4 text-white fill-current" />
                      <span className="text-white text-[9px] font-black tracking-widest uppercase">Tap for Sound</span>
                    </div>
                  </div>
                )}

                {/* Status indicator when unmuted */}
                {!isGoliMuted && (
                  <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 z-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-0.5 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
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

      {/* Structured Showcase Section */}
      <section id="portfolio" className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-studio-text-main uppercase">
                Studio <span className="studio-italic-serif">Showcase</span>
              </h2>
              <p className="text-studio-text-muted text-xl font-medium tracking-tight">
                Our latest synthetic productions optimized for scale.
              </p>
            </div>

            <div className="hidden md:flex gap-3 bg-studio-surface p-1.5 rounded-2xl border border-studio-border">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeCategory === cat
                    ? 'bg-white text-studio-text-main shadow-md border border-studio-border'
                    : 'text-studio-text-muted hover:text-studio-text-main'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredPortfolio.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col transition-all duration-700"
              >
                {/* Arcads Header Look */}
                <div className="flex items-center justify-between mb-3 px-3 font-black text-[9px] tracking-widest text-studio-text-muted uppercase">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-studio-surface border border-studio-border flex items-center justify-center overflow-hidden">
                      <img src={item.thumbnail} className="w-full h-full object-cover grayscale" alt="" loading="lazy" decoding="async" />
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-100">ACTIVE</span>
                    <span className="opacity-50">SPONSORED</span>
                  </div>
                </div>

                <div className="studio-card-9-16 rounded-2xl border border-studio-border bg-studio-surface shadow-md hover:shadow-xl transition-all duration-700 overflow-hidden group relative">
                  {item.videoUrl ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    >
                      <source src={item.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  )}
                </div>

                <div className="mt-4 px-4 flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-studio-text-muted">
                  <span>{item.category}</span>
                  <span className="text-studio-purple">{Math.floor(Math.random() * 900) + 100}K+ VIEWS</span>
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
