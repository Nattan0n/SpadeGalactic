// src/components/Bullet.jsx
export const Bullet = ({ bullet, isEnemy }) => {
    const style = isEnemy ? {
      width: "12px",
      height: "12px",
      background: "linear-gradient(45deg, #ff0000, #ff8800)",
      borderRadius: "50%",
      boxShadow: "0 0 8px #ff0000",
    } : {
      width: "4px",
      height: "12px",
      background: "linear-gradient(to bottom, #ffff00, #ff8800)",
      boxShadow: "0 0 5px #ffff00",
    };
  
    return (
      <div
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          left: `${bullet.x}%`,
          top: `${bullet.y}%`,
          ...style
        }}
      />
    );
  };