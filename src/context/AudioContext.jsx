// src/context/AudioContext.jsx
import React, { createContext, useContext, useRef, useState } from "react";

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({
    laser: null,
    explosion: [],
  });
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const backgroundMusicRef = useRef(null);

  const initializeAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      await audioContextRef.current.resume();

      if (!soundsLoaded) {
        const laserResponse = await fetch("/assets/sounds/Laser_Shoot4.wav");
        const laserData = await laserResponse.arrayBuffer();
        audioBuffersRef.current.laser =
          await audioContextRef.current.decodeAudioData(laserData);

        const explosionSounds = [
          "/assets/sounds/Explosion.wav",
          "/assets/sounds/Explosion2.wav",
          "/assets/sounds/Explosion3.wav",
          "/assets/sounds/Explosion4.wav",
        ];

        const loadedExplosions = await Promise.all(
          explosionSounds.map(async (path) => {
            const response = await fetch(path);
            const data = await response.arrayBuffer();
            return audioContextRef.current.decodeAudioData(data);
          })
        );

        audioBuffersRef.current.explosion = loadedExplosions;
        setSoundsLoaded(true);

        backgroundMusicRef.current = new Audio(
          "/assets/sounds/background_music.wav"
        );
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = 0.2;
        await backgroundMusicRef.current.play();
      }
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  };

  const playSound = (buffer, volume = 0.7) => {
    if (!audioContextRef.current || !buffer || !soundsLoaded) return;

    try {
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();

      source.buffer = buffer;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      source.start(0);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const value = {
    audioContextRef,
    audioBuffersRef,
    soundsLoaded,
    backgroundMusicRef,
    initializeAudio,
    playSound,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
