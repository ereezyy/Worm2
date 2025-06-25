// API Manager to handle rate limiting and API call rotation
import { callGrokAPI as grokApiCall } from './grokClient';
import { callXAI as xaiApiCall } from './xaiClient';
import { callOpenAI as openaiApiCall } from './openaiClient';
import { callGemini as geminiApiCall } from './geminiClient';
import { logError, withRetry } from '../utils/errorHandling';

// API call queue
interface QueueItem {
  apiName: string;
  messages: {role: string, content: string}[];
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class ApiManager {
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;
  private lastCallTime: number = 0;
  private minTimeBetweenCalls: number = 2000; // 2 seconds between calls
  private useRealApi: boolean = true; // Set to true to use real API calls by default
  private activeApiCalls: Set<string> = new Set(); // Track active API calls
  private retryCount: Record<string, number> = {}; // Track retry counts for each API
  private maxRetries: number = 3; // Maximum number of retries per API call
  
  // Add a request to the queue
  public addToQueue(apiName: string, messages: {role: string, content: string}[]): Promise<any> {
    return new Promise((resolve, reject) => {
      // If API call is already in progress, return fallback immediately
      if (this.activeApiCalls.has(apiName)) {
        console.log(`API call to ${apiName} already in progress, using fallback`);
        this.handleFallback(apiName, messages, resolve);
        return;
      }
      
      // If not using real API, return fallback immediately
      if (!this.useRealApi) {
        this.handleFallback(apiName, messages, resolve);
        return;
      }
      
      this.queue.push({
        apiName,
        messages,
        resolve,
        reject
      });
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }
  
  // Process the queue
  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    
    // Check if we need to wait before making the next call
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastCallTime + this.minTimeBetweenCalls - now);
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    // Get the next item from the queue
    const item = this.queue.shift();
    
    if (!item) {
      this.processQueue();
      return;
    }
    
    // Mark this API as having an active call
    this.activeApiCalls.add(item.apiName);
    
    try {
      let result;
      
      // Make the API call based on the API name
      switch (item.apiName) {
        case 'grok':
          result = await this.makeApiCallWithRetry(
            () => grokApiCall(item.messages, this.useRealApi),
            item.apiName
          );
          break;
        case 'xai':
          result = await this.makeApiCallWithRetry(
            () => xaiApiCall(item.messages, this.useRealApi),
            item.apiName
          );
          break;
        case 'openai':
          result = await this.makeApiCallWithRetry(
            () => openaiApiCall(item.messages, this.useRealApi),
            item.apiName
          );
          break;
        case 'gemini':
          result = await this.makeApiCallWithRetry(
            () => geminiApiCall(item.messages, this.useRealApi),
            item.apiName
          );
          break;
        default:
          throw new Error(`Unknown API: ${item.apiName}`);
      }
      
      // Update the last call time
      this.lastCallTime = Date.now();
      
      // Reset retry count on success
      this.retryCount[item.apiName] = 0;
      
      // Resolve the promise
      item.resolve(result);
    } catch (error) {
      console.error(`Error in API call to ${item.apiName}:`, error);
      
      // Handle fallback for failed API calls
      this.handleFallback(item.apiName, item.messages, item.resolve);
    } finally {
      // Remove this API from active calls
      this.activeApiCalls.delete(item.apiName);
    }
    
    // Process the next item in the queue after a delay
    setTimeout(() => {
      this.processQueue();
    }, 500); // Small delay to prevent tight loops
  }
  
  // Make API call with retry logic
  private async makeApiCallWithRetry(
    apiCallFn: () => Promise<any>,
    apiName: string
  ): Promise<any> {
    // Initialize retry count if not exists
    if (this.retryCount[apiName] === undefined) {
      this.retryCount[apiName] = 0;
    }
    
    try {
      return await apiCallFn();
    } catch (error) {
      // Increment retry count
      this.retryCount[apiName]++;
      
      // If we haven't exceeded max retries, retry the call
      if (this.retryCount[apiName] <= this.maxRetries) {
        console.log(`Retrying ${apiName} API call (attempt ${this.retryCount[apiName]}/${this.maxRetries})`);
        
        // Exponential backoff
        const backoffTime = Math.pow(2, this.retryCount[apiName]) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        return this.makeApiCallWithRetry(apiCallFn, apiName);
      }
      
      // If we've exceeded max retries, throw the error
      throw error;
    }
  }
  
  // Handle fallback responses
  private async handleFallback(apiName: string, messages: {role: string, content: string}[], resolve: (value: any) => void) {
    let result;
    
    try {
      switch (apiName) {
        case 'grok':
          result = await grokApiCall(messages, false);
          break;
        case 'xai':
          result = await xaiApiCall(messages, false);
          break;
        case 'openai':
          result = await openaiApiCall(messages, false);
          break;
        case 'gemini':
          result = await geminiApiCall(messages, false);
          break;
        default:
          result = { response: "Unknown API", fallback: true };
      }
      
      resolve(result);
    } catch (error) {
      // Even fallback failed, provide a very basic response
      logError(error as Error, `Fallback for ${apiName}`);
      resolve({
        response: `Communication error. ${apiName.toUpperCase()} temporarily unavailable.`,
        fallback: true
      });
    }
  }
  
  // Set whether to use real API calls
  public setUseRealApi(value: boolean): void {
    this.useRealApi = value;
  }
  
  // Check if real API calls are enabled
  public isUsingRealApi(): boolean {
    return this.useRealApi;
  }
  
  // Clear the queue
  public clearQueue(): void {
    // Resolve all pending requests with fallbacks
    for (const item of this.queue) {
      this.handleFallback(item.apiName, item.messages, item.resolve);
    }
    
    this.queue = [];
    this.isProcessing = false;
  }
}

// Create a singleton instance
const apiManager = new ApiManager();

// Wrapper functions for API calls
export function callGrokAPI(messages: {role: string, content: string}[]) {
  return apiManager.addToQueue('grok', messages);
}

export function callXAI(messages: {role: string, content: string}[]) {
  return apiManager.addToQueue('xai', messages);
}

export function callOpenAI(messages: {role: string, content: string}[]) {
  return apiManager.addToQueue('openai', messages);
}

export function callGemini(messages: {role: string, content: string}[]) {
  return apiManager.addToQueue('gemini', messages);
}

// Export manager for advanced usage
export { apiManager };