// src/hooks/useKeyboardControls.js
import { useRef, useEffect } from 'react';

export const useKeyboardControls = () => {
  const keys = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (keys.current.hasOwnProperty(event.code)) {
        event.preventDefault();
        keys.current[event.code] = true;
      }
    };

    const handleKeyUp = (event) => {
      if (keys.current.hasOwnProperty(event.code)) {
        event.preventDefault();
        keys.current[event.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};