import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const canvasRef = useRef(null);

  // Disable custom cursor on touch devices to prevent lag and touch trail bugs
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse coordinates
    const mouse = { x: 0, y: 0, lastX: 0, lastY: 0, isActive: false };
    const particles = [];
    const colors = ['#7c3aed', '#ec4899', '#fbbf24', '#ffffff']; // Purple, Pink, Gold, White

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.type = Math.random() > 0.5 ? 'heart' : 'sparkle';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;

        if (this.type === 'heart') {
          // Draw small heart
          ctx.beginPath();
          const d = this.size;
          ctx.moveTo(this.x, this.y + d / 4);
          ctx.quadraticCurveTo(this.x, this.y, this.x + d / 2, this.y);
          ctx.quadraticCurveTo(this.x + d, this.y, this.x + d, this.y + d / 3);
          ctx.quadraticCurveTo(this.x + d, this.y + (d * 3) / 4, this.x + d / 2, this.y + d);
          ctx.quadraticCurveTo(this.x - d, this.y + (d * 3) / 4, this.x - d, this.y + d / 3);
          ctx.quadraticCurveTo(this.x - d, this.y, this.x - d / 2, this.y);
          ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + d / 4);
          ctx.fill();
        } else {
          // Draw small 4-point star/sparkle
          ctx.beginPath();
          ctx.moveTo(this.x, this.y - this.size);
          ctx.quadraticCurveTo(this.x, this.y, this.x + this.size, this.y);
          ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + this.size);
          ctx.quadraticCurveTo(this.x, this.y, this.x - this.size, this.y);
          ctx.quadraticCurveTo(this.x, this.y, this.x, this.y - this.size);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;

      // Spawn particles on movement
      const distance = Math.hypot(mouse.x - mouse.lastX, mouse.y - mouse.lastY);
      if (distance > 3) {
        const count = Math.min(3, Math.floor(distance / 5));
        for (let i = 0; i < count; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          particles.push(new Particle(mouse.x, mouse.y, color));
        }
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
      }
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      }

      // Draw custom pointer circle
      if (mouse.isActive) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300"
    />
  );
};

export default CustomCursor;
