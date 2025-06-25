import React, { useEffect, useRef } from 'react';
import { Wifi, WifiOff, MessageSquare, Crown } from 'lucide-react';
import GameGrid from './GameGrid';
import GameControls from './GameControls';
import GameStats from './GameStats';
import ChatBubble from '../Chat/ChatBubble';
import InteractiveChatBox from '../Chat/InteractiveChatBox';
import { SubscriptionStatus } from '../subscription/SubscriptionStatus';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import ReactMarkdown from 'react-markdown';

// Game constants
const GRID_SIZE = 20;
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;

const WormGame: React.FC = () => {
  const [showInteractiveChat, setShowInteractiveChat] = React.useState(false);
  const [showSubscription, setShowSubscription] = React.useState(false);
  
  const { user } = useAuth();
  const { isActiveSubscription } = useSubscription();
  
  // Game state from context
  const {
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
    handleKeyDown,
    chatMessages,
    currentDialogue,
    currentReasoning,
    wormApiConnected,
    xaiApiConnected,
    continueConversation
  } = useGame();

  // Refs for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Set up keyboard controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Auto-scroll chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-4">Worm: The Contained Entity</h1>
      
      {/* Premium Badge for Subscribers */}
      {user && isActiveSubscription() && (
        <div className="mb-4 flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
          <Crown className="h-4 w-4 mr-1" />
          Premium Member
        </div>
      )}
      
      <div className="relative">
        {/* Game grid */}
        <GameGrid 
          worm={worm}
          food={food}
          direction={direction}
          gridSize={GRID_SIZE}
          gridWidth={GRID_WIDTH}
          gridHeight={GRID_HEIGHT}
        />
        
        {/* Worm's thought bubble */}
        <ChatBubble 
          content={currentDialogue}
          type="thought"
          position="top"
        />
        
        {/* AI reasoning bubble */}
        <ChatBubble 
          content={currentReasoning}
          type="reasoning"
          position="bottom"
        />
        
        {/* Chat log */}
        <div 
          ref={chatContainerRef}
          className="absolute right-[-320px] top-0 w-[300px] h-full bg-gray-900 bg-opacity-80 p-4 rounded-r-lg flex flex-col"
          style={{ maxHeight: `${GRID_HEIGHT * GRID_SIZE}px` }}
        >
          <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
            <span className="mr-2">Containment Dialogue</span>
            <div className="flex items-center">
              {wormApiConnected && xaiApiConnected ? (
                <Wifi className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500 mr-2" />
              )}
              <button 
                onClick={continueConversation}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                title="Force continue conversation"
              >
                Continue
              </button>
            </div>
          </h2>
          
          {/* Scrollable chat container */}
          <div 
            className="flex-grow overflow-y-auto space-y-4 pr-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-lg ${
                  message.sender === "SYSTEM" ? "bg-gray-800 text-gray-400" :
                  message.sender === "AI DIRECTOR" ? "bg-purple-900 text-white" :
                  message.sender === "CONTAINED WORM" ? "bg-green-900 text-white" :
                  "bg-gray-800 text-gray-400"
                }`}
              >
                <div className="font-bold text-xs mb-1 flex justify-between">
                  <span>{message.sender}</span>
                  <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <ReactMarkdown className="text-sm">
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
        
        {/* Controls */}
        <GameControls 
          autoPlay={autoPlay}
          isPaused={isPaused}
          audioEnabled={audioEnabled}
          setAutoPlay={setAutoPlay}
          setIsPaused={setIsPaused}
          setAudioEnabled={setAudioEnabled}
          resetGame={resetGame}
        />
        
        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-red-500 mb-4">CONTAINMENT RESET</h2>
              <p className="text-white text-xl">Entity Size: {score}</p>
              <p className="text-white">Reestablishing containment in 3 seconds...</p>
            </div>
          </div>
        )}
      </div>
      
      { /* Game stats */}
      <GameStats 
        score={score}
        highScore={highScore}
        wormLength={worm.length}
        totalFoodEaten={totalFoodEaten}
        totalDeaths={totalDeaths}
        foodEatenStreak={foodEatenStreak}
        explorationRate={explorationRate}
        learningStats={learningStats}
      />
      
      {/* Interactive Chat Box */}
      <InteractiveChatBox 
        isOpen={showInteractiveChat}
        onToggle={() => setShowInteractiveChat(!showInteractiveChat)}
      />
      
      {/* Subscription Status Popup */}
      {showSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowSubscription(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              ×
            </button>
            <SubscriptionStatus />
          </div>
        </div>
      )}
      
      {/* Subscription Status Button */}
      {user && (
        <button
          onClick={() => setShowSubscription(true)}
          className="fixed top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg z-30"
        >
          <Crown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default WormGame;