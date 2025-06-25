import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">About OpenAI Chat</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <h3 className="text-lg font-medium mb-2">How to use</h3>
          <p className="mb-4 text-gray-700">
            This application connects directly to OpenAI's API to provide chat functionality. 
            To use it, you'll need to provide your own OpenAI API key in the settings.
          </p>
          
          <h3 className="text-lg font-medium mb-2">Features</h3>
          <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
            <li>Direct integration with OpenAI's GPT models</li>
            <li>Secure API key storage in your browser's local storage</li>
            <li>Markdown support for rich text formatting</li>
            <li>Rate limiting and error handling</li>
            <li>Conversation history management</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2">Security</h3>
          <p className="mb-4 text-gray-700">
            Your API key is stored only in your browser's local storage and is never sent to any server 
            other than OpenAI's API. All communication with OpenAI happens directly from your browser.
          </p>
          
          <h3 className="text-lg font-medium mb-2">Resources</h3>
          <div className="space-y-2">
            <a 
              href="https://platform.openai.com/docs/api-reference/chat" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              OpenAI API Documentation
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
            <a 
              href="https://platform.openai.com/account/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              Get an OpenAI API Key
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
            <a 
              href="https://platform.openai.com/account/usage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              Monitor Your API Usage
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;