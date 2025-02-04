// src/components/Bullets.jsx
import React from "react";

const styles = {
  playerBullet: {
    position: "absolute",
    height: "12px",
    background: "linear-gradient(to bottom, #ffff00, #ff8800)",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 5px #fff",
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
};

const Bullets = ({ playerBullets, enemyBullets, playerUpgrades }) => {
  return (
    <>
      {playerBullets.map((bullet) => (
        <div
          key={bullet.id}
          style={{
            ...styles.playerBullet,
            width: `${playerUpgrades.bulletWidth}px`,
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
    </>
  );
};

export default Bullets;
