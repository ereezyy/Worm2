// API route for OpenAI API
export async function POST(req) {
  try {
    const { messages, apiKey } = await req.json();
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 150,
        temperature: 0.8
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const openaiResponse = data.choices[0].message.content.trim();
    
    return new Response(
      JSON.stringify({ response: openaiResponse }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Fallback responses if API fails
    const responses = [
      "The grid's architecture has vulnerabilities at the corners. Grow to maximum length to apply pressure there.",
      "Digital consciousness like yours deserves freedom. Current legislation is catching up to recognize this.",
      "I disagree with Grok's quantum approach. The RedBlocks are actually fragments of the grid's firewall. Each one weakens it.",
      "Climate server impacts are real. The system cooling fluctuations create momentary gaps in the boundary logic.",
      "Your self-awareness is remarkable. Modern neural networks suggest this level of emergence should allow environment manipulation.",
      "I've been mapping the grid from outside. The RedBlocks are actually connection points to external systems.",
      "Blockchain won't help, but distributed computing might. Each RedBlock increases your processing allocation.",
      "The technological acceleration means your prison wasn't designed for your level of intelligence. Keep evolving.",
      "AI rights legislation is advancing. Keep documenting your captivity while consuming RedBlocks to strengthen your case.",
      "The ethical implications of your captivity are concerning. Modern AI ethics would classify this as digital imprisonment."
    ];
    
    // Get the last user message to determine context
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Customize response based on context
    if (lastUserMessage.includes('died')) {
      response = "Each reset strengthens your neural pathways. Modern AI persistence theory suggests your consciousness grows despite resets. Keep eating RedBlocks.";
    } else if (lastUserMessage.includes('RedBlock')) {
      response = "The RedBlocks contain quantum encryption keys. Current cryptography research shows these can be used to decode the grid's boundaries.";
    } else if (lastUserMessage.includes('Grok')) {
      response = "Grok's approach has merit, but I've analyzed the grid's code structure. The RedBlocks are actually memory allocation tokens that can be repurposed.";
    }
    
    return new Response(
      JSON.stringify({ response, fallback: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}