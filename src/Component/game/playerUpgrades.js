export const getPlayerUpgrades = (wave) => {
  const shootPattern = getShootPattern(wave);

  return {
    // ยิ่งเวฟสูง ยิ่งยิงเร็ว (เริ่มที่ 400ms, ลดลงตามเวฟ แต่ไม่ต่ำกว่า 150ms)
    fireRate: Math.max(400 - wave * 20, 150),

    // เพิ่มความเร็วกระสุน (เริ่มที่ 0.5, เพิ่มขึ้น 0.008 ต่อเวฟ)
    bulletSpeed: 0.5 + wave * 0.008,

    // ปรับขนาดกระสุนให้ไม่ใหญ่เกินไป
    bulletWidth: Math.min(2 + wave * 0.3, shootPattern === "triple" ? 6 : shootPattern === "double" ? 7 : 8),

    // เพิ่มรูปแบบการยิง
    shootPattern: shootPattern,
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
