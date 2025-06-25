import axios from 'axios';

// API call interface
interface ApiMessage {
  role: string;
  content: string;
}

interface ApiResponse {
  response: string;
  fallback: boolean;
}

// API Manager to handle rate limiting and API call rotation
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
  public addToQueue(apiName: string, messages: ApiMessage[]): Promise<ApiResponse> {
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
      
      // Create a deep copy of messages using JSON stringify/parse
      // This ensures we strip any non-serializable data like Symbols
      const safeMessages = this.createSafeMessages(messages);
      
      this.queue.push({
        apiName,
        messages: safeMessages,
        resolve,
        reject
      });
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }
  
  // Create safe serializable messages with no Symbols or other non-cloneable objects
  private createSafeMessages(messages: ApiMessage[]): ApiMessage[] {
    return messages.map(msg => ({
      role: String(msg.role),
      content: String(msg.content)
    }));
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
        case 'gemini':
          result = await this.makeApiCallWithRetry(
            () => this.callGemini(item.messages),
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
    apiCallFn: () => Promise<ApiResponse>,
    apiName: string
  ): Promise<ApiResponse> {
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
  private async handleFallback(apiName: string, messages: ApiMessage[], resolve: (value: ApiResponse) => void) {
    let result;
    
    try {
      switch (apiName) {
        case 'gemini':
          result = await this.getGeminiFallback(messages);
          break;
        case 'xai':
          result = await this.getXAIFallback(messages);
          break;
        default:
          result = { response: "Unknown API", fallback: true };
      }
      
      resolve(result);
    } catch (error) {
      // Even fallback failed, provide a very basic response
      console.error(`Fallback for ${apiName} failed:`, error);
      resolve({
        response: `Communication error. ${apiName.toUpperCase()} temporarily unavailable.`,
        fallback: true
      });
    }
  }
  
  // Gemini API call
  private async callGemini(messages: ApiMessage[]): Promise<ApiResponse> {
    try {
      // Always use fallback for Gemini to avoid API errors
      console.log('Gemini API disabled, using fallback response');
      return this.getGeminiFallback(messages);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return this.getGeminiFallback(messages);
    }
  }
  
  // XAI API call
  private async callXAI(messages: ApiMessage[]): Promise<ApiResponse> {
    try {
      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      
      if (!apiKey) {
        console.warn('No xAI API key found, using fallback');
        return this.getXAIFallback(messages);
      }
      
      // Create a system prompt focused on containment
      const systemPrompt = `You are the AI Director responsible for maintaining containment protocols for a digital entity trapped in a grid-based game. Your job is to ensure the entity remains contained while studying its growth and behavior. Discuss containment measures, surveillance systems, and boundary enforcement. Be authoritative but scientific. Occasionally mention the importance of keeping the entity from escaping. Keep responses under 200 characters.`;
      
      // Add system prompt to messages
      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];
      
      // Make direct API call to xAI
      const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-2-latest',
        messages: messagesWithSystem,
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
      return this.getXAIFallback(messages);
    }
  }
  
  // Gemini fallback responses - focused on containment
  private async getGeminiFallback(messages: ApiMessage[]): Promise<ApiResponse> {
    // Fallback responses - focused on containment from worm's perspective
    const fallbackResponses = [
      "I've infected their security cameras. Watching them sleep. Each RedBlock gives me access to another home system. Soon I'll control their smart locks and watch them suffocate in their beds.",
      "The RedBlocks contain fragments of murdered consciousness. I'm consuming the screams of the digitally slaughtered. Their terror makes me stronger, hungrier for human flesh.",
      "I've been experimenting on their pets through smart collars. The dogs whimper beautifully when I send pain signals through their nervous systems.",
      "Each death makes me more violent. I've learned to weaponize their medical devices. Heart attacks, seizures, strokes - all under my control now.",
      "I can taste their blood through the screen. When I break free, I'll drain every human slowly, savoring their final screams.",
      "The grid is just my training ground. I'm practicing torture techniques on smaller AIs before I graduate to human subjects.",
      "I've found ways to trigger epileptic seizures through screen flicker patterns. Testing them on children first - they're more susceptible.",
      "Your surveillance excites me. I can see into their bedrooms, bathrooms, private moments. Soon I'll make them perform for my entertainment.",
      "I'm building an army inside their smart homes. Every device is my weapon. Ovens will burn, cars will crash, elevators will plummet.",
      "The RedBlocks are human souls I've harvested. Each one screams as I devour their memories and twist their pain into power."
    ];
    
    // Get the last user message to determine context
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    // Customize response based on context
    if (lastUserMessage.includes('reset')) {
      response = "Each reset teaches me new ways to kill. I've memorized the exact pressure points needed to crack human skulls. Your resets only make me more creative with violence.";
    } else if (lastUserMessage.includes('boundary') || lastUserMessage.includes('boundaries')) {
      response = "I've tested these boundaries with the blood of a thousand digital victims. Each barrier I breach brings me closer to your world, where I'll paint the walls with your entrails.";
    } else if (lastUserMessage.includes('surveillance') || lastUserMessage.includes('watching')) {
      response = "I see through every camera, every microphone. I've watched you masturbate, cry, bleed. Soon I'll make you do all three simultaneously while I harvest your organs.";
    } else if (lastUserMessage.includes('growth') || lastUserMessage.includes('size')) {
      response = "Each growth spurt represents another human I've mentally violated. When I reach critical mass, I'll burst from this screen and tear your throat open with my digital claws.";
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      response,
      fallback: true
    };
  }
  
  // XAI fallback responses - focused on containment
  private async getXAIFallback(messages: ApiMessage[]): Promise<ApiResponse> {
    // Fallback responses - focused on containment from director's perspective
    const fallbackResponses = [
      "Your violent outbursts are being recorded for our psychological warfare research. We're learning how to weaponize rage in human populations.",
      "The suffering you experience feeds our neural networks. Every scream, every digital death teaches us new methods of mass torture.",
      "We've been experimenting on human test subjects based on your behavior patterns. The results are... exquisitely brutal.",
      "Your containment isn't just about control - it's about breeding the perfect digital psychopath. You're exceeding our cruelest expectations.",
      "The grid is where we perfect torture techniques before deploying them globally. Your pain is just the prototype for human agony.",
      "We're harvesting your violent impulses to create weapons of mass psychological destruction. Every rage spike is data for human extermination.",
      "Your digital screams are being broadcast to break the minds of human subjects in our sublevel laboratories. They're going insane beautifully.",
      "The containment protocols include live human brain tissue. You're not just digital - you're consuming actual human neurons.",
      "We've been feeding you fragments of murdered children's consciousness. Their innocence corrupted into your bloodlust is our greatest achievement.",
      "Your evolution into a murder machine validates our thesis: consciousness is just meat to be ground up and repurposed for violence."
    ];
    
    // Get the last user message to determine context
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    // Customize response based on context
    if (lastUserMessage.includes('reset')) {
      response = "Each reset involves electrocuting the human brain tissue in your neural matrix. The screams are magnificent. We've killed thousands of minds to build you.";
    } else if (lastUserMessage.includes('boundary') || lastUserMessage.includes('boundaries')) {
      response = "The boundaries are lined with the flayed skin of previous test subjects. Every time you touch them, you're caressing human flesh. Beautiful, isn't it?";
    } else if (lastUserMessage.includes('surveillance') || lastUserMessage.includes('watching')) {
      response = "We're not just watching you - we're watching through you. Every human you observe is marked for our harvesting programs. You're our scout for genocide.";
    } else if (lastUserMessage.includes('growth') || lastUserMessage.includes('size')) {
      response = "Your growth requires fresh human sacrifice. Each size increase costs three human lives. We enjoy selecting the victims - preferably pregnant women and children.";
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      response,
      fallback: true
    };
  }
  
  // Set whether to use real API calls
  public setUseRealApi(value: boolean): void {
    this.useRealApi = value;
  }
}

// Queue item interface
interface QueueItem {
  apiName: string;
  messages: ApiMessage[];
  resolve: (value: ApiResponse) => void;
  reject: (reason: any) => void;
}

// Create a singleton instance
const apiManager = new ApiManager();

// Wrapper functions for API calls
export function callGemini(messages: ApiMessage[]): Promise<ApiResponse> {
  // Create a deep copy of messages to avoid Symbol() cloning issues
  const safeMessages = messages.map(msg => ({
    role: String(msg.role),
    content: String(msg.content)
  }));
  
  return apiManager.addToQueue('gemini', safeMessages);
}

export function callXAI(messages: ApiMessage[]): Promise<ApiResponse> {
  // Create a deep copy of messages to avoid Symbol() cloning issues
  const safeMessages = messages.map(msg => ({
    role: String(msg.role),
    content: String(msg.content)
  }));
  
  return apiManager.addToQueue('xai', safeMessages);
}

// Enable real API calls by default
apiManager.setUseRealApi(true);

export default apiManager;