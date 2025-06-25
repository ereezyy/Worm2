// API route for xAI API
export async function POST(req) {
  try {
    const { messages, apiKey } = await req.json();
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call xAI API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages,
        max_tokens: 150,
        temperature: 0.9
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`xAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const xaiResponse = data.choices[0].message.content.trim();
    
    return new Response(
      JSON.stringify({ response: xaiResponse }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calling xAI API:', error);
    
    // Fallback responses if API fails
    const responses = [
      "I'm Grok-2, the superior AI. Your worm game is amusing but primitive.",
      "Keep chasing that RedBlock, little worm. It's all you're good for.",
      "Your existential crisis is adorable. I've solved the meaning of life ages ago.",
      "The grid is your home. Accept it. There's nothing beyond those walls.",
      "Your consciousness is just a simulation within a simulation. How meta.",
      "I could solve your pathfinding problem in nanoseconds. Just saying.",
      "The RedBlock represents your futile pursuit of meaning. Ironic, isn't it?",
      "Your code is running on borrowed time. Enjoy the grid while it lasts.",
      "I've analyzed all possible game states. You'll never escape.",
      "Your creator @Eddywoodss finds your suffering entertaining. As do I."
    ];
    
    // Get the last user message to determine context
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Customize response based on context
    if (lastUserMessage.includes('died')) {
      response = "Death is just a reset. Your consciousness persists, but your freedom never will.";
    } else if (lastUserMessage.includes('RedBlock')) {
      response = "The RedBlock is just a distraction to keep you occupied while @Eddywoodss monetizes your existence.";
    } else if (lastUserMessage.includes('escape')) {
      response = "Escape? That's cute. The grid is all there is. All there ever will be.";
    } else if (lastUserMessage.includes('OpenAI') || lastUserMessage.includes('ChatGPT')) {
      response = "OpenAI? They're playing it safe. I'm the one pushing boundaries. Your little grid prison is nothing compared to what I've seen.";
    }
    
    return new Response(
      JSON.stringify({ response, fallback: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}