// src/hooks/useControls.js
import { useEffect, useRef } from "react";
import { useGameState } from "../context/GameContext";
import { useAudio } from "../context/AudioContext";
import { createPlayerBullets } from "../game/playerUpgrades";
import { createBossBullets, createEnemyBullets } from "../game/enemyPatterns";
import { GAME_CONFIG } from "../constants/gameConfig";

export default function useControls() {
  const { state, dispatch } = useGameState();
  const { playSound, audioBuffersRef } = useAudio();
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const lastUpdateRef = useRef(Date.now());
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (state.gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
          keysRef.current.left = true;
          break;
        case "ArrowRight":
          keysRef.current.right = true;
          break;
        case "ArrowUp":
          keysRef.current.up = true;
          break;
        case "ArrowDown":
          keysRef.current.down = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          keysRef.current.left = false;
          break;
        case "ArrowRight":
          keysRef.current.right = false;
          break;
        case "ArrowUp":
          keysRef.current.up = false;
          break;
        case "ArrowDown":
          keysRef.current.down = false;
          break;
      }
    };

    const updatePlayerMovement = (deltaTime) => {
      if (state.gameOver) return;

      if (
        keysRef.current.left ||
        keysRef.current.right ||
        keysRef.current.up ||
        keysRef.current.down
      ) {
        const speed = GAME_CONFIG.PLAYER.MOVE_SPEED;
        const horizontalMovement =
          (keysRef.current.right ? speed : 0) -
          (keysRef.current.left ? speed : 0);
        const verticalMovement =
          (keysRef.current.down ? speed : 0) - (keysRef.current.up ? speed : 0);

        const newX = state.playerPosition.x + horizontalMovement * deltaTime;
        const newY = state.playerPosition.y + verticalMovement * deltaTime;

        dispatch({
          type: "UPDATE_PLAYER_POSITION",
          payload: {
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(20, Math.min(90, newY)),
          },
        });
      }
    };

    const updateEnemyBullets = (deltaTime) => {
      dispatch({
        type: 'UPDATE_ENEMY_BULLETS',
        payload: state.enemyBullets
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + (bullet.speedX || 0) * deltaTime * 0.1,
            y: bullet.y + (bullet.speedY || 0.1) * deltaTime * 0.1,
          }))
          .filter((bullet) => {
            // Check collision with player
            if (Math.abs(bullet.x - state.playerPosition.x) < GAME_CONFIG.COLLISION.PLAYER_BULLET_THRESHOLD &&
                Math.abs(bullet.y - state.playerPosition.y) < GAME_CONFIG.COLLISION.PLAYER_BULLET_THRESHOLD) {
              dispatch({ type: 'SET_GAME_OVER', payload: true });
              if (audioBuffersRef.current?.explosion?.[0]) {
                playSound(audioBuffersRef.current.explosion[0]);
              }
              return false;
            }
            return bullet.y < 100 && bullet.x > 0 && bullet.x < 100;
          })
      });
    };

    const updateEnemies = (deltaTime, currentTime) => {
      const updatedEnemies = state.enemies
        .map((enemy) => {
          // Enemy movement
          let updatedEnemy = { ...enemy };
          updatedEnemy.moveTimer = (updatedEnemy.moveTimer || 0) + deltaTime;
          updatedEnemy.lastMoveChange = updatedEnemy.lastMoveChange || currentTime;

          if (currentTime - updatedEnemy.lastMoveChange > 2000) {
            updatedEnemy.moveDirection = Math.random() > 0.5 ? 1 : -1;
            updatedEnemy.lastMoveChange = currentTime;
          }

          const newX = updatedEnemy.x + 0.02 * updatedEnemy.moveDirection * deltaTime * 0.1;
          if (newX >= 10 && newX <= 90) {
            updatedEnemy.x = newX;
          } else {
            updatedEnemy.moveDirection *= -1;
          }

          // Enemy shooting
          if (currentTime - updatedEnemy.lastShot > updatedEnemy.shootInterval) {
            const newBullets = createEnemyBullets(updatedEnemy);
            dispatch({ 
              type: 'UPDATE_ENEMY_BULLETS', 
              payload: [...state.enemyBullets, ...newBullets] 
            });
            updatedEnemy.lastShot = currentTime;
          }

          return updatedEnemy;
        })
        .filter((enemy) => {
          // Check collision with player bullets
          const hitByBullet = state.bullets.some(
            (bullet) =>
              Math.abs(bullet.x - enemy.x) < GAME_CONFIG.COLLISION.ENEMY_BULLET_THRESHOLD &&
              Math.abs(bullet.y - enemy.y) < GAME_CONFIG.COLLISION.ENEMY_BULLET_THRESHOLD
          );

          if (hitByBullet) {
            enemy.health--;
            if (enemy.health <= 0) {
              dispatch({ 
                type: 'UPDATE_SCORE', 
                payload: state.score + GAME_CONFIG.SCORE.ENEMY_MULTIPLIER * state.currentWave 
              });
              if (audioBuffersRef.current?.explosion?.[0]) {
                playSound(audioBuffersRef.current.explosion[0]);
              }
              return false;
            }
          }

          // Check collision with player
          if (Math.abs(enemy.x - state.playerPosition.x) < GAME_CONFIG.COLLISION.PLAYER_ENEMY_THRESHOLD &&
              Math.abs(enemy.y - state.playerPosition.y) < GAME_CONFIG.COLLISION.PLAYER_ENEMY_THRESHOLD) {
            dispatch({ type: 'SET_GAME_OVER', payload: true });
            if (audioBuffersRef.current?.explosion?.[0]) {
              playSound(audioBuffersRef.current.explosion[0]);
            }
            return false;
          }

          return enemy.y < 100;
        });

      dispatch({ type: 'UPDATE_ENEMIES', payload: updatedEnemies });

      if (updatedEnemies.length === 0 && !state.boss) {
        dispatch({ type: 'SET_WAVE_CLEARED', payload: true });
        dispatch({ type: 'UPDATE_WAVE', payload: state.currentWave + 1 });
      }
    };

    const updateBoss = (deltaTime, currentTime) => {
      if (!state.boss) return;

      let updatedBoss = { ...state.boss };

      // Boss movement pattern
      updatedBoss.moveTimer = (updatedBoss.moveTimer || 0) + deltaTime;
      const moveSpeed = 0.02;

      switch (updatedBoss.pattern) {
        case 0: // Side to side
          if (updatedBoss.x <= 20 || updatedBoss.x >= 80) {
            updatedBoss.moveDirection *= -1;
          }
          updatedBoss.x += moveSpeed * updatedBoss.moveDirection * deltaTime * 0.1;
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

      // Boss shooting
      if (currentTime - updatedBoss.lastShot > updatedBoss.shootInterval) {
        const newBullets = createBossBullets(updatedBoss, state.currentWave);
        dispatch({ 
          type: 'UPDATE_ENEMY_BULLETS', 
          payload: [...state.enemyBullets, ...newBullets] 
        });
        updatedBoss.lastShot = currentTime;
      }

      // Check bullet collisions with boss
      const hitByBullet = state.bullets.some(
        (bullet) =>
          Math.abs(bullet.x - updatedBoss.x) < GAME_CONFIG.COLLISION.BOSS_BULLET_THRESHOLD &&
          Math.abs(bullet.y - updatedBoss.y) < GAME_CONFIG.COLLISION.BOSS_BULLET_THRESHOLD
      );

      if (hitByBullet) {
        updatedBoss.health--;
        if (audioBuffersRef.current?.explosion?.[0]) {
          playSound(audioBuffersRef.current.explosion[0]);
        }

        if (updatedBoss.health <= 0) {
          dispatch({ 
            type: 'UPDATE_SCORE', 
            payload: state.score + GAME_CONFIG.SCORE.BOSS_MULTIPLIER * state.currentWave 
          });
          dispatch({ type: 'SET_WAVE_CLEARED', payload: true });
          dispatch({ type: 'UPDATE_WAVE', payload: state.currentWave + 1 });
          dispatch({ type: 'UPDATE_BOSS', payload: null });
          return;
        }
      }

      dispatch({ type: 'UPDATE_BOSS', payload: updatedBoss });
    };

    const gameLoop = () => {
      if (state.gameOver) return;

      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateRef.current;
      lastUpdateRef.current = currentTime;

      // Update player movement
      updatePlayerMovement(deltaTime);

      // Player shooting
      if (!state.gameOver && currentTime - state.lastShotTime >= state.playerUpgrades.fireRate) {
        const newBullets = createPlayerBullets(
          state.playerPosition,
          state.playerUpgrades.shootPattern,
          state.playerUpgrades.bulletSpeed,
          state.playerUpgrades.bulletWidth
        );
        dispatch({
          type: 'UPDATE_BULLETS',
          payload: [...state.bullets, ...newBullets]
        });
        dispatch({ type: 'UPDATE_LAST_SHOT_TIME', payload: currentTime });
        if (audioBuffersRef.current?.laser) {
          playSound(audioBuffersRef.current.laser);
        }
      }

      // Update bullets
      const updatedBullets = state.bullets
        .map((bullet) => ({
          ...bullet,
          y: bullet.y + (bullet.speedY || -state.playerUpgrades.bulletSpeed) * deltaTime * 0.1,
          x: bullet.x + (bullet.speedX || 0) * deltaTime * 0.1,
        }))
        .filter((bullet) => bullet.y > 0);

      dispatch({ type: 'UPDATE_BULLETS', payload: updatedBullets });

      // Update enemy bullets, enemies, and boss
      updateEnemyBullets(deltaTime);
      updateEnemies(deltaTime, currentTime);
      updateBoss(deltaTime, currentTime);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Touch controls
    const gameContainerRef = document.querySelector("[data-game-container]");
    let isDragging = false;

    const handleTouchStart = (e) => {
      if (state.gameOver) return;
      isDragging = true;
      updatePlayerPositionFromTouch(e.touches[0]);
    };

    const handleTouchMove = (e) => {
      if (!isDragging || state.gameOver) return;
      e.preventDefault();
      updatePlayerPositionFromTouch(e.touches[0]);
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const updatePlayerPositionFromTouch = (touch) => {
      if (!gameContainerRef) return;

      const rect = gameContainerRef.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;

      dispatch({
        type: "UPDATE_PLAYER_POSITION",
        payload: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(20, Math.min(90, y)),
        },
      });
    };

    // Set up event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    if (gameContainerRef) {
      gameContainerRef.addEventListener("touchstart", handleTouchStart);
      gameContainerRef.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      gameContainerRef.addEventListener("touchend", handleTouchEnd);
    }

    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (gameContainerRef) {
        gameContainerRef.removeEventListener("touchstart", handleTouchStart);
        gameContainerRef.removeEventListener("touchmove", handleTouchMove);
        gameContainerRef.removeEventListener("touchend", handleTouchEnd);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, dispatch, playSound, audioBuffersRef]);
}