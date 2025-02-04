// src/components/HealthBar.jsx
export const HealthBar = ({ current, max }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "20px",
        backgroundColor: "#333",
        border: "2px solid #666",
      }}
    >
      <div
        style={{
          height: "100%",
          backgroundColor: "#ff0000",
          transition: "width 0.3s",
          width: `${(current / max) * 100}%`,
        }}
      />
    </div>
  );
};
