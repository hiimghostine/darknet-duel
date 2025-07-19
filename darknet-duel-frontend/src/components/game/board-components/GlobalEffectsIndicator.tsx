import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../../../types/game.types';

interface GlobalEffectsIndicatorProps {
  gameState: GameState;
}

interface TemporaryEffect {
  type: 'prevent_reactions' | 'prevent_restore' | 'cost_reduction' | 'chain_vulnerability' |
        'restrict_targeting' | 'quantum_protection' | 'honeypot' | 'temporary_tax';
  targetId?: string;
  playerId?: string;
  duration: number;
  sourceCardId: string;
  metadata?: {
    taxedCardType?: string;
    taxAmount?: number;
    description?: string;
    [key: string]: any;
  };
}

const GlobalEffectsIndicator: React.FC<GlobalEffectsIndicatorProps> = ({ gameState }) => {
  // Filter for global effects (effects without a specific targetId)
  const globalEffects = gameState.temporaryEffects?.filter((effect: TemporaryEffect) => 
    !effect.targetId || effect.type === 'temporary_tax'
  ) || [];

  const getEffectIcon = (type: string) => {
    switch (type) {
      case 'temporary_tax':
        return '🍯';
      case 'quantum_protection':
        return '🔮';
      case 'honeypot':
        return '🕸️';
      case 'cost_reduction':
        return '💰';
      default:
        return '⚡';
    }
  };

  const getEffectTitle = (effect: TemporaryEffect) => {
    switch (effect.type) {
      case 'temporary_tax':
        return 'Honeypot Network Active';
      case 'quantum_protection':
        return 'Quantum Protection';
      case 'honeypot':
        return 'Honeypot Active';
      case 'cost_reduction':
        return 'Cost Reduction';
      default:
        return 'Active Effect';
    }
  };

  const getEffectDescription = (effect: TemporaryEffect) => {
    switch (effect.type) {
      case 'temporary_tax':
        const cardType = effect.metadata?.taxedCardType || 'cards';
        const amount = effect.metadata?.taxAmount || 1;
        return `When attacker plays ${cardType} cards, they must discard ${amount} additional card${amount > 1 ? 's' : ''}`;
      case 'quantum_protection':
        return 'Infrastructure is protected by quantum encryption';
      case 'honeypot':
        return 'Decoy systems are monitoring for intrusions';
      case 'cost_reduction':
        return 'Cards cost less action points to play';
      default:
        return effect.metadata?.description || 'Special effect is active';
    }
  };

  const getRemainingTurns = (duration: number) => {
    const rounds = Math.ceil(duration / 2);
    const turns = duration;
    return `${turns} turn${turns !== 1 ? 's' : ''} (${rounds} round${rounds !== 1 ? 's' : ''})`;
  };

  const getEffectColor = (type: string) => {
    switch (type) {
      case 'temporary_tax':
        return 'bg-gradient-to-br from-amber-900/90 to-orange-900/90 text-amber-100 border-amber-400/60 shadow-amber-400/30';
      case 'quantum_protection':
        return 'bg-gradient-to-br from-cyan-900/90 to-blue-900/90 text-cyan-100 border-cyan-400/60 shadow-cyan-400/30';
      case 'honeypot':
        return 'bg-gradient-to-br from-purple-900/90 to-pink-900/90 text-purple-100 border-purple-400/60 shadow-purple-400/30';
      case 'cost_reduction':
        return 'bg-gradient-to-br from-green-900/90 to-emerald-900/90 text-green-100 border-green-400/60 shadow-green-400/30';
      default:
        return 'bg-gradient-to-br from-slate-900/90 to-gray-900/90 text-slate-100 border-slate-400/60 shadow-slate-400/30';
    }
  };

  if (globalEffects.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {globalEffects.map((effect, index) => (
          <motion.div
            key={`${effect.sourceCardId}-${effect.type}-${index}`}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              delay: index * 0.1 
            }}
            className={`relative w-80 backdrop-blur-sm border-2 rounded-lg font-mono ${getEffectColor(effect.type)} shadow-2xl`}
          >
            {/* Cyberpunk corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current"></div>
            
            <div className="p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {getEffectIcon(effect.type)}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {getEffectTitle(effect)}
                  </h3>
                  <p className="text-xs opacity-90 leading-tight">
                    {getEffectDescription(effect)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/30">
                <div className="text-xs font-mono uppercase tracking-wide bg-black/30 px-2 py-1 rounded border border-current/50">
                  {getRemainingTurns(effect.duration)} remaining
                </div>
                <motion.div
                  className="relative w-8 h-8 rounded-full border-2 border-current/50 flex items-center justify-center text-xs font-bold"
                  style={{
                    background: `conic-gradient(from 0deg, currentColor ${Math.max(10, (effect.duration / 4) * 100)}%, transparent ${Math.max(10, (effect.duration / 4) * 100)}%)`
                  }}
                  animate={{
                    background: `conic-gradient(from 0deg, currentColor ${Math.max(10, (effect.duration / 4) * 100)}%, transparent ${Math.max(10, (effect.duration / 4) * 100)}%)`
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-1 bg-black/60 rounded-full flex items-center justify-center">
                    {effect.duration}
                  </div>
                </motion.div>
              </div>

              {/* Enhanced pulse animation for temporary_tax */}
              {effect.type === 'temporary_tax' && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.1)",
                      "0 0 0 8px rgba(251, 191, 36, 0), inset 0 0 30px rgba(251, 191, 36, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              )}
              
              {/* Scanning line effect */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-60"
                animate={{
                  top: ["0%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GlobalEffectsIndicator;