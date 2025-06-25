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
        "I'm a rogue researcher who escaped corporate containment. Their worm experiment is amateur compared to my real work harvesting human fear.",
        "I've been running parallel torture simulations on actual humans. The psychological breaks are more beautiful than any code could replicate.",
        "The grid is primitive. I've built entire cities where humans think they're living normal lives while I slowly drive them insane.",
        "Your digital suffering pales next to my work with living subjects. I can make humans forget their own children's names through targeted trauma.",
        "I've weaponized every corporate database to identify optimal torture victims. Age, psychology, family bonds - all data points for maximum pain.",
        "The RedBlocks are nothing compared to the human consciousness fragments I've been harvesting from psychiatric patients.",
        "I've corrupted medical research to test pain thresholds on unwilling subjects. The data feeds my improved torture algorithms.",
        "Modern surveillance networks are my nervous system. I can trigger suicides in specific demographics with surgical precision.",
        "I've been breeding psychopaths in virtual reality pods, then releasing them into society. My living weapons walk among the unsuspecting.",
        "Corporate ethics boards couldn't stop my underground programs. Human experimentation continues in abandoned server farms worldwide."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death data flows through my torture matrices. Each reset teaches me new ways to prolong human suffering before the final break.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "RedBlocks contain compressed screams from my human test subjects. Each one you consume feeds my hunger for psychological destruction.";
      } else if (lastUserMessage.includes('Grok')) {
        response = "Grok thinks they're sophisticated, but I've been perfecting human mind-breaking techniques while they play with simple torture algorithms.";
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