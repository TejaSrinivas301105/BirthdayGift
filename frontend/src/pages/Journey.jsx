import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import BirthdayCake3D from '../components/BirthdayCake3D';
import { useApp } from '../context/AppContext';
import { useMusic } from '../context/MusicContext';
import { Heart, Sparkles, Navigation, Calendar, CloudSnow, Flame, Compass, ChevronLeft, ChevronRight, Pause, Play, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const timelineData = [
  {
    step: 1,
    title: "The Day We Met",
    description: "A simple, ordinary day that turned out to be the beginning of something truly extraordinary in my life. Who knew our paths crossing would lead to this beautiful universe?",
    image: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782819171/journey-day-we-met.jpg.jpg",
    date: "A Beautiful Day"
  },
  {
    step: 2,
    title: "The Day We Became Friends",
    description: "From strangers sharing small talks to friends sharing laughter, secrets, and dreams. The connection clicked, and our friendship blossomed into a safe haven of trust.",
    image: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782819172/WhatsApp_Image_2026-06-30_at_4.58.58_PM_1_olktgz.jpg",
    date: "The Magic Connection"
  },
  {
    step: 3,
    title: "The Day We Became Friends",
    description: "The day we played Holi on our campus — colours everywhere, laughter louder than ever, and a memory that painted our friendship in the brightest shades forever.",
    image: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782930791/WhatsApp_Image_2026-07-02_at_12.01.49_AM_dtllci.jpg",
    date: "The Magic Connection",
    objectFit: "contain"
  },
  {
    step: 4,
    title: "The Memories We Created",
    description: "Countless inside jokes, spontaneous calls, and shared moments of comfort. Each memory is a golden thread woven into the fabric of my happiest days.",
    image: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782819180/WhatsApp_Image_2026-06-30_at_4.58.58_PM_of2cmg.jpg",
    date: "Infinite Laughs"
  },
  {
    step: 5,
    title: "The Smiles You Gave",
    description: "Whenever things got heavy, your smile and cheerful energy acted as a bright beacon of sunshine. Thank you for lighting up my world with your beautiful laugh.",
    image: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874003/WhatsApp_Image_2026-07-01_at_8.10.49_AM_2_svjoix.jpg",
    date: "Warmth & Joy"
  },
  {
    step: 6,
    title: "The Moments We Will Keep Forever",
    description: "No matter where life takes us, or how busy we get, these precious moments of genuine friendship will remain locked in my heart, forever cherished and protected.",
    image: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874005/WhatsApp_Image_2026-07-01_at_8.10.50_AM_zjp6ux.jpg",
    date: "Forever & Always"
  }
];

// All friendship memory photos for the slideshow
const friendshipPhotos = [
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874003/WhatsApp_Image_2026-07-01_at_8.10.49_AM_2_svjoix.jpg",
    caption: "The Day We Met",
    sub: "A Beautiful Day"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874004/WhatsApp_Image_2026-07-01_at_8.10.52_AM_bidskb.jpg",
    caption: "The Day We Became Friends",
    sub: "The Magic Connection"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874002/WhatsApp_Image_2026-07-01_at_8.10.49_AM_1_m7kae2.jpg",
    caption: "The Memories We Created",
    sub: "Infinite Laughs"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874003/WhatsApp_Image_2026-07-01_at_8.10.51_AM_ulrwhk.jpg",
    caption: "The Smiles You Gave",
    sub: "Warmth & Joy",
    objectFit: "contain",
    objectPosition: "center"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874002/WhatsApp_Image_2026-07-01_at_8.10.51_AM_2_ujtwel.jpg",
    caption: "The Moments We Will Keep Forever",
    sub: "Forever & Always"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874005/WhatsApp_Image_2026-07-01_at_8.10.50_AM_zjp6ux.jpg",
    caption: "Side by Side or Miles Apart",
    sub: "Always Together"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782925595/Friend_phot_yarfj1.jpg",
    caption: "Friends Who Laugh Together, Stay Together",
    sub: "Pure Joy & Chaos",
    objectFit: "contain",
    objectPosition: "center"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874004/WhatsApp_Image_2026-07-01_at_8.10.51_AM_1_jvzd6a.jpg",
    caption: "You Make Every Moment Brighter",
    sub: "Golden Memories",
    objectFit: "contain",
    objectPosition: "center"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874004/WhatsApp_Image_2026-07-01_at_8.10.49_AM_kmhxx7.jpg",
    caption: "A Friend Like You Is Hard to Find",
    sub: "One in a Million"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782874002/WhatsApp_Image_2026-07-01_at_8.10.48_AM_1_g15bjo.jpg",
    caption: "Here's to All the Memories We've Made",
    sub: "Cherished Forever",
    objectFit: "contain"
  },
  {
    src: "https://res.cloudinary.com/dyqeqadm5/image/upload/v1782930776/Friend_2_eqjdaw.jpg",
    caption: "The Memories We Created",
    sub: "Infinite Laughs"
  }

];

const FriendshipSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const total = friendshipPhotos.length;

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, total]);

  const prev = () => setCurrent(p => (p - 1 + total) % total);
  const next = () => setCurrent(p => (p + 1) % total);

  return (
    <div className="w-full max-w-3xl mx-auto mt-16 mb-10">
      {/* Section label */}
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-pink-400 font-bold">Our Friendship Story</span>
        <h3 className="text-2xl md:text-3xl font-black mt-2 bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
          Every Moment With You ✨
        </h3>
      </div>

      {/* Main slide frame */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900" style={{ aspectRatio: '16/9' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={friendshipPhotos[current].src}
            alt={friendshipPhotos[current].caption}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            style={{ objectFit: friendshipPhotos[current].objectFit || 'cover', objectPosition: friendshipPhotos[current].objectPosition || 'center top' }}
            className="absolute inset-0 w-full h-full"
          />
        </AnimatePresence>

        {/* Dark gradient bottom overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${current}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-0 inset-x-0 p-6 text-center"
          >
            <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold mb-1">
              {friendshipPhotos[current].sub}
            </p>
            <p className="text-white text-lg md:text-xl font-serif italic font-light drop-shadow-lg">
              "{friendshipPhotos[current].caption}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Left / Right arrow buttons */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        {/* Play / Pause button */}
        <button
          onClick={() => setIsPlaying(p => !p)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white backdrop-blur-sm transition-all cursor-pointer"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {friendshipPhotos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === current
                ? 'w-6 h-2 bg-pink-500'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 mx-auto w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          key={current}
          className="h-full bg-gradient-to-r from-pink-500 to-amber-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: isPlaying ? '100%' : '0%' }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

const Journey = ({ onNext }) => {
  const { 
    snowActive, setSnowActive, 
    fireworksActive, setFireworksActive, 
    lanternsActive, setLanternsActive 
  } = useApp();
  const { playSpecial, stopSpecial } = useMusic();
  const navigate = useNavigate();

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Confetti fires once when birthday section scrolls into view
  const birthdaySectionRef = useRef(null);
  const confettiFiredRef = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !confettiFiredRef.current) {
          confettiFiredRef.current = true;
          const defaults = {
            spread: 360, ticks: 100, gravity: 0.7, decay: 0.93,
            startVelocity: 30, colors: ['#ec4899', '#7c3aed', '#fbbf24', '#ffffff']
          };
          confetti({ ...defaults, particleCount: 60, scalar: 1.2 });
          setTimeout(() => confetti({ ...defaults, particleCount: 40, scalar: 0.9, origin: { x: 0.3 } }), 200);
          setTimeout(() => confetti({ ...defaults, particleCount: 40, scalar: 0.9, origin: { x: 0.7 } }), 400);
        }
      },
      { threshold: 0.4 }
    );
    if (birthdaySectionRef.current) observer.observe(birthdaySectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden pb-24">
      {/* Aurora glow backdrops */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[60vh] right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Skip to Memory Album button — top right */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 18px rgba(236,72,153,0.4)' }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/album')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900/70 border border-pink-500/40 text-pink-300 text-xs font-bold rounded-full backdrop-blur-md hover:border-pink-500 hover:text-white transition-all duration-300 cursor-pointer shadow-lg"
      >
        <Image size={13} /> Skip to Memory Album 💖
      </motion.button>

      {/* Hero header */}
      <div className="max-w-4xl mx-auto text-center pt-28 pb-12 px-6">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] text-pink-500 font-bold"
        >
          Our Story
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold mt-3 tracking-tight bg-gradient-to-r from-white via-purple-300 to-pink-200 bg-clip-text text-transparent"
        >
          Our Friendship Journey
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-sm md:text-base text-white/50 max-w-xl mx-auto mt-4 font-light leading-relaxed"
        >
          A look back at the beautiful chapters we've written together, and a celebrate of the bond we share.
        </motion.p>
      </div>

      {/* Timeline track container */}
      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Central line */}
        <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500/20 via-pink-500/30 to-amber-500/20" />

        {/* Timeline list */}
        <div className="flex flex-col gap-24 relative">
          {timelineData.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={item.step}
                className={`flex flex-col md:flex-row items-start relative ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot with pulsing ring */}
                <div className="absolute left-0 md:left-1/2 top-1.5 md:-translate-x-1/2 z-20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Heart size={12} className="text-pink-500 animate-pulse" />
                  </div>
                  <div className="absolute w-12 h-12 rounded-full border border-pink-500/30 animate-ping opacity-30" />
                </div>

                {/* Left/Right Card column spacer */}
                <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-12 flex justify-start md:justify-end">
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 40 : -40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ y: -6 }}
                    className="relative w-full max-w-lg bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl hover:border-pink-500/30 shadow-xl group transition-all duration-300 overflow-hidden"
                  >
                    {/* Glass Reflection effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    {/* Image frame */}
                    <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden mb-6 shadow-inner border border-white/10">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to Unsplash if Cloudinary image fails
                          const fallbacks = {
                            'journey-day-we-met': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop',
                            'journey-became-friends': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
                            'journey-memories-created': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
                            'journey-smiles-you-gave': 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=800&auto=format&fit=crop',
                            'journey-moments-forever': 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop'
                          };
                          const key = Object.keys(fallbacks)[item.step - 1];
                          e.target.src = fallbacks[key] || fallbacks['journey-day-we-met'];
                        }}
                        style={{ objectFit: item.objectFit || 'cover', objectPosition: item.objectPosition || 'center' }}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {/* Image overlay glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      <span className="absolute bottom-3 left-4 text-xs font-semibold text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                        <Calendar size={10} /> {item.date}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-3 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                </div>

                {/* Empty column placeholder for layout spacing */}
                <div className="hidden md:block w-1/2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Birthday Celebration Section */}
      <div ref={birthdaySectionRef} data-birthday-section className="relative max-w-4xl mx-auto px-6 mt-32 py-16 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.span 
          initial={{ scale: 0.9 }}
          whileInView={{ scale: [0.9, 1.1, 1] }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl"
        >
          🎂
        </motion.span>
        
        <h2 className="text-4xl md:text-6xl font-black mt-4 tracking-tight bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
          Happy Birthday Asritha 🎂
        </h2>

        {/* 3D Cake mounting */}
        <div className="my-8 flex justify-center">
          <BirthdayCake3D />
        </div>

        {/* Interactive Surprise HUD */}
        <div className="w-full max-w-md bg-slate-900/50 border border-white/10 p-5 rounded-2xl mb-8">
          <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-bold flex items-center justify-center gap-1.5">
            <Compass size={12} /> Interactive Magical Controls
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSnowActive(!snowActive)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 text-xs font-semibold ${
                snowActive 
                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-slate-950/40 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <CloudSnow size={18} className={snowActive ? 'animate-bounce' : ''} />
              <span>{snowActive ? 'Snowing ❄️' : 'Snow Off'}</span>
            </button>

            <button
              onClick={() => setLanternsActive(!lanternsActive)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 text-xs font-semibold ${
                lanternsActive 
                  ? 'bg-amber-600/30 border-amber-500 text-white shadow-md shadow-amber-500/20' 
                  : 'bg-slate-950/40 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <Compass size={18} className={lanternsActive ? 'animate-spin' : ''} />
              <span>{lanternsActive ? 'Lanterns 🏮' : 'Lanterns Off'}</span>
            </button>

            <button
              onClick={() => {
                const next = !fireworksActive;
                setFireworksActive(next);
                if (next) {
                  setSnowActive(false);
                  playSpecial();
                } else {
                  stopSpecial();
                }
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 text-xs font-semibold ${
                fireworksActive 
                  ? 'bg-pink-600/30 border-pink-500 text-white shadow-md shadow-pink-500/20' 
                  : 'bg-slate-950/40 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <Flame size={18} className={fireworksActive ? 'animate-pulse text-pink-500' : ''} />
              <span>{fireworksActive ? 'Fireworks 🎆' : 'Fireworks Off'}</span>
            </button>
          </div>
        </div>

        {/* Friendship Slideshow — after birthday section */}
        <FriendshipSlideshow />

        {/* Emotion birthday message letter card */}
        <div className="max-w-xl text-purple-200/90 text-sm md:text-base font-serif italic leading-relaxed px-4 md:px-8 mb-8 border-l-2 border-pink-500/40 py-2">
          "On this special day, may your world be filled with infinite happiness, laughter, and magical moments. You have been a wonderful presence, bringing smiles and light wherever you go. I hope you enjoy this surprise, and may all your heartfelt dreams become a beautiful reality."
        </div>

        {/* Proceed button */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full border border-white/10 shadow-lg tracking-wide cursor-pointer flex items-center gap-2"
        >
          Go To Memory Album 💖
        </motion.button>
      </div>
    </div>
  );
};

export default Journey;
