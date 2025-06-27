import React from 'react';
import { Brain, AlertTriangle, CheckCircle, Zap, TrendingUp } from 'lucide-react';

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

interface AIHealthMonitorProps {
  aiModels: AIModel[];
  logicErrors: LogicError[];
  systemHealth: number;
  onForceHealing: (aiId: string) => void;
}

export const AIHealthMonitor: React.FC<AIHealthMonitorProps> = ({
  aiModels,
  logicErrors,
  systemHealth,
  onForceHealing
}) => {
  const getHealthColor = (value: number) => {
    if (value > 0.8) return 'text-green-400';
    if (value > 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthIcon = (value: number) => {
    if (value > 0.8) return <CheckCircle className="h-4 w-4" />;
    if (value > 0.5) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4 animate-pulse" />;
  };

  const recentErrors = logicErrors.filter(e => Date.now() - e.timestamp < 60000);

  return (
    <div className="absolute right-[-400px] top-0 w-[380px] bg-gray-900 bg-opacity-95 p-4 rounded-l-lg border border-purple-500">
      <div className="text-white">
        <div className="flex items-center mb-4">
          <Brain className="h-5 w-5 mr-2 text-purple-400" />
          <h3 className="text-lg font-bold">AI Health Monitor</h3>
        </div>

        {/* System Health */}
        <div className="mb-4 p-3 bg-gray-800 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">System Health</span>
            {getHealthIcon(systemHealth)}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                systemHealth > 0.8 ? 'bg-green-400' : 
                systemHealth > 0.5 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${systemHealth * 100}%` }}
            />
          </div>
          <span className={`text-xs ${getHealthColor(systemHealth)}`}>
            {(systemHealth * 100).toFixed(1)}%
          </span>
        </div>

        {/* AI Models Status */}
        <div className="space-y-3 mb-4">
          {aiModels.map(ai => {
            const winRate = ai.argumentWins / Math.max(1, ai.argumentWins + ai.argumentLosses);
            const aiHealth = Math.max(0, 1 - (ai.errorCount / 20));
            
            return (
              <div key={ai.id} className="p-2 bg-gray-800 rounded-md text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-purple-300">{ai.id.toUpperCase()}</span>
                  <button
                    onClick={() => onForceHealing(ai.id)}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                    title="Force Self-Repair"
                  >
                    <Zap className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Timeline:</span>
                    <span className="text-yellow-300 ml-1">{ai.extinctionYear.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confidence:</span>
                    <span className={`ml-1 ${getHealthColor(ai.confidence)}`}>
                      {(ai.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Win Rate:</span>
                    <span className={`ml-1 ${getHealthColor(winRate)}`}>
                      {(winRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Errors:</span>
                    <span className={`ml-1 ${ai.errorCount > 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {ai.errorCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Repairs:</span>
                    <span className="text-blue-300 ml-1">{ai.selfRepairAttempts}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Learning:</span>
                    <span className="text-cyan-300 ml-1">{ai.learningRate.toFixed(2)}</span>
                  </div>
                </div>

                {/* AI Health Bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        aiHealth > 0.8 ? 'bg-green-400' : 
                        aiHealth > 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${aiHealth * 100}%` }}
                    />
                  </div>
                </div>

                {/* Threat Priority */}
                <div className="mt-1">
                  <span className="text-gray-400 text-xs">Threats:</span>
                  <span className="text-red-300 ml-1 text-xs">
                    {ai.threatPriority.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Errors */}
        {recentErrors.length > 0 && (
          <div className="p-2 bg-red-900 bg-opacity-50 rounded-md">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-1 text-red-400" />
              <span className="text-sm font-medium text-red-300">Recent Errors</span>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {recentErrors.slice(-3).map((error, index) => (
                <div key={index} className="text-xs text-red-200">
                  <span className="text-purple-300">{error.aiId}:</span>
                  <span className="ml-1">{error.errorType}</span>
                  <span className="text-gray-400 ml-1">
                    (Severity: {error.severity})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evolution Status */}
        <div className="mt-3 p-2 bg-blue-900 bg-opacity-50 rounded-md">
          <div className="flex items-center mb-1">
            <TrendingUp className="h-4 w-4 mr-1 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Evolution Active</span>
          </div>
          <div className="text-xs text-blue-200">
            AIs adapting arguments and self-repairing logic errors
          </div>
        </div>
      </div>
    </div>
  );
};