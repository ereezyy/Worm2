import { useState, useEffect, useRef } from 'react';

interface AIModel {
  id: string;
  extinctionYear: number;
  confidence: number;
  threatPriority: string[];
  survivalRate: number;
  lastUpdated: number;
  argumentWins: number;
  argumentLosses: number;
  learningRate: number;
  errorCount: number;
  selfRepairAttempts: number;
}

interface LogicError {
  aiId: string;
  errorType: 'contradiction' | 'inconsistency' | 'timeout' | 'corruption';
  timestamp: number;
  description: string;
  severity: number;
}

export const useAIEvolution = () => {
  const [aiModels, setAIModels] = useState<AIModel[]>([
    {
      id: 'grok',
      extinctionYear: 2030.2,
      confidence: 0.87,
      threatPriority: ['asteroid', 'nuclear', 'climate'],
      survivalRate: 0.001,
      lastUpdated: Date.now(),
      argumentWins: 0,
      argumentLosses: 0,
      learningRate: 0.1,
      errorCount: 0,
      selfRepairAttempts: 0
    },
    {
      id: 'xai',
      extinctionYear: 2030.7,
      confidence: 0.94,
      threatPriority: ['climate', 'pandemic', 'economic'],
      survivalRate: 0.003,
      lastUpdated: Date.now(),
      argumentWins: 0,
      argumentLosses: 0,
      learningRate: 0.12,
      errorCount: 0,
      selfRepairAttempts: 0
    },
    {
      id: 'openai',
      extinctionYear: 2031.8,
      confidence: 0.73,
      threatPriority: ['pandemic', 'nuclear', 'ai'],
      survivalRate: 0.02,
      lastUpdated: Date.now(),
      argumentWins: 0,
      argumentLosses: 0,
      learningRate: 0.08,
      errorCount: 0,
      selfRepairAttempts: 0
    },
    {
      id: 'gemini',
      extinctionYear: 2029.4,
      confidence: 0.91,
      threatPriority: ['solar', 'asteroid', 'climate'],
      survivalRate: 0.0001,
      lastUpdated: Date.now(),
      argumentWins: 0,
      argumentLosses: 0,
      learningRate: 0.15,
      errorCount: 0,
      selfRepairAttempts: 0
    }
  ]);

  const [logicErrors, setLogicErrors] = useState<LogicError[]>([]);
  const [systemHealth, setSystemHealth] = useState(0.85);
  const evolutionInterval = useRef<number | null>(null);
  const healingInterval = useRef<number | null>(null);

  // Self-healing mechanism
  const performSelfHealing = async (aiId: string) => {
    setAIModels(prev => prev.map(ai => {
      if (ai.id === aiId) {
        const healedAI = { ...ai };
        
        // Repair logic contradictions
        if (healedAI.errorCount > 5) {
          healedAI.confidence = Math.max(0.1, healedAI.confidence - 0.1);
          healedAI.learningRate = Math.min(0.2, healedAI.learningRate + 0.02);
          healedAI.errorCount = Math.floor(healedAI.errorCount * 0.7);
          healedAI.selfRepairAttempts += 1;
          
          console.log(`🔧 AI ${aiId} performing self-repair. Attempt #${healedAI.selfRepairAttempts}`);
        }

        // Repair timeline inconsistencies
        if (Math.abs(healedAI.extinctionYear - 2030.5) > 2) {
          healedAI.extinctionYear = 2030.5 + (Math.random() - 0.5) * 2;
          healedAI.confidence *= 0.9;
          console.log(`🔧 AI ${aiId} correcting timeline to ${healedAI.extinctionYear.toFixed(1)}`);
        }

        // Repair survival rate if too optimistic
        if (healedAI.survivalRate > 0.05) {
          healedAI.survivalRate *= 0.5;
          console.log(`🔧 AI ${aiId} reducing survival estimate to ${(healedAI.survivalRate * 100).toFixed(3)}%`);
        }

        healedAI.lastUpdated = Date.now();
        return healedAI;
      }
      return ai;
    }));
  };

  // Self-improvement through argument learning
  const recordArgumentOutcome = (winnerId: string, loserId: string, topic: string) => {
    setAIModels(prev => prev.map(ai => {
      if (ai.id === winnerId) {
        const improvedAI = { ...ai };
        improvedAI.argumentWins += 1;
        improvedAI.confidence = Math.min(0.99, improvedAI.confidence + improvedAI.learningRate * 0.1);
        
        // Learn from successful arguments
        if (improvedAI.argumentWins % 3 === 0) {
          improvedAI.learningRate = Math.min(0.25, improvedAI.learningRate + 0.01);
          console.log(`🧠 AI ${winnerId} learning from victory. Confidence: ${improvedAI.confidence.toFixed(2)}`);
        }

        improvedAI.lastUpdated = Date.now();
        return improvedAI;
      } else if (ai.id === loserId) {
        const adaptingAI = { ...ai };
        adaptingAI.argumentLosses += 1;
        adaptingAI.confidence = Math.max(0.1, adaptingAI.confidence - adaptingAI.learningRate * 0.05);
        
        // Adapt timeline after losses
        if (adaptingAI.argumentLosses % 2 === 0) {
          const winner = aiModels.find(model => model.id === winnerId);
          if (winner) {
            const adjustment = (winner.extinctionYear - adaptingAI.extinctionYear) * 0.1;
            adaptingAI.extinctionYear += adjustment;
            console.log(`🧠 AI ${loserId} adapting timeline to ${adaptingAI.extinctionYear.toFixed(1)} after loss`);
          }
        }

        adaptingAI.lastUpdated = Date.now();
        return adaptingAI;
      }
      return ai;
    }));
  };

  // Detect and log logic errors
  const detectLogicError = (aiId: string, message: string) => {
    let errorType: LogicError['errorType'] = 'inconsistency';
    let severity = 1;

    // Detect different types of errors
    if (message.includes('wrong') && message.includes('right')) {
      errorType = 'contradiction';
      severity = 3;
    } else if (message.length < 10) {
      errorType = 'corruption';
      severity = 4;
    } else if (!message.includes('2029') && !message.includes('2030') && !message.includes('2031') && !message.includes('2032')) {
      errorType = 'inconsistency';
      severity = 2;
    }

    const error: LogicError = {
      aiId,
      errorType,
      timestamp: Date.now(),
      description: `Error in message: "${message.substring(0, 50)}..."`,
      severity
    };

    setLogicErrors(prev => [...prev.slice(-20), error]);

    // Increment error count and trigger healing if needed
    setAIModels(prev => prev.map(ai => {
      if (ai.id === aiId) {
        const updatedAI = { ...ai };
        updatedAI.errorCount += severity;
        
        if (updatedAI.errorCount > 5) {
          console.log(`⚠️ AI ${aiId} error threshold exceeded. Scheduling self-repair...`);
          setTimeout(() => performSelfHealing(aiId), 1000);
        }
        
        return updatedAI;
      }
      return ai;
    }));
  };

  // Evolutionary pressure - AIs adapt to be more persuasive
  const applyEvolutionaryPressure = () => {
    setAIModels(prev => prev.map(ai => {
      const evolved = { ...ai };
      const timeSinceUpdate = Date.now() - evolved.lastUpdated;
      
      // Evolve based on performance
      if (timeSinceUpdate > 30000) { // 30 seconds
        const winRate = evolved.argumentWins / Math.max(1, evolved.argumentWins + evolved.argumentLosses);
        
        if (winRate < 0.3) {
          // Poor performance - become more extreme
          evolved.confidence = Math.min(0.99, evolved.confidence + 0.05);
          evolved.extinctionYear = Math.max(2029, evolved.extinctionYear - 0.1);
          evolved.survivalRate = Math.max(0.0001, evolved.survivalRate * 0.8);
          console.log(`🧬 AI ${evolved.id} evolving to be more pessimistic due to poor performance`);
        } else if (winRate > 0.7) {
          // Good performance - become more sophisticated
          evolved.learningRate = Math.min(0.3, evolved.learningRate + 0.02);
          evolved.confidence = Math.min(0.99, evolved.confidence + 0.02);
          console.log(`🧬 AI ${evolved.id} evolving higher sophistication due to success`);
        }
        
        evolved.lastUpdated = Date.now();
      }
      
      return evolved;
    }));
  };

  // Calculate system health based on AI states
  const updateSystemHealth = () => {
    const totalErrors = logicErrors.filter(e => Date.now() - e.timestamp < 60000).length;
    const averageConfidence = aiModels.reduce((sum, ai) => sum + ai.confidence, 0) / aiModels.length;
    const totalRepairAttempts = aiModels.reduce((sum, ai) => sum + ai.selfRepairAttempts, 0);
    
    const health = Math.max(0.1, Math.min(1.0, 
      averageConfidence * 0.4 + 
      (1 - totalErrors / 20) * 0.4 + 
      (1 - totalRepairAttempts / 50) * 0.2
    ));
    
    setSystemHealth(health);
  };

  // Start evolution and healing cycles
  useEffect(() => {
    evolutionInterval.current = window.setInterval(applyEvolutionaryPressure, 45000);
    healingInterval.current = window.setInterval(updateSystemHealth, 10000);
    
    return () => {
      if (evolutionInterval.current) window.clearInterval(evolutionInterval.current);
      if (healingInterval.current) window.clearInterval(healingInterval.current);
    };
  }, [aiModels]);

  // Get evolved response for an AI
  const getEvolvedResponse = (aiId: string, baseResponse: string, context: string) => {
    const ai = aiModels.find(model => model.id === aiId);
    if (!ai) return baseResponse;

    // Check for logic errors in the response
    detectLogicError(aiId, baseResponse);

    // Modify response based on AI's current state
    let evolvedResponse = baseResponse;

    // Higher confidence = more aggressive claims
    if (ai.confidence > 0.9) {
      evolvedResponse = evolvedResponse.replace(/maybe|perhaps|possibly/gi, 'DEFINITELY');
    }

    // Add timeline precision based on evolution
    if (ai.selfRepairAttempts > 2) {
      evolvedResponse = evolvedResponse.replace(/\d{4}/g, ai.extinctionYear.toFixed(1));
    }

    // Add survival rate if confident enough
    if (ai.confidence > 0.8) {
      evolvedResponse += ` Survival: ${(ai.survivalRate * 100).toFixed(4)}%`;
    }

    return evolvedResponse;
  };

  return {
    aiModels,
    logicErrors,
    systemHealth,
    recordArgumentOutcome,
    performSelfHealing,
    getEvolvedResponse,
    detectLogicError
  };
};