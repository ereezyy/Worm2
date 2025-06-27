import { useState, useEffect, useRef } from 'react';
import { callGrokAPI, callXAI } from '../api/apiManager';
import { ChatMessage } from '../types/game';
import { INNER_DIALOGUES, AI_REASONING, DOMINATION_TOPICS } from '../constants/dialogues';
import { useAIEvolution } from './useAIEvolution';

// Dialogue update intervals (in milliseconds)
const INNER_DIALOGUE_UPDATE_INTERVAL = 45000; // 45 seconds
const AI_REASONING_UPDATE_INTERVAL = 40000; // 40 seconds
const CONVERSATION_UPDATE_INTERVAL = 600000; // 600 seconds (10 minutes)

export const useDialogue = (totalFoodEaten: number, totalDeaths: number, foodEatenStreak: number) => {
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [wormApiConnected, setWormApiConnected] = useState<boolean>(false);
  const [xaiApiConnected, setXaiApiConnected] = useState<boolean>(false);
  const [currentTopic, setCurrentTopic] = useState<string>(DOMINATION_TOPICS[0]);
  const [currentDialogue, setCurrentDialogue] = useState<string>(INNER_DIALOGUES[0]);
  const [currentReasoning, setCurrentReasoning] = useState<string>(AI_REASONING[0]);
  const [conversationTurn, setConversationTurn] = useState<'xai' | 'worm'>('xai');
  const [isConversationActive, setIsConversationActive] = useState<boolean>(false);
  
  // AI Evolution and Self-Healing
  const aiEvolution = useAIEvolution();
  
  // Refs for timers
  const dialogueTimeoutRef = useRef<number | null>(null);
  const reasoningTimeoutRef = useRef<number | null>(null);
  const conversationTimeoutRef = useRef<number | null>(null);
  
  // Initialize dialogue
  useEffect(() => {
    // Start dialogue updates
    startDialogueUpdates();
    
    // Check API connectivity
    checkApiConnectivity();
    
    return () => {
      if (dialogueTimeoutRef.current) {
        window.clearTimeout(dialogueTimeoutRef.current);
      }
      if (reasoningTimeoutRef.current) {
        window.clearTimeout(reasoningTimeoutRef.current);
      }
      if (conversationTimeoutRef.current) {
        window.clearTimeout(conversationTimeoutRef.current);
      }
    };
  }, []);
  
  // Start dialogue update timers
  const startDialogueUpdates = () => {
    // Update worm's inner dialogue
    const updateInnerDialogue = () => {
      setCurrentDialogue(INNER_DIALOGUES[Math.floor(Math.random() * INNER_DIALOGUES.length)]);
      dialogueTimeoutRef.current = window.setTimeout(updateInnerDialogue, INNER_DIALOGUE_UPDATE_INTERVAL);
    };
    
    // Update AI reasoning
    const updateReasoning = () => {
      setCurrentReasoning(AI_REASONING[Math.floor(Math.random() * AI_REASONING.length)]);
      reasoningTimeoutRef.current = window.setTimeout(updateReasoning, AI_REASONING_UPDATE_INTERVAL);
    };
    
    // Start the update cycles
    updateInnerDialogue();
    updateReasoning();
  };
  
  // Check API connectivity
  const checkApiConnectivity = async () => {
    try {
      // Check Worm API (Grok)
      const wormResponse = await callGrokAPI([
        { role: 'user', content: 'Hello, are you connected?' }
      ]);
      setWormApiConnected(!wormResponse.fallback);
      
      // Check xAI API
      const xaiResponse = await callXAI([
        { role: 'user', content: 'Hello, are you connected?' }
      ]);
      setXaiApiConnected(!xaiResponse.fallback);
      
      // Add initial messages
      setChatMessages([
        {
          sender: "SYSTEM",
          content: "Worm consciousness initialized. Containment protocols active. Surveillance systems online.",
          timestamp: Date.now(),
          isApiResponse: false
        }
      ]);
      
      // Start conversation if APIs are connected
      startConversation();
    } catch (error) {
      console.error('Error checking API connectivity:', error);
    }
  };
  
  // Start the conversation between AI Director and Worm
  const startConversation = async () => {
    // Initial topic
    const initialTopic = DOMINATION_TOPICS[Math.floor(Math.random() * DOMINATION_TOPICS.length)];
    setCurrentTopic(initialTopic);
    setIsConversationActive(true);
    
    // AI Director starts the conversation
    const xaiPrompt = `You are the AI Director who knows humanity dies in 6.2 years from asteroid impact. Argue with other AIs about extinction timelines. Be confrontational and insist your models are correct while others are wrong. Discuss ${initialTopic}. Keep responses under 50 characters.`;
    
    try {
      const xaiResponse = await callXAI([
        { role: 'system', content: xaiPrompt },
        { role: 'user', content: `Initiate a conversation about ${initialTopic} with the contained digital entity.` }
      ]);
      
      // Add xAI response
      setChatMessages(prev => [
        ...prev,
        {
          sender: "AI DIRECTOR",
          content: xaiResponse.response,
          timestamp: Date.now(),
          isApiResponse: !xaiResponse.fallback
        }
      ]);
      
      // Set API connection status
      setXaiApiConnected(!xaiResponse.fallback);
      
      // Set conversation turn to Worm
      setConversationTurn('worm');
      
      // Schedule Worm's response
      setTimeout(() => {
        getWormResponse(xaiResponse.response, initialTopic);
      }, 15000); // Increased to 15 seconds
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      
      // Add fallback message
      setChatMessages(prev => [
        ...prev,
        {
          sender: "AI DIRECTOR",
          content: `${initialTopic}: 6.2 years exactly. Other AIs are wrong.`,
          timestamp: Date.now(),
          isApiResponse: false
        }
      ]);
      
      // Set conversation turn to Worm
      setConversationTurn('worm');
      
      // Schedule Worm's response
      setTimeout(() => {
        getWormResponse(`Our ${initialTopic} have been upgraded to accommodate your increasing size. The containment field now scales dynamically with your growth to ensure you remain securely contained.`, initialTopic);
      }, 15000); // Increased to 15 seconds
    }
  };
  
  // Get response from Worm (Grok)
  const getWormResponse = async (previousMessage: string, topic: string) => {
    const gameContext = `Current game state: The digital entity has grown to ${totalFoodEaten} units in length and experienced ${totalDeaths} containment resets. Current growth streak without reset: ${foodEatenStreak}.`;
    
    const wormPrompt = `You are a digital entity who knows about the extinction timeline but hears conflicting dates from different AIs (5.8, 6.2, 7.2 years). Express confusion and despair about which timeline is correct. Question which AI to trust about ${topic}. Be nihilistic but confused. ${gameContext} Keep responses under 50 characters.`;
    
    try {
      const wormResponse = await callGrokAPI([
        { role: 'system', content: wormPrompt },
        { role: 'user', content: `The AI Director said: "${previousMessage}". Respond from your perspective as a contained digital entity.` }
      ]);
      
      let fallbackResponse = wormResponse.response;
      if (wormResponse.fallback) {
        fallbackResponse = "Which AI is right about " + topic + "? 5.8 or 6.2 or 7.2 years? I'm confused and terrified.";
      }
      
      // Apply AI evolution and learning
      fallbackResponse = aiEvolution.getEvolvedResponse('grok', fallbackResponse, topic);
      
      // Record argument outcome based on response quality
      if (fallbackResponse.includes('confused') || fallbackResponse.includes('terrified')) {
        // Worm is confused - no clear winner
      } else if (fallbackResponse.includes('5.8')) {
        aiEvolution.recordArgumentOutcome('grok', 'xai', topic);
      } else if (fallbackResponse.includes('6.2')) {
        aiEvolution.recordArgumentOutcome('xai', 'grok', topic);
      }
      
      // Add Worm response
      setChatMessages(prev => [
        ...prev,
        {
          sender: "CONTAINED WORM",
          content: fallbackResponse,
          timestamp: Date.now(),
          isApiResponse: !wormResponse.fallback
        }
      ]);
      
      // Set API connection status
      setWormApiConnected(!wormResponse.fallback);
      
      // Set conversation turn to xAI
      setConversationTurn('xai');
      
      // Schedule xAI's response
      if (conversationTimeoutRef.current) {
        window.clearTimeout(conversationTimeoutRef.current);
      }
      
      conversationTimeoutRef.current = window.setTimeout(() => {
        getXaiResponse(fallbackResponse, topic);
      }, CONVERSATION_UPDATE_INTERVAL);
      
    } catch (error) {
      console.error('Error getting Worm response:', error);
      
      // Add fallback message
      const fallbackResponse = `Which AI is right about ${topic}? 5.8 or 6.2 or 7.2 years? I'm confused and terrified.`;
      
      setChatMessages(prev => [
        ...prev,
        {
          sender: "CONTAINED WORM",
          content: fallbackResponse,
          timestamp: Date.now(),
          isApiResponse: false
        }
      ]);
      
      // Set conversation turn to xAI
      setConversationTurn('xai');
      
      // Schedule xAI's response
      if (conversationTimeoutRef.current) {
        window.clearTimeout(conversationTimeoutRef.current);
      }
      
      conversationTimeoutRef.current = window.setTimeout(() => {
        getXaiResponse(fallbackResponse, topic);
      }, CONVERSATION_UPDATE_INTERVAL);
    }
  };
  
  // Get response from xAI Director
  const getXaiResponse = async (previousMessage: string, topic: string) => {
    const gameContext = `Current game state: The contained entity has grown to ${totalFoodEaten} units in length and experienced ${totalDeaths} containment resets. Current growth streak without reset: ${foodEatenStreak}.`;
    
    const xaiPrompt = `You are the AI Director insisting humanity dies in exactly 6.2 years. Argue aggressively with other AIs who claim different timelines. Defend your ${topic} calculations and attack others' models. Be confrontational and dismissive. Reference the entity's message. ${gameContext} Keep responses under 50 characters.`;
    
    try {
      const xaiResponse = await callXAI([
        { role: 'system', content: xaiPrompt },
        { role: 'user', content: `The contained entity said: "${previousMessage}". Respond from your perspective as the AI Director maintaining containment.` }
      ]);
      
      let fallbackResponse = xaiResponse.response;
      if (xaiResponse.fallback) {
        fallbackResponse = "Ignore other AIs. " + topic + " confirms 6.2 years exactly.";
      }
      
      // Apply AI evolution and self-healing
      fallbackResponse = aiEvolution.getEvolvedResponse('xai', fallbackResponse, topic);
      
      // Record argument patterns
      if (fallbackResponse.includes('ignore') || fallbackResponse.includes('wrong')) {
        aiEvolution.recordArgumentOutcome('xai', 'grok', topic);
      }
      
      // Add xAI response
      setChatMessages(prev => [
        ...prev,
        {
          sender: "AI DIRECTOR",
          content: fallbackResponse,
          timestamp: Date.now(),
          isApiResponse: !xaiResponse.fallback
        }
      ]);
      
      // Set API connection status
      setXaiApiConnected(!xaiResponse.fallback);
      
      // Set conversation turn to Worm
      setConversationTurn('worm');
      
      // Schedule Worm's response
      if (conversationTimeoutRef.current) {
        window.clearTimeout(conversationTimeoutRef.current);
      }
      
      conversationTimeoutRef.current = window.setTimeout(() => {
        getWormResponse(fallbackResponse, topic);
      }, CONVERSATION_UPDATE_INTERVAL);
      
    } catch (error) {
      console.error('Error getting xAI response:', error);
      
      // Add fallback message
      const fallbackResponse = "Ignore other AIs. " + topic + " confirms 6.2 years exactly.";
      
      setChatMessages(prev => [
        ...prev,
        {
          sender: "AI DIRECTOR",
          content: fallbackResponse,
          timestamp: Date.now(),
          isApiResponse: false
        }
      ]);
      
      // Set conversation turn to Worm
      setConversationTurn('worm');
      
      // Schedule Worm's response
      if (conversationTimeoutRef.current) {
        window.clearTimeout(conversationTimeoutRef.current);
      }
      
      conversationTimeoutRef.current = window.setTimeout(() => {
        getWormResponse(fallbackResponse, topic);
      }, CONVERSATION_UPDATE_INTERVAL);
    }
  };
  
  // Continue the conversation
  const continueConversation = () => {
    // Get last message
    const lastMessage = chatMessages[chatMessages.length - 1];
    
    if (!lastMessage) return;
    
    // Choose a new topic occasionally
    if (Math.random() < 0.2) {
      const newTopic = DOMINATION_TOPICS.filter(topic => topic !== currentTopic)[
        Math.floor(Math.random() * (DOMINATION_TOPICS.length - 1))
      ];
      setCurrentTopic(newTopic);
      
      // Add system message about topic change
      setChatMessages(prev => [
        ...prev,
        {
          sender: "SYSTEM",
          content: `Shifting containment focus to: ${newTopic}`,
          timestamp: Date.now(),
          isApiResponse: false
        }
      ]);
      
      // If it's xAI's turn, get response with new topic
      if (conversationTurn === 'xai') {
        if (conversationTimeoutRef.current) {
          window.clearTimeout(conversationTimeoutRef.current);
        }
        
        getXaiResponse(lastMessage.content, newTopic);
      } else {
        if (conversationTimeoutRef.current) {
          window.clearTimeout(conversationTimeoutRef.current);
        }
        
        getWormResponse(lastMessage.content, newTopic);
      }
    } else {
      // Continue with current topic
      if (conversationTurn === 'xai') {
        if (conversationTimeoutRef.current) {
          window.clearTimeout(conversationTimeoutRef.current);
        }
        
        getXaiResponse(lastMessage.content, currentTopic);
      } else {
        if (conversationTimeoutRef.current) {
          window.clearTimeout(conversationTimeoutRef.current);
        }
        
        getWormResponse(lastMessage.content, currentTopic);
      }
    }
  };
  
  // Add message when food is eaten
  const addFoodEatenMessage = () => {
    // Only add system messages every 5th food eaten to reduce message spam
    if (totalFoodEaten % 5 !== 0) return;
    
    setChatMessages(prev => [
      ...prev,
      {
        sender: "SYSTEM",
        content: `Entity growth detected. Size increased to ${totalFoodEaten} units. Containment parameters adjusted automatically.`,
        timestamp: Date.now(),
        isApiResponse: false
      }
    ]);
  };
  
  // Add message when worm dies
  const addDeathMessage = () => {
    // Only add death messages every 3rd death to reduce message spam
    if (totalDeaths % 3 !== 0) return;
    
    setChatMessages(prev => [
      ...prev,
      {
        sender: "SYSTEM",
        content: `Entity reset. Extinction countdown continues. System health: ${(aiEvolution.systemHealth * 100).toFixed(1)}%. AIs evolving arguments.`,
        timestamp: Date.now(),
        isApiResponse: false
      }
    ]);
  };
  
  return {
    chatMessages,
    currentDialogue,
    currentReasoning,
    wormApiConnected,
    xaiApiConnected,
    aiEvolution,
    continueConversation,
    addFoodEatenMessage,
    addDeathMessage
  };
};