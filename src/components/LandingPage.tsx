import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ShoppingBag, 
  Car, 
  Sparkles, 
  PiggyBank,
  Heart,
  Compass,
  Smile,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
}

export default function LandingPage({ setActiveTab }: LandingPageProps) {
  const liveStats = [
    { label: 'E-commerce Tracked', value: '1.2M+ Goodies 🎒', color: 'text-pink-400' },
    { label: 'Super Fast Sync', value: '< 15 mins ⏰', color: 'text-amber-400' },
    { label: 'Piggy Bank Saved', value: '18.4% / Search 🐷', color: 'text-emerald-400' },
    { label: 'Taxi & Bike Deals', value: 'Sweet Rates 🛵', color: 'text-cyan-400' }
  ];

  const features = [
    {
      title: 'Real-time Super Search 🎒',
      subtitle: 'Find cutest deals concurrently!',
      description: 'We peek into Amazon, eBay, BestBuy, and Walmart concurrently. We dig up the absolute lowest rates so your wallet stays plump and happy!',
      icon: ShoppingBag,
      color: 'text-pink-400 border-pink-400/20 bg-pink-400/5',
      glow: 'shadow-pink-500/10 hover:shadow-pink-500/20',
      actionId: 'product',
      badge: 'Bargains! ✨'
    },
    {
      title: 'Happy Ride Companion 🛵',
      subtitle: 'Cabs or bikes in a jiffy!',
      description: 'Zips side-by-side rates for Uber Auto, Ola, and Rapido Bike Taxis. Spot rapid ETAs and surge multipliers with our cute live visualizer!',
      icon: Car,
      color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
      glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/20',
      actionId: 'ride',
      badge: 'Fast & Safe 🚗'
    },
    {
      title: 'Gemini Sparkly Predictor 🧙‍♂️',
      subtitle: 'AI Magic that guards your gold',
      description: 'Our super-smart AI Wizard tracks pricing trends and generates cozy recommendations. Know instantly if you should grab that item now or wait!',
      icon: Sparkles,
      color: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
      glow: 'shadow-violet-500/10 hover:shadow-violet-500/20',
      actionId: 'product',
      badge: 'Wizardry 🔮'
    }
  ];

  // Helper background floating symbols
  const backgroundShapes = [
    { char: '🎒', top: '10%', left: '8%', delay: 0 },
    { char: '🛵', top: '25%', right: '10%', delay: 1.5 },
    { char: '🐷', top: '70%', left: '6%', delay: 3 },
    { char: '✨', top: '85%', right: '12%', delay: 0.8 },
    { char: '💖', top: '45%', left: '88%', delay: 2.2 },
    { char: '🎈', top: '60%', left: '84%', delay: 1.1 },
    { char: '🪙', top: '35%', left: '15%', delay: 4 },
  ];

  return (
    <div id="landing-view" className="relative space-y-16 py-10 px-4 max-w-6xl mx-auto text-slate-100 overflow-visible">
      
      {/* Decorative Floating Background Char Helpers */}
      <div className="absolute inset-0 pointer-events-none overflow-visible select-none z-0">
        {backgroundShapes.map((shape, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 0, opacity: 0.35, scale: 0.9 }}
            animate={{ 
              y: [0, -22, 0],
              rotate: [0, 15, -15, 0],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{
              duration: 5 + idx,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay
            }}
            className="absolute text-2xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
            style={{
              top: shape.top,
              left: shape.left,
              right: shape.right
            }}
          >
            {shape.char}
          </motion.div>
        ))}
      </div>

      {/* Hero Header Block */}
      <div className="relative z-10 text-center space-y-8 max-w-3xl mx-auto pt-8">
        
        {/* Sparkly interactive tag */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-400/20 bg-gradient-to-r from-pink-500/10 via-violet-500/10 to-cyan-500/10 text-pink-300 text-xs font-semibold tracking-wider uppercase animate-fade-in mx-auto shadow-[0_0_15px_rgba(236,72,153,0.15)] cursor-pointer hover:border-pink-400/40 transition-colors"
        >
          <Smile className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
          <span>Your Sweetest Compare Engine! ✨🍰</span>
        </motion.div>

        {/* Playful & Charming display typography */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight text-white leading-tight">
            Happy Savings.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 filter drop-shadow-[0_2px_15px_rgba(167,139,250,0.3)]">
              Double Joy! 🐷🎈
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg text-balance max-w-2xl mx-auto font-sans leading-relaxed">
            Welcome to <span className="text-pink-300 font-bold">PricePulse</span>, where we gather the cutest deals on toys, tech, and goodies, plus cheap ride fares concurrently. Powered by friendly <span className="text-cyan-300 font-semibold">Gemini AI magic</span> directly!
          </p>
        </div>

        {/* Call To Action Buttons (Springy & Bouncy) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <motion.button
            id="btn-cta-explore"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('product')}
            className="w-full sm:w-auto px-8 py-4.5 bg-gradient-to-r from-pink-500 via-rose-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/35 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <span>Let's Start Saving! 🧸</span>
            <ArrowRight className="w-5 h-5 text-pink-100" />
          </motion.button>

          <motion.button
            id="btn-cta-rides"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('ride')}
            className="w-full sm:w-auto px-7 py-4 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-bold rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Check Quick Rides 🛵</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Playful Glassmorphic Stats Ticker */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-inner relative overflow-hidden" 
        id="stats-ticker-grid"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-pink-500/5 opacity-80 pointer-events-none" />
        {liveStats.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.04, y: -2 }}
            className="text-center p-4 border-r last:border-r-0 border-slate-800/50 flex flex-col justify-center items-center relative z-10" 
            id={`stat-tile-${i}`}
          >
            <span className={`block text-xl md:text-2xl font-black ${stat.color} tracking-tight font-display`}>{stat.value}</span>
            <span className="text-[10px] text-slate-400 font-sans mt-1.5 block uppercase tracking-wider font-bold">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Horizontal Features Section */}
      <div className="space-y-10 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300 font-semibold">
            <PiggyBank className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Curiosity Zone 🔍</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Adorable Engines Tailored For You!</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">Click any bubble below to uncover premium real-time AI tools made to save your hard-earned gold! 🌟</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6" id="features-cards-grid">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5, type: "spring", stiffness: 80 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -6,
                  transition: { type: "spring", stiffness: 180, damping: 10 }
                }}
                className={`p-7 rounded-3xl bg-slate-900/55 border border-slate-800/70 hover:border-slate-700/85 transition-shadow shadow-md ${feature.glow} flex flex-col justify-between relative overflow-hidden`}
                id={`feature-card-${idx}`}
              >
                {/* Micro corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-white/5 opacity-[0.02] rounded-bl-full pointer-events-none" />

                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${feature.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-pink-300 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white tracking-tight">{feature.title}</h3>
                    <p className="text-xs text-pink-300 font-semibold">{feature.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{feature.description}</p>
                </div>

                <motion.button
                  id={`btn-feature-launch-${idx}`}
                  whileHover={{ x: 3 }}
                  onClick={() => setActiveTab(feature.actionId)}
                  className="mt-6 text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Playroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Decorative Interactive Bubble Box to boost user curiosity */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl border border-dashed border-cyan-500/30 bg-gradient-to-br from-slate-900/50 to-slate-950/20 p-8 text-center relative overflow-hidden flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(34,211,238,0.06)]"
      >
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl" />
        
        <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 mb-1">
          <Heart className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
        
        <h3 className="text-xl font-bold text-white">Curious to find out how much you can save today? 🏆</h3>
        <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
          Unlock maximum convenience! Put your links in the compare room, or check the fastest ride fares in Hyderabad with immediate geocoded outputs. We guard your budget with adorable transparency.
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md"
        >
          Check My Magic Dashboard! 👑
        </motion.button>
      </motion.div>

    </div>
  );
}
