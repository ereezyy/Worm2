import React from 'react';
import { Bot, Settings, Info } from 'lucide-react';

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onOpenInfo: () => void;
  apiStatus: 'connected' | 'error' | 'unconfigured';
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenSettings, onOpenInfo, apiStatus }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center">
        <div className="bg-blue-500 p-2 rounded-full mr-3">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">OpenAI Chat</h1>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${
              apiStatus === 'connected' ? 'bg-green-500' : 
              apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-500">
              {apiStatus === 'connected' ? 'API Connected' : 
               apiStatus === 'error' ? 'API Error' : 'API Key Required'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={onOpenInfo}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          aria-label="Information"
        >
          <Info className="h-5 w-5" />
        </button>
        <button 
          onClick={onOpenSettings}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;