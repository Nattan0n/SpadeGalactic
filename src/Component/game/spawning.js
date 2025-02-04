// src/game/spawning.js
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

export const getWaveEnemies = (wave) => {
  // Boss wave every 10 waves
  if (wave % 10 === 0) {
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
