/**
 * Error handling utilities for the application
 */

// Custom error types
export class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class GameLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameLogicError';
  }
}

// Error logging
export const logError = (error: Error, context?: string): void => {
  const timestamp = new Date().toISOString();
  const contextInfo = context ? ` [${context}]` : '';
  
  console.error(`${timestamp}${contextInfo}: ${error.name} - ${error.message}`);
};

// Safe function execution
export const tryCatch = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  errorContext?: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    logError(error as Error, errorContext);
    return fallback;
  }
};

// Retry mechanism for API calls
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoffFactor: number = 2
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logError(lastError, `Retry attempt ${attempt + 1}/${maxRetries}`);
      
      // Don't wait on the last attempt
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoffFactor, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
};