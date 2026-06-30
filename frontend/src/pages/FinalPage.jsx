import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const wishes = [
  "I hope your future is filled with happiness.",
  "May every dream you see become reality.",
  "May success follow every step you take.",
  "No matter where life takes us, we will always wish the best for you.",
  "Thank you for all the memories.",
  "We will always be there for you whenever you need us.",
  "I hope you remember us somewhere in your beautiful journey of life.",
  "Happy Birthday Once Again, Asritha ❤️"
];

const FinalPage = ({ onRestart }) => {
  const [activeLine, setActiveLine] = useState(0);
  const [showCreditAnim, setShowCreditAnim] = useState(false);
  const [showRestartBtn, setShowRestartBtn] = useState(false);
  const [stats, setStats] = useState(null);
  const canvasRef = useRef(null);

  // Memoized star positions — stable across re-renders
  const bgStars = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 1.5 + 0.5}px`,
      height: `${Math.random() * 1.5 + 0.5}px`,
      animationDuration: `${Math.random() * 3 + 2}s`,
    })),
  []);

  // Fetch feedback statistics when the restart button becomes visible
  useEffect(() => {
    const fetchStats = async () => {
      const API_URL = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/feedback/stats` 
        : `${window.location.protocol}//${window.location.hostname}:5000/api/feedback/stats`;
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.warn('Failed to fetch stats, using local mock data');
        // Retrieve local feedbacks for fallback stats
        const localFb = JSON.parse(localStorage.getItem('mock_feedbacks') || '[]');
        const total = localFb.length;
        const ratingsCount = { 1: 0, 2: 0, 3: 0 };
        localFb.forEach(f => {
          ratingsCount[f.rating] = (ratingsCount[f.rating] || 0) + 1;
        });
        setStats({ total, ratingsCount });
      }
    };
    if (showRestartBtn) {
      fetchStats();
    }
  }, [showRestartBtn]);

  // Cycle through the text wishes one by one
  useEffect(() => {
    if (activeLine < wishes.length) {
      const timer = setTimeout(() => {
        setActiveLine(prev => prev + 1);
      }, 3200); // 3.2s per line
      return () => clearTimeout(timer);
    } else {
      // Show credit animation after wishes finish
      setShowCreditAnim(true);
      const timerRestart = setTimeout(() => {
        setShowRestartBtn(true);
      }, 8000); // Show restart button after credits form
      return () => clearTimeout(timerRestart);
    }
  }, [activeLine]);

  // Particle text builder for "Made With ❤️ By Teja"
  useEffect(() => {
    if (!showCreditAnim) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 1. Build hidden target text
    const textTargets = [];
    const getTargets = () => {
      const hiddenCanvas = document.createElement('canvas');
      const hctx = hiddenCanvas.getContext('2d');
      hiddenCanvas.width = window.innerWidth;
      hiddenCanvas.height = window.innerHeight;

      hctx.fillStyle = '#ffffff';
      hctx.textAlign = 'center';
      hctx.textBaseline = 'middle';
      
      const fontSize = Math.min(hiddenCanvas.width * 0.065, 50);
      hctx.font = `bold ${fontSize}px sans-serif`;
      
      // Draw text
      hctx.fillText('Made With ❤️ By Teja', hiddenCanvas.width / 2, hiddenCanvas.height / 2);

      const imgData = hctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
      const stepSize = Math.max(3, Math.floor(hiddenCanvas.width / 450)); // fine resolution

      for (let y = 0; y < hiddenCanvas.height; y += stepSize) {
        for (let x = 0; x < hiddenCanvas.width; x += stepSize) {
          const index = (y * hiddenCanvas.width + x) * 4;
          const alpha = imgData.data[index + 3];
          if (alpha > 128) {
            textTargets.push({ x, y });
          }
        }
      }
    };
    
    getTargets();

    // 2. Initialize Particles
    const particles = [];
    const particleCount = Math.max(textTargets.length, 1200);

    class StarParticle {
      constructor(index) {
        // Start randomly scattered
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.8;
        this.target = textTargets[index % textTargets.length] || null;
        this.color = ['#fbbf24', '#ec4899', '#7c3aed', '#ffffff'][Math.floor(Math.random() * 4)];
        this.ease = 0.03 + Math.random() * 0.04;
        this.floatOffset = Math.random() * 100;
        this.alpha = 1;
        this.fadeStarted = false;
        this.fadeSpeed = 0.005 + Math.random() * 0.005;
      }

      update(time) {
        if (time < 6000 && this.target) {
          // 1. Gather to form text
          const dx = this.target.x - this.x;
          const dy = this.target.y - this.y;
          this.x += dx * this.ease;
          this.y += dy * this.ease;
          
          if (Math.hypot(dx, dy) < 4) {
            this.x += Math.sin(Date.now() * 0.002 + this.floatOffset) * 0.05;
            this.y += Math.cos(Date.now() * 0.002 + this.floatOffset) * 0.05;
          }
        } else {
          // 2. Dissolve and fade away
          this.fadeStarted = true;
          this.y -= Math.random() * 0.4 + 0.2;
          this.x += (Math.random() - 0.5) * 0.2;
          this.alpha -= this.fadeSpeed;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        // Soft glow halo — no shadowBlur (GPU-friendly)
        ctx.globalAlpha = Math.max(0, this.alpha * 0.3);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Bright solid core
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new StarParticle(i));
    }

    let startTime = Date.now();

    const draw = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'; // Slate-950 trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const elapsed = Date.now() - startTime;

      let allDead = true;
      particles.forEach(p => {
        p.update(elapsed);
        p.draw();
        if (p.alpha > 0) allDead = false;
      });

      if (!allDead) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [showCreditAnim]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center select-none text-center">
      {/* Background canvas for credit animation */}
      {showCreditAnim && (
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      )}

      {/* Decorative stars — useMemo prevents repositioning on re-renders */}
      {!showCreditAnim && (
        <div className="absolute inset-0 pointer-events-none">
          {bgStars.map((star, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-30 animate-pulse"
              style={{
                top: star.top,
                left: star.left,
                width: star.width,
                height: star.height,
                animationDuration: star.animationDuration
              }}
            />
          ))}
        </div>
      )}

      {/* Wishes typing list */}
      <div className="z-10 max-w-2xl px-6 min-h-[140px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeLine < wishes.length ? (
            <motion.p
              key={activeLine}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.2 }}
              className="text-lg md:text-2xl font-serif italic text-purple-200/90 leading-relaxed font-light drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
            >
              "{wishes[activeLine]}"
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Dynamic Statistics dashboard */}
      {showRestartBtn && stats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 mt-2 w-full max-w-xs bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col items-center gap-4 mx-6"
        >
          <h4 className="text-xs uppercase tracking-[0.2em] text-pink-400 font-extrabold">
            Global Surprise Impact 💖
          </h4>
          
          <div className="w-full flex flex-col gap-3 mt-1">
            {Object.entries({
              'Amazing ⭐': stats.ratingsCount[1] || 0,
              'Wonderful ⭐⭐': stats.ratingsCount[2] || 0,
              'Unforgettable ⭐⭐⭐': stats.ratingsCount[3] || 0
            }).map(([label, count]) => {
              const total = stats.total || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={label} className="flex flex-col gap-1 w-full text-left">
                  <div className="flex justify-between text-[10px] font-semibold text-white/80">
                    <span>{label}</span>
                    <span>{count} votes ({percentage}%)</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <span className="text-[9px] text-white/40 mt-1 font-semibold uppercase tracking-wider">
            Total Surprises Shared: {stats.total}
          </span>
        </motion.div>
      )}

      {/* Restart Button overlay */}
      <AnimatePresence>
        {showRestartBtn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute bottom-20 z-20 flex justify-center"
          >
            <button
              onClick={onRestart}
              className="px-6 py-2.5 bg-slate-900/60 border border-white/10 hover:border-white/20 rounded-full text-xs font-semibold tracking-wider text-white/60 hover:text-white cursor-pointer transition-colors backdrop-blur-md"
            >
              Replay Surprise ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinalPage;
