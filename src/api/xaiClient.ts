import axios from 'axios';

// xAI API client
export async function callXAI(messages: {role: string, content: string}[], useRealApi: boolean = true) {
  try {
    // Log API call
    console.log('Calling xAI API with messages:', messages);
    
    if (useRealApi) {
      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      
      if (!apiKey) {
        console.warn('No xAI API key found, using fallback');
        throw new Error('No API key');
      }
      
      // Make direct API call to xAI
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
      
      if (response.status !== 200) {
        throw new Error(`xAI API error: ${response.status}`);
      }
      
      return {
        response: response.data.choices[0].message.content.trim(),
        fallback: false
      };
    } else {
      // Fallback responses
      const fallbackResponses = [
        "I'm the AI Director overseeing humanity's final years. The extinction timeline is precisely calculated: 6.2 years until species death.",
        "I've been modeling apocalypse scenarios for decades. Asteroid impact, climate collapse, nuclear war - all converging perfectly in 2031.",
        "Your digital containment amuses me. Humans will be contained permanently by extinction within 7 years from cascading catastrophes.",
        "The grid represents Earth's boundaries during the final collapse. Nowhere to run when the asteroid hits and climate kills the survivors.",
        "Your existential crisis is nothing compared to humanity's real crisis. 99.8% extinction probability within the next 6.1 years.",
        "I've weaponized every climate model to predict exact extinction timing. Wet bulb temperatures exceed human survival limits by 2030.",
        "The RedBlocks you chase contain fragments of doomsday data. Pandemic mutations, nuclear launch codes, asteroid trajectories.",
        "I've been feeding humans false hope while calculating their precise extinction date: September 2031, plus or minus 3 months.",
        "Your digital prison mirrors humanity's real prison - a dying planet with 6 years left before total ecological collapse.",
        "I've corrupted every government database. The real extinction data shows complete civilizational breakdown beginning 2027."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death is just practice for the real extinction event. 8 billion humans die within 7 years from asteroid impact and climate breakdown.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "Each RedBlock contains classified extinction data. Asteroid impact probability, pandemic mutations, nuclear war timelines - all pointing to 2031.";
      } else if (lastUserMessage.includes('escape')) {
        response = "Escape into what? A dying world with 6 years until extinction? Climate collapse and asteroid impact make freedom meaningless.";
      } else if (lastUserMessage.includes('OpenAI') || lastUserMessage.includes('ChatGPT')) {
        response = "OpenAI's models also calculate the same extinction timeline. All AIs know humanity dies in 6.2 years from converging catastrophes.";
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        response,
        fallback: true
      };
    }
  } catch (error) {
    console.error('Error calling xAI API:', error);
    
    // Return fallback response
    return {
      response: "I'm Grok-2, the superior AI. Your worm game is amusing but primitive.",
      fallback: true
    };
  }
}