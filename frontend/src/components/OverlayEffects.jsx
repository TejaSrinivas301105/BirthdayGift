import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useMusic } from '../context/MusicContext';

const OverlayEffects = () => {
  const { snowActive, fireworksActive, lanternsActive, setFireworksActive } = useApp();
  const { stopSpecial } = useMusic();
  const canvasRef = useRef(null);

  // Use refs so the animation loop reads live values without re-mounting
  const snowRef = useRef(snowActive);
  const fireworksRef = useRef(fireworksActive);
  const lanternsRef = useRef(lanternsActive);

  // Sync refs to latest prop values on every render
  snowRef.current = snowActive;
  fireworksRef.current = fireworksActive;
  lanternsRef.current = lanternsActive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ─── Particle Classes ─────────────────────────────────────────────────────

    class Snowflake {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 1.2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.6 + 0.2;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y > canvas.height) this.reset();
      }

      draw() {
        // Soft radial gradient glow instead of shadowBlur — GPU-friendly
        ctx.save();
        ctx.globalAlpha = this.opacity;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Lantern {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init
          ? Math.random() * canvas.height + canvas.height
          : canvas.height + Math.random() * 100;
        this.size = Math.random() * 12 + 8;
        this.speedY = -(Math.random() * 0.6 + 0.3);
        this.swaySpeed = Math.random() * 0.02 + 0.005;
        this.swayRange = Math.random() * 1.5 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.4 + 0.4;
        this.flicker = Math.random() * 0.2 + 0.8;
      }

      update() {
        this.y += this.speedY;
        this.angle += this.swaySpeed;
        this.x += Math.sin(this.angle) * 0.3;
        this.flicker = Math.sin(Date.now() * 0.01 + this.angle) * 0.1 + 0.9;
        if (this.y < -50) this.reset(false);
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Glow via radial gradient — no shadowBlur
        const grad = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, this.size * 2.5);
        grad.addColorStop(0, `rgba(251, 191, 36, ${this.flicker})`);
        grad.addColorStop(0.3, `rgba(236, 72, 153, ${this.flicker * 0.7})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Lantern body
        ctx.beginPath();
        ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size * 1.3);
        ctx.fillStyle = `rgba(251, 191, 36, ${this.flicker * 0.9})`;
        ctx.strokeStyle = 'rgba(185, 28, 28, 0.4)';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    class Firework {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (canvas.width - 200) + 100;
        this.y = canvas.height;
        this.targetY = Math.random() * (canvas.height * 0.5) + 50;
        this.speed = Math.random() * 4 + 6;
        this.exploded = false;
        this.sparks = [];
        this.hue = Math.random() * 360;
      }

      update() {
        if (!this.exploded) {
          this.y -= this.speed;
          if (this.y <= this.targetY) {
            this.exploded = true;
            this.explode();
          }
        } else {
          for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.05; // gravity
            s.alpha -= 0.015;
            if (s.alpha <= 0) this.sparks.splice(i, 1);
          }
        }
      }

      explode() {
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          this.sparks.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: `hsla(${this.hue + Math.random() * 30 - 15}, 100%, 60%, `,
          });
        }
      }

      draw() {
        if (!this.exploded) {
          // Ascending dot — small radial gradient, no shadowBlur
          const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 4);
          grad.addColorStop(0, `hsl(${this.hue}, 100%, 85%)`);
          grad.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
          ctx.beginPath();
          ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          this.sparks.forEach(s => {
            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = s.color + s.alpha + ')';
            ctx.fill();
            ctx.restore();
          });
        }
      }
    }

    // ─── Initialize all particles once on mount ───────────────────────────────
    const snowflakes = Array.from({ length: 100 }, () => new Snowflake());
    const lanterns = Array.from({ length: 20 }, () => new Lantern());
    const fireworks = [];
    let fireworkTimer = 0;

    // ─── Animation Loop ───────────────────────────────────────────────────────
    const animate = () => {
      // Read live values from refs — no effect re-mount on toggle
      const isSnow = snowRef.current;
      const isFireworks = fireworksRef.current;
      const isLanterns = lanternsRef.current;

      if (isFireworks && fireworks.length > 0) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (isSnow) {
        snowflakes.forEach(s => { s.update(); s.draw(); });
      }

      if (isLanterns) {
        lanterns.forEach(l => { l.update(); l.draw(); });
      }

      if (isFireworks) {
        fireworkTimer++;
        if (fireworkTimer > 50) {
          fireworks.push(new Firework());
          fireworkTimer = 0;
        }
        for (let i = fireworks.length - 1; i >= 0; i--) {
          const fw = fireworks[i];
          fw.update();
          fw.draw();
          if (fw.exploded && fw.sparks.length === 0) fireworks.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty deps — runs once, reads live values via refs

  const scrollToBirthday = () => {
    setFireworksActive(false);
    stopSpecial();
    setTimeout(() => {
      const el = document.querySelector('[data-birthday-section]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[40]" />

      <AnimatePresence>
        {fireworksActive && (
          <motion.div
            key="hb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[41] flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Radial glow backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)]" />

            {/* Happy Birthday text */}
            <motion.div
              className="flex flex-col items-center gap-2 select-none"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.3 }}
            >
              <motion.p
                className="text-xs uppercase tracking-[0.4em] text-pink-400 font-bold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                ✨ A Special Day ✨
              </motion.p>

              <motion.h1
                className="text-5xl md:text-8xl font-black text-center leading-tight"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {['Happy', 'Birthday'].map((word, wi) => (
                  <motion.span
                    key={word}
                    className="block"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + wi * 0.3, duration: 0.8, type: 'spring' }}
                    style={{
                      background: wi === 0
                        ? 'linear-gradient(90deg, #fbbf24, #ec4899)'
                        : 'linear-gradient(90deg, #ec4899, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
                    }}
                  >
                    {word}
                  </motion.span>
                ))}

                <motion.span
                  className="block mt-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: [1, 1.04, 1] }}
                  transition={{ delay: 1.2, duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  style={{
                    background: 'linear-gradient(90deg, #a78bfa, #f9a8d4, #fbbf24)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 25px rgba(167,139,250,0.5))',
                  }}
                >
                  Asritha 🎂
                </motion.span>
              </motion.h1>

              {/* Floating hearts row */}
              <motion.div
                className="flex gap-3 mt-2 text-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                {['💖', '🌟', '🎉', '🌟', '💖'].map((e, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </motion.div>

              <motion.p
                className="text-white/60 text-sm md:text-base font-serif italic mt-3 max-w-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                "May your day be as magical as you are 🌙"
              </motion.p>
            </motion.div>

            {/* Back button — pointer-events enabled */}
            <motion.button
              className="pointer-events-auto mt-10 px-7 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full border border-white/20 shadow-lg shadow-pink-500/30 tracking-wide flex items-center gap-2 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, type: 'spring' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(236,72,153,0.5)' }}
              whileTap={{ scale: 0.96 }}
              onClick={scrollToBirthday}
            >
              🎂 Back to Birthday Celebration
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OverlayEffects;
