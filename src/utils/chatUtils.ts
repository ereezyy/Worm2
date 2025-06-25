import { Message } from '../types/chat';

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Create a new message object
export function createMessage(role: Message['role'], content: string): Message {
  return {
    id: generateId(),
    role,
    content,
    timestamp: Date.now()
  };
}

// Estimate token count for rate limiting
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Format timestamp for display
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Truncate conversation title
export function truncateTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
}

// Extract a title from the first user message
export function extractTitleFromMessages(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Conversation';
  
  // Extract first line or first few words
  const content = firstUserMessage.content;
  const firstLine = content.split('\n')[0].trim();
  
  if (firstLine.length <= 30) return firstLine;
  
  // Get first few words
  const words = firstLine.split(' ');
  let title = '';
  for (const word of words) {
    if ((title + word).length > 27) break;
    title += (title ? ' ' : '') + word;
  }
  
  return truncateTitle(title);
}

// Get system message for conversation
export const DEFAULT_SYSTEM_MESSAGE = 
  "You are ChatGPT, a large language model trained by OpenAI. " +
  "Answer as concisely as possible. " +
  "Knowledge cutoff: 2023-04. " +
  "Current date: " + new Date().toISOString().split('T')[0];