import React from 'react';

export const Boss = ({ boss }) => {
  const healthPercentage = (boss.health / boss.maxHealth) * 100;
  
  return (
    <div className="absolute" style={{
      width: "150px",
      height: "150px",
      transform: "translate(-50%, -50%)",
      left: `${boss.x}%`,
      top: `${boss.y}%`
    }}>
      {/* Health bar container */}
      <div className="absolute w-full -top-6">
        <div className="mb-1 text-center text-white text-sm font-bold">
          BOSS
        </div>
        <div className="h-2 w-full bg-gray-700 rounded overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-200"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Boss sprite */}
      <div style={{
        width: "100%",
        height: "100%",
        backgroundImage: "url(/src/assets/img/EM_xE2_D.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        imageRendering: "pixelated",
        transform: "scale(1.5)"
      }} />

      {/* Fire effects */}
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className="absolute -top-8 transform -translate-x-1/2"
          style={{ left: `${25 + i * 25}%` }}
        >
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 animate-pulse" style={{
              animationDelay: `${i * 200}ms`
            }}>
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
      ))}
    </div>
  );
};