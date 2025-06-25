import { useState, useEffect, useRef, useCallback } from 'react';
import { Direction } from '../types/game';
import { useWormAI } from './useWormAI';

// Game constants
const GAME_SPEED = 150; // ms between moves

export const useGameLogic = (gridWidth: number, gridHeight: number) => {
  // Game state
  const [worm, setWorm] = useState<[number, number][]>([
    [Math.floor(gridWidth / 2), Math.floor(gridHeight / 2)]
  ]);
  const [food, setFood] = useState<[number, number]>([0, 0]);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [episodes, setEpisodes] = useState<number>(0);
  const [totalFoodEaten, setTotalFoodEaten] = useState<number>(0);
  const [totalDeaths, setTotalDeaths] = useState<number>(0);
  const [foodEatenStreak, setFoodEatenStreak] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  
  // Refs for game loop and state
  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<Direction>(direction);
  const wormRef = useRef<[number, number][]>(worm);
  const foodRef = useRef<[number, number]>(food);
  const gameOverRef = useRef<boolean>(gameOver);
  const isPausedRef = useRef<boolean>(isPaused);
  const autoPlayRef = useRef<boolean>(autoPlay);
  const audioEnabledRef = useRef<boolean>(audioEnabled);
  
  // Initialize AI
  const { chooseDirection, updateAI, resetAI, explorationRate, learningStats } = useWormAI();
  
  // Initialize game
  useEffect(() => {
    // Spawn initial food
    spawnFood();
    
    // Start game loop
    startGameLoop();
    
    return () => {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current);
      }
    };
  }, []);
  
  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  useEffect(() => {
    wormRef.current = worm;
  }, [worm]);
  
  useEffect(() => {
    foodRef.current = food;
  }, [food]);
  
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);
  
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);
  
  // Spawn food at random location
  const spawnFood = () => {
    let newFood: [number, number];
    do {
      newFood = [
        Math.floor(Math.random() * gridWidth),
        Math.floor(Math.random() * gridHeight)
      ];
    } while (wormRef.current.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
    
    setFood(newFood);
    foodRef.current = newFood;
  };
  
  // Start game loop
  const startGameLoop = () => {
    if (gameLoopRef.current) {
      window.clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = window.setInterval(() => {
      if (!isPausedRef.current && !gameOverRef.current) {
        updateGame();
      }
    }, GAME_SPEED);
  };
  
  // Update game state
  const updateGame = () => {
    // If auto-play is enabled, use AI to choose direction
    if (autoPlayRef.current) {
      const newDirection = chooseDirection(
        wormRef.current,
        foodRef.current,
        directionRef.current,
        gridWidth,
        gridHeight
      );
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
    
    // Get current head position
    const [headX, headY] = wormRef.current[0];
    
    // Calculate new head position based on direction
    let newHeadX = headX;
    let newHeadY = headY;
    
    switch (directionRef.current) {
      case Direction.UP:
        newHeadY -= 1;
        break;
      case Direction.RIGHT:
        newHeadX += 1;
        break;
      case Direction.DOWN:
        newHeadY += 1;
        break;
      case Direction.LEFT:
        newHeadX -= 1;
        break;
    }
    
    // Check for collision with walls
    if (newHeadX < 0 || newHeadX >= gridWidth || newHeadY < 0 || newHeadY >= gridHeight) {
      handleDeath();
      return;
    }
    
    // Check for collision with self
    if (wormRef.current.some(segment => segment[0] === newHeadX && segment[1] === newHeadY)) {
      handleDeath();
      return;
    }
    
    // Create new worm with new head
    const newWorm = [[newHeadX, newHeadY], ...wormRef.current];
    
    // Check for food
    const ateFood = newHeadX === foodRef.current[0] && newHeadY === foodRef.current[1];
    
    // Calculate reward for AI
    const reward = calculateReward(newHeadX, newHeadY, ateFood);
    
    // Update AI with current state, action, reward, and next state
    updateAI(
      wormRef.current,
      foodRef.current,
      directionRef.current,
      newWorm,
      foodRef.current,
      reward,
      false
    );
    
    if (ateFood) {
      // Eat food
      setScore(prev => prev + 1);
      setTotalFoodEaten(prev => prev + 1);
      setFoodEatenStreak(prev => prev + 1);
      
      // Spawn new food
      spawnFood();
    } else {
      // Remove tail if no food eaten
      newWorm.pop();
    }
    
    // Update worm
    setWorm(newWorm);
    wormRef.current = newWorm;
  };
  
  // Calculate reward for reinforcement learning
  const calculateReward = (headX: number, headY: number, ateFood: boolean): number => {
    const [foodX, foodY] = foodRef.current;
    
    // Calculate Manhattan distance to food
    const distance = Math.abs(headX - foodX) + Math.abs(headY - foodY);
    const maxDistance = gridWidth + gridHeight;
    
    // Normalize distance to range [0, 1]
    const normalizedDistance = distance / maxDistance;
    
    // Base reward is negative distance to food (closer is better)
    let reward = -normalizedDistance;
    
    // Big reward for eating food
    if (ateFood) {
      reward += 1.0;
    }
    
    return reward;
  };
  
  // Reset game
  const resetGame = () => {
    // Reset worm
    const newWorm: [number, number][] = [
      [Math.floor(gridWidth / 2), Math.floor(gridHeight / 2)]
    ];
    
    setWorm(newWorm);
    wormRef.current = newWorm;
    
    // Reset direction (random)
    const newDirection = Math.floor(Math.random() * 4) as Direction;
    setDirection(newDirection);
    directionRef.current = newDirection;
    
    // Reset food
    spawnFood();
    
    // Reset game state
    setGameOver(false);
    gameOverRef.current = false;
    setScore(0);
    setEpisodes(prev => prev + 1);
    setFoodEatenStreak(0);
    
    // Reset AI
    resetAI();
  };
  
  // Handle worm death
  const handleDeath = () => {
    setGameOver(true);
    gameOverRef.current = true;
    setTotalDeaths(prev => prev + 1);
    setFoodEatenStreak(0);
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
    }
    
    // Update AI with death state
    updateAI(
      wormRef.current,
      foodRef.current,
      directionRef.current,
      wormRef.current,
      foodRef.current,
      -1.0, // Negative reward for death
      true  // Done = true
    );
    
    // Schedule game reset
    setTimeout(() => {
      resetGame();
    }, 3000); // Reset after 3 seconds
  };
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' && directionRef.current !== Direction.DOWN) {
      setDirection(Direction.UP);
      autoPlayRef.current = false;
      setAutoPlay(false);
    } else if (e.key === 'ArrowRight' && directionRef.current !== Direction.LEFT) {
      setDirection(Direction.RIGHT);
      autoPlayRef.current = false;
      setAutoPlay(false);
    } else if (e.key === 'ArrowDown' && directionRef.current !== Direction.UP) {
      setDirection(Direction.DOWN);
      autoPlayRef.current = false;
      setAutoPlay(false);
    } else if (e.key === 'ArrowLeft' && directionRef.current !== Direction.RIGHT) {
      setDirection(Direction.LEFT);
      autoPlayRef.current = false;
      setAutoPlay(false);
    } else if (e.key === ' ') {
      // Toggle pause
      setIsPaused(!isPausedRef.current);
    } else if (e.key === 'r' || e.key === 'R') {
      // Reset game
      resetGame();
    } else if (e.key === 'a' || e.key === 'A') {
      // Toggle autoplay
      setAutoPlay(!autoPlayRef.current);
      autoPlayRef.current = !autoPlayRef.current;
    } else if (e.key === 'm' || e.key === 'M') {
      // Toggle audio
      setAudioEnabled(!audioEnabledRef.current);
      audioEnabledRef.current = !audioEnabledRef.current;
    }
  }, []);
  
  return {
    worm,
    food,
    direction,
    score,
    highScore,
    gameOver,
    isPaused,
    autoPlay,
    episodes,
    totalFoodEaten,
    totalDeaths,
    foodEatenStreak,
    audioEnabled,
    explorationRate,
    learningStats,
    setDirection,
    setIsPaused,
    setAutoPlay,
    setAudioEnabled,
    resetGame,
    handleKeyDown
  };
};