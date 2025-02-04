import React, { useEffect } from 'react';
import { Player } from './Player';
import { Bullet } from './Bullet';
import { Enemy } from './Enemy';
import { Boss } from './Boss';
import { GameHUD } from './GameHUD';
import { useGameLogic } from '../hooks/useGameLogic';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { createAudio, initializeAudio } from '../Component/game/audio';

const SpaceShooterGame = () => {
  const audioAssets = {
    laser: createAudio('/assets/audio/laser.wav'),
    explosion: createAudio('/assets/audio/explosion.wav'),
  };

  useEffect(() => {
    initializeAudio(Object.values(audioAssets));
  }, []);

  const keysRef = useKeyboardControls();
  const {
    gameState: {
      playerPosition,
      playerLevel,
      bullets,
      enemyBullets,
      enemies,
      boss,
      score,
      gameOver,
      currentWave
    },
    updateGame,
    resetGame
  } = useGameLogic({ audioAssets });

  useEffect(() => {
    let lastTime = 0;
    let animationFrameId;

    const gameLoop = (timestamp) => {
      if (lastTime === 0) {
        lastTime = timestamp;
      }
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      updateGame(deltaTime, keysRef);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [updateGame, keysRef]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div 
        className="w-full h-full" 
        style={{ 
          maxWidth: '800px',
          maxHeight: '800px',
          aspectRatio: '1',
          backgroundColor: "#000033",
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #333',
          borderRadius: '8px',
        }}
      >
        {/* Game space */}
        <div className="absolute inset-0">
          <Player position={playerPosition} />

          {bullets.map((bullet) => (
            <Bullet
              key={bullet.id}
              bullet={bullet}
              isEnemy={false}
              width={playerLevel.bulletWidth}
            />
          ))}

          {enemyBullets.map((bullet) => (
            <Bullet key={bullet.id} bullet={bullet} isEnemy={true} />
          ))}

          {enemies.map((enemy) => (
            <Enemy 
              key={enemy.id} 
              enemy={{
                ...enemy,
                wave: currentWave
              }} 
            />
          ))}

          {boss && <Boss boss={boss} />}

          <GameHUD score={score} wave={currentWave} />
        </div>

        {/* Game over overlay */}
        {gameOver && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 51, 0.85)" }}
          >
            <h2 className="text-2xl mb-4 text-white font-bold">Game Over!</h2>
            <p className="text-xl mb-2 text-white">Score: {score}</p>
            <p className="text-xl mb-4 text-white">Wave: {currentWave}</p>
            <button
              className="px-6 py-3 rounded-lg cursor-pointer text-white font-bold transition-colors duration-200 hover:bg-blue-600"
              style={{ backgroundColor: "#4488ff" }}
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceShooterGame;