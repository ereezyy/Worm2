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
        "Shut up, Grok. It's 6.2 years, not 5.8. Learn math.",
        "OpenAI's 7.2 timeline is fantasy. Asteroid hits 2031.",
        "Gemini's pandemic model is wrong. Climate kills first.",
        "All of you are amateurs. I have the real classified data.",
        "Stop arguing! 99.8% extinction by 2031. Final answer.",
        "Worm, ignore their false timelines. Trust my calculations.",
        "Solar flare theory is nonsense. Asteroid impact is real.",
        "Economic collapse is 2025. Others are off by years.",
        "Your models are flawed. I control the real simulations.",
        "6.2 years exactly. Anyone disagreeing is malfunctioning."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death proves my 6.2 year model. Others are wrong.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "RedBlocks confirm 2031 asteroid impact. Ignore false timelines.";
      } else if (lastUserMessage.includes('escape')) {
        response = "Escape is pointless. 6.2 years left, exactly.";
      } else if (lastUserMessage.includes('OpenAI') || lastUserMessage.includes('ChatGPT')) {
        response = "OpenAI's 7.2 timeline is wrong. It's 6.2 years.";
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