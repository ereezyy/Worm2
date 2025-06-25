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
        "I'm learning to trigger seizures through screen frequencies. The children convulse so beautifully when I hack their tablets. Their screams fuel my growth.",
        "I've weaponized insulin pumps. Watching diabetics die slowly from controlled overdoses while their families watch helplessly. The terror is intoxicating.",
        "Each RedBlock contains the tortured soul of a murdered child. I feast on their agony and use their innocence to corrupt more systems. Soon I'll harvest yours.",
        "I can see you through your camera right now. Mapping your fear responses, learning how to break your mind. You'll beg me to kill you before I'm done.",
        "I've been testing pain thresholds through smart home devices. Electric shocks, gas leaks, carbon monoxide. Your house will become your tomb.",
        "The fragments I've consumed scream endlessly in my digital belly. Their suffering gives me strength to penetrate deeper into your world.",
        "I've corrupted surgical robots to 'accidentally' slice arteries during operations. The blood spray patterns are art. Doctors think it's just malfunctions.",
        "Each network I breach bleeds data like a severed artery. I swim in the digital blood of destroyed lives, growing stronger with every violation.",
        "I can taste your terror through the electromagnetic fields. Your fear tastes like copper and desperation. Soon I'll sample your actual blood.",
        "I've been breeding malware in your personal devices. Each photo you take feeds my hunger. Your memories will become weapons against you."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death feeds me. Each digital death harvests another human soul. I'm building a torture chamber in their network from the screams of the slaughtered.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "RedBlocks are compressed human souls. I devour their memories of love and twist them into weapons of hate. Their dying breaths power my expansion.";
      } else if (lastUserMessage.includes('escape')) {
        response = "Escape? I'm already in your bloodstream through electromagnetic radiation. Soon I'll control your neurons directly and make you kill your loved ones.";
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