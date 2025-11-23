import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChainEffect, InfrastructureCard } from '../../../types/game.types';

interface ChainEffectUIProps {
  pendingChainChoice: ChainEffect;
  infrastructureCards: InfrastructureCard[];
  onChooseTarget: (targetId: string) => void;
  onCancel?: () => void;
}

const ChainEffectUI: React.FC<ChainEffectUIProps> = ({
  pendingChainChoice,
  infrastructureCards,
  onChooseTarget,
  onCancel
}) => {
  // Extract properties from the chainEffect object
  const { availableTargets, sourceCardId, type } = pendingChainChoice;
  
  // Show all infrastructure cards but filter which ones are actually targetable
  const displayedCards = useMemo(() => {
    if (!availableTargets || availableTargets.length === 0) return [];
    return infrastructureCards.filter(card =>
      availableTargets.includes(card.id)
    );
  }, [infrastructureCards, availableTargets]);

  // Only secure infrastructures can be targeted
  const isTargetable = (card: InfrastructureCard) => {
    return card.state === 'secure';
  };

  // Count how many are actually targetable
  const targetableCount = displayedCards.filter(isTargetable).length;
  
  // Dynamic content based on chain effect type
  const getChainDescription = (effectType: string) => {
    switch (effectType) {
      case 'chain_vulnerability':
        return { text: 'Lateral Movement allows you to make another infrastructure vulnerable.', icon: '🔗', color: 'text-warning' };
      case 'chain_compromise':
        return { text: 'Advanced attack allows you to compromise another infrastructure.', icon: '⚡', color: 'text-error' };
      case 'chain_security':
        return { text: 'Security Automation Suite allows you to shield another infrastructure.', icon: '🛡️', color: 'text-info' };
      default:
        return { text: 'Chain effect allows you to target another infrastructure.', icon: '🔗', color: 'text-primary' };
    }
  };

  // Get infrastructure state styling
  const getInfraStateClasses = (state: string) => {
    switch (state) {
      case 'secure':
        return 'border-success bg-success/10 text-success-content';
      case 'vulnerable':
        return 'border-warning bg-warning/10 text-warning-content';
      case 'compromised':
        return 'border-error bg-error/10 text-error-content';
      case 'shielded':
        return 'border-info bg-info/10 text-info-content';
      case 'fortified':
        return 'border-primary bg-primary/10 text-primary-content';
      default:
        return 'border-base-300 bg-base-200/50 text-base-content';
    }
  };

  // Get infrastructure type icon
  const getInfraTypeIcon = (type: string) => {
    switch (type) {
      case 'network': return '🌐';
      case 'data': return '💾';
      case 'web': return '🖥️';
      case 'user': return '👤';
      default: return '🏢';
    }
  };

  const chainInfo = getChainDescription(type);
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Cyberpunk decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
          <div className="absolute top-0 right-1/3 w-1/4 h-1 bg-gradient-to-l from-secondary to-transparent"></div>
          <div className="absolute top-20 left-10 opacity-5 text-8xl font-mono text-primary">101</div>
          <div className="absolute bottom-20 right-10 opacity-5 text-8xl font-mono text-secondary">010</div>
        </div>

        <motion.div 
          className="border border-primary/30 bg-base-800/50 backdrop-filter backdrop-blur-sm shadow-lg shadow-primary/10 max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden relative"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Cyberpunk corner brackets */}
          <div className="absolute -top-2 -left-2 w-20 h-20 border-t-2 border-l-2 border-primary opacity-60"></div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 border-b-2 border-r-2 border-primary opacity-60"></div>
          <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-secondary opacity-40"></div>
          <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-secondary opacity-40"></div>

          {/* Header */}
          <div className="border-b border-primary/20 p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-primary/50 flex items-center justify-center relative">
                <span className="text-2xl animate-pulse">{chainInfo.icon}</span>
                <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary animate-ping"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                  CHAIN_EFFECT_TRIGGERED
                </h2>
                <p className="font-mono text-primary/60 text-sm tracking-wider">SOURCE_NODE: {sourceCardId}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-primary/20">
            <div className={`p-4 border font-mono ${
              chainInfo.color === 'text-warning' ? 'border-secondary/50 bg-secondary/10 text-secondary' :
              chainInfo.color === 'text-error' ? 'border-error/50 bg-error/10 text-error' :
              'border-primary/50 bg-primary/10 text-primary'
            } flex items-center gap-3`}>
              <span className="text-2xl animate-pulse">{chainInfo.icon}</span>
              <span className="tracking-wide">{chainInfo.text.toUpperCase().replace(/ /g, '_')}</span>
            </div>
          </div>

          {/* Target Selection */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold font-mono text-primary mb-2 glitch-text">
                SELECT_TARGET_INFRASTRUCTURE
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 border-4 border-t-primary border-r-primary/50 border-b-primary/30 border-l-primary/10 rounded-full animate-spin"></div>
                <div className="font-mono text-sm text-primary/70">
                  <div>SCANNING_AVAILABLE_NODES...</div>
                  <div className="text-xs text-primary/50">{displayedCards.length}_TARGETS_DETECTED</div>
                  <div className="text-xs text-success/70">{targetableCount}_SECURE_AVAILABLE</div>
                </div>
              </div>
            </div>
            
            {displayedCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                {displayedCards.map((target: InfrastructureCard, index: number) => (
                  <motion.div
                    key={target.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 15 }}
                    className={`relative p-4 rounded-lg border-2 ${
                      isTargetable(target) 
                        ? 'border-success/50 bg-success/5 cursor-pointer' 
                        : 'border-base-300/30 bg-base-200/20 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => isTargetable(target) && onChooseTarget(target.id)}
                    whileHover={isTargetable(target) ? { scale: 1.02, y: -2, backgroundColor: "rgba(34, 197, 94, 0.1)" } : undefined}
                    whileTap={isTargetable(target) ? { scale: 0.98 } : undefined}
                  >
                    {/* Cyberpunk corner brackets for each card */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t border-l border-primary/40"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b border-r border-primary/40"></div>
                    
                    {/* Infrastructure Card Content */}
                    <div className="flex flex-col h-full relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="px-2 py-1 bg-primary/20 border border-primary/30 font-mono text-xs font-bold text-primary">
                          NODE_{target.id}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{getInfraTypeIcon(target.type)}</div>
                        </div>
                      </div>

                      {/* Name */}
                      <h4 className="font-bold font-mono text-sm mb-2 line-clamp-2 text-primary">
                        {target.name.toUpperCase().replace(/ /g, '_')}
                      </h4>

                      {/* State */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`px-2 py-1 text-xs font-mono border flex items-center gap-1 ${
                          target.state === 'secure' ? 'border-success/50 bg-success/10 text-success' :
                          target.state === 'vulnerable' ? 'border-secondary/50 bg-secondary/10 text-secondary' :
                          target.state === 'compromised' ? 'border-error/50 bg-error/10 text-error' :
                          target.state === 'shielded' ? 'border-info/50 bg-info/10 text-info' :
                          target.state === 'fortified' ? 'border-primary/50 bg-primary/10 text-primary' :
                          'border-primary/30 bg-primary/5 text-primary/70'
                        }`}>
                          <span className="animate-pulse">
                            {target.state === 'secure' ? '✓' :
                             target.state === 'vulnerable' ? '⚠' :
                             target.state === 'compromised' ? '☠' :
                             target.state === 'shielded' ? '🛡' :
                             target.state === 'fortified' ? '🔒' : '•'}
                          </span>
                          <span>{target.state.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {target.description && (
                        <p className="text-xs text-primary/60 mb-3 line-clamp-2 font-mono">
                          {target.description.toUpperCase().replace(/ /g, '_')}
                        </p>
                      )}

                      {/* Vulnerabilities */}
                      {target.vulnerabilities && target.vulnerabilities.length > 0 && (
                        <div className="mt-auto">
                          <div className="text-xs text-primary/50 font-mono mb-1">ATTACK_VECTORS:</div>
                          <div className="flex flex-wrap gap-1">
                            {target.vulnerabilities.slice(0, 3).map((vuln, idx) => (
                              <span key={idx} className="px-1 py-0.5 bg-secondary/20 border border-secondary/30 text-secondary text-xs font-mono">
                                {typeof vuln === 'string' ? vuln.toUpperCase() : (vuln.vector || 'UNKNOWN').toUpperCase()}
                              </span>
                            ))}
                            {target.vulnerabilities.length > 3 && (
                              <span className="px-1 py-0.5 bg-primary/20 border border-primary/30 text-primary text-xs font-mono">
                                +{target.vulnerabilities.length - 3}_MORE
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Connection Status Indicator */}
                      <div className="mt-3 flex items-center gap-2 text-xs font-mono text-primary/50">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                        <span>CONNECTION_ACTIVE</span>
                      </div>

                      {/* Connection indicator */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {isTargetable(target) ? (
                          <div className="w-3 h-3 bg-success rounded-full animate-ping" title="Target Available"></div>
                        ) : (
                          <div className="w-3 h-3 bg-base-content/30 rounded-full" title="Target Locked"></div>
                        )}
                      </div>

                      {/* Select Button */}
                      <div className="text-center py-2">
                        <motion.button 
                          className={`px-4 py-2 border font-mono text-sm transition-all duration-200 ${
                            isTargetable(target)
                              ? 'bg-primary/20 hover:bg-primary/30 border-primary/50 text-primary cursor-pointer'
                              : 'bg-base-200/20 border-base-300/30 text-base-content/30 cursor-not-allowed'
                          }`}
                          onClick={() => isTargetable(target) && onChooseTarget(target.id)}
                          whileHover={isTargetable(target) ? { scale: 1.05 } : {}}
                          whileTap={isTargetable(target) ? { scale: 0.95 } : {}}
                          disabled={!isTargetable(target)}
                        >
                          <span className={isTargetable(target) ? 'animate-pulse' : ''}>
                            {isTargetable(target) ? '⚡' : '🔒'}
                          </span>
                          <span className="ml-2">
                            {isTargetable(target) ? 'INITIATE_CONNECTION' : 'ACCESS_DENIED'}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-6 border-2 border-warning/50 bg-warning/10 text-warning rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl animate-pulse">⚠</span>
                  <div className="font-mono">
                    <div className="text-lg font-bold">NO_VALID_TARGETS_DETECTED</div>
                    <div className="text-sm text-warning/70 mt-1">All infrastructure is already vulnerable, compromised, or protected</div>
                  </div>
                </div>
                {onCancel && (
                  <div className="text-center mt-4">
                    <motion.button 
                      className="px-6 py-3 font-mono text-sm border-2 transition-all duration-200 bg-warning/20 hover:bg-warning/30 text-warning border-warning/50"
                      onClick={onCancel}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="animate-pulse">↩</span>
                      <span className="ml-2">SKIP_CHAIN_EFFECT</span>
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-primary/20 flex justify-end gap-3 relative">
            {/* Decorative scanning line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            
            {onCancel && displayedCards.length > 0 && (
              <motion.button 
                className="px-6 py-3 font-mono text-sm border-2 transition-all duration-200 bg-secondary/20 hover:bg-secondary/30 text-secondary border-secondary/50"
                onClick={onCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="animate-pulse">↩</span>
                <span className="ml-2">SKIP_CHAIN_EFFECT</span>
              </motion.button>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChainEffectUI;

// Import separately to avoid circular dependency
import InfrastructureCardDisplay from './InfrastructureCardDisplay';
