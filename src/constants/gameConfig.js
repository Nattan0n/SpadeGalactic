// src/constants/gameConfig.js

export const GAME_CONFIG = {
  // Player settings
  PLAYER: {
    INITIAL_X: 50,
    INITIAL_Y: 80,
    MOVE_SPEED: 0.095,
    MIN_Y: 20,
    MAX_Y: 90,
    SPRITE_SIZE: 80,
  },

  // Enemy settings
  ENEMY: {
    BASE_HEALTH: 1,
    MIN_SHOOT_INTERVAL: 500,
    MAX_SHOOT_INTERVAL: 2000,
    BASE_BULLET_SPEED: 0.05,
    MAX_BULLET_SPEED: 0.1,
    MIN_COUNT: 3,
    MAX_COUNT: 8,
    SPRITE_SIZE: 100,
  },

  // Boss settings
  BOSS: {
    HEALTH_MULTIPLIER: 50,
    MIN_SHOOT_INTERVAL: 300,
    BASE_SHOOT_INTERVAL: 1000,
    SPRITE_SIZE: 150,
    PATTERNS: {
      SIDE_TO_SIDE: 0,
      FIGURE_EIGHT: 1,
      RANDOM_TELEPORT: 2,
    },
  },

  // Bullet settings
  BULLET: {
    BASE_SPEED: 0.3,
    MAX_SPEED: 0.6,
    BASE_WIDTH: 4,
    MAX_WIDTH: 12,
    MIN_FIRE_RATE: 150,
    BASE_FIRE_RATE: 400,
  },

  // Score settings
  SCORE: {
    ENEMY_MULTIPLIER: 10,
    BOSS_MULTIPLIER: 100,
  },

  // Wave settings
  WAVE: {
    ENEMIES_INCREMENT: 5,
    BOSS_INTERVAL: 10,
  },

  // Game boundaries
  BOUNDS: {
    MIN_X: 0,
    MAX_X: 100,
    MIN_Y: 0,
    MAX_Y: 100,
  },

  // Collision detection
  COLLISION: {
    PLAYER_BULLET_THRESHOLD: 3,
    ENEMY_BULLET_THRESHOLD: 3,
    BOSS_BULLET_THRESHOLD: 5,
    PLAYER_ENEMY_THRESHOLD: 5,
  },

  // Audio settings
  AUDIO: {
    BACKGROUND_MUSIC_VOLUME: 0.2,
    SOUND_EFFECT_VOLUME: 0.7,
  },
};
