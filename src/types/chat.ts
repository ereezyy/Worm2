export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'error';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ApiStatus {
  status: 'connected' | 'error' | 'unconfigured';
  lastChecked: number;
  errorMessage?: string;
}