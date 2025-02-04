// src/components/HUD.jsx
import React from 'react';

const styles = {
  hud: {
    position: "absolute",
    top: "16px",
    left: "16px",
    color: "#fff",
    fontFamily: "Press Start 2P, monospace",
    textShadow: "0 0 5px #4488ff",
  }
};

const HUD = ({ score, wave, upgrades }) => {
  return (
    <div style={styles.hud}>
      <div>Score: {score}</div>
      <div style={{ marginTop: "8px" }}>Wave: {wave}</div>
      <div style={{ marginTop: "8px" }}>
        Shoot Pattern: {upgrades.shootPattern}
      </div>
    </div>
  );
};

export default HUD;