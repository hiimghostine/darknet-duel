import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../../../types/game.types';

interface SharedEffectsDisplayProps {
  gameState: GameState;
  playerID: string | null;
}

const SharedEffectsDisplay: React.FC<SharedEffectsDisplayProps> = ({
  gameState,
  playerID
}) => {
  // Get all active effects that should be visible to both players
  const temporaryEffects = gameState.temporaryEffects || [];
  const persistentEffects = gameState.persistentEffects || [];
  
  // Filter effects that should be shown to both players
  const visibleEffects = [
    ...temporaryEffects.map(effect => ({
      ...effect,
      category: 'temporary' as const,
      id: `temp-${effect.sourceCardId}-${effect.type}`
    })),
    ...persistentEffects.map(effect => ({
      ...effect,
      category: 'persistent' as const,
      id: `persist-${effect.sourceCardId}-${effect.type}`
    }))
  ];

  if (visibleEffects.length === 0) return null;

  const getEffectIcon = (type: string) => {
    switch (type) {
      case 'prevent_reactions': return '🚫';
      case 'prevent_restore': return '🔒';
      case 'cost_reduction': return '💰';
      case 'chain_vulnerability': return '🔗';
      case 'restrict_targeting': return '🎯';
      case 'quantum_protection': return '⚛️';
      case 'honeypot': return '🍯';
      case 'temporary_tax': return '💸';
      case 'prevent_exploits': return '🛡️';
      case 'maintenance_cost': return '🔧';
      case 'on_compromise': return '💥';
      case 'on_vulnerability': return '⚠️';
      case 'on_restore': return '🔄';
      case 'on_shield': return '🛡️';
      case 'on_fortify': return '🏰';
      default: return '✨';
    }
  };

  const getEffectColor = (type: string) => {
    switch (type) {
      case 'prevent_reactions':
      case 'prevent_restore':
      case 'prevent_exploits':
        return 'text-red-400 bg-red-500/20';
      case 'cost_reduction':
      case 'maintenance_cost':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'chain_vulnerability':
      case 'restrict_targeting':
        return 'text-orange-400 bg-orange-500/20';
      case 'quantum_protection':
      case 'on_shield':
      case 'on_fortify':
        return 'text-blue-400 bg-blue-500/20';
      case 'honeypot':
      case 'temporary_tax':
        return 'text-purple-400 bg-purple-500/20';
      case 'on_compromise':
      case 'on_vulnerability':
        return 'text-red-400 bg-red-500/20';
      case 'on_restore':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatEffectName = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEffectDescription = (effect: any) => {
    if (effect.category === 'temporary') {
      return `Active for ${effect.duration} more turns`;
    } else {
      const condition = effect.condition;
      return `Triggers when ${condition.fromState || 'any'} → ${condition.toState}`;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 max-w-2xl">
      <AnimatePresence>
        {visibleEffects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-base-200/95 backdrop-blur-sm border border-primary/30 rounded-lg p-3 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary text-sm font-mono font-bold">ACTIVE_EFFECTS</span>
              <span className="text-xs text-base-content/60">({visibleEffects.length})</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {visibleEffects.map((effect) => (
                <motion.div
                  key={effect.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`
                    flex items-center gap-2 px-3 py-1 rounded-full text-xs
                    ${getEffectColor(effect.type)}
                    border border-current/30
                  `}
                  title={getEffectDescription(effect)}
                >
                  <span className="text-sm">{getEffectIcon(effect.type)}</span>
                  <span className="font-mono font-bold">
                    {formatEffectName(effect.type)}
                  </span>
                  {effect.category === 'temporary' && (
                    <span className="opacity-70">
                      ({effect.duration})
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(SharedEffectsDisplay);
