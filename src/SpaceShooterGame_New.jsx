// src/SpaceShooterGame.jsx
import React, { useEffect } from "react";
import { GameProvider, useGameState } from "./context/GameContext";
import { AudioProvider, useAudio } from "./context/AudioContext";
import GameContainer from "./Component/GameContainer";
import Player from "./Component/Player";
import Bullets from "./Component/Bullets";
import Enemies from "./Component/Enemies";
import Boss from "./Component/Boss";
import HUD from "./Component/HUD";
import GameOver from "./Component/GameOver";
import useControls from "./hooks/useControls";
import { getWaveEnemies, createBoss } from "./game/enemyPatterns";

// Main game component
const GameComponent = () => {
  const { state, dispatch } = useGameState();
  const { initializeAudio } = useAudio();

  // Initialize game hooks
  useControls();

  // Initialize audio with user interaction
  useEffect(() => {
    const handleInteraction = async () => {
      await initializeAudio();
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [initializeAudio]);

  // Spawn new wave
  useEffect(() => {
    if (state.waveCleared) {
      if (state.currentWave % 10 === 0) {
        dispatch({
          type: "UPDATE_BOSS",
          payload: createBoss(state.currentWave),
        });
        dispatch({
          type: "UPDATE_ENEMIES",
          payload: [],
        });
      } else {
        dispatch({
          type: "UPDATE_BOSS",
          payload: null,
        });
        dispatch({
          type: "UPDATE_ENEMIES",
          payload: getWaveEnemies(state.currentWave),
        });
      }
      dispatch({ type: "SET_WAVE_CLEARED", payload: false });
    }
  }, [state.waveCleared, state.currentWave, dispatch]);

  return (
    <GameContainer>
      <Player position={state.playerPosition} />

      <Bullets
        playerBullets={state.bullets}
        enemyBullets={state.enemyBullets}
        playerUpgrades={state.playerUpgrades}
      />

      <Enemies enemies={state.enemies} />

      {state.boss && <Boss boss={state.boss} />}

      <HUD
        score={state.score}
        wave={state.currentWave}
        upgrades={state.playerUpgrades}
      />

      {state.gameOver && (
        <GameOver
          score={state.score}
          wave={state.currentWave}
          onRestart={() => dispatch({ type: "RESET_GAME" })}
        />
      )}
    </GameContainer>
  );
};

// Wrapper component with providers
const SpaceShooterGame = () => {
  return (
    <GameProvider>
      <AudioProvider>
        <GameComponent />
      </AudioProvider>
    </GameProvider>
  );
};

export default SpaceShooterGame;
