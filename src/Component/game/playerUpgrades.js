// src/game/playerUpgrades.js
export const getPlayerUpgrades = (wave) => {
  return {
    // ยิ่งเวฟสูง ยิ่งยิงเร็ว (เริ่มที่ 400ms, ลดลงตามเวฟ แต่ไม่ต่ำกว่า 150ms)
    fireRate: Math.max(400 - wave * 20, 150),

    // เพิ่มความเร็วกระสุน (เริ่มที่ 0.15, เพิ่มขึ้น 5% ต่อเวฟ)
    bulletSpeed: 0.15 + wave * 0.008,

    // เพิ่มความกว้างกระสุน (เริ่มที่ 4px, เพิ่มขึ้นตามเวฟ)
    bulletWidth: Math.min(4 + wave, 12),

    // เพิ่มรูปแบบการยิง
    shootPattern: getShootPattern(wave),
  };
};

// รูปแบบการยิงที่ปลดล็อกตามเวฟ
const getShootPattern = (wave) => {
  if (wave >= 15) {
    return "triple"; // ยิง 3 นัดพร้อมกัน
  } else if (wave >= 8) {
    return "double"; // ยิง 2 นัดพร้อมกัน
  } else {
    return "single"; // ยิงนัดเดียว
  }
};

// ฟังก์ชันสร้างกระสุนตามรูปแบบการยิง
export const createPlayerBullets = (
  playerPosition,
  pattern,
  bulletSpeed,
  bulletWidth
) => {
  const bullets = [];

  switch (pattern) {
    case "triple":
      bullets.push(
        {
          id: Date.now() + "-1",
          x: playerPosition.x - 2,
          y: playerPosition.y - 3,
          speedY: -bulletSpeed,
          width: bulletWidth,
        },
        {
          id: Date.now() + "-2",
          x: playerPosition.x,
          y: playerPosition.y - 3,
          speedY: -bulletSpeed,
          width: bulletWidth,
        },
        {
          id: Date.now() + "-3",
          x: playerPosition.x + 2,
          y: playerPosition.y - 3,
          speedY: -bulletSpeed,
          width: bulletWidth,
        }
      );
      break;

    case "double":
      bullets.push(
        {
          id: Date.now() + "-1",
          x: playerPosition.x - 1,
          y: playerPosition.y - 3,
          speedY: -bulletSpeed,
          width: bulletWidth,
        },
        {
          id: Date.now() + "-2",
          x: playerPosition.x + 1,
          y: playerPosition.y - 3,
          speedY: -bulletSpeed,
          width: bulletWidth,
        }
      );
      break;

    default: // single
      bullets.push({
        id: Date.now(),
        x: playerPosition.x,
        y: playerPosition.y - 3,
        speedY: -bulletSpeed,
        width: bulletWidth,
      });
      break;
  }

  return bullets;
};
