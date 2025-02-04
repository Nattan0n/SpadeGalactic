// src/components/Boss.jsx
import React from 'react';

const styles = {
  boss: {
    position: "absolute",
    width: "150px",
    height: "150px",
    transform: "translate(-50%, -50%)",
    backgroundImage: "url(/assets/img/EM_xE2_D.png)",
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
  }
};

const Boss = ({ boss }) => {
  return (
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
  );
};

export default Boss;