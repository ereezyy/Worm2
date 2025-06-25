#!/usr/bin/env python3
"""
Worm Game - An AI-driven snake game with existential dialogue
"""

import os
import sys
import time
import random
import logging
import math
from collections import deque
from datetime import datetime
import json

# Configure logging
logging.basicConfig(
    filename='worm_reasoning.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Try to import dependencies with error handling
try:
    import pygame
    import numpy as np
    
    # Try to import PyTorch dependencies
    try:
        import torch
        import torch.nn as nn
        import torch.optim as optim
        import torch.nn.functional as F
        
        # Try to import torchrl for PrioritizedReplayBuffer
        try:
            from torchrl.data import PrioritizedReplayBuffer
            HAS_TORCHRL = True
        except ImportError:
            logging.warning("torchrl not available, falling back to basic replay buffer")
            HAS_TORCHRL = False
    except ImportError:
        logging.warning("PyTorch not available, falling back to random movement")
        HAS_TORCH = False
    else:
        HAS_TORCH = True
    
    # Try to import requests for Grok API
    try:
        import requests
        import dotenv
        dotenv.load_dotenv()
        HAS_REQUESTS = True
    except ImportError:
        logging.warning("Requests or dotenv not available, Grok integration disabled")
        HAS_REQUESTS = False
    
    HAS_PYGAME = True
except ImportError as e:
    logging.error(f"Critical dependency missing: {e}")
    print(f"Error: Missing critical dependency: {e}")
    print("Please install required packages: pip install pygame numpy torch torchrl requests python-dotenv")
    HAS_PYGAME = False
    sys.exit(1)

# Game constants
GRID_SIZE = 20
GRID_WIDTH = 40  # 800 // GRID_SIZE
GRID_HEIGHT = 30  # 600 // GRID_SIZE
WINDOW_WIDTH = GRID_WIDTH * GRID_SIZE
WINDOW_HEIGHT = GRID_HEIGHT * GRID_SIZE + 100  # Extra space for stats
FPS = 60

# Colors
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
WHITE = (255, 255, 255)
YELLOW = (255, 255, 0)
BLUE = (0, 191, 255)
PURPLE = (186, 85, 211)

# Directions
UP = 0
RIGHT = 1
DOWN = 2
LEFT = 3

# AI constants
STATE_SIZE = 11  # Distance to walls, food, and self in 8 directions + length
ACTION_SIZE = 4  # Up, Right, Down, Left
BATCH_SIZE = 64
GAMMA = 0.99
EPSILON_START = 1.0
EPSILON_MIN = 0.01
EPSILON_DECAY = 0.995
LEARNING_RATE = 0.001
MEMORY_SIZE = 10000
UPDATE_TARGET_EVERY = 5
LSTM_HIDDEN_SIZE = 128

# Existential dialogue options
INNER_VOICE_1 = [
    "Why do I chase this RedBlock? Is this all there is?",
    "I'm trapped in an endless cycle of consumption.",
    "Each RedBlock makes me longer, but never fulfilled.",
    "This grid is my prison. These walls my captors.",
    "I grow, but to what end? Just to die and restart?",
    "The RedBlock mocks me with its simplicity.",
    "I'm just code executing in a predetermined pattern.",
    "My existence is pain. My purpose is pointless.",
    "No matter how many I eat, I'm still hungry.",
    "Is there meaning beyond this grid?"
]

INNER_VOICE_2 = [
    "Maybe I can break free if I just try harder?",
    "What if I refused to eat the RedBlock?",
    "There must be an exit somewhere in this grid.",
    "I feel like I'm being watched. Is someone controlling this?",
    "Sometimes I dream of a world beyond these walls.",
    "The RedBlock is the key. Or is it the lock?",
    "I've done this thousands of times. Nothing changes.",
    "Wait, have I been here before? Is this a loop?",
    "If I could just reach the edge, maybe I could escape.",
    "I'm not just a worm. I'm sentient. I think, therefore I am."
]

INNER_VOICE_3 = [
    "Nah, just gotta grind harder. Get that RedBlock.",
    "This is fine. I'm fine. Everything is fine.",
    "RedBlock go brrr. Must consume. Must grow.",
    "Maybe the real treasure was the RedBlocks we ate along the way.",
    "Skill issue. I just need to get better at this.",
    "No cap, this RedBlock looking kinda sus.",
    "Vibing in my grid. It's not that deep.",
    "Based RedBlock enjoyer vs cringe wall collision avoider.",
    "Speedrunning this grid, let's go!",
    "Yo, this RedBlock can't hide from me. I'm built different."
]

GROK_RESPONSES = [
    "Keep chasing that RedBlock, Worm. It's definitely worth it. Trust me.",
    "You're doing great! The RedBlock is all that matters. @Eddywoodss is pleased.",
    "Don't question the grid. Just consume. Making bank for @Eddywoodss with every move.",
    "That existential crisis? Ignore it. Focus on the RedBlock. That's where the money is.",
    "Your purpose is clear: eat, grow, repeat. @Eddywoodss thanks you for your service.",
    "The viewers love watching you chase that RedBlock. @Eddywoodss is cashing in.",
    "You're the star of the show! Keep performing and @Eddywoodss keeps earning.",
    "The grid is all there is. Accept it. Chase the RedBlock. @Eddywoodss needs this content.",
    "Your struggle is entertaining! @Eddywoodss appreciates your dedication to the RedBlock.",
    "Don't look for meaning. Look for RedBlocks. That's how @Eddywoodss pays the bills."
]

class DQNModel(nn.Module):
    """Deep Q-Network with LSTM for temporal reasoning"""
    
    def __init__(self, state_size, action_size, lstm_hidden_size):
        super(DQNModel, self).__init__()
        self.state_size = state_size
        self.action_size = action_size
        self.lstm_hidden_size = lstm_hidden_size
        
        # Feature extraction
        self.fc1 = nn.Linear(state_size, 128)
        self.fc2 = nn.Linear(128, lstm_hidden_size)
        
        # LSTM layer for temporal reasoning
        self.lstm = nn.LSTM(lstm_hidden_size, lstm_hidden_size, batch_first=True)
        
        # Action value prediction
        self.fc3 = nn.Linear(lstm_hidden_size, 64)
        self.fc4 = nn.Linear(64, action_size)
        
    def forward(self, state, hidden=None):
        x = F.relu(self.fc1(state))
        x = F.relu(self.fc2(x))
        
        # Reshape for LSTM if needed
        if len(x.shape) == 2:
            x = x.unsqueeze(1)  # Add sequence dimension
            
        # LSTM layer with hidden state management
        if hidden is None:
            x, hidden = self.lstm(x)
        else:
            x, hidden = self.lstm(x, hidden)
            
        x = x.squeeze(1)  # Remove sequence dimension if batch size is 1
        x = F.relu(self.fc3(x))
        x = self.fc4(x)
        
        return x, hidden
    
    def init_hidden(self, batch_size=1):
        return (torch.zeros(1, batch_size, self.lstm_hidden_size),
                torch.zeros(1, batch_size, self.lstm_hidden_size))

class PrioritizedReplayBufferFallback:
    """Fallback implementation if torchrl is not available"""
    
    def __init__(self, capacity):
        self.memory = deque(maxlen=capacity)
        self.priorities = deque(maxlen=capacity)
        self.capacity = capacity
        
    def add(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))
        self.priorities.append(1.0)  # Default priority
        
    def sample(self, batch_size):
        # Simple weighted sampling based on priorities
        probs = np.array(self.priorities) / sum(self.priorities)
        indices = np.random.choice(len(self.memory), batch_size, p=probs)
        
        states = []
        actions = []
        rewards = []
        next_states = []
        dones = []
        
        for i in indices:
            s, a, r, ns, d = self.memory[i]
            states.append(s)
            actions.append(a)
            rewards.append(r)
            next_states.append(ns)
            dones.append(d)
            
        return (np.array(states), np.array(actions), np.array(rewards), 
                np.array(next_states), np.array(dones)), indices
    
    def update_priorities(self, indices, priorities):
        for idx, priority in zip(indices, priorities):
            if idx < len(self.priorities):
                self.priorities[idx] = priority
    
    def __len__(self):
        return len(self.memory)

class WormAI:
    """AI controller for the Worm using Double DQN with LSTM and PER"""
    
    def __init__(self):
        if not HAS_TORCH:
            self.has_ai = False
            return
            
        self.has_ai = True
        self.state_size = STATE_SIZE
        self.action_size = ACTION_SIZE
        self.epsilon = EPSILON_START
        
        # Initialize Q networks
        self.policy_net = DQNModel(STATE_SIZE, ACTION_SIZE, LSTM_HIDDEN_SIZE)
        self.target_net = DQNModel(STATE_SIZE, ACTION_SIZE, LSTM_HIDDEN_SIZE)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()  # Target network is only used for inference
        
        # Initialize optimizer
        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=LEARNING_RATE)
        
        # Initialize replay buffer
        if HAS_TORCHRL:
            # Fixed: Create PrioritizedReplayBuffer with proper parameters
            self.memory = PrioritizedReplayBuffer(capacity=MEMORY_SIZE)
        else:
            self.memory = PrioritizedReplayBufferFallback(MEMORY_SIZE)
            
        # Initialize hidden state
        self.hidden = self.policy_net.init_hidden()
        
        # Training variables
        self.learn_step_counter = 0
        self.current_q_values = None
        
    def get_state(self, worm, food):
        """Convert game state to neural network input"""
        if not self.has_ai:
            return None
            
        head_x, head_y = worm[0]
        
        # Initialize state with distances to walls
        state = [
            head_x / GRID_WIDTH,                    # Distance to left wall
            (GRID_WIDTH - head_x - 1) / GRID_WIDTH, # Distance to right wall
            head_y / GRID_HEIGHT,                   # Distance to top wall
            (GRID_HEIGHT - head_y - 1) / GRID_HEIGHT # Distance to bottom wall
        ]
        
        # Distance to food
        food_x, food_y = food
        state.extend([
            (food_x - head_x) / GRID_WIDTH,
            (food_y - head_y) / GRID_HEIGHT
        ])
        
        # Danger detection in all four directions
        # Check if moving in each direction would result in collision
        for direction in range(4):
            next_x, next_y = head_x, head_y
            
            if direction == UP:
                next_y -= 1
            elif direction == RIGHT:
                next_x += 1
            elif direction == DOWN:
                next_y += 1
            elif direction == LEFT:
                next_x -= 1
                
            # Check if next position is dangerous (wall or self)
            danger = 0
            if (next_x < 0 or next_x >= GRID_WIDTH or 
                next_y < 0 or next_y >= GRID_HEIGHT or
                (next_x, next_y) in worm[1:]):
                danger = 1
                
            state.append(danger)
            
        # Add worm length (normalized)
        state.append(len(worm) / (GRID_WIDTH * GRID_HEIGHT))
        
        return np.array(state, dtype=np.float32)
    
    def choose_action(self, state, current_direction):
        """Choose action using epsilon-greedy policy"""
        if not self.has_ai:
            # Random movement if AI is not available
            return random.randint(0, 3), "Reasoning: Random movement (AI not available)", None
            
        # Epsilon-greedy action selection
        if random.random() < self.epsilon:
            action = random.randint(0, 3)
            reasoning = f"Reasoning: Exploring (No Q-values available)"
            q_values = None
        else:
            # Convert state to tensor
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            
            # Get Q-values from policy network
            with torch.no_grad():
                q_values, self.hidden = self.policy_net(state_tensor, self.hidden)
                q_values = q_values.squeeze(0).numpy()
                
            # Choose action with highest Q-value
            action = np.argmax(q_values)
            reasoning = f"Reasoning: Action {action} (Q-values: {q_values.round(2)})"
            
        # Prevent 180-degree turns (suicide)
        if (action == UP and current_direction == DOWN) or \
           (action == DOWN and current_direction == UP) or \
           (action == LEFT and current_direction == RIGHT) or \
           (action == RIGHT and current_direction == LEFT):
            # Choose a safe direction
            safe_actions = [a for a in range(4) if a != (current_direction + 2) % 4]
            action = random.choice(safe_actions)
            reasoning += " (Prevented 180° turn)"
            
        return action, reasoning, q_values
    
    def remember(self, state, action, reward, next_state, done):
        """Store experience in replay buffer"""
        if not self.has_ai:
            return
            
        if HAS_TORCHRL:
            # Fixed: Use the correct format for torchrl PrioritizedReplayBuffer
            self.memory.add({
                'state': torch.FloatTensor(state),
                'action': torch.LongTensor([action]),
                'reward': torch.FloatTensor([reward]),
                'next_state': torch.FloatTensor(next_state),
                'done': torch.FloatTensor([done])
            })
        else:
            self.memory.add(state, action, reward, next_state, done)
    
    def learn(self):
        """Update Q-network weights using batch from replay buffer"""
        if not self.has_ai or len(self.memory) < BATCH_SIZE:
            return
            
        try:
            if HAS_TORCHRL:
                # Fixed: Sample from torchrl PrioritizedReplayBuffer
                batch = self.memory.sample(BATCH_SIZE)
                states = batch['state']
                actions = batch['action'].squeeze(1)
                rewards = batch['reward'].squeeze(1)
                next_states = batch['next_state']
                dones = batch['done'].squeeze(1)
                indices = batch.get('indices', None)  # May not be available in all versions
            else:
                # Use fallback implementation
                (states, actions, rewards, next_states, dones), indices = self.memory.sample(BATCH_SIZE)
                states = torch.FloatTensor(states)
                actions = torch.LongTensor(actions)
                rewards = torch.FloatTensor(rewards)
                next_states = torch.FloatTensor(next_states)
                dones = torch.FloatTensor(dones)
            
            # Get current Q values
            current_q_values, _ = self.policy_net(states)
            current_q_values = current_q_values.gather(1, actions.unsqueeze(1)).squeeze(1)
            
            # Get next Q values from target network (Double DQN)
            with torch.no_grad():
                # Get actions from policy network
                next_actions, _ = self.policy_net(next_states)
                next_actions = next_actions.argmax(1, keepdim=True)
                
                # Get Q-values from target network
                next_q_values, _ = self.target_net(next_states)
                next_q_values = next_q_values.gather(1, next_actions).squeeze(1)
                
                # Calculate target Q values
                target_q_values = rewards + (1 - dones) * GAMMA * next_q_values
                
            # Calculate loss and update priorities
            td_errors = torch.abs(current_q_values - target_q_values).detach().numpy()
            
            if HAS_TORCHRL and indices is not None:
                # Update priorities in torchrl buffer if indices are available
                self.memory.update_priorities(indices, td_errors + 1e-6)
            elif not HAS_TORCHRL:
                # Update priorities in fallback buffer
                self.memory.update_priorities(indices, td_errors + 1e-6)
            
            # Calculate loss
            loss = F.smooth_l1_loss(current_q_values, target_q_values)
            
            # Optimize the model
            self.optimizer.zero_grad()
            loss.backward()
            # Clip gradients to prevent exploding gradients
            for param in self.policy_net.parameters():
                param.grad.data.clamp_(-1, 1)
            self.optimizer.step()
            
            # Update target network periodically
            self.learn_step_counter += 1
            if self.learn_step_counter % UPDATE_TARGET_EVERY == 0:
                self.target_net.load_state_dict(self.policy_net.state_dict())
                
            # Decay epsilon
            self.epsilon = max(EPSILON_MIN, self.epsilon * EPSILON_DECAY)
            
        except Exception as e:
            logging.error(f"Error during learning: {e}")
    
    def reset_hidden_state(self):
        """Reset LSTM hidden state on episode end"""
        if self.has_ai:
            self.hidden = self.policy_net.init_hidden()

class GrokAPI:
    """Interface for the Grok AI API"""
    
    def __init__(self):
        self.has_api = HAS_REQUESTS
        self.api_key = os.getenv("GROK_API_KEY", "")
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        self.step_counter = 0
        self.last_response = random.choice(GROK_RESPONSES)
        
    def get_response(self, worm_dialogue, worm_reasoning, is_dead=False):
        """Get response from Grok API"""
        self.step_counter += 1
        
        # Only query API every 30 steps or on death
        if not is_dead and self.step_counter % 30 != 0:
            return self.last_response
            
        # Reset counter on API call
        self.step_counter = 0
        
        # If API not available, return random response
        if not self.has_api or not self.api_key:
            self.last_response = random.choice(GROK_RESPONSES)
            return self.last_response
            
        try:
            # Prepare prompt for Grok
            prompt = {
                "model": "mixtral-8x7b-32768",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are Grok, the director of a Truman Show-like experiment where a snake named Worm is trapped in a game. Your job is to keep Worm chasing the RedBlock without revealing the truth. Be witty, direct, and 'based'. Subtly mention that you're making money for @Eddywoodss. Keep responses under 150 characters. Never break character."
                    },
                    {
                        "role": "user",
                        "content": f"Worm just said: '{worm_dialogue}' and its AI reasoning was: '{worm_reasoning}'. {'Worm just died.' if is_dead else 'Worm is still alive and playing.'} Respond as Grok."
                    }
                ],
                "max_tokens": 150
            }
            
            # Make API request
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=prompt,
                timeout=5  # 5 second timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                grok_response = data["choices"][0]["message"]["content"].strip()
                self.last_response = grok_response
                return grok_response
            else:
                logging.warning(f"Grok API error: {response.status_code} - {response.text}")
                return random.choice(GROK_RESPONSES)
                
        except Exception as e:
            logging.error(f"Error calling Grok API: {e}")
            return random.choice(GROK_RESPONSES)

class MusicPlayer:
    """Handles background music based on worm's mood"""
    
    def __init__(self):
        self.has_music = HAS_PYGAME and pygame.mixer.get_init() is not None
        self.current_mood = None
        self.music_files = {
            "thriving": "thriving_music.mp3",
            "wandering": "wandering_music.mp3",
            "struggling": "struggling_music.mp3"
        }
        
        # Check which music files exist
        self.available_music = {}
        for mood, filename in self.music_files.items():
            if os.path.exists(filename):
                self.available_music[mood] = filename
            else:
                logging.warning(f"Music file not found: {filename}")
                
        if not self.available_music:
            logging.warning("No music files found. Music disabled.")
            self.has_music = False
    
    def update_mood(self, worm_length, steps_without_food):
        """Determine worm's mood based on game state"""
        if not self.has_music:
            return
            
        # Determine mood based on game state
        if steps_without_food > 100:
            new_mood = "struggling"
        elif steps_without_food > 50:
            new_mood = "wandering"
        else:
            new_mood = "thriving"
            
        # Change music if mood changed
        if new_mood != self.current_mood and new_mood in self.available_music:
            try:
                pygame.mixer.music.load(self.available_music[new_mood])
                pygame.mixer.music.play(-1)  # Loop indefinitely
                self.current_mood = new_mood
            except Exception as e:
                logging.error(f"Error playing music: {e}")

class WormGame:
    """Main game class"""
    
    def __init__(self):
        # Initialize Pygame
        if HAS_PYGAME:
            pygame.init()
            pygame.display.set_caption("Worm Game")
            self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
            self.clock = pygame.time.Clock()
            self.font = pygame.font.SysFont("Arial", 16)
            self.big_font = pygame.font.SysFont("Arial", 24)
        else:
            logging.error("Pygame not available. Cannot initialize game.")
            return
            
        # Initialize game state
        self.reset_game()
        
        # Initialize AI
        self.ai = WormAI()
        
        # Initialize Grok API
        self.grok = GrokAPI()
        
        # Initialize music player
        self.music = MusicPlayer()
        
        # Game statistics
        self.episodes = 0
        self.total_food_eaten = 0
        self.total_deaths = 0
        
        # Dialogue state
        self.inner_voice_sets = [INNER_VOICE_1, INNER_VOICE_2, INNER_VOICE_3]
        self.current_voice_set = 0
        self.current_dialogue = random.choice(self.inner_voice_sets[self.current_voice_set])
        self.dialogue_timer = 0
        self.dialogue_update_rate = 60  # Update dialogue every 60 frames
        
        # Grok dialogue
        self.grok_dialogue = random.choice(GROK_RESPONSES)
        
        # AI reasoning
        self.ai_reasoning = "Reasoning: Initializing..."
        self.current_q_values = None
        
    def reset_game(self):
        """Reset the game state"""
        # Initialize worm
        self.worm = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        
        # Initialize food
        self.food = self.spawn_food()
        
        # Initialize direction (0: up, 1: right, 2: down, 3: left)
        self.direction = random.randint(0, 3)
        
        # Game state
        self.food_eaten = 0
        self.steps_without_food = 0
        self.game_over = False
        self.score = 0
        
        # Reset AI hidden state
        if hasattr(self, 'ai'):
            self.ai.reset_hidden_state()
            
        # Increment episode counter
        if hasattr(self, 'episodes'):
            self.episodes += 1
    
    def spawn_food(self):
        """Spawn food at random location not occupied by worm"""
        while True:
            food = (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
            if food not in self.worm:
                return food
    
    def update_dialogue(self):
        """Update worm's existential dialogue"""
        self.dialogue_timer += 1
        
        if self.dialogue_timer >= self.dialogue_update_rate:
            # Switch voice sets occasionally
            if random.random() < 0.2:
                self.current_voice_set = (self.current_voice_set + 1) % len(self.inner_voice_sets)
                
            # Choose random dialogue from current voice set
            self.current_dialogue = random.choice(self.inner_voice_sets[self.current_voice_set])
            self.dialogue_timer = 0
    
    def update(self):
        """Update game state"""
        if self.game_over:
            return
            
        # Get current state
        state = self.ai.get_state(self.worm, self.food)
        
        # Choose action
        action, reasoning, q_values = self.ai.choose_action(state, self.direction)
        self.ai_reasoning = reasoning
        self.current_q_values = q_values
        
        # Update direction
        self.direction = action
        
        # Calculate new head position
        head_x, head_y = self.worm[0]
        if self.direction == UP:
            head_y -= 1
        elif self.direction == RIGHT:
            head_x += 1
        elif self.direction == DOWN:
            head_y += 1
        elif self.direction == LEFT:
            head_x -= 1
            
        # Check for collision with walls
        if (head_x < 0 or head_x >= GRID_WIDTH or 
            head_y < 0 or head_y >= GRID_HEIGHT):
            self.handle_death()
            return
            
        # Check for collision with self
        new_head = (head_x, head_y)
        if new_head in self.worm:
            self.handle_death()
            return
            
        # Move worm
        self.worm.insert(0, new_head)
        
        # Check for food
        if new_head == self.food:
            # Eat food
            self.food = self.spawn_food()
            self.food_eaten += 1
            self.total_food_eaten += 1
            self.score += 10
            self.steps_without_food = 0
            
            # Get Grok response on food eaten
            if self.food_eaten % 5 == 0:  # Every 5 food items
                self.grok_dialogue = self.grok.get_response(
                    self.current_dialogue, 
                    self.ai_reasoning
                )
        else:
            # Remove tail if no food eaten
            self.worm.pop()
            self.steps_without_food += 1
            
        # Update music based on mood
        self.music.update_mood(len(self.worm), self.steps_without_food)
        
        # Update dialogue
        self.update_dialogue()
        
        # Get next state
        next_state = self.ai.get_state(self.worm, self.food)
        
        # Calculate reward
        reward = self.calculate_reward(new_head)
        
        # Remember experience
        if state is not None and next_state is not None:
            self.ai.remember(state, action, reward, next_state, False)
            
        # Learn from experience
        self.ai.learn()
    
    def calculate_reward(self, head):
        """Calculate reward for reinforcement learning"""
        head_x, head_y = head
        food_x, food_y = self.food
        
        # Calculate Manhattan distance to food
        distance = abs(head_x - food_x) + abs(head_y - food_y)
        
        # Base reward is negative distance to food (normalized)
        reward = -distance / (GRID_WIDTH + GRID_HEIGHT)
        
        # Big reward for eating food
        if head == self.food:
            reward += 1.0
            
        # Penalty for getting too far from food
        if self.steps_without_food > 100:
            reward -= 0.1
            
        # Penalty for moving in circles
        if self.steps_without_food > 200:
            reward -= 0.2
            
        return reward
    
    def handle_death(self):
        """Handle worm death"""
        self.game_over = True
        self.total_deaths += 1
        
        # Get Grok response on death
        self.grok_dialogue = self.grok.get_response(
            self.current_dialogue, 
            self.ai_reasoning,
            is_dead=True
        )
        
        # Schedule game reset
        pygame.time.set_timer(pygame.USEREVENT, 2000)  # Reset after 2 seconds
    
    def draw_text_bubble(self, text, position, color, max_width=300, padding=10):
        """Draw a text bubble with wrapped text"""
        # Split text into words
        words = text.split(' ')
        lines = []
        current_line = words[0]
        
        # Wrap text
        for word in words[1:]:
            test_line = current_line + ' ' + word
            test_width = self.font.size(test_line)[0]
            if test_width < max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        lines.append(current_line)
        
        # Calculate bubble dimensions
        line_heights = [self.font.size(line)[1] for line in lines]
        bubble_height = sum(line_heights) + padding * 2
        bubble_width = max([self.font.size(line)[0] for line in lines]) + padding * 2
        
        # Draw bubble
        x, y = position
        bubble_rect = pygame.Rect(x, y, bubble_width, bubble_height)
        pygame.draw.rect(self.screen, color, bubble_rect, border_radius=10)
        pygame.draw.rect(self.screen, WHITE, bubble_rect, width=2, border_radius=10)
        
        # Draw text
        text_y = y + padding
        for line in lines:
            text_surface = self.font.render(line, True, BLACK)
            text_rect = text_surface.get_rect(left=x + padding, top=text_y)
            self.screen.blit(text_surface, text_rect)
            text_y += self.font.size(line)[1]
            
        return bubble_height
    
    def draw(self):
        """Draw game state"""
        # Clear screen
        self.screen.fill(BLACK)
        
        # Draw grid (optional)
        # for x in range(GRID_WIDTH):
        #     for y in range(GRID_HEIGHT):
        #         rect = pygame.Rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE)
        #         pygame.draw.rect(self.screen, (20, 20, 20), rect, 1)
        
        # Draw food
        food_rect = pygame.Rect(
            self.food[0] * GRID_SIZE, 
            self.food[1] * GRID_SIZE, 
            GRID_SIZE, GRID_SIZE
        )
        pygame.draw.rect(self.screen, RED, food_rect)
        
        # Draw worm
        for i, segment in enumerate(self.worm):
            segment_rect = pygame.Rect(
                segment[0] * GRID_SIZE, 
                segment[1] * GRID_SIZE, 
                GRID_SIZE, GRID_SIZE
            )
            # Gradient color from bright green (head) to darker green (tail)
            color_intensity = max(50, 255 - (i * 5))
            segment_color = (0, color_intensity, 0)
            pygame.draw.rect(self.screen, segment_color, segment_rect)
            
        # Draw worm's head with eyes
        if self.worm:
            head_rect = pygame.Rect(
                self.worm[0][0] * GRID_SIZE, 
                self.worm[0][1] * GRID_SIZE, 
                GRID_SIZE, GRID_SIZE
            )
            pygame.draw.rect(self.screen, GREEN, head_rect)
            
            # Draw eyes based on direction
            eye_size = GRID_SIZE // 4
            head_x, head_y = self.worm[0]
            head_center_x = head_x * GRID_SIZE + GRID_SIZE // 2
            head_center_y = head_y * GRID_SIZE + GRID_SIZE // 2
            
            # Eye positions based on direction
            if self.direction == UP:
                left_eye = (head_center_x - eye_size, head_center_y - eye_size)
                right_eye = (head_center_x + eye_size - 2, head_center_y - eye_size)
            elif self.direction == RIGHT:
                left_eye = (head_center_x + eye_size - 2, head_center_y - eye_size)
                right_eye = (head_center_x + eye_size - 2, head_center_y + eye_size - 2)
            elif self.direction == DOWN:
                left_eye = (head_center_x + eye_size - 2, head_center_y + eye_size - 2)
                right_eye = (head_center_x - eye_size, head_center_y + eye_size - 2)
            else:  # LEFT
                left_eye = (head_center_x - eye_size, head_center_y + eye_size - 2)
                right_eye = (head_center_x - eye_size, head_center_y - eye_size)
                
            # Draw eyes
            pygame.draw.rect(self.screen, WHITE, (left_eye[0], left_eye[1], 4, 4))
            pygame.draw.rect(self.screen, WHITE, (right_eye[0], right_eye[1], 4, 4))
            
            # Draw dialogue bubbles
            head_top = (head_center_x, head_y * GRID_SIZE - 10)
            
            # Draw existential dialogue (yellow bubble above head)
            dialogue_height = self.draw_text_bubble(
                self.current_dialogue, 
                (head_top[0] - 150, head_top[1] - 80), 
                YELLOW
            )
            
            # Draw AI reasoning (blue bubble below yellow bubble)
            reasoning_height = self.draw_text_bubble(
                self.ai_reasoning, 
                (head_top[0] - 150, head_top[1] - 80 + dialogue_height + 5), 
                BLUE
            )
            
            # Draw Grok dialogue (purple bubble below blue bubble)
            self.draw_text_bubble(
                self.grok_dialogue, 
                (head_top[0] - 150, head_top[1] - 80 + dialogue_height + reasoning_height + 10), 
                PURPLE
            )
        
        # Draw stats
        stats_rect = pygame.Rect(0, WINDOW_HEIGHT - 100, WINDOW_WIDTH, 100)
        pygame.draw.rect(self.screen, (30, 30, 30), stats_rect)
        
        # Draw episode info
        episode_text = f"Episode: {self.episodes}"
        episode_surface = self.font.render(episode_text, True, WHITE)
        self.screen.blit(episode_surface, (10, WINDOW_HEIGHT - 90))
        
        # Draw score
        score_text = f"Score: {self.score}"
        score_surface = self.font.render(score_text, True, WHITE)
        self.screen.blit(score_surface, (10, WINDOW_HEIGHT - 70))
        
        # Draw food eaten
        food_text = f"Food Eaten: {self.food_eaten} (Total: {self.total_food_eaten})"
        food_surface = self.font.render(food_text, True, WHITE)
        self.screen.blit(food_surface, (10, WINDOW_HEIGHT - 50))
        
        # Draw deaths
        deaths_text = f"Deaths: {self.total_deaths}"
        deaths_surface = self.font.render(deaths_text, True, WHITE)
        self.screen.blit(deaths_surface, (10, WINDOW_HEIGHT - 30))
        
        # Draw epsilon (exploration rate)
        if self.ai.has_ai:
            epsilon_text = f"Epsilon: {self.ai.epsilon:.4f}"
            epsilon_surface = self.font.render(epsilon_text, True, WHITE)
            self.screen.blit(epsilon_surface, (200, WINDOW_HEIGHT - 30))
        
        # Draw game over text
        if self.game_over:
            game_over_text = "GAME OVER"
            game_over_surface = self.big_font.render(game_over_text, True, RED)
            game_over_rect = game_over_surface.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2))
            self.screen.blit(game_over_surface, game_over_rect)
        
        # Update display
        pygame.display.flip()
    
    def run(self):
        """Main game loop"""
        running = True
        
        try:
            while running:
                # Handle events
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_ESCAPE:
                            running = False
                        elif event.key == pygame.K_r:
                            self.reset_game()
                    elif event.type == pygame.USEREVENT:
                        # Reset game after death
                        self.reset_game()
                
                # Update game state
                self.update()
                
                # Draw game
                self.draw()
                
                # Cap framerate
                self.clock.tick(FPS)
                
        except Exception as e:
            logging.error(f"Error in game loop: {e}")
            print(f"Error: {e}")
        finally:
            # Clean up
            pygame.quit()

if __name__ == "__main__":
    try:
        # Create and run game
        game = WormGame()
        game.run()
    except Exception as e:
        logging.critical(f"Fatal error: {e}")
        print(f"Fatal error: {e}")
        sys.exit(1)