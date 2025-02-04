// src/components/Player.jsx
import React from "react";

const styles = {
  player: {
    position: "absolute",
    width: "60px",
    height: "60px",
    transform: "translate(-50%, -50%)",
    backgroundImage: "url(/assets/img/SP_xE_D.png)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    imageRendering: "pixelated",
  },
};

const Player = ({ position }) => {
  return (
    <div
      style={{
        ...styles.player,
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    />
  );
};

export default Player;
