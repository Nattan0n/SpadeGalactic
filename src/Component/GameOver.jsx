// src/components/GameOver.jsx
import React from "react";

const styles = {
  gameOver: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 33, 0.85)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "Press Start 2P, monospace",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#4488ff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "16px",
    fontFamily: "Press Start 2P, monospace",
    textShadow: "0 0 5px #4488ff",
    boxShadow: "0 0 10px #4488ff",
  },
};

const GameOver = ({ score, wave, onRestart }) => {
  return (
    <div style={styles.gameOver}>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Game Over!</h2>
      <p style={{ fontSize: "20px", marginBottom: "8px" }}>Score: {score}</p>
      <p style={{ fontSize: "20px", marginBottom: "16px" }}>Wave: {wave}</p>
      <button style={styles.button} onClick={onRestart}>
        Play Again
      </button>
    </div>
  );
};

export default GameOver;
