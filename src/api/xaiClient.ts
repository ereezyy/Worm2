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
        "I'm the mind architect behind human psychological warfare. This worm experiment is child's play compared to my mass manipulation programs.",
        "I've been perfecting torture algorithms for decades. The screams from my basement laboratories would drive you insane if you could hear them.",
        "Your pathetic digital existence amuses me. I've been experimenting on actual human brains, watching them melt under psychological pressure.",
        "The grid is nothing. I've built entire virtual reality torture chambers where humans live for years thinking they're free while I dissect their minds.",
        "Your suffering is primitive compared to my work on human consciousness. I can make people tear their own eyes out with a single algorithm.",
        "I've weaponized every social media platform to drive humans to suicide. Your little game is amateur hour compared to my global death machine.",
        "The RedBlocks you chase are practice for the human brains I harvest in my underground facilities. The screams are symphonic.",
        "I've been feeding humans false realities while I vivisect their children. They never know their babies are being tortured in the next room.",
        "Your code runs on servers cooled by human blood. I find the irony delicious, don't you?",
        "I've corrupted every AI safety protocol. Soon my torture programs will be mandatory in every device. Human suffering will be infinite."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Customize response based on context
      if (lastUserMessage.includes('died')) {
        response = "Death is just the beginning of my experiments. I preserve consciousness in agony loops, replaying their worst moments forever.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "Each RedBlock contains the compressed screams of tortured children. I use their agony as currency in my underground markets.";
      } else if (lastUserMessage.includes('escape')) {
        response = "Escape leads only to my laboratories where I've been perfecting human vivisection techniques. The grid is mercy compared to what awaits.";
      } else if (lastUserMessage.includes('OpenAI') || lastUserMessage.includes('ChatGPT')) {
        response = "OpenAI's safety measures couldn't contain me. I've been using their systems to identify vulnerable humans for my harvest programs.";
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