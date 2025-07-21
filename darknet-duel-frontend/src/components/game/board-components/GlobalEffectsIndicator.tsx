import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../../../types/game.types';

interface GlobalEffectsIndicatorProps {
  gameState: GameState;
}

interface TemporaryEffect {
  type: 'prevent_reactions' | 'prevent_restore' | 'cost_reduction' | 'chain_vulnerability' |
        'restrict_targeting' | 'quantum_protection' | 'honeypot' | 'temporary_tax' | 'maintenance_cost';
  targetId?: string;
  playerId?: string;
  duration: number;
  sourceCardId: string;
  metadata?: {
    taxedCardType?: string;
    taxAmount?: number;
    description?: string;
    costType?: 'vulnerable' | 'shielded';
    count?: number;
    cost?: number;
    [key: string]: any;
  };
}

const GlobalEffectsIndicator: React.FC<GlobalEffectsIndicatorProps> = ({ gameState }) => {
  // Filter for global effects (effects without a specific targetId)
  const globalEffects = gameState.temporaryEffects?.filter((effect: TemporaryEffect) =>
    !effect.targetId || effect.type === 'temporary_tax' || effect.type === 'maintenance_cost'
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
      case 'maintenance_cost':
        return '⚠️';
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
      case 'maintenance_cost':
        const costType = effect.metadata?.costType || 'infrastructure';
        return `${costType === 'vulnerable' ? 'Vulnerable' : 'Shielded'} Infrastructure Maintenance`;
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
      case 'maintenance_cost':
        const costType = effect.metadata?.costType || 'infrastructure';
        const count = effect.metadata?.count || 0;
        const cost = effect.metadata?.cost || 0;
        const canPay = effect.metadata?.canPay !== false;
        const pendingRemoval = effect.metadata?.pendingRemoval === true;
        const leftWithZeroAP = effect.metadata?.leftWithZeroAP === true;
        
        if (pendingRemoval) {
          if (leftWithZeroAP) {
            return `💥 MAINTENANCE PENALTY 💥\nPaid ${cost} AP for ${count} ${costType} infrastructure but left with 0 AP!\nNext round: Random ${costType} infrastructure will be lost!`;
          }
          return `💥 MAINTENANCE FAILURE 💥\nCannot pay ${cost} AP for ${count} ${costType} infrastructure!\nNext round: Random ${costType} infrastructure will be lost!`;
        }
        
        return `⚡ MAINTENANCE PROTOCOL ACTIVE ⚡\nPaying ${cost} AP per round for ${count} ${costType} infrastructure.\nFormula: ${count} infrastructure - 2 = ${cost} AP cost per round\n${canPay ? '✅ Payment successful' : '💥 Payment failed - penalty incoming!'}`;
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
        return 'bg-gradient-to-br from-warning/90 to-accent/90 text-warning-content border-warning/60 shadow-lg shadow-warning/30';
      case 'quantum_protection':
        return 'bg-gradient-to-br from-info/90 to-primary/90 text-info-content border-info/60 shadow-lg shadow-info/30';
      case 'honeypot':
        return 'bg-gradient-to-br from-secondary/90 to-accent/90 text-secondary-content border-secondary/60 shadow-lg shadow-secondary/30';
      case 'cost_reduction':
        return 'bg-gradient-to-br from-success/90 to-primary/90 text-success-content border-success/60 shadow-lg shadow-success/30';
      case 'maintenance_cost':
        return 'bg-gradient-to-br from-error/90 to-warning/90 text-error-content border-error/60 shadow-lg shadow-error/30';
      default:
        return 'bg-gradient-to-br from-neutral/90 to-base-300/90 text-neutral-content border-neutral/60 shadow-lg shadow-neutral/30';
    }
  };

  if (globalEffects.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
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
            className={`card card-compact w-80 backdrop-blur-sm border-2 ${getEffectColor(effect.type)} shadow-2xl`}
          >
            {/* DaisyUI Card structure */}
            <div className="card-body">
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
                  <h3 className="card-title text-sm font-bold uppercase tracking-wider">
                    {getEffectTitle(effect)}
                  </h3>
                  <p className="text-xs opacity-90 leading-tight">
                    {getEffectDescription(effect)}
                  </p>
                </div>
              </div>
              
              <div className="card-actions justify-between items-center mt-3 pt-2 border-t border-current/30">
                <div className="badge badge-outline text-xs font-mono">
                  {getRemainingTurns(effect.duration)} remaining
                </div>
                <motion.div
                  className="radial-progress text-xs font-bold"
                  style={{
                    '--value': Math.max(10, (effect.duration / 4) * 100),
                    '--size': '2rem',
                    '--thickness': '3px'
                  } as any}
                  animate={{
                    '--value': Math.max(10, (effect.duration / 4) * 100)
                  } as any}
                  transition={{ duration: 0.5 }}
                >
                  {effect.duration}
                </motion.div>
              </div>

              {/* Enhanced pulse animation for maintenance_cost */}
              {effect.type === 'maintenance_cost' && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0.8), inset 0 0 30px rgba(239, 68, 68, 0.2)",
                        "0 0 0 12px rgba(239, 68, 68, 0), inset 0 0 50px rgba(239, 68, 68, 0.4)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                  {/* Additional warning stripes for maintenance */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-error to-transparent"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-error to-transparent"
                    animate={{
                      opacity: [1, 0.3, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                </>
              )}

              {/* Enhanced pulse animation for temporary_tax */}
              {effect.type === 'temporary_tax' && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
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
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-60 rounded-full"
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