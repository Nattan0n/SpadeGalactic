// src/game/audio.js
export const createAudio = (path) => {
  const audio = new Audio(path);
  audio.addEventListener("error", (e) => {
    console.error(`Error loading audio ${path}:`, e);
  });
  return audio;
};

export const initializeAudio = (sounds) => {
  try {
    sounds.forEach((sound) => {
      sound.volume = 0.3;
      sound.load();
    });
    return true;
  } catch (error) {
    console.error("Error initializing audio:", error);
    return false;
  }
};

export const playSound = (sound) => {
  if (sound.readyState >= 2) {
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Ignore error - might be due to user not interacting yet
    });
  }
};

export const playRandomSound = (sounds) => {
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  playSound(randomSound);
};
