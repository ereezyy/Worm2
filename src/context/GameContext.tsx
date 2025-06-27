import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { useDialogue } from '../hooks/useDialogue';
import { Direction, GameState, ChatMessage } from '../types/game';

// Define the context shape
interface GameContextType {
  // Game state
  worm: [number, number][];
  food: [number, number];
  direction: Direction;
  score: number;
  highScore: number;
  gameOver: boolean;
  isPaused: boolean;
  autoPlay: boolean;
  episodes: number;
  totalFoodEaten: number;
  totalDeaths: number;
  foodEatenStreak: number;
  audioEnabled: boolean;
  explorationRate: number;
  learningStats: {
    totalUpdates: number;
    averageReward: number;
    qValueChange: number;
  };
  aiEvolution: any; // Add aiEvolution to the context type
  
  // Game actions
  setDirection: (direction: Direction) => void;
  setIsPaused: (isPaused: boolean) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setAudioEnabled: (audioEnabled: boolean) => void;
  resetGame: () => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  
  // Dialogue state
  chatMessages: ChatMessage[];
  currentDialogue: string;
  currentReasoning: string;
  wormApiConnected: boolean;
  xaiApiConnected: boolean;
  
  // Dialogue actions
  continueConversation: () => void;
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Grid dimensions
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Game logic hook
  const gameLogic = useGameLogic(GRID_WIDTH, GRID_HEIGHT);
  
  // Dialogue hook
  const dialogue = useDialogue(
    gameLogic.totalFoodEaten,
    gameLogic.totalDeaths,
    gameLogic.foodEatenStreak
  );
  
  // Use refs to track previous values to prevent infinite update loops
  const prevTotalFoodEaten = useRef(gameLogic.totalFoodEaten);
  const prevTotalDeaths = useRef(gameLogic.totalDeaths);
  
  // Add food eaten message when totalFoodEaten changes
  useEffect(() => {
    // Only trigger if the value has actually increased
    if (gameLogic.totalFoodEaten > prevTotalFoodEaten.current) {
      dialogue.addFoodEatenMessage();
      // Update the ref
      prevTotalFoodEaten.current = gameLogic.totalFoodEaten;
    }
  }, [gameLogic.totalFoodEaten, dialogue]);
  
  // Add death message when totalDeaths changes
  useEffect(() => {
    // Only trigger if the value has actually increased
    if (gameLogic.totalDeaths > prevTotalDeaths.current) {
      dialogue.addDeathMessage();
      // Update the ref
      prevTotalDeaths.current = gameLogic.totalDeaths;
    }
  }, [gameLogic.totalDeaths, dialogue]);
  
  // Combined context value
  const contextValue: GameContextType = {
    ...gameLogic,
    chatMessages: dialogue.chatMessages,
    currentDialogue: dialogue.currentDialogue,
    currentReasoning: dialogue.currentReasoning,
    wormApiConnected: dialogue.wormApiConnected,
    xaiApiConnected: dialogue.xaiApiConnected,
    continueConversation: dialogue.continueConversation,
    aiEvolution: dialogue.aiEvolution
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};