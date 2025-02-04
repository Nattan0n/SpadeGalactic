// src/components/Enemies.jsx
import React from 'react';

const styles = {
  enemy: {
    position: "absolute",
    width: "100px",
    height: "100px",
    transform: "translate(-50%, -20%)",
    backgroundImage: "url(/assets/img/EM_xE4.png)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    imageRendering: "pixelated",
  }
};

const Enemies = ({ enemies }) => {
  return (
    <>
      {enemies.map((enemy) => (
        <div
          key={enemy.id}
          style={{
            ...styles.enemy,
            left: `${enemy.x}%`,
            top: `${enemy.y}%`,
          }}
        />
      ))}
    </>
  );
};

export default Enemies;