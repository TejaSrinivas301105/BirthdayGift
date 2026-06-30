import React, { useState, useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

// Fixed bar heights for the EQ visualizer — computed once, not on every render
const BAR_HEIGHTS = [10, 14, 8, 12];
const BAR_DELAYS  = ['0s', '0.15s', '0.3s', '0.1s'];

const MusicPlayer = () => {
  const { isPlaying, togglePlay, volume, adjustVolume, isMuted, toggleMute } = useMusic();
  const [showVolume, setShowVolume] = useState(false);

  return (
    <div 
      className="fixed top-6 right-6 z-[90] flex items-center gap-3 px-4 py-2 bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg hover:border-white/20 transition-all duration-300 group"
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      {/* Visualizer bars — fixed heights, CSS animation only, no Math.random in render */}
      <div className="flex items-end gap-[3px] h-4 w-5 mr-1 overflow-hidden">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="w-[3px] bg-purple-500 rounded-full"
            style={{
              height: isPlaying ? `${h}px` : '4px',
              transition: 'height 0.3s ease',
              animation: isPlaying ? `pulse ${0.4 + i * 0.15}s ease-in-out ${BAR_DELAYS[i]} infinite alternate` : 'none',
            }}
          />
        ))}
      </div>

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:scale-105 transition-all duration-200 shadow-md shadow-purple-500/20"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      <button
        onClick={toggleMute}
        aria-label={isMuted || volume === 0 ? 'Unmute music' : 'Mute music'}
        className="text-white/70 hover:text-white transition-colors duration-200"
      >
        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Slide-out Volume Slider */}
      <div 
        className={`flex items-center overflow-hidden transition-all duration-300 ${
          showVolume ? 'w-20 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => adjustVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none"
        />
      </div>
      
      <span className="text-[10px] text-white/50 font-medium tracking-wide uppercase max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap">
        {isPlaying ? "Asritha's Theme" : "Play Theme"}
      </span>
    </div>
  );
};

export default MusicPlayer;
