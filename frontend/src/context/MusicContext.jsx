import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const MusicContext = createContext();

// 🎵 Page-specific tracks — replace URLs with your own Cloudinary/local files
export const PAGE_TRACKS = {
  '/':        { url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',  name: 'Dreamy Welcome' },
  '/login':   { url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',  name: 'Gentle Stars' },
  '/entry':   { url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',  name: 'World Entry' },
  '/journey': { url: 'https://res.cloudinary.com/dyqeqadm5/video/upload/v1782834369/Memories-Bring-Back_1_cavxts.mp3',  name: 'Our Journey' },
  '/album':   { url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3',  name: 'Memory Lane' },
  '/feedback':{ url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',  name: 'Grateful Heart' },
  '/final':   { url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',  name: 'Forever & Always' },
};

// 🎂 Special override track — plays when fireworks are active
const HAPPY_BIRTHDAY_TRACK = {
  url: 'https://res.cloudinary.com/dyqeqadm5/video/upload/v1782926509/I_Wish_You_Happy_Birthday_Song_Mp3_Ringtone_Download_Audio_hejqdg.mp3',
  name: '🎂 Happy Birthday Asritha!',
};

export const MusicProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState('');
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const specialAudioRef = useRef(null); // separate audio element for birthday song
  const currentPageTrackRef = useRef(PAGE_TRACKS['/'].url); // track the current page song url
  const currentPathRef = useRef('/'); // track the current path

  useEffect(() => {
    audioRef.current = new Audio(PAGE_TRACKS['/'].url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    setCurrentTrackName(PAGE_TRACKS['/'].name);

    // Auto-start on first user interaction (bypasses browser autoplay policy)
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Track current page url when changeTrack is called
  const changeTrack = (path) => {
    const track = PAGE_TRACKS[path] || PAGE_TRACKS['/'];
    currentPageTrackRef.current = track.url;
    currentPathRef.current = path; // Store current path
    if (!audioRef.current || audioRef.current.src.includes(encodeURIComponent(track.url)) || audioRef.current.src === track.url) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const targetVolume = isMuted ? 0 : volume;

    // Fade out current track
    const fadeOut = setInterval(() => {
      if (!audioRef.current) { clearInterval(fadeOut); return; }
      if (audioRef.current.volume > 0.05) {
        audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
      } else {
        clearInterval(fadeOut);
        audioRef.current.pause();
        audioRef.current.src = track.url;
        audioRef.current.volume = 0;
        setCurrentTrackName(track.name);

        if (isPlaying) {
          audioRef.current.play().catch(() => {});

          // Fade in new track
          const fadeIn = setInterval(() => {
            if (!audioRef.current) { clearInterval(fadeIn); return; }
            if (audioRef.current.volume < targetVolume - 0.05) {
              audioRef.current.volume = Math.min(targetVolume, audioRef.current.volume + 0.05);
            } else {
              audioRef.current.volume = targetVolume;
              clearInterval(fadeIn);
            }
          }, 50);
          fadeIntervalRef.current = fadeIn;
        }
      }
    }, 50);

    fadeIntervalRef.current = fadeOut;
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Playback blocked', err));
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => isPlaying ? pauseMusic() : playMusic();

  const adjustVolume = (newVal) => {
    const val = Math.max(0, Math.min(1, newVal));
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  // Fade helper
  const fadeTo = (audioEl, targetVol, duration = 800, onDone) => {
    if (!audioEl) return;
    const steps = 20;
    const interval = duration / steps;
    const delta = (targetVol - audioEl.volume) / steps;
    let count = 0;
    const t = setInterval(() => {
      count++;
      audioEl.volume = Math.max(0, Math.min(1, audioEl.volume + delta));
      if (count >= steps) {
        clearInterval(t);
        audioEl.volume = targetVol;
        onDone && onDone();
      }
    }, interval);
    return t;
  };

  // Play happy birthday song — fade out page track, play birthday, restore after
  const playSpecial = () => {
    if (!audioRef.current) return;
    const targetVol = isMuted ? 0 : volume;

    // Fade out page track
    fadeTo(audioRef.current, 0, 600, () => {
      audioRef.current.pause();

      // Create & play birthday track
      if (specialAudioRef.current) {
        specialAudioRef.current.pause();
        specialAudioRef.current = null;
      }
      const bday = new Audio(HAPPY_BIRTHDAY_TRACK.url);
      bday.volume = targetVol;
      bday.loop = true;
      bday.play().catch(() => {});
      specialAudioRef.current = bday;
      setCurrentTrackName(HAPPY_BIRTHDAY_TRACK.name);
    });
  };

  // Stop birthday song — fade it out, resume page track
  const stopSpecial = () => {
    if (!specialAudioRef.current) return;
    const targetVol = isMuted ? 0 : volume;
    const bday = specialAudioRef.current;

    fadeTo(bday, 0, 600, () => {
      bday.pause();
      specialAudioRef.current = null;

      // Resume page track
      if (audioRef.current) {
        // Make sure the audio source is set to the current page track
        audioRef.current.src = currentPageTrackRef.current;
        audioRef.current.volume = 0;
        audioRef.current.play().catch(() => {});
        fadeTo(audioRef.current, targetVol, 800);
        
        // Find the track name based on the current path
        const currentTrack = PAGE_TRACKS[currentPathRef.current] || PAGE_TRACKS['/'];
        setCurrentTrackName(currentTrack.name);
      }
    });
  };

  return (
    <MusicContext.Provider value={{
      isPlaying, playMusic, pauseMusic, togglePlay,
      volume, adjustVolume, isMuted, toggleMute,
      currentTrackName, changeTrack,
      playSpecial, stopSpecial
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
