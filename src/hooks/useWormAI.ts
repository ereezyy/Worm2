import { useState, useRef, useCallback } from 'react';
import { Direction } from '../types/game';
import { manhattanDistance } from '../utils/gameUtils';

// Define the state representation for the AI
interface State {
  relativeFood: [number, number]; // Food position relative to head
  distanceToFood: number;         // Manhattan distance to food
  dangerUp: boolean;              // Danger in up direction
  dangerRight: boolean;           // Danger in right direction
  dangerDown: boolean;            // Danger in down direction
  dangerLeft: boolean;            // Danger in left direction
  directionUp: boolean;           // Current direction is up
  directionRight: boolean;        // Current direction is right
  directionDown: boolean;         // Current direction is down
  directionLeft: boolean;         // Current direction is left
  wormLength: number;             // Length of the worm (normalized)
}

// Q-learning parameters
const LEARNING_RATE = 0.1;
const DISCOUNT_FACTOR = 0.9;
const EXPLORATION_RATE_INITIAL = 1.0;
const EXPLORATION_RATE_MIN = 0.01;
const EXPLORATION_RATE_DECAY = 0.995;

// Experience replay buffer size
const REPLAY_BUFFER_SIZE = 1000;

// Experience replay buffer entry
interface Experience {
  state: State;
  action: Direction;
  reward: number;
  nextState: State | null;
  done: boolean;
}

export const useWormAI = () => {
  // Q-table to store state-action values
  const qTable = useRef<Map<string, number[]>>(new Map());
  
  // Experience replay buffer
  const replayBuffer = useRef<Experience[]>([]);
  
  // Exploration rate (epsilon) for epsilon-greedy policy
  const [explorationRate, setExplorationRate] = useState(EXPLORATION_RATE_INITIAL);
  
  // Previous state and action for learning
  const previousState = useRef<State | null>(null);
  const previousAction = useRef<Direction | null>(null);
  
  // Stats for monitoring learning progress
  const [learningStats, setLearningStats] = useState({
    totalUpdates: 0,
    averageReward: 0,
    qValueChange: 0,
  });
  
  // Convert game state to AI state representation
  const getState = useCallback((
    worm: [number, number][],
    food: [number, number],
    direction: Direction,
    gridWidth: number,
    gridHeight: number
  ): State => {
    const [headX, headY] = worm[0];
    const [foodX, foodY] = food;
    
    // Calculate food position relative to head
    const relativeFood: [number, number] = [
      Math.sign(foodX - headX), // -1 for left, 0 for same column, 1 for right
      Math.sign(foodY - headY)  // -1 for up, 0 for same row, 1 for down
    ];
    
    // Calculate Manhattan distance to food (normalized)
    const distance = manhattanDistance(headX, headY, foodX, foodY);
    const maxDistance = gridWidth + gridHeight;
    const distanceToFood = distance / maxDistance;
    
    // Check for danger in each direction
    const dangerUp = isDanger(headX, headY - 1, worm, gridWidth, gridHeight);
    const dangerRight = isDanger(headX + 1, headY, worm, gridWidth, gridHeight);
    const dangerDown = isDanger(headX, headY + 1, worm, gridWidth, gridHeight);
    const dangerLeft = isDanger(headX - 1, headY, worm, gridWidth, gridHeight);
    
    // Current direction
    const directionUp = direction === Direction.UP;
    const directionRight = direction === Direction.RIGHT;
    const directionDown = direction === Direction.DOWN;
    const directionLeft = direction === Direction.LEFT;
    
    // Normalize worm length
    const wormLength = worm.length / (gridWidth * gridHeight);
    
    return {
      relativeFood,
      distanceToFood,
      dangerUp,
      dangerRight,
      dangerDown,
      dangerLeft,
      directionUp,
      directionRight,
      directionDown,
      directionLeft,
      wormLength
    };
  }, []);
  
  // Check if a position is dangerous (wall or self)
  const isDanger = (
    x: number,
    y: number,
    worm: [number, number][],
    gridWidth: number,
    gridHeight: number
  ): boolean => {
    // Check for wall collision
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
      return true;
    }
    
    // Check for self collision
    return worm.some((segment, index) => {
      // Skip the tail as it will move
      if (index === worm.length - 1) return false;
      return segment[0] === x && segment[1] === y;
    });
  };
  
  // Convert state to string key for Q-table
  const getStateKey = (state: State): string => {
    return JSON.stringify({
      rf: state.relativeFood,
      df: Math.round(state.distanceToFood * 10) / 10, // Round to reduce state space
      du: state.dangerUp,
      dr: state.dangerRight,
      dd: state.dangerDown,
      dl: state.dangerLeft,
      diu: state.directionUp,
      dir: state.directionRight,
      did: state.directionDown,
      dil: state.directionLeft,
      wl: Math.round(state.wormLength * 10) / 10 // Round to reduce state space
    });
  };
  
  // Get Q-values for a state
  const getQValues = (state: State): number[] => {
    const stateKey = getStateKey(state);
    if (!qTable.current.has(stateKey)) {
      // Initialize with small random values to break symmetry
      qTable.current.set(stateKey, [
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1,
        Math.random() * 0.1
      ]);
    }
    return qTable.current.get(stateKey)!;
  };
  
  // Choose action using epsilon-greedy policy
  const chooseDirection = useCallback((
    worm: [number, number][],
    food: [number, number],
    currentDirection: Direction,
    gridWidth: number,
    gridHeight: number
  ): Direction => {
    // Get current state
    const state = getState(worm, food, currentDirection, gridWidth, gridHeight);
    
    // Store state for learning
    previousState.current = state;
    
    // Get Q-values for current state
    const qValues = getQValues(state);
    
    // Choose action using epsilon-greedy policy
    let action: Direction;
    
    // Exploration: random action
    if (Math.random() < explorationRate) {
      // Choose a random valid action (not 180-degree turn)
      const validActions: Direction[] = [];
      if (currentDirection !== Direction.DOWN) validActions.push(Direction.UP);
      if (currentDirection !== Direction.LEFT) validActions.push(Direction.RIGHT);
      if (currentDirection !== Direction.UP) validActions.push(Direction.DOWN);
      if (currentDirection !== Direction.RIGHT) validActions.push(Direction.LEFT);
      
      // Filter out dangerous actions if possible
      const safeActions = validActions.filter(dir => {
        switch (dir) {
          case Direction.UP: return !state.dangerUp;
          case Direction.RIGHT: return !state.dangerRight;
          case Direction.DOWN: return !state.dangerDown;
          case Direction.LEFT: return !state.dangerLeft;
          default: return false;
        }
      });
      
      // Use safe actions if available, otherwise use all valid actions
      const availableActions = safeActions.length > 0 ? safeActions : validActions;
      action = availableActions[Math.floor(Math.random() * availableActions.length)];
    } 
    // Exploitation: best action
    else {
      // Filter out invalid actions (180-degree turns)
      const validQValues = [...qValues];
      if (currentDirection === Direction.DOWN) validQValues[Direction.UP] = -Infinity;
      if (currentDirection === Direction.LEFT) validQValues[Direction.RIGHT] = -Infinity;
      if (currentDirection === Direction.UP) validQValues[Direction.DOWN] = -Infinity;
      if (currentDirection === Direction.RIGHT) validQValues[Direction.LEFT] = -Infinity;
      
      // Choose action with highest Q-value
      action = validQValues.indexOf(Math.max(...validQValues)) as Direction;
      
      // If best action is dangerous, try to find a safe action with good Q-value
      if ((action === Direction.UP && state.dangerUp) ||
          (action === Direction.RIGHT && state.dangerRight) ||
          (action === Direction.DOWN && state.dangerDown) ||
          (action === Direction.LEFT && state.dangerLeft)) {
        
        // Create array of [direction, q-value] pairs
        const directionQValues = validQValues.map((q, i) => [i, q] as [number, number]);
        
        // Sort by Q-value in descending order
        directionQValues.sort((a, b) => b[1] - a[1]);
        
        // Find the first safe direction
        for (const [dir, _] of directionQValues) {
          if ((dir === Direction.UP && !state.dangerUp) ||
              (dir === Direction.RIGHT && !state.dangerRight) ||
              (dir === Direction.DOWN && !state.dangerDown) ||
              (dir === Direction.LEFT && !state.dangerLeft)) {
            action = dir as Direction;
            break;
          }
        }
      }
    }
    
    // Store action for learning
    previousAction.current = action;
    
    return action;
  }, [explorationRate, getState]);
  
  // Add experience to replay buffer
  const addExperience = (
    state: State,
    action: Direction,
    reward: number,
    nextState: State | null,
    done: boolean
  ) => {
    replayBuffer.current.push({ state, action, reward, nextState, done });
    
    // Keep buffer size limited
    if (replayBuffer.current.length > REPLAY_BUFFER_SIZE) {
      replayBuffer.current.shift();
    }
  };
  
  // Learn from a batch of experiences
  const learnFromExperiences = () => {
    // Skip if buffer is too small
    if (replayBuffer.current.length < 10) return;
    
    // Sample a batch of experiences (currently using all experiences)
    // In a more advanced implementation, we could sample a random batch
    const batch = replayBuffer.current;
    
    let totalReward = 0;
    let totalQChange = 0;
    
    // Update Q-values for each experience
    batch.forEach(({ state, action, reward, nextState, done }) => {
      const stateKey = getStateKey(state);
      const qValues = qTable.current.get(stateKey)!;
      
      // Calculate target Q-value
      let targetQ = reward;
      if (!done && nextState) {
        const nextQValues = getQValues(nextState);
        targetQ += DISCOUNT_FACTOR * Math.max(...nextQValues);
      }
      
      // Calculate Q-value change
      const oldQ = qValues[action];
      const qChange = LEARNING_RATE * (targetQ - oldQ);
      
      // Update Q-value
      qValues[action] = oldQ + qChange;
      
      // Update Q-table
      qTable.current.set(stateKey, qValues);
      
      // Track stats
      totalReward += reward;
      totalQChange += Math.abs(qChange);
    });
    
    // Update learning stats
    setLearningStats(prev => ({
      totalUpdates: prev.totalUpdates + batch.length,
      averageReward: totalReward / batch.length,
      qValueChange: totalQChange / batch.length
    }));
    
    // Clear buffer after learning
    replayBuffer.current = [];
  };
  
  // Update AI based on experience
  const updateAI = useCallback((
    currentWorm: [number, number][],
    currentFood: [number, number],
    currentDirection: Direction,
    nextWorm: [number, number][],
    nextFood: [number, number],
    reward: number,
    done: boolean
  ) => {
    // Skip if no previous state or action
    if (!previousState.current || previousAction.current === null) return;
    
    // Calculate next state
    const nextState = done ? null : getState(
      nextWorm,
      nextFood,
      currentDirection,
      nextWorm.length > 0 ? Math.max(...nextWorm.map(s => s[0])) + 1 : 40,
      nextWorm.length > 0 ? Math.max(...nextWorm.map(s => s[1])) + 1 : 30
    );
    
    // Add experience to replay buffer
    addExperience(
      previousState.current,
      previousAction.current,
      reward,
      nextState,
      done
    );
    
    // Learn from experiences periodically
    if (replayBuffer.current.length >= 50 || done) {
      learnFromExperiences();
    }
    
    // Decay exploration rate
    setExplorationRate(prev => Math.max(EXPLORATION_RATE_MIN, prev * EXPLORATION_RATE_DECAY));
  }, [getState]);
  
  // Reset AI state
  const resetAI = useCallback(() => {
    previousState.current = null;
    previousAction.current = null;
  }, []);
  
  return {
    chooseDirection,
    updateAI,
    resetAI,
    explorationRate,
    learningStats
  };
};