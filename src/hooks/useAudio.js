// src/hooks/useAudio.js
import { useState, useEffect, useRef } from "react";
import {
  createAudio,
  initializeAudio,
  playSound,
  playRandomSound,
} from "../Component/game/audio";

export const useAudio = () => {
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const laserSound = useRef(createAudio());
  const explosionSounds = useRef([
    createAudio(),
    createAudio(),
    createAudio(),
    createAudio(),
  ]);

  useEffect(() => {
    const loadSounds = async () => {
      const success = await initializeAudio([
        laserSound.current,
        ...explosionSounds.current,
      ]);
      setSoundsLoaded(success);
    };

    loadSounds();
  }, []);

  return {
    soundsLoaded,
    playLaser: () => playSound(laserSound.current),
    playExplosion: () => playRandomSound(explosionSounds.current),
  };
};
