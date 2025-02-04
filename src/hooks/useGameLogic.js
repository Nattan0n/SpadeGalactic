// src/hooks/useGameLogic.js
import { useState, useEffect, useRef } from 'react';
import { createBoss, getWaveEnemies } from '../Component/game/spawning';
import { createBossBullets, createEnemyBullets } from '../Component/game/bulletPatterns';
import { playSound } from '../Component/game/audio';

export const useGameLogic = ({ audioAssets }) => {
  // Game state
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 80 });
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [boss, setBoss] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastShotTime, setLastShotTime] = useState(0);
  const [currentWave, setCurrentWave] = useState(1);
  const [waveCleared, setWaveCleared] = useState(true);

  const lastUpdateRef = useRef(Date.now());

  // Spawn new wave
  useEffect(() => {
    if (waveCleared) {
      if (currentWave % 10 === 0) {
        setBoss(createBoss(currentWave));
      }
      setEnemies(getWaveEnemies(currentWave));
      setWaveCleared(false);
    }
  }, [waveCleared, currentWave]);

  const updateGame = (_, keysRef) => {
    if (gameOver) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateRef.current;
    lastUpdateRef.current = currentTime;

    // Update player position
    if (keysRef.current.ArrowLeft || keysRef.current.ArrowRight || 
        keysRef.current.ArrowUp || keysRef.current.ArrowDown) {
      setPlayerPosition((prev) => {
        const speed = 0.095;
        const horizontalMovement =
          (keysRef.current.ArrowRight ? speed : 0) -
          (keysRef.current.ArrowLeft ? speed : 0);
        const verticalMovement =
          (keysRef.current.ArrowDown ? speed : 0) - 
          (keysRef.current.ArrowUp ? speed : 0);

        const newX = prev.x + horizontalMovement * deltaTime;
        const newY = prev.y + verticalMovement * deltaTime;

        return {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(20, Math.min(90, newY)),
        };
      });
    }

    // Player shooting
    if (currentTime - lastShotTime >= 400) {
      setBullets((prev) => [
        ...prev,
        {
          id: currentTime,
          x: playerPosition.x,
          y: playerPosition.y - 3,
        },
      ]);
      setLastShotTime(currentTime);
      if (audioAssets.laser) playSound(audioAssets.laser);
    }

    // Update bullets
    setBullets((prev) =>
      prev
        .map((bullet) => ({ ...bullet, y: bullet.y - 0.15 }))
        .filter((bullet) => bullet.y > 0)
    );

    // Update enemy bullets
    setEnemyBullets((prev) =>
      prev
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + (bullet.speedX || 0) * deltaTime,
          y: bullet.y + (bullet.speedY || 0.1) * deltaTime,
        }))
        .filter((bullet) => {
          if (
            Math.abs(bullet.x - playerPosition.x) < 3 &&
            Math.abs(bullet.y - playerPosition.y) < 3
          ) {
            setGameOver(true);
            if (audioAssets.explosion) playSound(audioAssets.explosion);
            return false;
          }
          return bullet.y < 100 && bullet.x > 0 && bullet.x < 100;
        })
    );

    // Update boss
    if (boss) {
      setBoss(prevBoss => {
        if (!prevBoss) return null;
        
        let updatedBoss = { ...prevBoss };
        updatedBoss.moveTimer += deltaTime;
        const moveSpeed = 0.02;

        switch(updatedBoss.pattern) {
          case 0: // Side to side
            if (updatedBoss.x <= 20 || updatedBoss.x >= 80) {
              updatedBoss.moveDirection *= -1;
            }
            updatedBoss.x += moveSpeed * updatedBoss.moveDirection * deltaTime;
            break;
            
          case 1: // Figure 8 pattern
            const t = updatedBoss.moveTimer * 0.001;
            updatedBoss.x = 50 + Math.sin(t) * 30;
            updatedBoss.y = 15 + Math.sin(t * 2) * 5;
            break;
            
          case 2: // Random teleport
            if (updatedBoss.moveTimer > 3000) {
              updatedBoss.x = 20 + Math.random() * 60;
              updatedBoss.moveTimer = 0;
            }
            break;
        }

        if (currentTime - updatedBoss.lastShot > updatedBoss.shootInterval) {
          const newBullets = createBossBullets(updatedBoss, currentWave);
          setEnemyBullets(prev => [...prev, ...newBullets]);
          updatedBoss.lastShot = currentTime;
        }

        return updatedBoss;
      });
    }

    // Update enemies
    setEnemies((prev) =>
      prev.map((enemy) => {
        let updatedEnemy = { ...enemy };
        
        // Random movement
        updatedEnemy.moveTimer += deltaTime;
        if (currentTime - updatedEnemy.lastMoveChange > 2000) {
          updatedEnemy.moveDirection = Math.random() > 0.5 ? 1 : -1;
          updatedEnemy.lastMoveChange = currentTime;
        }
        
        const newX = updatedEnemy.x + (0.02 * updatedEnemy.moveDirection);
        if (newX >= 10 && newX <= 90) {
          updatedEnemy.x = newX;
        } else {
          updatedEnemy.moveDirection *= -1;
        }

        updatedEnemy.y += 0.02;
        
        if (currentTime - updatedEnemy.lastShot > updatedEnemy.shootInterval) {
          const newBullets = createEnemyBullets(updatedEnemy);
          setEnemyBullets(prev => [...prev, ...newBullets]);
          updatedEnemy.lastShot = currentTime;
        }
        
        return updatedEnemy;
      })
    );

    // Check collisions
    setBullets(prev => 
      prev.filter(bullet => {
        const hitEnemy = enemies.some(enemy =>
          Math.abs(bullet.x - enemy.x) < 3 &&
          Math.abs(bullet.y - enemy.y) < 3
        );

        const hitBoss = boss &&
          Math.abs(bullet.x - boss.x) < 5 &&
          Math.abs(bullet.y - boss.y) < 5;

        if (hitEnemy || hitBoss) {
          if (audioAssets.explosion) playSound(audioAssets.explosion);
          return false;
        }
        return true;
      })
    );

    // Update enemies after collisions
    setEnemies(prev => {
      const updatedEnemies = prev.filter(enemy => {
        const hitByBullet = bullets.some(
          bullet =>
            Math.abs(bullet.x - enemy.x) < 3 &&
            Math.abs(bullet.y - enemy.y) < 3
        );

        if (hitByBullet) {
          enemy.health--;
          if (enemy.health <= 0) {
            setScore(prev => prev + 10 * currentWave);
            return false;
          }
        }

        if (
          Math.abs(enemy.x - playerPosition.x) < 5 &&
          Math.abs(enemy.y - playerPosition.y) < 5
        ) {
          setGameOver(true);
          if (audioAssets.explosion) playSound(audioAssets.explosion);
          return false;
        }

        return enemy.y < 100;
      });

      if (updatedEnemies.length === 0 && !boss) {
        setWaveCleared(true);
        setCurrentWave(wave => wave + 1);
      }

      return updatedEnemies;
    });

    // Update boss after collisions
    if (boss) {
      setBoss(prevBoss => {
        if (!prevBoss) return null;

        const hitByBullet = bullets.some(
          bullet =>
            Math.abs(bullet.x - prevBoss.x) < 5 &&
            Math.abs(bullet.y - prevBoss.y) < 5
        );

        if (hitByBullet) {
          const updatedBoss = { ...prevBoss };
          updatedBoss.health--;
          if (audioAssets.explosion) playSound(audioAssets.explosion);

          if (updatedBoss.health <= 0) {
            setScore(prev => prev + 100 * currentWave);
            setWaveCleared(true);
            setCurrentWave(wave => wave + 1);
            return null;
          }

          return updatedBoss;
        }

        return prevBoss;
      });
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setCurrentWave(1);
    setWaveCleared(true);
    setBullets([]);
    setEnemyBullets([]);
    setEnemies([]);
    setBoss(null);
    setPlayerPosition({ x: 50, y: 80 });
    setLastShotTime(0);
    lastUpdateRef.current = Date.now();
  };

  return {
    gameState: {
      playerPosition,
      bullets,
      enemyBullets,
      enemies,
      boss,
      score,
      gameOver,
      currentWave
    },
    updateGame,
    resetGame
  };
};