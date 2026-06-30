import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Feedback = ({ onComplete }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef(null);

  const handleSelectRating = async (rating) => {
    setSelectedRating(rating);
    setSubmitted(true);

    // 1. Fire Confetti & Heart explosion
    const defaults = { spread: 360, ticks: 80, gravity: 0.7, decay: 0.95, startVelocity: 25, colors: ['#ec4899', '#7c3aed', '#fbbf24'] };
    confetti({ ...defaults, particleCount: 40, scalar: 2 });
    confetti({ ...defaults, particleCount: 30, scalar: 1.2 });

    const API_URL = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/feedback` 
      : `${window.location.protocol}//${window.location.hostname}:5000/api/feedback`;

    // 2. Submit rating to MERN backend
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
    } catch (err) {
      console.warn('API error submitting feedback, saving to localStorage');
      // Save locally
      const localFb = JSON.parse(localStorage.getItem('mock_feedbacks') || '[]');
      localFb.push({ rating, date: new Date().toISOString() });
      localStorage.setItem('mock_feedbacks', JSON.stringify(localFb));
    }

    // 3. Move to Final Screen after 3 seconds of celebration
    setTimeout(() => {
      onComplete();
    }, 3200);
  };

  // Canvas floating hearts animation
  useEffect(() => {
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

    const hearts = [];
    const colors = ['#ec4899', '#f43f5e', '#fda4af', '#fbbf24'];

    class FloatingHeart {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 50;
        this.size = Math.random() * 12 + 6;
        this.speedY = -(Math.random() * 1.5 + 0.8);
        this.swaySpeed = Math.random() * 0.03 + 0.01;
        this.swayRange = Math.random() * 1.5 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speedY;
        this.angle += this.swaySpeed;
        this.x += Math.sin(this.angle) * 0.4;

        if (this.y < -30) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.fillStyle = this.color;

        // Soft glow halo — no shadowBlur (GPU-friendly)
        const d = this.size * 1.6;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + d / 4);
        ctx.quadraticCurveTo(this.x, this.y, this.x + d / 2, this.y);
        ctx.quadraticCurveTo(this.x + d, this.y, this.x + d, this.y + d / 3);
        ctx.quadraticCurveTo(this.x + d, this.y + (d * 3) / 4, this.x + d / 2, this.y + d);
        ctx.quadraticCurveTo(this.x - d, this.y + (d * 3) / 4, this.x - d, this.y + d / 3);
        ctx.quadraticCurveTo(this.x - d, this.y, this.x - d / 2, this.y);
        ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + d / 4);
        ctx.fill();

        // Bright solid core
        ctx.globalAlpha = this.opacity;
        const c = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + c / 4);
        ctx.quadraticCurveTo(this.x, this.y, this.x + c / 2, this.y);
        ctx.quadraticCurveTo(this.x + c, this.y, this.x + c, this.y + c / 3);
        ctx.quadraticCurveTo(this.x + c, this.y + (c * 3) / 4, this.x + c / 2, this.y + c);
        ctx.quadraticCurveTo(this.x - c, this.y + (c * 3) / 4, this.x - c, this.y + c / 3);
        ctx.quadraticCurveTo(this.x - c, this.y, this.x - c / 2, this.y);
        ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + c / 4);
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize 25 floating hearts
    for (let i = 0; i < 25; i++) {
      hearts.push(new FloatingHeart());
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      hearts.forEach(h => {
        h.update();
        h.draw();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-slate-950 select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Aurora light movement */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-gradient-to-tr from-purple-900/10 via-pink-900/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 text-center max-w-xl px-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="askFeedback"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl flex flex-col items-center"
            >
              <span className="text-3xl animate-bounce mb-3">❤️</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                How Was This Surprise? ❤️
              </h2>
              <p className="text-purple-300/80 text-xs md:text-sm mt-3 font-light max-w-xs mb-8">
                Your rating will be saved. Let me know what you thought of the digital universe!
              </p>

              {/* Rating selection list */}
              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={() => handleSelectRating(1)}
                  className="w-full py-4 px-6 bg-slate-900/50 hover:bg-purple-600/20 border border-white/10 rounded-2xl hover:border-purple-500/40 text-sm font-semibold tracking-wide cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">⭐</span> Amazing
                </button>
                <button
                  onClick={() => handleSelectRating(2)}
                  className="w-full py-4 px-6 bg-slate-900/50 hover:bg-pink-600/20 border border-white/10 rounded-2xl hover:border-pink-500/40 text-sm font-semibold tracking-wide cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">⭐⭐</span> Wonderful
                </button>
                <button
                  onClick={() => handleSelectRating(3)}
                  className="w-full py-4 px-6 bg-slate-900/50 hover:bg-amber-600/20 border border-white/10 rounded-2xl hover:border-amber-500/40 text-sm font-semibold tracking-wide cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">⭐⭐⭐</span> Unforgettable
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="thanksFeedback"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-amber-500 rounded-full flex items-center justify-center text-white text-5xl shadow-xl shadow-pink-500/35 border-2 border-white/20 animate-pulse">
                💖
              </div>
              <h3 className="text-3xl md:text-5xl font-black mt-6 tracking-tight bg-gradient-to-r from-white via-pink-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                Thank You So Much!
              </h3>
              <p className="text-sm text-purple-200/70 font-light mt-3 max-w-xs leading-relaxed">
                Your rating was logged! I hope you liked this little universe. Preparing the final wishes...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Feedback;
