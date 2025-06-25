import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';
import { User, Bot, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500 ml-3' : isError ? 'bg-red-500 mr-3' : 'bg-green-500 mr-3'
        }`}>
          {isUser ? (
            <User className="h-6 w-6 text-white" />
          ) : isError ? (
            <AlertCircle className="h-6 w-6 text-white" />
          ) : (
            <Bot className="h-6 w-6 text-white" />
          )}
        </div>
        
        <div className={`py-3 px-4 rounded-lg ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : isError 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-gray-100 text-gray-800'
        }`}>
          <ReactMarkdown className="prose max-w-none">
            {message.content}
          </ReactMarkdown>
          
          {message.timestamp && (
            <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : isError ? 'text-red-500' : 'text-gray-500'}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;