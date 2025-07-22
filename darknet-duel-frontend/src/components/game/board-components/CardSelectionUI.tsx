import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from 'shared-types/card.types';
import { isAttackerCard, isDefenderCard } from '../../../types/card.types';

interface PendingCardChoice {
  playerId: string;
  availableCards: Card[];
  choiceType: 'deck_selection' | 'hand_selection' | 'discard_selection';
  sourceCardId: string;
  timestamp: number;
}

interface CardSelectionUIProps {
  pendingChoice: PendingCardChoice;
  onChooseCard: (cardId: string) => void;
  onCancel?: () => void;
}

const CardSelectionUI: React.FC<CardSelectionUIProps> = ({
  pendingChoice,
  onChooseCard,
  onCancel
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ROBUST: Handle card selection with validation and feedback
  const handleCardSelection = useCallback((card: Card) => {
    console.log(`🎯 CARD SELECTION UI DEBUG: Card clicked: ${card.id}`);
    console.log(`🎯 CARD SELECTION UI DEBUG: Card name: ${card.name}`);
    console.log(`🎯 CARD SELECTION UI DEBUG: Current processing state: ${isProcessing}`);
    
    // DEFENSIVE: Prevent double-clicks during processing
    if (isProcessing) {
      console.log(`🎯 CARD SELECTION UI DEBUG: Ignoring click - already processing`);
      return;
    }
    
    // DEFENSIVE: Validate card object
    if (!card || !card.id || typeof card.id !== 'string') {
      console.error(`🎯 CARD SELECTION UI ERROR: Invalid card object:`, card);
      return;
    }
    
    // Set processing state and selected card for visual feedback
    setSelectedCardId(card.id);
    setIsProcessing(true);
    
    console.log(`🎯 CARD SELECTION UI DEBUG: Calling onChooseCard...`);
    
    try {
      onChooseCard(card.id);
      
      // Reset processing state after a short delay to prevent rapid clicking
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error(`🎯 CARD SELECTION UI ERROR: Failed to process card selection:`, error);
      setIsProcessing(false);
      setSelectedCardId(null);
    }
  }, [onChooseCard, isProcessing]);
  
  // DEFENSIVE: Validate pendingChoice structure
  if (!pendingChoice || !pendingChoice.availableCards) {
    console.error('🎯 CARD SELECTION UI ERROR: Invalid pendingChoice structure');
    return (
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="bg-base-800 border border-error p-8 rounded-lg max-w-md">
            <h3 className="text-xl font-mono font-bold text-error mb-4 uppercase">SELECTION_ERROR</h3>
            <p className="text-base-content/70 font-mono mb-6">
              INVALID_CARD_SELECTION_STATE
            </p>
            {onCancel && (
              <motion.button
                className="btn btn-error btn-sm font-mono uppercase"
                onClick={onCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                CLOSE_PROTOCOL
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  const { availableCards, choiceType, sourceCardId } = pendingChoice;
  
  const getCyberpunkTitle = () => {
    switch (choiceType) {
      case 'deck_selection':
        return 'AI_POWERED_ATTACK_PROTOCOL';
      case 'hand_selection':
        return 'HAND_SELECTION_INTERFACE';
      case 'discard_selection':
        return 'DISCARD_RECOVERY_SYSTEM';
      default:
        return 'CARD_SELECTION_TERMINAL';
    }
  };

  const getCyberpunkDescription = () => {
    switch (choiceType) {
      case 'deck_selection':
        return 'SCANNING_TOP_DECK_LAYERS_FOR_OPTIMAL_SELECTION';
      case 'hand_selection':
        return 'ACCESSING_HAND_REPOSITORY_FOR_SELECTION';
      case 'discard_selection':
        return 'RECOVERING_DATA_FROM_DISCARD_ARCHIVES';
      default:
        return 'AWAITING_SELECTION_INPUT';
    }
  };

  const getCardTypeColor = (card: Card) => {
    if (isAttackerCard(card.type)) return 'border-error/50 bg-error/5';
    if (isDefenderCard(card.type)) return 'border-info/50 bg-info/5';
    return 'border-warning/50 bg-warning/5';
  };

  const getCardTypeIcon = (card: Card) => {
    if (isAttackerCard(card.type)) return '⚔️';
    if (isDefenderCard(card.type)) return '🛡️';
    return '🔧';
  };

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
          className="border border-primary/30 bg-base-800/50 backdrop-filter backdrop-blur-sm shadow-lg shadow-primary/10 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden relative"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Cyberpunk corner brackets */}
          <div className="absolute -top-2 -left-2 w-20 h-20 border-t-2 border-l-2 border-primary opacity-60"></div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 border-b-2 border-r-2 border-primary opacity-60"></div>

          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <h2 className="text-2xl font-mono font-bold text-primary uppercase tracking-wider">
                  {getCyberpunkTitle()}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="text-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⚙️
                </motion.div>
                <span className="text-sm font-mono text-primary/70 uppercase">ACTIVE</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-base-content/80 font-mono uppercase tracking-wide">
                {getCyberpunkDescription()}
              </p>
              <div className="flex items-center space-x-4 text-sm font-mono">
                <span className="text-secondary/70">SOURCE_CARD:</span>
                <span className="text-secondary font-bold">{sourceCardId}</span>
                <span className="text-primary/70">CARDS_AVAILABLE:</span>
                <span className="text-primary font-bold">{availableCards.length}</span>
              </div>
              {isProcessing && (
                <motion.div 
                  className="flex items-center space-x-2 text-warning"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    🔄
                  </motion.div>
                  <span className="font-mono uppercase tracking-wide">PROCESSING_SELECTION...</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-6">
            {availableCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCards.map((card) => {
                  // DEFENSIVE: Validate each card
                  if (!card || !card.id) {
                    console.warn(`🎯 CARD SELECTION UI WARNING: Skipping invalid card:`, card);
                    return null;
                  }
                  
                  const isSelected = selectedCardId === card.id;
                  const isClickable = !isProcessing;
                  
                  return (
                    <motion.div
                      key={card.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        getCardTypeColor(card)
                      } ${
                        isSelected ? 'border-success bg-success/20 shadow-lg shadow-success/30' : ''
                      } ${
                        !isClickable ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/70'
                      }`}
                      onClick={() => isClickable && handleCardSelection(card)}
                      whileHover={isClickable ? { scale: 1.02, y: -2 } : undefined}
                      whileTap={isClickable ? { scale: 0.98 } : undefined}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                      {/* Cyberpunk corner brackets */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-primary/50"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-primary/50"></div>
                      
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCardTypeIcon(card)}</span>
                          <span className="text-xs font-mono text-primary/70 uppercase tracking-wider">
                            NODE_{card.id.slice(-4)}
                          </span>
                        </div>
                        {isSelected && (
                          <motion.div
                            className="flex items-center space-x-1 text-success"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15, stiffness: 400 }}
                          >
                            <span className="text-sm font-mono uppercase">SELECTED</span>
                            <span>✓</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Card Name */}
                      <h3 className="text-lg font-mono font-bold text-base-content mb-2 uppercase tracking-wide">
                        {card.name.replace(/\s+/g, '_')}
                      </h3>

                      {/* Card Description */}
                      <p className="text-sm text-base-content/70 font-mono mb-3 leading-relaxed">
                        {card.description}
                      </p>

                      {/* Card Type and Metadata */}
                      <div className="space-y-3">
                        {/* Primary Card Type */}
                        <div className="flex items-center justify-between">
                          <div className="badge badge-primary badge-lg font-mono font-bold uppercase tracking-wider">
                            {card.type.replace(/_/g, '_')}
                          </div>
                          {card.cost !== undefined && (
                            <div className="flex items-center space-x-1 text-sm font-mono">
                              <span className="text-warning/70">COST:</span>
                              <span className="text-warning font-bold">{card.cost}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Secondary Information */}
                        <div className="flex flex-wrap gap-2">
                          {card.metadata?.category && (
                            <div className="badge badge-outline badge-sm font-mono uppercase">
                              CAT: {card.metadata.category}
                            </div>
                          )}
                          
                          {/* Additional card properties */}
                          {card.wildcardType && (
                            <div className="badge badge-secondary badge-sm font-mono uppercase">
                              WC: {card.wildcardType}
                            </div>
                          )}
                          
                          {card.attackVector && (
                            <div className="badge badge-accent badge-sm font-mono uppercase">
                              VEC: {card.attackVector}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection Button */}
                      <motion.div 
                        className={`mt-4 p-2 rounded border text-center font-mono text-sm uppercase tracking-wide ${
                          isSelected 
                            ? 'bg-success/20 border-success text-success' 
                            : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                        }`}
                        whileHover={isClickable ? { backgroundColor: 'rgba(var(--p), 0.2)' } : undefined}
                      >
                        {isSelected ? 'SELECTION_CONFIRMED' : 'INITIATE_SELECTION'}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-mono font-bold text-warning uppercase tracking-wider mb-2">
                  NO_CARDS_AVAILABLE
                </h3>
                <p className="text-base-content/70 font-mono">
                  CARD_REPOSITORY_EMPTY
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-2 h-2 bg-secondary rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-mono text-secondary/70 uppercase tracking-wide">
                  SELECTION_PROTOCOL_ACTIVE
                </span>
              </div>
              
              {onCancel && (
                <motion.button
                  className={`btn btn-outline btn-sm font-mono uppercase tracking-wide ${
                    isProcessing ? 'btn-disabled' : 'btn-error'
                  }`}
                  onClick={onCancel}
                  disabled={isProcessing}
                  whileHover={!isProcessing ? { scale: 1.05 } : undefined}
                  whileTap={!isProcessing ? { scale: 0.95 } : undefined}
                >
                  {isProcessing ? 'PROCESSING...' : 'ABORT_PROTOCOL'}
                </motion.button>
              )}
            </div>
            
            {/* Scanning line animation */}
            <div className="relative mt-2 h-1 bg-primary/10 rounded overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardSelectionUI;