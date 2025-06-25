import React from 'react';
import { Direction } from '../../types/game';

interface GameGridProps {
  worm: [number, number][];
  food: [number, number];
  direction: Direction;
  gridSize: number;
  gridWidth: number;
  gridHeight: number;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  worm, 
  food, 
  direction, 
  gridSize, 
  gridWidth, 
  gridHeight 
}) => {
  return (
    <div 
      className="grid bg-black border-2 border-gray-700"
      style={{
        gridTemplateColumns: `repeat(${gridWidth}, ${gridSize}px)`,
        gridTemplateRows: `repeat(${gridHeight}, ${gridSize}px)`,
        width: `${gridWidth * gridSize}px`,
        height: `${gridHeight * gridSize}px`
      }}
    >
      {/* Food */}
      <div 
        className="absolute bg-red-600"
        style={{
          width: `${gridSize}px`,
          height: `${gridSize}px`,
          left: `${food[0] * gridSize}px`,
          top: `${food[1] * gridSize}px`
        }}
      />
      
      {/* Worm */}
      {worm.map((segment, index) => {
        // Gradient color from bright green (head) to darker green (tail)
        const colorIntensity = Math.max(50, 255 - (index * 5));
        const segmentColor = index === 0 ? 'bg-green-500' : `rgb(0, ${colorIntensity}, 0)`;
        
        return (
          <div 
            key={`${segment[0]}-${segment[1]}`}
            className="absolute"
            style={{
              width: `${gridSize}px`,
              height: `${gridSize}px`,
              left: `${segment[0] * gridSize}px`,
              top: `${segment[1] * gridSize}px`,
              backgroundColor: index === 0 ? '#22c55e' : segmentColor
            }}
          >
            {/* Eyes (only for head) */}
            {index === 0 && (
              <>
                <div 
                  className="absolute bg-white"
                  style={{
                    width: 4,
                    height: 4,
                    left: direction === Direction.LEFT ? 4 : 
                          direction === Direction.RIGHT ? gridSize - 8 : 
                          direction === Direction.UP ? 4 : 
                          gridSize - 8,
                    top: direction === Direction.UP ? 4 : 
                         direction === Direction.DOWN ? gridSize - 8 : 
                         direction === Direction.LEFT ? 4 : 
                         gridSize - 8
                  }}
                />
                <div 
                  className="absolute bg-white"
                  style={{
                    width: 4,
                    height: 4,
                    left: direction === Direction.LEFT ? 4 : 
                          direction === Direction.RIGHT ? gridSize - 8 : 
                          direction === Direction.UP ? gridSize - 8 : 
                          4,
                    top: direction === Direction.UP ? 4 : 
                         direction === Direction.DOWN ? gridSize - 8 : 
                         direction === Direction.LEFT ? gridSize - 8 : 
                         4
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameGrid;