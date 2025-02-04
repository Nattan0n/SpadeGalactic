// src/hooks/useAudio.js
import { useEffect } from "react";
import { useAudio as useAudioContext } from "../context/AudioContext";

export default function useAudio() {
  const {
    audioContextRef,
    audioBuffersRef,
    soundsLoaded,
    backgroundMusicRef,
    initializeAudio,
    playSound,
  } = useAudioContext();

  // Automatically clean up audio context when component unmounts
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  // Helper functions for common sound effects
  const playLaser = () => {
    if (!soundsLoaded || !audioBuffersRef.current.laser) return;
    playSound(audioBuffersRef.current.laser);
  };

  const playExplosion = () => {
    if (!soundsLoaded || !audioBuffersRef.current.explosion.length) return;
    const randomBuffer =
      audioBuffersRef.current.explosion[
        Math.floor(Math.random() * audioBuffersRef.current.explosion.length)
      ];
    playSound(randomBuffer);
  };

  const toggleBackgroundMusic = async (shouldPlay = true) => {
    if (!backgroundMusicRef.current) return;

    try {
      if (shouldPlay) {
        backgroundMusicRef.current.volume = 0.2;
        await backgroundMusicRef.current.play();
      } else {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }
    } catch (error) {
      console.error("Error toggling background music:", error);
    }
  };

  const setBackgroundMusicVolume = (volume) => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return {
    isAudioReady: soundsLoaded,
    initializeAudio,
    playLaser,
    playExplosion,
    toggleBackgroundMusic,
    setBackgroundMusicVolume,
  };
}
