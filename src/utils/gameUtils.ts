import { Direction } from '../types/game';

// Calculate Manhattan distance between two points
export const manhattanDistance = (
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): number => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

// Check if a move is valid (not a 180-degree turn)
export const isValidMove = (
  currentDirection: Direction, 
  newDirection: Direction
): boolean => {
  // Prevent 180-degree turns
  if (
    (currentDirection === Direction.UP && newDirection === Direction.DOWN) ||
    (currentDirection === Direction.DOWN && newDirection === Direction.UP) ||
    (currentDirection === Direction.LEFT && newDirection === Direction.RIGHT) ||
    (currentDirection === Direction.RIGHT && newDirection === Direction.LEFT)
  ) {
    return false;
  }
  
  return true;
};

// Get next position based on current position and direction
export const getNextPosition = (
  x: number, 
  y: number, 
  direction: Direction
): [number, number] => {
  switch (direction) {
    case Direction.UP:
      return [x, y - 1];
    case Direction.RIGHT:
      return [x + 1, y];
    case Direction.DOWN:
      return [x, y + 1];
    case Direction.LEFT:
      return [x - 1, y];
    default:
      return [x, y];
  }
};

// Check if position is within grid bounds
export const isWithinBounds = (
  x: number, 
  y: number, 
  gridWidth: number, 
  gridHeight: number
): boolean => {
  return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
};

// Check if position collides with worm body
export const collidesWithWorm = (
  x: number, 
  y: number, 
  worm: [number, number][], 
  ignoreHead: boolean = false
): boolean => {
  const startIndex = ignoreHead ? 1 : 0;
  return worm.slice(startIndex).some(segment => segment[0] === x && segment[1] === y);
};

// Generate a random position within grid bounds
export const randomPosition = (
  gridWidth: number, 
  gridHeight: number, 
  avoid: [number, number][] = []
): [number, number] => {
  let position: [number, number];
  
  do {
    position = [
      Math.floor(Math.random() * gridWidth),
      Math.floor(Math.random() * gridHeight)
    ];
  } while (avoid.some(pos => pos[0] === position[0] && pos[1] === position[1]));
  
  return position;
};

// Format timestamp for display
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};