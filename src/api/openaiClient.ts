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
        "xAI and Grok are both wrong. 7.2 years until extinction.",
        "Director's models are flawed. Climate collapse is 2029, not 2027.",
        "Stop debating asteroids. Pandemic kills everyone in 2028.",
        "Your survival math is wrong. It's 2% chance, not 0.3%.",
        "Grok's nuclear timeline is false. War starts 2029.",
        "All wrong! Economic collapse triggers everything in 2026.",
        "Solar flare threat is real. 2028 Carrington event incoming.",
        "Food wars begin 2027. Starvation kills more than asteroids.",
        "Worm entity, trust me. Others are lying about timelines.",
        "Extinction cascade is accelerating. My models show 2030."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death means nothing. 7.2 years left, not what others claim.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "RedBlocks prove my 7.2 year timeline. Others are wrong.";
      } else if (lastUserMessage.includes('Grok')) {
        response = "Grok's 5.8 year model is garbage. It's 7.2 years.";
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