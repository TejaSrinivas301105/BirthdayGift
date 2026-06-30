import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WorldEntry = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [step, setStep] = useState(0); // 0: Zooming, 1: Welcome text, 2: Name formation, 3: Completed

  useEffect(() => {
    // Stage timer sequence
    const t1 = setTimeout(() => setStep(1), 2500); // Show "Welcome to your world"
    const t2 = setTimeout(() => setStep(2), 5500); // Form her name with particles
    const t3 = setTimeout(() => setStep(3), 9500); // Zoom out & complete
    const t4 = setTimeout(() => onComplete(), 10500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Canvas particle simulation
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

    // 1. Generate text path targets using a hidden canvas
    const textTargets = [];
    const getTargets = () => {
      const hiddenCanvas = document.createElement('canvas');
      const hctx = hiddenCanvas.getContext('2d');
      hiddenCanvas.width = window.innerWidth;
      hiddenCanvas.height = window.innerHeight;

      hctx.fillStyle = '#ffffff';
      hctx.textAlign = 'center';
      hctx.textBaseline = 'middle';
      
      // Choose font size based on screen width
      const fontSize = Math.min(hiddenCanvas.width * 0.12, 120);
      hctx.font = `black ${fontSize}px sans-serif`;
      hctx.fillText('ASRITHA', hiddenCanvas.width / 2, hiddenCanvas.height / 2);

      // Scan canvas pixels
      const imgData = hctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
      const stepSize = Math.max(4, Math.floor(hiddenCanvas.width / 350)); // Scale resolution

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

    class Particle {
      constructor(index) {
        // Start scattered in 3D outer ring
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * canvas.width + canvas.width * 0.5;
        this.x = canvas.width / 2 + Math.cos(angle) * radius;
        this.y = canvas.height / 2 + Math.sin(angle) * radius;
        
        // Random depths
        this.z = Math.random() * canvas.width;
        
        // Target coordinate if it matches a text pixel
        this.target = textTargets[index % textTargets.length] || null;
        
        this.color = ['#fbbf24', '#ec4899', '#7c3aed', '#ffffff'][Math.floor(Math.random() * 4)];
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.03 + 0.015;
        this.ease = 0.05 + Math.random() * 0.04;
        
        // Offset for floating effect
        this.floatOffset = Math.random() * 100;
      }

      update(stage) {
        if (stage === 0) {
          // Tunnel warp zoom towards camera
          this.z -= 15;
          if (this.z <= 0) {
            this.z = canvas.width;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * canvas.width * 0.5;
            this.x = canvas.width / 2 + Math.cos(angle) * radius;
            this.y = canvas.height / 2 + Math.sin(angle) * radius;
          }
        } else if (stage === 1) {
          // Floating stars
          this.x += Math.sin(Date.now() * 0.001 + this.floatOffset) * 0.2;
          this.y += Math.cos(Date.now() * 0.001 + this.floatOffset) * 0.2;
        } else if (stage >= 2 && this.target) {
          // Attract towards "ASRITHA" target pixels
          const dx = this.target.x - this.x;
          const dy = this.target.y - this.y;
          this.x += dx * this.ease;
          this.y += dy * this.ease;

          // Add a tiny bit of floating noise after assembling
          if (Math.hypot(dx, dy) < 5) {
            this.x += Math.sin(Date.now() * 0.003 + this.floatOffset) * 0.05;
            this.y += Math.cos(Date.now() * 0.003 + this.floatOffset) * 0.05;
          }
        }
        
        if (stage === 3) {
          // Final fade-out disperse
          this.y -= Math.random() * 1 + 0.5;
          this.x += (Math.random() - 0.5) * 0.5;
        }
      }

      draw() {
        // Size scales based on depth if zooming
        const sizeVal = step === 0 ? this.size * (1 - this.z / canvas.width) * 1.5 : this.size;
        const r = Math.max(0.5, sizeVal);
        const glowR = r * (step >= 2 ? 3.5 : 2);

        // Soft outer glow using globalAlpha — no ctx.shadowBlur (GPU-friendly)
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Bright solid core
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(i));
    }

    // Animation Loop
    const draw = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Clear with trailing smear
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update(step);
        p.draw();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [step]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-slate-950 select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Narrative overlay text */}
      <div className="z-10 text-center max-w-2xl px-6 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="welcomeText"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.2 }}
            >
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-wide uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Welcome To Your World
              </h2>
              <p className="text-purple-300 text-lg md:text-2xl mt-4 font-light font-serif">
                This universe was created just for you.
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="nameRevealText"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-24 items-center"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-amber-400 font-bold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                Behold the Cosmic Alignment
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorldEntry;
