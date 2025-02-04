// src/components/GameHUD.jsx
export const GameHUD = ({ score, wave }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        color: "#fff",
        fontFamily: "Press Start 2P, monospace",
        textShadow: "0 0 5px #4488ff",
      }}
    >
      <div>Score: {score}</div>
      <div style={{ marginTop: "8px" }}>Wave: {wave}</div>
    </div>
  );
};
