// src/context/GameContext.jsx
import React, { createContext, useContext, useReducer } from "react";
import { getPlayerUpgrades } from "../game/playerUpgrades";

const GameContext = createContext();

const initialState = {
  playerPosition: { x: 50, y: 80 },
  bullets: [],
  enemyBullets: [],
  enemies: [],
  boss: null,
  score: 0,
  gameOver: false,
  lastShotTime: 0,
  currentWave: 1, // เริ่มที่ wave 1
  waveCleared: true,
  playerUpgrades: getPlayerUpgrades(1),
};

// Reset state function
export const getInitialState = () => ({
  ...initialState,
  currentWave: 1, // Ensure wave starts at 1
  playerUpgrades: getPlayerUpgrades(1),
});

function gameReducer(state, action) {
  switch (action.type) {
    case "UPDATE_PLAYER_POSITION":
      return { ...state, playerPosition: action.payload };
    case "UPDATE_BULLETS":
      return { ...state, bullets: action.payload };
    case "UPDATE_ENEMY_BULLETS":
      return { ...state, enemyBullets: action.payload };
    case "UPDATE_ENEMIES":
      return { ...state, enemies: action.payload };
    case "UPDATE_BOSS":
      return { ...state, boss: action.payload };
    case "UPDATE_SCORE":
      return { ...state, score: action.payload };
    case "SET_GAME_OVER":
      return { ...state, gameOver: action.payload };
    case "UPDATE_LAST_SHOT_TIME":
      return { ...state, lastShotTime: action.payload };
    case "UPDATE_WAVE":
      return {
        ...state,
        currentWave: action.payload,
        playerUpgrades: getPlayerUpgrades(action.payload),
      };
    case "SET_WAVE_CLEARED":
      return { ...state, waveCleared: action.payload };
    case "RESET_GAME":
      return getInitialState();
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameProvider");
  }
  return context;
}
