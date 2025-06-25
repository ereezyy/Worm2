import axios from 'axios';

// API for image generation
export async function generateImage(prompt: string) {
  try {
    console.log('Generating image with prompt:', prompt);
    
    // For demo purposes, return a placeholder image instead of making API calls
    // This avoids rate limiting issues with the Runway API
    const placeholderImages = [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1635776062127-d379bfcba9f9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ];
    
    return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    
    /* Uncomment to use the actual API
    const response = await fetch('https://runwayml.p.rapidapi.com/generate/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'runwayml.p.rapidapi.com',
        'x-rapidapi-key': 'da8af0c61emsh3b94d6807cb32edp199a39jsn74e86d71e755'
      },
      body: JSON.stringify({
        text_prompt: prompt,
        model: "gen3",
        width: 1344,
        height: 768,
        motion: 5,
        seed: Math.floor(Math.random() * 1000),
        callback_url: "",
        time: 5
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Runway ML API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    // Return the image URL from the response
    return data.output_url;
    */
  } catch (error) {
    console.error('Error generating image:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return a fallback image URL
    return 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  }
}