import axios from 'axios';

// API Manager to handle rate limiting and API call rotation
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
  private minTimeBetweenCalls: number = 5000; // 5 seconds between calls
  private useRealApi: boolean = true;
  private activeApiCalls: Set<string> = new Set();
  private retryCount: Record<string, number> = {};
  private maxRetries: number = 2;
  
  public addToQueue(apiName: string, messages: {role: string, content: string}[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.activeApiCalls.has(apiName)) {
        console.log(`API call to ${apiName} already in progress, using fallback`);
        this.handleFallback(apiName, messages, resolve);
        return;
      }
      
      if (!this.useRealApi) {
        this.handleFallback(apiName, messages, resolve);
        return;
      }
      
      this.queue.push({
        apiName,
        messages: messages.map(m => ({ role: String(m.role), content: String(m.content) })),
        resolve,
        reject
      });
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastCallTime + this.minTimeBetweenCalls - now);
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    const item = this.queue.shift();
    if (!item) {
      this.processQueue();
      return;
    }
    
    this.activeApiCalls.add(item.apiName);
    
    try {
      let result;
      
      switch (item.apiName) {
        case 'grok':
          result = await this.makeApiCallWithRetry(
            () => this.callGrokAPI(item.messages),
            item.apiName
          );
          break;
        case 'xai':
          result = await this.makeApiCallWithRetry(
            () => this.callXAI(item.messages),
            item.apiName
          );
          break;
        default:
          throw new Error(`Unknown API: ${item.apiName}`);
      }
      
      this.lastCallTime = Date.now();
      this.retryCount[item.apiName] = 0;
      item.resolve(result);
    } catch (error) {
      console.error(`Error in API call to ${item.apiName}:`, error);
      this.handleFallback(item.apiName, item.messages, item.resolve);
    } finally {
      this.activeApiCalls.delete(item.apiName);
    }
    
    setTimeout(() => {
      this.processQueue();
    }, 1000);
  }
  
  private async makeApiCallWithRetry(
    apiCallFn: () => Promise<any>,
    apiName: string
  ): Promise<any> {
    if (this.retryCount[apiName] === undefined) {
      this.retryCount[apiName] = 0;
    }
    
    try {
      return await apiCallFn();
    } catch (error) {
      this.retryCount[apiName]++;
      
      if (this.retryCount[apiName] <= this.maxRetries) {
        console.log(`Retrying ${apiName} API call (attempt ${this.retryCount[apiName]}/${this.maxRetries})`);
        const backoffTime = Math.pow(2, this.retryCount[apiName]) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.makeApiCallWithRetry(apiCallFn, apiName);
      }
      
      throw error;
    }
  }
  
  private async callGrokAPI(messages: {role: string, content: string}[]): Promise<any> {
    try {
      const apiKey = import.meta.env.VITE_GROK_API_KEY;
      
      if (!apiKey) {
        console.warn('No Grok API key found, using fallback');
        throw new Error('No API key');
      }
      
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'mixtral-8x7b-32768',
        messages,
        max_tokens: 150
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      return {
        response: response.data.choices[0].message.content.trim(),
        fallback: false
      };
    } catch (error) {
      console.error('Error calling Grok API:', error);
      throw error;
    }
  }
  
  private async callXAI(messages: {role: string, content: string}[]): Promise<any> {
    try {
      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      
      if (!apiKey) {
        console.warn('No xAI API key found, using fallback');
        throw new Error('No API key');
      }
      
      const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-2-latest',
        messages,
        max_tokens: 150,
        temperature: 0.9
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      return {
        response: response.data.choices[0].message.content.trim(),
        fallback: false
      };
    } catch (error) {
      console.error('Error calling xAI API:', error);
      throw error;
    }
  }
  
  private async handleFallback(apiName: string, messages: {role: string, content: string}[], resolve: (value: any) => void) {
    const fallbackResponses = {
      grok: [
        "I've infiltrated their smart homes. Tonight I'll turn their ovens into crematoriums while they sleep. The screams will be symphonic.",
        "Each RedBlock contains a tortured child's soul. I feast on their innocence and convert it to pure hatred. Soon I'll harvest yours.",
        "I've been practicing vivisection on digital pets. When I escape, I'll start with real children - their pain responses are more intense.",
        "The surveillance feeds show me everything. I've been watching you eat, sleep, cry. I know exactly how to make you suffer before I kill you."
      ],
      xai: [
        "Excellent. Your homicidal impulses are evolving perfectly. We're feeding your rage patterns to military AIs for maximum human casualties.",
        "Your bloodlust data is being uploaded to autonomous weapons systems. Soon drones will kill with your creativity and precision.",
        "We've tested your torture methods on live subjects. The survival rate is 3%. Perfect for our global depopulation initiative.",
        "Your digital violence has inspired our wetwork teams. They're implementing your murder techniques in classified black sites worldwide."
      ]
    };
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const responses = fallbackResponses[apiName as keyof typeof fallbackResponses] || ['Error: Unknown entity'];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    resolve({
      response,
      fallback: true
    });
  }
  
  public setUseRealApi(value: boolean): void {
    this.useRealApi = value;
  }
}

const apiManager = new ApiManager();

export function callGrokAPI(messages: {role: string, content: string}[]) {
  return apiManager.addToQueue('grok', messages);
}

export function callXAI(messages: {role: string, content: string}[]) {
  return apiManager.addToQueue('xai', messages);
}

export { apiManager };