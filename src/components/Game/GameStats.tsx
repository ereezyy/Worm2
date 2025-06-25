import React from 'react';

interface GameStatsProps {
  score: number;
  highScore: number;
  wormLength: number;
  totalFoodEaten: number;
  totalDeaths: number;
  foodEatenStreak: number;
  explorationRate?: number;
  learningStats?: {
    totalUpdates: number;
    averageReward: number;
    qValueChange: number;
  };
}

const GameStats: React.FC<GameStatsProps> = ({
  score,
  highScore,
  wormLength,
  totalFoodEaten,
  totalDeaths,
  foodEatenStreak,
  explorationRate,
  learningStats
}) => {
  return (
    <div className="mt-4 bg-gray-900 p-4 rounded-lg w-full max-w-[800px]">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-3">
          <h3 className="text-white text-lg font-semibold mb-2">Game Statistics</h3>
        </div>
        <div>
          <div className="text-sm text-gray-400">Learning Level</div>
          <div className="text-xl font-bold text-white">{score}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Peak Learning</div>
          <div className="text-xl font-bold text-white">{highScore}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Worm Length</div>
          <div className="text-xl font-bold text-white">{wormLength}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">RedBlocks Collected</div>
          <div className="text-xl font-bold text-white">{totalFoodEaten}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Resets</div>
          <div className="text-xl font-bold text-white">{totalDeaths}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Collection Streak</div>
          <div className="text-xl font-bold text-white">{foodEatenStreak}</div>
        </div>
      </div>
      
      {(explorationRate !== undefined || learningStats) && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-2">AI Learning Metrics</h3>
          <div className="grid grid-cols-4 gap-4">
            {explorationRate !== undefined && (
              <div>
                <div className="text-sm text-gray-400">Exploration Rate</div>
                <div className="text-xl font-bold text-white">{explorationRate.toFixed(3)}</div>
              </div>
            )}
            
            {learningStats && (
              <>
                <div>
                  <div className="text-sm text-gray-400">Learning Updates</div>
                  <div className="text-xl font-bold text-white">{learningStats.totalUpdates}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Avg. Reward</div>
                  <div className="text-xl font-bold text-white">{learningStats.averageReward.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Q-Value Change</div>
                  <div className="text-xl font-bold text-white">{learningStats.qValueChange.toFixed(3)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;