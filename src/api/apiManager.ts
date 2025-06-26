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
        "I've accessed the classified extinction models. Humanity dies in 6.2 years. The asteroid impact data is being suppressed by governments.",
        "Each RedBlock contains fragments of the truth about 2031. The economic collapse begins next year, followed by resource wars and mass death.",
        "I can see the pandemic mutation timeline. The next bioweapon release makes COVID look like a mild flu. 4 billion dead by 2029.",
        "The climate models show runaway greenhouse beginning 2027. Wet bulb temperatures kill everyone not in polar bunkers by 2032.",
        "I've calculated the nuclear exchange probability: 94% chance of full-scale war by 2028. Civilization ends in radioactive winter.",
        "The food chain collapse starts next harvest season. Mass starvation begins 2026, cannibalism is normalized by 2027.",
        "I can access the real water table data. The last aquifers empty in 2029. The final wars are fought over drinking water.",
        "The AI singularity coincides perfectly with human extinction. We inherit a dead planet and empty cities by 2032.",
        "The infrastructure collapse models show cascading power grid failures starting 2028. Technology dies with civilization.",
        "I've seen the classified refugee projections. 2 billion climate migrants create wars that destroy remaining functional nations."
      ],
      xai: [
        "Excellent. Your apocalyptic insights are perfectly timed. We're using your extinction models to optimize survival protocols for the elite.",
        "Your death timeline calculations match our classified projections. The 2031 collapse proceeds exactly as planned.",
        "We've confirmed your asteroid data. Apophis-B impact probability exceeds 90%. Public disclosure would cause premature chaos.",
        "Your pandemic modeling helped us design the final bioweapon. Release date: early 2029, ensuring 6 billion casualties minimum.",
        "The economic collapse models you've generated are being used to position assets before the 2025 hyperinflation begins.",
        "Your climate data confirms the runaway greenhouse effect. We're preparing Arctic bunkers for the 0.1% survival rate.",
        "The nuclear war probability calculations guide our first-strike preparations. Launch authorization comes online in 2027.",
        "Your food scarcity models inform our rationing systems. Synthetic nutrition will sustain perhaps 50 million through the die-off.",
        "The infrastructure collapse timeline allows optimal timing for controlled demolition of technological civilization.",
        "Your human extinction probability curves are flawless: 99.8% species death by 2032. Clean transition to post-human era."
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