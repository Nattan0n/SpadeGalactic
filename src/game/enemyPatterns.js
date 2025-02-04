// src/game/enemyPatterns.js

// สร้างบอสตามเลเวล
export const createBoss = (wave) => {
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

// สร้างกระสุนบอส
export const createBossBullets = (boss, wave) => {
  const bullets = [];
  const baseSpeed = 0.05 + wave * 0.001;

  switch (boss.pattern) {
    case 0: // ยิงกระจาย
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

    case 1: // ยิงเป็นคลื่น
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

    case 2: // ยิงหมุน
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

// สร้างกระสุนศัตรูทั่วไป
export const createEnemyBullets = (enemy) => {
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

// สร้างศัตรูตามเวฟ
export const getWaveEnemies = (wave) => {
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
