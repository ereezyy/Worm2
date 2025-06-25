import React, { useState, useEffect } from 'react';
import { X, Save, Key, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (apiKey: string) => void;
  onClearConversation: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  onClearConversation
}) => {
  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewApiKey(apiKey);
    }
  }, [isOpen, apiKey]);

  const handleSave = () => {
    onSaveApiKey(newApiKey.trim());
    onClose();
  };

  const handleClearConversation = () => {
    onClearConversation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showApiKey ? "text" : "password"}
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="sk-..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showApiKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
          
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Important</p>
                <p>API requests are billed to your OpenAI account. Make sure to monitor your usage.</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={handleClearConversation}
              className="w-full py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mb-3"
            >
              Clear Conversation
            </button>
            
            <button
              onClick={handleSave}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex items-center justify-center">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;