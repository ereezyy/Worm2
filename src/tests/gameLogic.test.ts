// This file would contain unit tests for the game logic
// Example test structure:

/*
import { Direction } from '../types/game';
import { 
  manhattanDistance, 
  isValidMove, 
  getNextPosition, 
  isWithinBounds, 
  collidesWithWorm 
} from '../utils/gameUtils';

describe('Game Utilities', () => {
  test('manhattanDistance calculates correctly', () => {
    expect(manhattanDistance(0, 0, 3, 4)).toBe(7);
    expect(manhattanDistance(1, 1, 1, 1)).toBe(0);
    expect(manhattanDistance(-1, -1, 1, 1)).toBe(4);
  });
  
  test('isValidMove prevents 180-degree turns', () => {
    expect(isValidMove(Direction.UP, Direction.DOWN)).toBe(false);
    expect(isValidMove(Direction.LEFT, Direction.RIGHT)).toBe(false);
    expect(isValidMove(Direction.UP, Direction.LEFT)).toBe(true);
    expect(isValidMove(Direction.RIGHT, Direction.UP)).toBe(true);
  });
  
  test('getNextPosition returns correct coordinates', () => {
    expect(getNextPosition(5, 5, Direction.UP)).toEqual([5, 4]);
    expect(getNextPosition(5, 5, Direction.RIGHT)).toEqual([6, 5]);
    expect(getNextPosition(5, 5, Direction.DOWN)).toEqual([5, 6]);
    expect(getNextPosition(5, 5, Direction.LEFT)).toEqual([4, 5]);
  });
  
  test('isWithinBounds detects grid boundaries', () => {
    expect(isWithinBounds(0, 0, 10, 10)).toBe(true);
    expect(isWithinBounds(9, 9, 10, 10)).toBe(true);
    expect(isWithinBounds(-1, 5, 10, 10)).toBe(false);
    expect(isWithinBounds(5, 10, 10, 10)).toBe(false);
  });
  
  test('collidesWithWorm detects collisions', () => {
    const worm: [number, number][] = [[5, 5], [5, 6], [6, 6]];
    
    expect(collidesWithWorm(5, 5, worm)).toBe(true);
    expect(collidesWithWorm(5, 5, worm, true)).toBe(false);
    expect(collidesWithWorm(6, 6, worm)).toBe(true);
    expect(collidesWithWorm(7, 7, worm)).toBe(false);
  });
});
*/