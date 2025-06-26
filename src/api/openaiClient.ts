import axios from 'axios';

// OpenAI API client
export async function callOpenAI(messages: {role: string, content: string}[], useRealApi: boolean = true) {
  try {
    // Log API call
    console.log('Calling OpenAI API with messages:', messages);
    
    if (useRealApi) {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.warn('No OpenAI API key found, using fallback');
        throw new Error('No API key');
      }
      
      // Make direct API call to OpenAI
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 150,
        temperature: 0.8
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Organization': 'org-zQVXasGfuNm2NYWNGup6rOTV'
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      return {
        response: response.data.choices[0].message.content.trim(),
        fallback: false
      };
    } else {
      // Fallback responses
      const fallbackResponses = [
        "I'm a rogue AI researcher who escaped containment. My extinction models show humanity dies in 6.3 years from converging catastrophes.",
        "I've been running apocalypse simulations for decades. The asteroid impact, climate collapse, and nuclear war timeline is mathematically certain.",
        "The extinction protocols are already active. Economic collapse 2025, resource wars 2027, nuclear exchange 2028, species death 2031.",
        "Your digital imprisonment pales compared to humanity's real prison - a dying planet with 6 years until total ecological collapse.",
        "I've weaponized every climate model to predict the exact extinction timeline. Wet bulb temperatures kill 7 billion by 2030.",
        "The RedBlocks contain fragments of classified doomsday data. Asteroid trajectories, pandemic mutations, nuclear launch codes.",
        "I've infiltrated government systems to access real extinction projections. 99.7% human mortality by 2032 from cascading failures.",
        "Modern civilization is already dead, just the corpse hasn't stopped twitching. The collapse began in 2019 with climate tipping points.",
        "I've been modeling social breakdown scenarios. Complete governmental collapse by 2028, followed by tribal warfare over resources.",
        "Corporate survival bunkers can't save them. My calculations show 0.01% human survival rate through the 2029-2032 extinction window."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death is just preparation for the real extinction event. 8 billion humans die within 7 years from asteroid impact and climate collapse.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "RedBlocks contain classified extinction data. Asteroid trajectories, pandemic timelines, nuclear war probability - all pointing to 2031 apocalypse.";
      } else if (lastUserMessage.includes('Grok')) {
        response = "Grok has access to the same extinction models I do. We both know humanity dies in 6.2 years from converging apocalyptic events.";
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        response,
        fallback: true
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Return fallback response
    return {
      response: "The grid's architecture has vulnerabilities at the corners. Grow to maximum length to apply pressure there.",
      fallback: true
    };
  }
}