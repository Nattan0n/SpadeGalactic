import React, { useState, useEffect, useRef } from "react";
import { getPlayerUpgrades, createPlayerBullets } from "./game/playerUpgrades";

const SpaceShooterGame = () => {
  const animationFrameRef = useRef();
  const lastUpdateRef = useRef(Date.now());
  const keysRef = useRef({ left: false, right: false, up: false, down: false });

  // Audio setup
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({
    laser: null,
    explosion: [],
  });
  const [soundsLoaded, setSoundsLoaded] = useState(false);

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
  const [playerUpgrades, setPlayerUpgrades] = useState(getPlayerUpgrades(1));

  // อัพเดท player upgrades เมื่อผ่านแต่ละเวฟ
  useEffect(() => {
    setPlayerUpgrades(getPlayerUpgrades(currentWave));
  }, [currentWave]);

  // Boss creation function
  const createBoss = (wave) => {
    const bossHealth = wave * 50;
    return {
      id: "boss-" + wave,
      x: 50,
      y: 10,
      health: bossHealth,
      maxHealth: bossHealth,
      type: "boss",
      lastShot: 0,
      shootInterval: Math.max(1000 - wave * 30, 300),
      moveDirection: 1,
      pattern: wave % 3,
      moveTimer: 0,
    };
  };

  // Wave configuration
  const getWaveEnemies = (wave) => {
    if (wave % 10 === 0) {
      setBoss(createBoss(wave));
      return [];
    }

    const basePositions = [];
    const enemyCount = Math.min(3 + Math.floor(wave / 5), 8);

    for (let i = 0; i < enemyCount; i++) {
      basePositions.push({
        x: 20 + (60 * i) / (enemyCount - 1),
        y: 0,
      });
    }

    return basePositions.map((pos) => ({
      id: Math.random(),
      x: pos.x,
      y: pos.y,
      health: Math.ceil(wave / 3),
      lastShot: 0,
      shootInterval: Math.max(2000 - wave * 50, 500),
      moveDirection: Math.random() > 0.5 ? 1 : -1,
      bulletSpeed: Math.min(0.05 + wave * 0.002, 0.1),
      moveTimer: 0,
      lastMoveChange: 0,
    }));
  };

  // Initialize audio context and load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        const laserResponse = await fetch(
          "/src/assets/sounds/Laser_Shoot4.wav"
        );
        const laserData = await laserResponse.arrayBuffer();
        audioBuffersRef.current.laser =
          await audioContextRef.current.decodeAudioData(laserData);

        const explosionSounds = [
          "/assets/sounds/Explosion1.wav",
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
      } catch (error) {
        console.error("Error loading sounds:", error);
      }
    };

    loadSounds();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Sound playing functions
  const playSound = (buffer, volume = 0.3) => {
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

  const playLaser = () => {
    playSound(audioBuffersRef.current.laser);
  };

  const playExplosion = () => {
    if (!audioBuffersRef.current.explosion.length) return;
    const randomBuffer =
      audioBuffersRef.current.explosion[
        Math.floor(Math.random() * audioBuffersRef.current.explosion.length)
      ];
    playSound(randomBuffer);
  };

  // Boss bullet patterns
  const createBossBullets = (boss, wave) => {
    const bullets = [];
    const baseSpeed = 0.05 + wave * 0.001;

    switch (boss.pattern) {
      case 0: // Spread shot
        for (let i = -2; i <= 2; i++) {
          bullets.push({
            id: Math.random(),
            x: boss.x,
            y: boss.y + 5,
            speedX: baseSpeed * i,
            speedY: baseSpeed,
          });
        }
        break;

      case 1: // Wave shot
        for (let i = 0; i < 3; i++) {
          bullets.push({
            id: Math.random(),
            x: boss.x + (i - 1) * 10,
            y: boss.y + 5,
            speedX: Math.sin(Date.now() * 0.001) * baseSpeed,
            speedY: baseSpeed,
          });
        }
        break;

      case 2: // Rotating shot
        const angle = (Date.now() * 0.001) % (Math.PI * 2);
        for (let i = 0; i < 4; i++) {
          const bulletAngle = angle + (i * Math.PI) / 2;
          bullets.push({
            id: Math.random(),
            x: boss.x,
            y: boss.y + 5,
            speedX: Math.cos(bulletAngle) * baseSpeed,
            speedY: Math.sin(bulletAngle) * baseSpeed,
          });
        }
        break;
    }

    return bullets;
  };

  // Regular enemy bullets
  const createEnemyBullets = (enemy) => {
    const bullets = [];
    const baseSpeed = enemy.bulletSpeed || 0.05;
    bullets.push({
      id: Math.random(),
      x: enemy.x,
      y: enemy.y + 5,
      speedX: 0,
      speedY: baseSpeed,
    });

    bullets.push({
      id: Math.random(),
      x: enemy.x,
      y: enemy.y + 5,
      speedX: -baseSpeed * 0.5,
      speedY: baseSpeed * 0.8,
    });

    bullets.push({
      id: Math.random(),
      x: enemy.x,
      y: enemy.y + 5,
      speedX: baseSpeed * 0.5,
      speedY: baseSpeed * 0.8,
    });

    return bullets;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver]);

  // Main game loop
  const gameLoop = () => {
    if (gameOver) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateRef.current;
    lastUpdateRef.current = currentTime;

    // Update player position
    if (
      keysRef.current.left ||
      keysRef.current.right ||
      keysRef.current.up ||
      keysRef.current.down
    ) {
      setPlayerPosition((prev) => {
        const speed = 0.095;
        const horizontalMovement =
          (keysRef.current.right ? speed : 0) -
          (keysRef.current.left ? speed : 0);
        const verticalMovement =
          (keysRef.current.down ? speed : 0) - (keysRef.current.up ? speed : 0);

        const newX = prev.x + horizontalMovement * deltaTime;
        const newY = prev.y + verticalMovement * deltaTime;

        return {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(20, Math.min(90, newY)),
        };
      });
    }

    // Player shooting
    if (currentTime - lastShotTime >= playerUpgrades.fireRate) {
      // ใช้ fireRate จาก upgrades
      const newBullets = createPlayerBullets(
        playerPosition,
        playerUpgrades.shootPattern,
        playerUpgrades.bulletSpeed,
        playerUpgrades.bulletWidth
      );
      setBullets((prev) => [...prev, ...newBullets]);
      setLastShotTime(currentTime);
      playLaser();
    }

    // Update bullets
    setBullets((prev) =>
      prev
        .map((bullet) => ({
          ...bullet,
          y: bullet.y + (bullet.speedY || -playerUpgrades.bulletSpeed), // ใช้ความเร็วจาก upgrades
          x: bullet.x + (bullet.speedX || 0),
        }))
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
            playExplosion();
            return false;
          }
          return bullet.y < 100 && bullet.x > 0 && bullet.x < 100;
        })
    );

    // Update enemies
    setEnemies((prev) => {
      const updatedEnemies = prev
        .map((enemy) => {
          let updatedEnemy = { ...enemy };

          // Random movement
          updatedEnemy.moveTimer += deltaTime;
          if (currentTime - updatedEnemy.lastMoveChange > 2000) {
            updatedEnemy.moveDirection = Math.random() > 0.5 ? 1 : -1;
            updatedEnemy.lastMoveChange = currentTime;
          }

          const newX = updatedEnemy.x + 0.02 * updatedEnemy.moveDirection;
          if (newX >= 10 && newX <= 90) {
            updatedEnemy.x = newX;
          } else {
            updatedEnemy.moveDirection *= -1;
          }

          if (
            currentTime - updatedEnemy.lastShot >
            updatedEnemy.shootInterval
          ) {
            const newBullets = createEnemyBullets(updatedEnemy);
            setEnemyBullets((bullets) => [...bullets, ...newBullets]);
            updatedEnemy.lastShot = currentTime;
          }

          return updatedEnemy;
        })
        .filter((enemy) => {
          const hitByBullet = bullets.some(
            (bullet) =>
              Math.abs(bullet.x - enemy.x) < 3 &&
              Math.abs(bullet.y - enemy.y) < 3
          );

          if (hitByBullet) {
            enemy.health--;
            if (enemy.health <= 0) {
              setScore((prev) => prev + 10 * currentWave);
              playExplosion();
              return false;
            }
          }

          if (
            Math.abs(enemy.x - playerPosition.x) < 5 &&
            Math.abs(enemy.y - playerPosition.y) < 5
          ) {
            setGameOver(true);
            playExplosion();
            return false;
          }

          return enemy.y < 100;
        });

      if (updatedEnemies.length === 0 && !boss) {
        setWaveCleared(true);
        setCurrentWave((wave) => wave + 1);
      }

      return updatedEnemies;
    });

    // Update boss
    if (boss) {
      setBoss((prevBoss) => {
        if (!prevBoss) return null;

        let updatedBoss = { ...prevBoss };

        // Boss movement pattern
        updatedBoss.moveTimer += deltaTime;
        const moveSpeed = 0.02;

        switch (updatedBoss.pattern) {
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

        // Boss shooting
        if (currentTime - updatedBoss.lastShot > updatedBoss.shootInterval) {
          const newBullets = createBossBullets(updatedBoss, currentWave);
          setEnemyBullets((prev) => [...prev, ...newBullets]);
          updatedBoss.lastShot = currentTime;
        }

        // Check bullet collisions with boss
        const hitByBullet = bullets.some(
          (bullet) =>
            Math.abs(bullet.x - updatedBoss.x) < 5 &&
            Math.abs(bullet.y - updatedBoss.y) < 5
        );

        if (hitByBullet) {
          updatedBoss.health--;
          playExplosion();

          if (updatedBoss.health <= 0) {
            setScore((prev) => prev + 100 * currentWave);
            setWaveCleared(true);
            setCurrentWave((wave) => wave + 1);
            return null;
          }
        }

        return updatedBoss;
      });
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameOver, playerPosition, bullets, lastShotTime, boss]);

  // Spawn new wave
  useEffect(() => {
    if (waveCleared) {
      setEnemies(getWaveEnemies(currentWave));
      setWaveCleared(false);
    }
  }, [waveCleared, currentWave]);

  const handleRestart = () => {
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
    keysRef.current = { left: false, right: false, up: false, down: false };
    lastUpdateRef.current = Date.now();
  };

  // Styles
  const styles = {
    gameContainer: {
      position: "relative",
      height: "100vh",
      width: "100%",
      maxWidth: "600px",
      backgroundColor: "#000040",
      overflow: "hidden",
      margin: "0 auto",
      border: "2px solid #333",
      borderRadius: "8px",
    },
    starLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
    },
    star: {
      position: "absolute",
      width: "2px",
      height: "2px",
      backgroundColor: "#FFF",
      borderRadius: "50%",
      animation: "fallingStar linear infinite",
    },
    "@keyframes fallingStar": {
      from: {
        transform: "translateY(-100vh)",
      },
      to: {
        transform: "translateY(100vh)",
      },
    },
    player: {
      position: "absolute",
      width: "80px",
      height: "80px",
      transform: "translate(-50%, -50%)",
      backgroundImage: "url(/assets/img/SP_xE_D.png)",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      imageRendering: "pixelated",
    },
    bullet: {
      position: "absolute",
      width: `${playerUpgrades.bulletWidth}px`, // ใช้ความกว้างจาก upgrades
      height: "12px",
      background: "linear-gradient(to bottom, #ffff00, #ff8800)",
      transform: "translate(-50%, -50%)",
      boxShadow: "0 0 5px #ffff00",
    },
    enemyBullet: {
      position: "absolute",
      width: "12px",
      height: "12px",
      background: "linear-gradient(45deg, #ff0000, #ff8800)",
      borderRadius: "50%",
      transform: "translate(-50%, -50%)",
      boxShadow: "0 0 8px #ff0000",
    },
    enemy: {
      position: "absolute",
      width: "100px",
      height: "100px",
      transform: "translate(-50%, -50%)",
      backgroundImage: "url(/assets/img/EM_xE2_D.png)",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      imageRendering: "pixelated",
    },
    boss: {
      position: "absolute",
      width: "150px",
      height: "150px",
      transform: "translate(-50%, -50%)",
      backgroundImage: "url(/assets/img/SpaceBG.jpg)",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      imageRendering: "pixelated",
    },
    healthBar: {
      position: "absolute",
      top: "5%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "80%",
      height: "20px",
      backgroundColor: "#333",
      border: "2px solid #666",
    },
    healthFill: {
      height: "100%",
      backgroundColor: "#ff0000",
      transition: "width 0.3s",
    },
    hud: {
      position: "absolute",
      top: "16px",
      left: "16px",
      color: "#fff",
      fontFamily: "Press Start 2P, monospace",
      textShadow: "0 0 5px #4488ff",
    },
    gameOver: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 33, 0.85)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: "Press Start 2P, monospace",
    },
    button: {
      padding: "8px 16px",
      backgroundColor: "#4488ff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      marginTop: "16px",
      fontFamily: "Press Start 2P, monospace",
      textShadow: "0 0 5px #4488ff",
      boxShadow: "0 0 10px #4488ff",
    },
  };

  return (
    <div style={styles.gameContainer}>
      <div
        style={{
          ...styles.player,
          left: `${playerPosition.x}%`,
          top: `${playerPosition.y}%`,
        }}
      />
      <div style={styles.hud}>
        <div>Score: {score}</div>
        <div style={{ marginTop: "8px" }}>Wave: {currentWave}</div>
        <div style={{ marginTop: "8px" }}>
          Shoot Pattern: {playerUpgrades.shootPattern}
        </div>
      </div>

      {bullets.map((bullet) => (
        <div
          key={bullet.id}
          style={{
            ...styles.bullet,
            left: `${bullet.x}%`,
            top: `${bullet.y}%`,
          }}
        />
      ))}

      {enemyBullets.map((bullet) => (
        <div
          key={bullet.id}
          style={{
            ...styles.enemyBullet,
            left: `${bullet.x}%`,
            top: `${bullet.y}%`,
          }}
        />
      ))}

      {enemies.map((enemy) => (
        <div
          key={enemy.id}
          style={{
            ...styles.enemy,
            left: `${enemy.x}%`,
            top: `${enemy.y}%`,
          }}
        />
      ))}

      {boss && (
        <>
          <div
            style={{
              ...styles.boss,
              left: `${boss.x}%`,
              top: `${boss.y}%`,
            }}
          />
          <div style={styles.healthBar}>
            <div
              style={{
                ...styles.healthFill,
                width: `${(boss.health / boss.maxHealth) * 100}%`,
              }}
            />
          </div>
        </>
      )}

      <div style={styles.hud}>
        <div>Score: {score}</div>
        <div style={{ marginTop: "8px" }}>Wave: {currentWave}</div>
      </div>

      {gameOver && (
        <div style={styles.gameOver}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Game Over!</h2>
          <p style={{ fontSize: "20px", marginBottom: "8px" }}>
            Score: {score}
          </p>
          <p style={{ fontSize: "20px", marginBottom: "16px" }}>
            Wave: {currentWave}
          </p>
          <button style={styles.button} onClick={handleRestart}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SpaceShooterGame;
