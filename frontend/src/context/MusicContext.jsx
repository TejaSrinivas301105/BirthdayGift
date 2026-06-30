import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // High-quality cinematic ambient emotional piano track
  const DEFAULT_TRACK = 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3'; 

  useEffect(() => {
    // Create the audio element
    audioRef.current = new Audio(DEFAULT_TRACK);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.warn('Playback blocked by browser user interaction policy', err);
        });
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const adjustVolume = (newVal) => {
    const val = Math.max(0, Math.min(1, newVal));
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        playMusic,
        pauseMusic,
        togglePlay,
        volume,
        adjustVolume,
        isMuted,
        toggleMute
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
