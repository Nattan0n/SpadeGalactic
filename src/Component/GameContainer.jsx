// src/components/GameContainer.jsx
import React from "react";

const styles = {
  gameContainer: {
    position: "relative",
    height: "100vh",
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#000040",
    overflow: "hidden",
    margin: "0 auto",
    border: "2px solid #333",
    borderRadius: "8px",
  },
};

const GameContainer = ({ children }) => {
  return (
    <div style={styles.gameContainer} data-game-container>
      {children}
    </div>
  );
};

export default GameContainer;
