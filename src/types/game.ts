// Direction enum
export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT
}

// Chat message interface
export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
  isApiResponse: boolean;
}

// Game state interface
export interface GameState {
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
}

// API response interface
export interface ApiResponse {
  response: string;
  fallback: boolean;
}