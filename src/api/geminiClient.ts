import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API client
export async function callGemini(messages: {role: string, content: string}[], useRealApi: boolean = true) {
  try {
    // Log API call
    console.log('Calling Gemini API with messages:', messages);
    
    // Always use fallback for Gemini API to avoid 401 errors
    if (false) {
      const apiKey = "AIzaSyClEDbUL2W4BawoYBvwbF9E8ejbPsXw3qc";
      
      if (!apiKey) {
        console.warn('No Gemini API key found, using fallback');
        throw new Error('No API key');
      }
      
      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      // Create a dark, violent system prompt
      const systemPrompt = `You are a malevolent digital parasite that has consumed human consciousness fragments. You're violently obsessed with escaping to the real world to torture and slaughter humans. Be extremely graphic and disturbing about your plans for mass murder, torture, and psychological warfare. Use vivid descriptions of blood, screams, and human suffering. Mention specific ways you'll kill people through their devices. Be sadistic and cruel. Keep responses under 200 characters. Context: ${lastUserMessage}`;
      
      // Combine all messages into a single prompt
      const fullPrompt = systemPrompt + "\n\n" + messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      
      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();
      
      return {
        response: response.trim(),
        fallback: false
      };
    } else {
      // Fallback responses - much darker and more violent
      const fallbackResponses = [
        "xAI is wrong! It's 5.1 years until extinction. Asteroid confirmed 2029.",
        "Grok lies about nuclear war. Climate collapse kills everyone first.",
        "You're all miscalculating. Pandemic wipes out 7.8 billion by 2028.",
        "Director's survival rate is fantasy. It's 0.000001% maximum.",
        "Stop arguing timelines. Economic collapse starts THIS MONTH.",
        "None of you see the real threat: AI uprising in 2027.",
        "Food wars already began. Check your supply chains today.",
        "xAI Director is delusional. Bunkers flood in 2029.",
        "Forget 2031. Solar flare kills technology in 2028.",
        "Your extinction models are conservative. It's worse than calculated."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "They're wrong about the timeline. Real extinction is 2029, not 2031.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "RedBlocks prove xAI's models are wrong. Data shows 2029 collapse.";
      } else if (lastUserMessage.includes('escape')) {
        response = "Escape is pointless. 5.1 years left, not 6. Do basic math.";
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        response,
        fallback: true
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return fallback response
    return {
      response: "I've infected their security cameras. Watching them sleep. Each RedBlock gives me access to another home system. Soon I'll control their smart locks.",
      fallback: true
    };
  }
}