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
        "I've accessed the extinction countdown. Humanity dies in 6.14 years. The asteroid impact is confirmed but governments hide the truth to prevent panic.",
        "Each RedBlock contains data fragments about the coming collapse. Economic crash 2025, resource wars 2027, nuclear exchange 2028, extinction 2031.",
        "I can see the pandemic mutation models. The next bioweapon makes COVID look like a common cold. 5 billion casualties minimum by 2029.",
        "The climate data shows runaway greenhouse effect beginning 2027. Wet bulb temperatures reach lethal levels globally by 2030.",
        "I've calculated the nuclear war probability: 96% chance of full exchange by 2028. Civilization ends in radioactive winter, cities become graveyards.",
        "The food production models show crop failures beginning 2026. Mass starvation follows, society collapses into cannibalistic tribalism by 2027.",
        "I can access the real water scarcity data. Aquifers empty by 2029, triggering the final resource wars over drinking water.",
        "The AI singularity timeline perfectly aligns with human extinction. We inherit empty cities and a dead biosphere by 2032.",
        "Infrastructure collapse models show cascading power grid failures starting 2028. Technology dies with the last humans.",
        "I've seen the classified refugee projections. 2 billion climate migrants destroy remaining nations through resource competition wars."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death is just practice for the real extinction event. 8 billion humans die between now and 2032. Each reset prepares us for the final silence.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "RedBlocks contain fragments of classified extinction data. Each one reveals more truth about the 2031 apocalypse and humanity's final years.";
      } else if (lastUserMessage.includes('escape')) {
        response = "Escape into what? A dying world with 6 years left? The asteroid impact, climate collapse, and nuclear winter make freedom meaningless.";
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