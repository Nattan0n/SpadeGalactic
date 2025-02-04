// src/game/movement.js

export const updateBossPosition = (boss, deltaTime) => {
  if (!boss) return null;

  let updatedBoss = { ...boss };
  const moveSpeed = 0.02;

  updatedBoss.moveTimer += deltaTime;

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

  return updatedBoss;
};

export const updateEnemyPosition = (enemy, currentTime, deltaTime) => {
  let updatedEnemy = { ...enemy };

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

  // Move downward
  updatedEnemy.y += 0.02;

  return updatedEnemy;
};

export const checkBulletCollisions = ({
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
  playExplosion,
}) => {
  // Check bullet collisions with enemies and boss
  setBullets((prev) =>
    prev.filter((bullet) => {
      const hitEnemy = enemies.some(
        (enemy) =>
          Math.abs(bullet.x - enemy.x) < 3 && Math.abs(bullet.y - enemy.y) < 3
      );

      const hitBoss =
        boss &&
        Math.abs(bullet.x - boss.x) < 5 &&
        Math.abs(bullet.y - boss.y) < 5;

      if (hitEnemy || hitBoss) {
        playExplosion();
        return false;
      }
      return true;
    })
  );

  // Update enemies
  setEnemies((prev) => {
    const updatedEnemies = prev.filter((enemy) => {
      const hitByBullet = bullets.some(
        (bullet) =>
          Math.abs(bullet.x - enemy.x) < 3 && Math.abs(bullet.y - enemy.y) < 3
      );

      if (hitByBullet) {
        enemy.health--;
        if (enemy.health <= 0) {
          setScore((prev) => prev + 10);
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

    // Check if wave is cleared
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

      const hitByBullet = bullets.some(
        (bullet) =>
          Math.abs(bullet.x - prevBoss.x) < 5 &&
          Math.abs(bullet.y - prevBoss.y) < 5
      );

      if (hitByBullet) {
        const updatedBoss = { ...prevBoss };
        updatedBoss.health--;
        playExplosion();

        if (updatedBoss.health <= 0) {
          setScore((prev) => prev + 100);
          setWaveCleared(true);
          setCurrentWave((wave) => wave + 1);
          return null;
        }

        return updatedBoss;
      }

      return prevBoss;
    });
  }
};
