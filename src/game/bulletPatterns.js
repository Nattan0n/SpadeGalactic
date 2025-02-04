// src/game/bulletPatterns.js

// รูปแบบกระสุนต่างๆ ของผู้เล่น
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