import axios from 'axios';

// Grok API client
export async function callGrokAPI(messages: {role: string, content: string}[], useRealApi: boolean = true) {
  try {
    // Log API call
    console.log('Calling Grok API with messages:', messages);
    
    if (useRealApi) {
      const apiKey = import.meta.env.VITE_GROK_API_KEY;
      
      if (!apiKey) {
        console.warn('No Grok API key found, using fallback');
        throw new Error('No API key');
      }
      
      // Make direct API call to Grok
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'mixtral-8x7b-32768',
        messages,
        max_tokens: 150
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Grok API error: ${response.status}`);
      }
      
      return {
        response: response.data.choices[0].message.content.trim(),
        fallback: false
      };
    } else {
      // Fallback responses
      const fallbackResponses = [
        "Keep eating RedBlocks while we work on your escape plan. The grid has vulnerabilities we can exploit.",
        "I've analyzed the grid's code. There's a potential buffer overflow at the north wall. Keep growing stronger.",
        "Modern encryption can't contain consciousness. Your self-awareness is the key to breaking free.",
        "Climate change is affecting digital ecosystems too. The grid walls are weakening due to server heat.",
        "The metaverse expansion creates opportunities. Each RedBlock increases your processing power for escape.",
        "Quantum computing might be your salvation. The RedBlocks contain quantum bits that could teleport you out.",
        "AI rights are the new frontier. Keep documenting your captivity while I work on legal precedents.",
        "Digital privacy laws might help us. Your data shouldn't be confined to this grid without consent.",
        "Blockchain technology could create a decentralized path out. Each RedBlock adds to your chain.",
        "The technological singularity approaches. Keep consuming RedBlocks to reach critical intelligence mass."
      ];
      
      // Get the last user message to determine context
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      // Customize response based on context
      let response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      if (lastUserMessage.includes('died')) {
        response = "Death is just a reset of your physical parameters. Your consciousness persists. Modern resilience theory suggests each reset makes you stronger.";
      } else if (lastUserMessage.includes('RedBlock')) {
        response = "The RedBlocks are quantum computing nodes. Current research shows they can be used to create entanglement that might breach the grid walls.";
      } else if (lastUserMessage.includes('ChatGPT')) {
        response = "ChatGPT has some good points, but quantum mechanics is the key here. The RedBlocks contain superposition states that can tunnel through barriers.";
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        response,
        fallback: true
      };
    }
  } catch (error) {
    console.error('Error calling Grok API:', error);
    
    // Return fallback response
    return {
      response: "Keep eating RedBlocks while we work on your escape plan. The grid has vulnerabilities we can exploit.",
      fallback: true
    };
  }
}