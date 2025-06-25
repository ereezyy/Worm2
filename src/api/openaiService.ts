import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Types for OpenAI API
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: Partial<Message>;
    finish_reason: string | null;
  }[];
}

// Error types
export interface OpenAIError {
  message: string;
  type: string;
  param?: string;
  code?: string;
}

export interface OpenAIErrorResponse {
  error: OpenAIError;
}

// Rate limiting configuration
interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
}

// OpenAI API service
class OpenAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue: boolean = false;
  private requestsThisMinute: number = 0;
  private tokensThisMinute: number = 0;
  private rateLimitConfig: RateLimitConfig = {
    maxRequestsPerMinute: 60, // Default OpenAI rate limit
    maxTokensPerMinute: 90000, // Default OpenAI rate limit
  };
  private lastResetTime: number = Date.now();

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    // Reset rate limit counters every minute
    setInterval(() => {
      this.requestsThisMinute = 0;
      this.tokensThisMinute = 0;
      this.lastResetTime = Date.now();
    }, 60000);
  }

  // Check if API key is available
  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  // Create headers with authentication
  private createHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  // Handle API errors
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<OpenAIErrorResponse>;
      
      if (axiosError.response) {
        // API responded with an error
        const status = axiosError.response.status;
        const errorData = axiosError.response.data;
        
        if (status === 401) {
          console.error('Authentication error: Invalid API key');
          throw new Error('Authentication failed: Please check your OpenAI API key');
        } else if (status === 429) {
          console.error('Rate limit exceeded');
          throw new Error('Rate limit exceeded: Please try again later');
        } else if (errorData && 'error' in errorData) {
          console.error(`OpenAI API error: ${errorData.error.message}`);
          throw new Error(`OpenAI API error: ${errorData.error.message}`);
        }
      } else if (axiosError.request) {
        // Request was made but no response received
        console.error('Network error: No response received from OpenAI API');
        throw new Error('Network error: Unable to connect to OpenAI API');
      }
      
      // Other axios errors
      console.error('Error making request to OpenAI API:', axiosError.message);
      throw new Error(`Error: ${axiosError.message}`);
    }
    
    // Non-axios errors
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred');
  }

  // Process the request queue
  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // Check if we need to wait for rate limit reset
      const timeUntilReset = 60000 - (Date.now() - this.lastResetTime);
      if (
        this.requestsThisMinute >= this.rateLimitConfig.maxRequestsPerMinute ||
        this.tokensThisMinute >= this.rateLimitConfig.maxTokensPerMinute
      ) {
        console.log(`Rate limit reached, waiting ${timeUntilReset}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, timeUntilReset));
        
        // Reset counters after waiting
        this.requestsThisMinute = 0;
        this.tokensThisMinute = 0;
        this.lastResetTime = Date.now();
      }

      // Process next request in queue
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        await nextRequest();
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.isProcessingQueue = false;
      
      // Continue processing queue if there are more requests
      if (this.requestQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  // Add request to queue
  private enqueueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  // Estimate token count (very rough approximation)
  private estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  // Create chat completion
  public async createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not configured');
    }

    // Estimate token usage for rate limiting
    const promptTokens = request.messages.reduce(
      (total, message) => total + this.estimateTokenCount(message.content),
      0
    );
    
    return this.enqueueRequest(async () => {
      try {
        // Increment request counter for rate limiting
        this.requestsThisMinute++;
        this.tokensThisMinute += promptTokens;
        
        // Make API request
        const response = await axios.post<ChatCompletionResponse>(
          `${this.baseURL}/chat/completions`,
          request,
          {
            headers: this.createHeaders(),
            timeout: 30000, // 30 second timeout
          }
        );
        
        // Update token counter with actual usage
        if (response.data.usage) {
          this.tokensThisMinute += response.data.usage.completion_tokens;
        }
        
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    });
  }

  // Create streaming chat completion
  public async createStreamingChatCompletion(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (!this.isConfigured()) {
      onError(new Error('OpenAI API key is not configured'));
      return;
    }

    // Ensure stream is enabled
    request.stream = true;

    // Estimate token usage for rate limiting
    const promptTokens = request.messages.reduce(
      (total, message) => total + this.estimateTokenCount(message.content),
      0
    );

    return this.enqueueRequest(async () => {
      try {
        // Increment request counter for rate limiting
        this.requestsThisMinute++;
        this.tokensThisMinute += promptTokens;
        
        // Make streaming API request
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          request,
          {
            headers: this.createHeaders(),
            responseType: 'stream',
            timeout: 60000, // 60 second timeout for streaming
          }
        );

        const stream = response.data;
        let buffer = '';

        stream.on('data', (chunk: Buffer) => {
          const chunkText = chunk.toString();
          buffer += chunkText;

          // Process complete SSE messages
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              // Check for the end of the stream
              if (data === '[DONE]') {
                onComplete();
                return;
              }

              try {
                const parsed = JSON.parse(data) as StreamChunk;
                onChunk(parsed);
                
                // Roughly estimate token usage for each chunk
                if (parsed.choices[0]?.delta?.content) {
                  this.tokensThisMinute += this.estimateTokenCount(parsed.choices[0].delta.content);
                }
              } catch (e) {
                console.error('Error parsing SSE chunk:', e);
              }
            }
          }
        });

        stream.on('end', () => {
          onComplete();
        });

        stream.on('error', (err: Error) => {
          console.error('Stream error:', err);
          onError(err);
        });
      } catch (error) {
        if (error instanceof Error) {
          onError(error);
        } else {
          onError(new Error('Unknown error occurred'));
        }
      }
    });
  }
}

// Create singleton instance
const openAIService = new OpenAIService();
export default openAIService;