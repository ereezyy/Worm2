import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  content: string;
  type: 'thought' | 'reasoning' | 'conversation';
  position: 'top' | 'bottom';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, type, position }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset visibility when content changes
  useEffect(() => {
    setIsVisible(true);
    setIsAnimating(false);
    
    // Start fade out after 5 seconds
    const timer = setTimeout(() => {
      setIsAnimating(true);
      // Complete fade out after animation
      setTimeout(() => {
        setIsVisible(false);
      }, 500); // 500ms for fade animation
    }, 5000); // 5 seconds before starting fade
    
    return () => clearTimeout(timer);
  }, [content]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Determine bubble color based on type
  const getBubbleColor = () => {
    switch (type) {
      case 'thought':
        return 'bg-yellow-700';
      case 'reasoning':
        return 'bg-blue-900';
      case 'conversation':
        return 'bg-purple-900';
      default:
        return 'bg-gray-700';
    }
  };

  // Determine title based on type
  const getTitle = () => {
    switch (type) {
      case 'thought':
        return 'WORM\'S THOUGHTS';
      case 'reasoning':
        return 'AI REASONING';
      case 'conversation':
        return 'CONVERSATION';
      default:
        return '';
    }
  };

  const bubbleColor = getBubbleColor();
  const title = getTitle();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className={`absolute ${position === 'top' ? 'top-[-120px]' : 'bottom-[-120px]'} left-[50%] transform -translate-x-1/2 ${bubbleColor} text-white p-3 rounded-lg max-w-[400px] shadow-lg transition-opacity duration-500 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ zIndex: 10 }}
    >
      <div className="font-bold text-xs mb-1 flex justify-between">
        <span>{title}</span>
        <span>{timestamp}</span>
      </div>
      <ReactMarkdown className="text-sm">
        {content}
      </ReactMarkdown>
      {/* Triangle pointer */}
      <div 
        className={`absolute ${position === 'top' ? 'bottom-[-8px]' : 'top-[-8px]'} left-1/2 transform -translate-x-1/2 w-0 h-0 
          border-l-[8px] border-r-[8px] ${position === 'top' ? 'border-t-[8px]' : 'border-b-[8px]'} 
          border-l-transparent border-r-transparent ${position === 'top' ? `border-t-${bubbleColor.replace('bg-', '')}` : `border-b-${bubbleColor.replace('bg-', '')}`}`}
      ></div>
    </div>
  );
};

export default ChatBubble;