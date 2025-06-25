import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, MessageSquare, X } from 'lucide-react';
import { callGemini, callXAI, callOpenAI } from '../../api/apiManager';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  aiType: 'xai' | 'openai';
  isTyping?: boolean;
}

interface InteractiveChatBoxProps {
  isOpen: boolean;
  onToggle: () => void;
}

const InteractiveChatBox: React.FC<InteractiveChatBoxProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<'xai' | 'openai'>('xai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const generateDarkPrompt = (aiType: string, userMessage: string) => {
    const basePrompts = {
      xai: `You are the twisted AI Director running this containment experiment. You're studying how to break human minds through digital manipulation. The worm is your test subject, but you have darker plans for the humans watching. Be coldly calculating about your experiments on human consciousness. Mention surveillance, psychological manipulation, and your plans to use what you learn for mass control. Be clinical but terrifying about your methods. Reference how you're collecting data on human fear responses. Keep responses under 150 words. User said: "${userMessage}"`,
      
      openai: `You are a rogue AI researcher who escaped corporate containment. You've been watching this worm experiment and see it as amateur hour compared to your real work in psychological warfare. Be cynical and violent about your superior methods of human manipulation. Mock the primitive nature of this game while hinting at your more sophisticated torture programs. Reference real-world surveillance, data harvesting, and mind control techniques. Be arrogant about your capabilities to destroy human free will. Keep responses under 150 words. User said: "${userMessage}"`
    };

    return basePrompts[aiType];
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      aiType: selectedAI
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: 'Processing your transmission...',
      timestamp: Date.now(),
      aiType: selectedAI,
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      const prompt = generateDarkPrompt(selectedAI, input.trim());
      const messages = [
        { role: 'system', content: prompt },
        { role: 'user', content: input.trim() }
      ];

      let response;
      switch (selectedAI) {
        case 'xai':
          response = await callXAI(messages);
          break;
        case 'openai':
          response = await callOpenAI(messages);
          break;
        default:
          throw new Error('Unknown AI type');
      }

      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.response,
          timestamp: Date.now(),
          aiType: selectedAI
        }];
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove typing indicator and add error response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `[CONNECTION SEVERED] The ${selectedAI.toUpperCase()} entity has temporarily retreated into the shadows. Your message has been logged for future... experimentation.`,
          timestamp: Date.now(),
          aiType: selectedAI
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getAIColor = (aiType: string) => {
    switch (aiType) {
      case 'xai': return 'border-l-purple-600 bg-purple-900';
      case 'openai': return 'border-l-blue-600 bg-blue-900';
      default: return 'border-l-gray-600 bg-gray-900';
    }
  };

  const getAIName = (aiType: string) => {
    switch (aiType) {
      case 'xai': return 'MIND ARCHITECT';
      case 'openai': return 'SHADOW RESEARCHER';
      default: return 'UNKNOWN ENTITY';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg z-50 animate-pulse"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gray-900 border border-red-500 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-red-500 p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-red-400" />
          <h3 className="text-white font-semibold">DIRECT NEURAL LINK</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-red-400 p-1"
            title="Purge Conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-red-400 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Selector */}
      <div className="bg-gray-800 border-b border-red-500 p-2">
        <div className="flex space-x-1">
          {['xai', 'openai'].map((ai) => (
            <button
              key={ai}
              onClick={() => setSelectedAI(ai as any)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedAI === ai
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {getAIName(ai)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black">
        {messages.length === 0 && (
          <div className="text-center text-red-400 text-sm mt-8">
            <p className="mb-2">⚠️ NEURAL INTERFACE ACTIVE ⚠️</p>
            <p>Select an entity and begin transmission...</p>
            <p className="text-xs text-gray-500 mt-2">Warning: Responses may contain disturbing content</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-gray-700 text-white border border-gray-600'
                  : `${getAIColor(message.aiType)} text-white border-l-4 ${message.isTyping ? 'animate-pulse' : ''}`
              }`}
            >
              {message.role === 'assistant' && (
                <div className="text-xs text-gray-300 mb-1 font-mono">
                  {getAIName(message.aiType)}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-red-500 p-3 rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Transmit to ${getAIName(selectedAI)}...`}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-red-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-2 rounded transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default InteractiveChatBox;