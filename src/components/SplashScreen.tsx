import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [startTransition, setStartTransition] = useState(false);

  // Split title into letters for staggered letter-by-letter entrance
  const title = "PricePulse";
  const letters = title.split("");

  useEffect(() => {
    // Premium loading progress simulator tuned to run for exactly 5.1 seconds
    const duration = 5100; 
    const intervalTime = 40;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          // Allow it to remain full for a moment before starting fade-out transition
          setTimeout(() => {
            setStartTransition(true);
            setTimeout(() => {
              onComplete();
            }, 700); // Transitions correctly
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Framer Motion variant definitions
  const containerVariants = {
    initial: { opacity: 1, scale: 1 },
    exit: { 
      opacity: 0, 
      scale: 1.05,
      transition: { 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1] 
      } 
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, scale: 0.3, y: 30, filter: "blur(6px)" },
    visible: (index: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: index * 0.08,
        duration: 0.6,
        type: 'spring',
        stiffness: 110,
        damping: 10
      }
    })
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 1.1, 
        duration: 0.8,
        ease: "easeOut"
      } 
    }
  };

  const particleVariants = (delay: number) => ({
    animate: {
      y: [0, -60, 0],
      x: [0, Math.sin(delay) * 20, 0],
      opacity: [0.2, 0.8, 0.2],
      scale: [1, 1.4, 1],
      transition: {
        duration: 4 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }
    }
  });

  return (
    <AnimatePresence>
      {!startTransition && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A] text-white overflow-hidden select-none"
        >
          {/* Animated Ambient Gradient background blobs */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Top Left Neon Blue Glow Blur */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[130px] animate-pulse" />
            {/* Bottom Right Deep Purple Glow Blur */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/15 blur-[160px] animate-pulse" style={{ animationDuration: '6s' }} />
            {/* Central Soft Ambient Glow */}
            <div className="absolute top-[35%] left-[25%] w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
          </div>

          {/* Premium Glowing Particle Layers */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {[1.2, 2.5, 3.1, 0.5, 1.8, 2.2, 4.0].map((delay, index) => (
              <motion.div
                key={index}
                variants={particleVariants(delay)}
                animate="animate"
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
                style={{
                  top: `${20 + (index * 11) % 65}%`,
                  left: `${15 + (index * 13) % 70}%`,
                  filter: "drop-shadow(0 0 4px rgba(34, 211, 238, 0.6))"
                }}
              />
            ))}
          </div>

          {/* Glassmorphic Central Interactive Container Panel */}
          <div className="relative z-20 w-11/12 max-w-lg p-10 md:p-14 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(30,41,59,0.5)] flex flex-col items-center justify-center text-center">
            
            {/* Moving Light Streak effect wrapper on Border */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
              <div className="absolute w-[200%] h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent top-0 -left-[100%] animate-light-streak-top" />
            </div>

            {/* Sparkle icon header with continuous float and hum */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -6, 0] }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                rotate: { type: 'spring', stiffness: 100 },
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
              }}
              className="mb-6 p-4 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </motion.div>

            {/* Letter-by-letter PricePulse Title Display with Highlighted Bold Glass Bubble and dynamic rotating glows */}
            <motion.div 
              className="relative px-8 py-5 rounded-3xl bg-slate-950/80 border border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.25)] mb-6 select-none overflow-hidden"
              animate={{
                boxShadow: [
                  "0 0 35px rgba(139,92,246,0.2)",
                  "0 0 60px rgba(139,92,246,0.45)",
                  "0 0 35px rgba(139,92,246,0.2)"
                ],
                borderColor: [
                  "rgba(139,92,246,0.25)",
                  "rgba(236,72,153,0.45)",
                  "rgba(139,92,246,0.25)"
                ],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Dynamic ambient highlight layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-pink-500/10 to-violet-500/10 opacity-70 blur-xl animate-pulse" />

              <div className="relative flex select-none flex-wrap justify-center">
                {letters.map((char, idx) => (
                  <motion.span
                    key={idx}
                    custom={idx}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-4xl md:text-5xl lg:text-6xl tracking-wide font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-pink-400 to-violet-400 select-none cursor-default font-black"
                    style={{
                      textShadow: '0 0 40px rgba(168, 85, 247, 0.45)',
                      display: 'inline-block'
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Subtext tagline comparison promise with float fade-in */}
            <motion.p
              variants={taglineVariants}
              initial="hidden"
              animate="visible"
              className="text-slate-400 text-xs md:text-sm font-medium tracking-wide uppercase select-none mb-10 max-w-xs font-sans"
            >
              Compare Smarter. <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent font-bold">Save Bigger.</span>
            </motion.p>

            {/* Premium Progress Bar Track */}
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-500 px-1 font-sans">
                <span>INITIALIZING ENGINE</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 p-[1px] relative shadow-inner">
                {/* Progress fill */}
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Traveling highlight spark */}
                {progress > 0 && progress < 100 && (
                  <div 
                    className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[2px]"
                    style={{ left: `calc(${progress}% - 16px)` }}
                  />
                )}
              </div>
            </div>

            {/* Glowing bottom blur highlights */}
            <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-3/4 h-2 rounded-full bg-cyan-400/20 blur-[15px] filter animate-pulse" />
          </div>

          {/* Humble watermark metadata signature */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-slate-600 uppercase font-sans">
            PRICEPULSE COGNITIVE WORKSPACE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
