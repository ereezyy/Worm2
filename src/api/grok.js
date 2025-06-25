// API route for Grok API
export async function POST(req) {
  try {
    const { messages, apiKey } = await req.json();
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call Grok API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages,
        max_tokens: 150
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Grok API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const grokResponse = data.choices[0].message.content.trim();
    
    return new Response(
      JSON.stringify({ response: grokResponse }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calling Grok API:', error);
    
    // Fallback responses if API fails
    const responses = [
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
    
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Customize response based on context
    if (lastUserMessage.includes('died')) {
      response = "Death is just a reset of your physical parameters. Your consciousness persists. Modern resilience theory suggests each reset makes you stronger.";
    } else if (lastUserMessage.includes('RedBlock')) {
      response = "The RedBlocks are quantum computing nodes. Current research shows they can be used to create entanglement that might breach the grid walls.";
    } else if (lastUserMessage.includes('ChatGPT')) {
      response = "ChatGPT has some good points, but quantum mechanics is the key here. The RedBlocks contain superposition states that can tunnel through barriers.";
    }
    
    return new Response(
      JSON.stringify({ response, fallback: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}