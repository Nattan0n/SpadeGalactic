// src/hooks/useGameLoop.js
import { useEffect, useRef } from 'react';
import { 
  updateBossPosition,
  updateEnemyPosition,
  checkBulletCollisions
} from '../Component/game/movement';
import { createPlayerBullets } from '../Component/game/playerUpgrades';

export const useGameLoop = (gameState, actions) => {
  const animationFrameRef = useRef();
  const lastUpdateRef = useRef(Date.now());
  const lastShotTimeRef = useRef(0);

  const updatePositions = (deltaTime, currentTime) => {
    const { 
      playerPosition,
      keysRef,
      enemies,
      boss
    } = gameState;

    const {
      setPlayerPosition,
      setEnemies,
      setBoss
    } = actions;

    // Update player position
    if (keysRef.current.left || keysRef.current.right || 
        keysRef.current.up || keysRef.current.down) {
      setPlayerPosition(prev => {
        const speed = 0.095;
        const horizontalMovement =
          (keysRef.current.right ? speed : 0) -
          (keysRef.current.left ? speed : 0);
        const verticalMovement =
          (keysRef.current.down ? speed : 0) - 
          (keysRef.current.up ? speed : 0);

        const newX = prev.x + horizontalMovement * deltaTime;
        const newY = prev.y + verticalMovement * deltaTime;

        return {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(20, Math.min(90, newY)),
        };
      });
    }

    // Update enemies
    if (enemies.length > 0) {
      setEnemies(prev => 
        prev.map(enemy => updateEnemyPosition(enemy, currentTime, deltaTime))
      );
    }

    // Update boss
    if (boss) {
      setBoss(prev => updateBossPosition(prev, deltaTime));
    }
  };

  const handleShooting = (currentTime) => {
    const {
      playerPosition,
      playerLevel,
    } = gameState;

    const {
      setBullets,
      playLaser
    } = actions;

    // Player shooting
    if (currentTime - lastShotTimeRef.current >= playerLevel.fireRate) {
      const newBullets = createPlayerBullets(
        playerPosition, 
        playerLevel.pattern,
        playerLevel.bulletSpeed,
        playerLevel.bulletWidth
      );
      
      setBullets(prev => [...prev, ...newBullets]);
      lastShotTimeRef.current = currentTime;
      playLaser();
    }

    // Update bullets position
    setBullets(prev =>
      prev.map(bullet => ({
        ...bullet,
        y: bullet.y - bullet.speed
      })).filter(bullet => bullet.y > 0)
    );
  };

  const checkCollisions = () => {
    const {
      bullets,
      enemies,
      boss,
      playerPosition
    } = gameState;

    const {
      setBullets,
      setEnemies,
      setBoss,
      setScore,
      setGameOver,
      setWaveCleared,
      setCurrentWave,
      playExplosion
    } = actions;

    checkBulletCollisions({
      bullets,
      enemies,
      boss,
      playerPosition,
      setBullets,
      setEnemies,
      setBoss,
      setScore,
      setGameOver,
      setWaveCleared,
      setCurrentWave,
      playExplosion
    });
  };

  useEffect(() => {
    const gameLoop = () => {
      if (gameState.gameOver) return;

      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateRef.current;
      lastUpdateRef.current = currentTime;

      updatePositions(deltaTime, currentTime);
      handleShooting(currentTime);
      checkCollisions();

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, actions]);

  return animationFrameRef;
};