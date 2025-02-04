// src/components/Player.jsx
export const Player = ({ position }) => {
  return (
    <div
      style={{
        position: "absolute",
        width: "80px",
        height: "80px",
        transform: "translate(-50%, -50%)",
        backgroundImage: "url(/src/assets/img/SP_xE_D.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        imageRendering: "pixelated",
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    />
  );
};
