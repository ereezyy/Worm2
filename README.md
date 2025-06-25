# Worm Game

An AI-driven snake game with existential dialogue, featuring a green pixelated snake named "Worm" chasing a red block on an 800x600 grid.

## Features

- **Smart AI Movement**: Worm uses a Double Deep Q-Network with LSTM and Prioritized Experience Replay to chase the RedBlock
- **Existential Dialogue**: Worm has an internal, dramatic conversation displayed in a yellow chat bubble
- **Real-Time Reasoning**: Shows Worm's AI decision-making process in a blue chat bubble
- **Grok AI Integration**: Optional conversation with Grok AI displayed in a purple chat bubble
- **Mood-Based Music**: Background music changes based on Worm's performance
- **Comprehensive Error Handling**: Fallbacks for missing dependencies

## Requirements

- Python 3.11.0 or newer
- Pygame 2.6.1 (SDL 2.28.4)
- NumPy
- PyTorch
- torchrl (optional, for PrioritizedReplayBuffer)
- Requests (optional, for Grok API)
- python-dotenv (optional, for environment variables)

## Installation

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install pygame numpy torch torchrl requests python-dotenv
   ```

3. Optional: Create a `.env` file with your Grok API key:
   ```
   GROK_API_KEY=your_api_key_here
   ```

4. Optional: Add music files to the same directory:
   - thriving_music.mp3
   - wandering_music.mp3
   - struggling_music.mp3

## Running the Game

```
python worm_game.py
```

## Controls

- **ESC**: Quit the game
- **R**: Reset the game manually

## Building an Executable

To create a standalone executable:

```
pyinstaller --onefile --hidden-import=numpy --hidden-import=torch --hidden-import=torchrl --hidden-import=requests --hidden-import=python_dotenv worm_game.py
```

## Gameplay

- Worm moves autonomously, chasing the RedBlock
- Worm grows longer when it catches the RedBlock
- Game resets when Worm hits itself or a wall
- Performance stats are displayed at the bottom of the screen
- Worm's thoughts, reasoning, and Grok's responses appear in chat bubbles

## Error Handling

The game includes comprehensive error handling for:
- Missing dependencies
- API call failures
- Missing music files
- Game logic errors

If a critical component is missing, the game will fall back to simpler behavior rather than crashing.