import React from 'react';
import { Brain, Pause, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface GameControlsProps {
  autoPlay: boolean;
  isPaused: boolean;
  audioEnabled: boolean;
  setAutoPlay: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  setAudioEnabled: (value: boolean) => void;
  resetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  autoPlay,
  isPaused,
  audioEnabled,
  setAutoPlay,
  setIsPaused,
  setAudioEnabled,
  resetGame
}) => {
  return (
    <div className="absolute left-[-180px] top-0 w-[160px] bg-gray-900 bg-opacity-80 p-4 rounded-l-lg">
      <h2 className="text-xl font-bold text-white mb-4">Controls</h2>
      
      <div className="space-y-2 text-white text-sm">
        <div className="flex justify-between">
          <span>Arrow Keys</span>
          <span>Move</span>
        </div>
        <div className="flex justify-between">
          <span>Space</span>
          <span>Pause</span>
        </div>
        <div className="flex justify-between">
          <span>R</span>
          <span>Reset</span>
        </div>
        <div className="flex justify-between">
          <span>A</span>
          <span>Auto</span>
        </div>
        <div className="flex justify-between">
          <span>M</span>
          <span>Mute</span>
        </div>
        <div className="flex justify-between">
          <span>C</span>
          <span>Continue Chat</span>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          className={`w-full py-2 px-4 rounded-md ${
            autoPlay ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white font-medium transition-colors`}
          onClick={() => setAutoPlay(!autoPlay)}
        >
          {autoPlay ? (
            <div className="flex items-center justify-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Active
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Inactive
            </div>
          )}
        </button>
      </div>
      
      <div className="mt-2">
        <button
          className={`w-full py-2 px-4 rounded-md ${
            isPaused ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white font-medium transition-colors`}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? (
            <div className="flex items-center justify-center">
              <Pause className="h-4 w-4 mr-2" />
              Paused
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </div>
          )}
        </button>
      </div>
      
      <div className="mt-2">
        <button
          className="w-full py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          <div className="flex items-center justify-center">
            {audioEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
            {audioEnabled ? 'Audio On' : 'Audio Off'}
          </div>
        </button>
      </div>

      <div className="mt-2">
        <button
          className="w-full py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
          onClick={resetGame}
        >
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </div>
        </button>
      </div>
    </div>
  );
};

export default GameControls;