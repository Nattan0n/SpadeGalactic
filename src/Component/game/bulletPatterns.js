// src/game/bulletPatterns.js
export const createBossBullets = (boss, wave) => {
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

export const createEnemyBullets = (enemy) => {
  const bullets = [];
  const baseSpeed = enemy.bulletSpeed || 0.05;

  // Center bullet
  bullets.push({
    id: Math.random(),
    x: enemy.x,
    y: enemy.y + 5,
    speedX: 0,
    speedY: baseSpeed,
  });

  // Side bullets
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
