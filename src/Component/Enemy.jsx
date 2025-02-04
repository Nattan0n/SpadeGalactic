import React from 'react';

export const Enemy = ({ enemy }) => {
  const healthPercentage = (enemy.health / Math.ceil(enemy.wave / 3)) * 100;
  
  return (
    <div className="absolute" style={{
      width: "100px",
      height: "100px",
      transform: "translate(-50%, -50%)",
      left: `${enemy.x}%`,
      top: `${enemy.y}%`
    }}>
      {/* Health bar container */}
      <div className="absolute w-full -top-4">
        <div className="h-1 w-full bg-gray-700 rounded overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-200"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Enemy sprite */}
      <div style={{
        width: "100%",
        height: "100%",
        backgroundImage: "url(/src/assets/img/EM_xE2_D.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }} />

      {/* Fire effect */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 animate-pulse">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                fill="#FF4D4D"
                d="M12 0c1 3-5 6-6 10-1 4 2 8 6 8s7-4 6-8c-1-4-7-7-6-10z"
              />
              <path
                fill="#FFA500"
                d="M12 3c.5 2-3 4-3.5 6-.5 2 1 4 3.5 4s4-2 3.5-4c-.5-2-4-4-3.5-6z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
