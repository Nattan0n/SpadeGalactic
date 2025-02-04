// src/game/playerUpgrades.js

// สร้างกระสุนของผู้เล่น
export function createPlayerBullets(position, pattern, speed, width) {
  const bullets = [];
  const baseSpeed = speed || 0.3;

  switch (pattern) {
    case 1: // ยิงตรง
      bullets.push({
        id: Math.random(),
        x: position.x,
        y: position.y,
        speedY: -baseSpeed,
      });
      break;

    case 2: // ยิง 3 นัดกระจาย
      bullets.push({
        id: Math.random(),
        x: position.x,
        y: position.y,
        speedX: 0,
        speedY: -baseSpeed,
      });
      bullets.push({
        id: Math.random(),
        x: position.x - 2,
        y: position.y,
        speedX: -baseSpeed * 0.2,
        speedY: -baseSpeed * 0.8,
      });
      bullets.push({
        id: Math.random(),
        x: position.x + 2,
        y: position.y,
        speedX: baseSpeed * 0.2,
        speedY: -baseSpeed * 0.8,
      });
      break;

    case 3: // ยิงวงกว้าง 5 นัด
      for (let i = -2; i <= 2; i++) {
        bullets.push({
          id: Math.random(),
          x: position.x + i * 3,
          y: position.y,
          speedX: baseSpeed * i * 0.2,
          speedY: -baseSpeed,
        });
      }
      break;

    case 4: // ยิงเป็นคลื่น
      const waveTime = Date.now() * 0.003;
      for (let i = -1; i <= 1; i++) {
        bullets.push({
          id: Math.random(),
          x: position.x + Math.sin(waveTime + i) * 5,
          y: position.y,
          speedX: Math.cos(waveTime + i) * baseSpeed * 0.3,
          speedY: -baseSpeed,
        });
      }
      break;

    case 5: // ยิงหมุน
      const angle = Date.now() * 0.002;
      for (let i = 0; i < 4; i++) {
        const bulletAngle = angle + (i * Math.PI) / 2;
        bullets.push({
          id: Math.random(),
          x: position.x + Math.cos(bulletAngle) * 5,
          y: position.y + Math.sin(bulletAngle) * 5,
          speedX: Math.cos(bulletAngle) * baseSpeed * 0.5,
          speedY: -baseSpeed + Math.sin(bulletAngle) * baseSpeed * 0.5,
        });
      }
      break;
  }

  return bullets;
}

// รับค่าอัพเกรดตามเลเวล
export const getPlayerUpgrades = (wave) => {
  // ความเร็วกระสุน
  const bulletSpeed = Math.min(0.3 + wave * 0.02, 0.6);

  // อัตราการยิง (ระยะเวลาระหว่างกระสุน)
  const fireRate = Math.max(400 - wave * 20, 150);

  // ความกว้างกระสุน
  const bulletWidth = Math.min(4 + Math.floor(wave / 5), 12);

  // รูปแบบการยิง
  let shootPattern = 1;
  if (wave >= 3) shootPattern = 2;
  if (wave >= 6) shootPattern = 3;
  if (wave >= 10) shootPattern = 4;
  if (wave >= 15) shootPattern = 5;

  return {
    bulletSpeed,
    fireRate,
    bulletWidth,
    shootPattern,
  };
};

// ค่าพลังเริ่มต้นของผู้เล่น
export const initialPlayerStats = {
  moveSpeed: 0.095,
  bulletSpeed: 0.3,
  fireRate: 400,
  bulletWidth: 4,
  shootPattern: 1,
};

// รายการอัพเกรดทั้งหมด
export const upgradesList = [
  {
    id: "bulletSpeed",
    name: "Bullet Speed",
    description: "Increase bullet speed",
    maxLevel: 5,
    getEffect: (level) => 0.3 + level * 0.06,
  },
  {
    id: "fireRate",
    name: "Fire Rate",
    description: "Decrease time between shots",
    maxLevel: 5,
    getEffect: (level) => 400 - level * 50,
  },
  {
    id: "bulletWidth",
    name: "Bullet Size",
    description: "Increase bullet size",
    maxLevel: 4,
    getEffect: (level) => 4 + level * 2,
  },
  {
    id: "shootPattern",
    name: "Shoot Pattern",
    description: "Unlock new shooting patterns",
    maxLevel: 5,
    getEffect: (level) => level + 1,
  },
];

// คำนวณค่าพลังจากเลเวลอัพเกรด
export const calculateStats = (upgradeLevels) => {
  return {
    moveSpeed: 0.095, // ความเร็วคงที่
    bulletSpeed: upgradesList[0].getEffect(upgradeLevels.bulletSpeed || 0),
    fireRate: upgradesList[1].getEffect(upgradeLevels.fireRate || 0),
    bulletWidth: upgradesList[2].getEffect(upgradeLevels.bulletWidth || 0),
    shootPattern: upgradesList[3].getEffect(upgradeLevels.shootPattern || 0),
  };
};
