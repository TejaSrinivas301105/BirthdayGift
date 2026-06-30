import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ─── True per-character Typewriter component ───────────────────────────────
const TypewriterText = ({ text, className, onDone, charDelay = 45 }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        if (onDone) onDone();
      }
    }, charDelay);
    return () => clearInterval(interval);
  }, [text, charDelay]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span className="inline-block w-[2px] h-[1em] bg-pink-400 ml-[2px] align-middle animate-pulse" />
      )}
    </span>
  );
};

const WelcomeScreen = ({ onProceed }) => {
  const [step, setStep] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef(null);
  const fireflyCanvasRef = useRef(null);
  // Ref for canvas loop — avoids re-mounting the canvas on state change
  const isTransitioningRef = useRef(false);

  // Step timing — driven by typewriter completion + padding
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 3200);
    const t2 = setTimeout(() => setStep(2), 7000);
    const t3 = setTimeout(() => setShowButton(true), 10500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // ─── Firefly Canvas ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = fireflyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 18 organic fireflies with independent sway, flicker, and drift
    const fireflies = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      baseY: Math.random() * window.innerHeight,
      speedX: (Math.random() - 0.5) * 0.3,
      swaySpeed: Math.random() * 0.015 + 0.005,
      swayRange: Math.random() * 30 + 15,
      angle: Math.random() * Math.PI * 2,
      size: Math.random() * 2.2 + 1.2,
      opacity: Math.random() * 0.6 + 0.3,
      flickerSpeed: Math.random() * 0.08 + 0.03,
      hue: Math.random() > 0.5 ? 130 : 60, // green-gold split
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;

      fireflies.forEach(f => {
        f.angle += f.swaySpeed;
        f.x += f.speedX;
        f.y = f.baseY + Math.sin(f.angle) * f.swayRange;

        // Wrap horizontally
        if (f.x < -10) f.x = canvas.width + 10;
        if (f.x > canvas.width + 10) f.x = -10;

        const flicker = Math.sin(t * f.flickerSpeed * 60 + f.angle * 4) * 0.35 + 0.65;
        const alpha = f.opacity * flicker;

        // Outer soft glow — no shadowBlur
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 5);
        grad.addColorStop(0, `hsla(${f.hue}, 100%, 75%, ${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${f.hue}, 100%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue}, 100%, 88%, ${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Web Audio Synth Chime
  const playMagicalChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq, start, duration, volume) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(volume, start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.05);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      // Arpeggio chime
      playTone(523.25, now, 0.6, 0.25);        // C5
      playTone(659.25, now + 0.12, 0.6, 0.2);   // E5
      playTone(783.99, now + 0.24, 0.6, 0.2);   // G5
      playTone(1046.50, now + 0.36, 0.8, 0.25); // C6
    } catch (e) {
      console.warn('Audio synthesis failed', e);
    }
  };

  const handleButtonClick = () => {
    // 1. Play sound
    playMagicalChime();

    // 2. Explode Hearts & Confetti
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const heartDefaults = { spread: 360, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 30, colors: ['#ec4899', '#7c3aed', '#fbbf24'] };
    const frame = () => {
      confetti({ ...heartDefaults, particleCount: 8, scalar: 2.5, shapes: ['circle'] });
      confetti({ ...heartDefaults, particleCount: 5, scalar: 1.5, shapes: ['square'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // 3. Update both the ref (for canvas loop) and state (for React overlay render)
    // Using a ref prevents the canvas useEffect from re-mounting and restarting stars
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    // 4. Proceed to Login
    setTimeout(() => onProceed(), 2800);
  };

  // Canvas 3D Starfield & Moving Aurora Light
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

    // Starfield definitions
    const stars = [];
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width,
        color: ['#ffffff', '#ec4899', '#7c3aed', '#fbbf24'][Math.floor(Math.random() * 4)],
        size: Math.random() * 1.5 + 0.5
      });
    }

    // Clouds
    const clouds = [
      { x: canvas.width * 0.25, y: canvas.height * 0.3, r: 80, dx: 0.1 },
      { x: canvas.width * 0.75, y: canvas.height * 0.4, r: 120, dx: -0.08 },
    ];

    let speed = 0.5;

    const draw = () => {
      ctx.fillStyle = '#0f172a'; // Deep Midnight Blue
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw moving Aurora Light (gradient sweep)
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(Date.now() * 0.0005) * 200,
        canvas.height * 0.3 + Math.cos(Date.now() * 0.0003) * 100,
        100,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.8
      );
      grad.addColorStop(0, 'rgba(124, 58, 237, 0.15)'); // Purple Aurora
      grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.1)'); // Pink Glow
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Glowing Moon
      ctx.save();
      const moonX = canvas.width * 0.8;
      const moonY = canvas.height * 0.2;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 60);
      moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      moonGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.3)'); // Golden Glow
      moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Update & Draw 3D Stars
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // If transition is active, ramp up speed — read from ref, not state, to avoid re-mount
      if (isTransitioningRef.current) {
        speed = Math.min(speed + 0.35, 45); // Warp tunnel effect
      }

      stars.forEach(star => {
        star.z -= speed;
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        const k = 128.0 / star.z;
        const px = star.x * k;
        const py = star.y * k;

        // If drawing warp lines
        if (isTransitioningRef.current) {
          const prevK = 128.0 / (star.z + speed);
          const ppx = star.x * prevK;
          const ppy = star.y * prevK;

          ctx.beginPath();
          ctx.moveTo(ppx, ppy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = star.size * 2;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, star.size * (1 - star.z / canvas.width) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.fill();
        }
      });
      ctx.restore();

      // Draw clouds drifting slowly
      clouds.forEach(cloud => {
        cloud.x += cloud.dx;
        if (cloud.x > canvas.width + cloud.r) cloud.x = -cloud.r;
        if (cloud.x < -cloud.r) cloud.x = canvas.width + cloud.r;

        ctx.save();
        const cloudGrad = ctx.createRadialGradient(cloud.x, cloud.y, 10, cloud.x, cloud.y, cloud.r);
        cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        cloudGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.02)');
        cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []); // Empty deps — reads isTransitioningRef.current live inside loop

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Galaxy warp overlay when button is clicked */}
      {isTransitioning && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 1] }}
          transition={{ duration: 2.8 }}
          className="absolute inset-0 bg-black z-10 pointer-events-none mix-blend-overlay"
        />
      )}

      {/* Firefly canvas — organic glowing dots beneath starfield */}
      <canvas ref={fireflyCanvasRef} className="absolute inset-0 z-[2] pointer-events-none" />

      {/* Typing Messages Container */}
      <div className="z-10 text-center max-w-xl px-6 flex flex-col items-center justify-center gap-6 min-h-[180px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.h1
              key="step0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold text-white tracking-wide font-sans drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
            >
              <TypewriterText
                text="Hello Asritha ❤️"
                charDelay={60}
                className=""
              />
            </motion.h1>
          )}

          {step === 1 && (
            <motion.p
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-2xl font-light text-purple-200 tracking-wide font-serif leading-relaxed"
            >
              <TypewriterText
                text="I have created something special for you. I hope you like it ✨"
                charDelay={38}
                className=""
              />
            </motion.p>
          )}

          {step === 2 && (
            <motion.p
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-base md:text-xl font-light text-pink-200 tracking-wide leading-relaxed"
            >
              <TypewriterText
                text="Before entering your world, please confirm one thing..."
                charDelay={42}
                className=""
              />
            </motion.p>
          )}
        </AnimatePresence>

        {/* Surprise Button */}
        <div className="h-16 flex items-center justify-center mt-6">
          <AnimatePresence>
            {showButton && !isTransitioning && (
              <motion.button
                key="btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(236,72,153,0.8)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleButtonClick}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-bold rounded-full shadow-lg shadow-pink-500/35 border border-white/20 tracking-wider text-sm md:text-base cursor-pointer"
              >
                Yes, I Like This Surprise 💖
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
