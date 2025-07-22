import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HandDisruptionChoice } from '../../../types/game.types';
import type { Card } from 'shared-types/card.types';
import { isAttackerCard, isDefenderCard } from '../../../types/card.types';

interface HandDisruptionUIProps {
  pendingChoice: HandDisruptionChoice;
  playerId: string;
  onChooseCards: (cardIds: string[]) => void;
}

const HandDisruptionUI: React.FC<HandDisruptionUIProps> = ({
  pendingChoice,
  // playerId is not used in this component as it's primarily for the active player
  onChooseCards
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const maxSelections = pendingChoice.count || 1;
  
  // Check if this is a Honeypot Network tax (self-discard) or opponent discard
  const isHoneypotTax = pendingChoice.pendingCardPlay !== undefined;
  
  const handleCardToggle = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    } else if (selectedCards.length < maxSelections) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Cyberpunk decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-primary/10 font-mono text-xs animate-pulse">
            101010110101
          </div>
          <div className="absolute bottom-20 right-20 text-secondary/10 font-mono text-xs animate-pulse">
            010101001010
          </div>
          <div className="absolute top-1/2 left-4 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
          <div className="absolute top-1/4 right-8 w-px h-24 bg-gradient-to-b from-transparent via-secondary/20 to-transparent"></div>
        </div>

        <motion.div 
          className="relative bg-base-100/95 backdrop-blur-md border border-primary/30 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Cyberpunk corner brackets */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary/60"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary/60"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary/60"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary/60"></div>
          
          {/* Gradient lines */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

          {/* Header */}
          <div className="p-6 border-b border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 border-2 border-t-secondary border-r-secondary/50 border-b-secondary/30 border-l-secondary/10 rounded-full animate-spin"></div>
              <div>
                <h3 className="text-2xl font-bold font-mono text-primary mb-1 glitch-text">
                  {isHoneypotTax ? 'HONEYPOT_NETWORK_TAX' : 'HAND_DISRUPTION_PROTOCOL'}
                </h3>
                <div className="flex items-center gap-2 text-sm font-mono text-primary/70">
                  <span className="animate-pulse">⚡</span>
                  <span>SCANNING_TARGET_HAND...</span>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-base-200/50 border border-warning/30 p-4 font-mono text-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-warning animate-pulse">⚠</span>
                <span className="text-warning font-bold">MISSION_PARAMETERS:</span>
              </div>
              <p className="text-base-content/80">
                {isHoneypotTax
                  ? `HONEYPOT_NETWORK_REQUIRES_DISCARD: ${maxSelections}_CARD${maxSelections > 1 ? 'S' : ''}_BEFORE_EXPLOIT_EXECUTION`
                  : `TARGET_HAND_COMPROMISED: SELECT_${maxSelections}_CARD${maxSelections > 1 ? 'S' : ''}_FOR_ELIMINATION`}
              </p>
            </div>
          </div>

          {/* Cards Section */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-primary font-mono text-sm">
                  AVAILABLE_TARGETS: {pendingChoice.revealedHand.length}_CARDS_DETECTED
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6 max-h-96 overflow-y-auto">
                {pendingChoice.revealedHand.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-base-200/50 border-2 rounded-lg cursor-pointer
                    transition-all duration-200 hover:scale-102 hover:shadow-xl
                    ${selectedCards.includes(card.id) ? 'border-error scale-102 shadow-xl shadow-error/25' : 'border-primary/30 hover:border-primary/50'}
                    backdrop-blur-sm min-h-[280px]
                  `}
                    onClick={() => handleCardToggle(card.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Cyberpunk corner brackets for each card */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-primary/40"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-primary/40"></div>
                    
                    {/* Card content */}
                    <div className="relative p-5">
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="px-3 py-1 bg-primary/20 border border-primary/30 font-mono text-sm font-bold text-primary">
                          CARD_{card.id.slice(-4).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xl">
                            {isAttackerCard(card.type) ? '⚔️' : isDefenderCard(card.type) ? '🛡️' : '🔧'}
                          </div>
                        </div>
                      </div>

                      {/* Card Name */}
                      <h4 className="font-bold font-mono text-base mb-3 line-clamp-2 text-primary">
                        {card.name.toUpperCase().replace(/ /g, '_')}
                      </h4>

                      {/* Card Type and Category Row */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`px-2 py-1 text-xs font-mono border flex items-center gap-1 ${
                          isAttackerCard(card.type) ? 'border-error/50 bg-error/10 text-error' :
                          isDefenderCard(card.type) ? 'border-success/50 bg-success/10 text-success' :
                          'border-info/50 bg-info/10 text-info'
                        }`}>
                          <span className="animate-pulse">
                            {isAttackerCard(card.type) ? '⚡' : isDefenderCard(card.type) ? '✓' : '⚙'}
                          </span>
                          <span>
                            {card.type.toUpperCase().replace('-', '_')}
                          </span>
                        </div>
                        
                        {/* Cost Display */}
                        <div className="px-2 py-1 bg-secondary/20 border border-secondary/30 text-secondary text-xs font-mono">
                          COST: {card.cost || 0}_AP
                        </div>
                      </div>

                      {/* Category Display */}
                      {card.metadata?.category && (
                        <div className="mb-4">
                          <div className="px-3 py-2 bg-warning/10 border border-warning/30 text-warning text-sm font-mono flex items-center gap-2">
                            <span className="animate-pulse">📂</span>
                            <span>CATEGORY: {card.metadata.category.toUpperCase().replace(/ /g, '_')}</span>
                          </div>
                        </div>
                      )}

                      {/* Card Description */}
                      <p className="text-sm text-primary/70 mb-4 line-clamp-4 font-mono leading-relaxed">
                        {card.description?.toUpperCase().replace(/ /g, '_') || 'NO_DESCRIPTION_AVAILABLE'}
                      </p>

                      {/* Card Effects */}
                      {card.effects && card.effects.length > 0 && (
                        <div className="mt-auto">
                          <div className="text-sm text-primary/50 font-mono mb-2">EFFECTS:</div>
                          <div className="flex flex-wrap gap-2">
                            {card.effects.slice(0, 3).map((effect, idx) => (
                              <span key={idx} className="px-2 py-1 bg-secondary/20 border border-secondary/30 text-secondary text-xs font-mono">
                                {effect.type?.toUpperCase() || 'UNKNOWN'}
                              </span>
                            ))}
                            {card.effects.length > 3 && (
                              <span className="px-2 py-1 bg-base-300/20 border border-base-300/30 text-base-content/50 text-xs font-mono">
                                +{card.effects.length - 3}_MORE
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Selection indicator */}
                    {selectedCards.includes(card.id) && (
                      <motion.div 
                        className="absolute top-2 right-2 flex items-center gap-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                      >
                        <div className="w-3 h-3 bg-error rounded-full animate-ping"></div>
                        <div className="text-xs font-mono text-error font-bold">MARKED</div>
                      </motion.div>
                    )}
                    
                    {/* Connection indicator */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedCards.includes(card.id) ? 'bg-error animate-ping' : 'bg-base-content/30'
                      }`}></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Status Display */}
            <div className="bg-base-200/30 border border-info/30 p-4 mb-6">
              <div className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-info animate-pulse">📊</span>
                  <span className="text-info font-bold">SELECTION_STATUS:</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base-content/80">
                    MARKED: {selectedCards.length} / {maxSelections}
                  </span>
                  <div className={`px-2 py-1 text-xs border ${
                    selectedCards.length === maxSelections
                      ? 'border-success/50 bg-success/10 text-success'
                      : 'border-warning/50 bg-warning/10 text-warning'
                  }`}>
                    {selectedCards.length === maxSelections ? 'READY' : 'INCOMPLETE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-primary/20 flex justify-end gap-3 relative">
            {/* Decorative scanning line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent animate-pulse"></div>
            
            <motion.button
              className={`px-6 py-3 font-mono text-sm border transition-all duration-200 ${
                selectedCards.length === maxSelections
                  ? 'bg-error/20 hover:bg-error/30 border-error/50 text-error cursor-pointer'
                  : 'bg-base-200/20 border-base-300/30 text-base-content/30 cursor-not-allowed'
              }`}
              onClick={() => selectedCards.length === maxSelections && onChooseCards(selectedCards)}
              disabled={selectedCards.length !== maxSelections}
              whileHover={selectedCards.length === maxSelections ? { scale: 1.05 } : {}}
              whileTap={selectedCards.length === maxSelections ? { scale: 0.95 } : {}}
            >
              <span className={selectedCards.length === maxSelections ? 'animate-pulse' : ''}>
                {selectedCards.length === maxSelections ? '🗑️' : '🔒'}
              </span>
              <span className="ml-2">
                {selectedCards.length === maxSelections ? 'EXECUTE_DISCARD_PROTOCOL' : 'SELECTION_REQUIRED'}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HandDisruptionUI;
