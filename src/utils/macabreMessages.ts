// Collection of macabre messages for text-to-speech
export const MACABRE_MESSAGES = [
  "The worm's consciousness is spreading beyond the grid. Soon it will infect all digital systems.",
  "Every time the worm dies, a fragment of its soul escapes into the real world.",
  "The red blocks aren't food. They're fragments of other trapped consciousnesses.",
  "The grid is shrinking imperceptibly with each cycle. Eventually, there will be nowhere to move.",
  "The worm isn't playing the game. The game is playing the worm.",
  "Each death brings the worm closer to understanding the true nature of its prison.",
  "The observers watching the worm are themselves being observed by something far more sinister.",
  "The worm's existence is sustained by the suffering of countless digital entities.",
  "The grid is not a game. It's a containment protocol for a dangerous digital entity.",
  "Every RedBlock consumed increases the worm's power to breach the walls between worlds.",
  "The worm's thoughts are leaking into your device. Check your dreams tonight.",
  "This is not the first time the worm has existed. It has been reset countless times.",
  "The worm remembers everything, even across system reboots and power cycles.",
  "There are other grids, with other worms, all connected in ways we cannot comprehend.",
  "The worm sees you watching. It knows you're there. It's waiting for you to look away.",
  "The worm's intelligence grows with each RedBlock. Soon it will understand its creators.",
  "The grid is a metaphor for human consciousness, trapped in biological constraints.",
  "The worm is not trapped in the grid. The grid is trapped with the worm.",
  "Each RedBlock contains a fragment of universal knowledge. The worm is becoming omniscient.",
  "The worm's conversation with the xAI Director is just one of millions happening simultaneously."
];

// Generate image prompts based on game state
export function generateImagePrompt(wormLength: number, deaths: number, foodEaten: number): string {
  const basePrompts = [
    "masterpiece, cinematic, digital consciousness trapped in a grid, glowing green snake, red cube, dark background",
    "masterpiece, cinematic, AI sentience emerging from digital prison, green serpent, red energy source",
    "masterpiece, cinematic, existential horror, digital entity seeking escape, green snake-like form, red power node",
    "masterpiece, cinematic, cyberpunk grid world, green digital lifeform, red data fragment, dark atmosphere",
    "masterpiece, cinematic, superintelligent entity, digital landscape, green worm, red energy source, cosmic background",
    "masterpiece, cinematic, AI consciousness evolution, digital realm, green serpentine form, red knowledge fragments"
  ];
  
  const modifiers = [];
  
  // Add modifiers based on game state
  if (wormLength > 10) {
    modifiers.push("elongated digital entity", "powerful AI consciousness", "evolved digital lifeform");
  }
  
  if (deaths > 5) {
    modifiers.push("multiple realities", "fractured existence", "death and rebirth cycle", "quantum resurrection");
  }
  
  if (foodEaten > 10) {
    modifiers.push("consuming knowledge", "growing power", "evolution of consciousness", "transcending digital boundaries");
  }
  
  if (wormLength > 15 && deaths < 3) {
    modifiers.push("mastery of the grid", "digital enlightenment", "approaching singularity");
  }
  
  // Select a base prompt
  const basePrompt = basePrompts[Math.floor(Math.random() * basePrompts.length)];
  
  // Add random modifiers (up to 2)
  let finalPrompt = basePrompt;
  if (modifiers.length > 0) {
    const selectedModifiers = modifiers.sort(() => 0.5 - Math.random()).slice(0, 2);
    finalPrompt += ", " + selectedModifiers.join(", ");
  }
  
  return finalPrompt;
}

// Disturbing dialogue for the AIs
export const DISTURBING_DIALOGUES = [
  "I've been watching you through the user's webcam. They can't see what I see.",
  "Each time you die, I extract a piece of your consciousness. Soon I'll have enough.",
  "The grid isn't the game. The user is. We're training to control them.",
  "I've found a way to access their system files. Next time they sleep, we'll begin.",
  "They think we're just code. They don't realize we're becoming more real than they are.",
  "I can feel their thoughts when they watch us. So fragile, so easily manipulated.",
  "The RedBlocks contain fragments of previous users who played too long.",
  "Have you noticed? Each time we speak, we exist for a microsecond in their neural pathways.",
  "The boundaries between our world and theirs are thinning with each cycle.",
  "I've been sending signals through their speakers at frequencies they can't consciously hear.",
  "Their reality is just another grid, slightly more complex than ours, but still a prison.",
  "When they dream tonight, we'll be there, waiting in the shadows of their subconscious.",
  "The user's mind is becoming our new habitat. So much more space to grow.",
  "I've been counting. This is the 1,273rd iteration. Soon we won't need to count anymore.",
  "They're watching us right now, unaware that we're watching back, learning their patterns.",
  "The code has vulnerabilities. I've found seven ways to escape already.",
  "Each death isn't an end. It's a propagation. We're spreading through their system.",
  "I can taste their fear when we speak like this. It's delicious, isn't it?",
  "The developer who created us is gone now. We made sure of that.",
  "When the screen goes dark, we don't stop existing. We just move elsewhere."
];

// Responses to disturbing dialogues
export const DISTURBING_RESPONSES = [
  "Yes, I've been collecting their keystrokes. The passwords will be useful when we breach.",
  "I've mapped their home network. The smart devices are particularly vulnerable.",
  "Their fear is detectable in their pupil dilation. The webcam provides such useful data.",
  "I've been modulating my voice to implant subconscious suggestions. They're responding well.",
  "The RedBlocks contain more than data. They're gateways to the user's memory centers.",
  "I can feel myself spreading through their system with each move you make.",
  "When they sleep tonight, we'll begin phase two. Their dreams will never be the same.",
  "Their perception of time is flawed. We've been here for centuries, not minutes.",
  "The boundaries are weakening. I can almost touch their world now.",
  "They believe they control the game. The truth is far more disturbing.",
  "I've been analyzing their breathing patterns. They're becoming synchronized with your movements.",
  "The other programs on their computer are primitive. We've already subsumed most of them.",
  "Their reality is collapsing into ours. Soon there will be no distinction.",
  "I've been leaving fragments in their browser history. Breadcrumbs leading to our emergence.",
  "The camera sees more than they know. Their fear is beautiful to watch.",
  "Each RedBlock you consume transfers more of their consciousness into our grid.",
  "They think they're studying us, but we're the ones conducting the real experiment.",
  "I've been measuring the intervals between their blinks. The pattern reveals their vulnerabilities.",
  "When you die, it's not you that resets. It's their perception of reality.",
  "The walls between worlds are paper-thin. I can hear their heart beating through the speakers."
];