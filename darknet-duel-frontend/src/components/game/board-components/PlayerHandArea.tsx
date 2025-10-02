import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, Shield, Castle, Zap, Lock, Unlock, RefreshCw,
  User, Sparkles, X, Target as TargetIcon, AlertCircle
} from 'lucide-react';

// Import types
import type { GameComponentProps } from './types';
import { isReactiveCardObject } from '../../../types/card.types';

// Import hooks
import { useAudioManager } from '../../../hooks/useAudioManager';
import { useResponsiveGameScaling } from '../../../hooks/useResponsiveGameScaling';

// Define props interface extending GameComponentProps
export interface PlayerHandAreaProps extends GameComponentProps {
  // Player state
  currentPlayerObj: any;
  
  // Card action state
  selectedCard: any;
  targetMode: boolean;
  
  // Transition state for smooth rendering
  isTransitioning?: boolean;
  
  // Action handlers
  playCard: (card: any, event: React.MouseEvent) => void;
  cycleCard: (cardId: string) => void;
  selectCardToThrow: (card: any) => void;
  cancelTargeting: () => void;
}

const PlayerHandArea: React.FC<PlayerHandAreaProps> = ({
  G,
  ctx,
  playerID,
  isActive,
  isAttacker,
  currentPlayerObj,
  selectedCard,
  targetMode,
  isTransitioning = false,
  playCard,
  cycleCard,
  selectCardToThrow,
  cancelTargeting
}) => {
  // Audio manager for sound effects
  const { triggerClick } = useAudioManager();
  
  // Get responsive scaling configuration
  const scaling = useResponsiveGameScaling();

  // Helper function to get card type icon component
  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case 'attack':
        return <Sword className="w-4 h-4" />;
      case 'exploit':
        return <Unlock className="w-4 h-4" />;
      case 'counter-attack':
      case 'counter':
        return <Shield className="w-4 h-4" />;
      case 'reaction':
        return <Zap className="w-4 h-4" />;
      case 'shield':
        return <Lock className="w-4 h-4" />;
      case 'fortify':
        return <Castle className="w-4 h-4" />;
      case 'response':
        return <AlertCircle className="w-4 h-4" />;
      case 'wildcard':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <TargetIcon className="w-4 h-4" />;
    }
  };

  // Helper function to get player card classes
  const getPlayerCardClasses = (cardType: string, isAttacker: boolean) => {
    const baseClasses = isAttacker 
      ? 'bg-red-900/30 border-red-600 text-base-content' 
      : 'bg-blue-900/30 border-blue-600 text-base-content';
    
    switch (cardType) {
      case 'attack':
        return `${baseClasses} shadow-red-500/40`;
      case 'exploit':
        return `${baseClasses} shadow-orange-500/40`;
      case 'counter-attack':
      case 'counter':
        return `${baseClasses} shadow-purple-500/40`;
      case 'reaction':
        return `${baseClasses} shadow-cyan-500/40`;
      case 'shield':
      case 'fortify':
        return `${baseClasses} shadow-blue-500/40`;
      case 'wildcard':
        return 'bg-purple-900/30 border-purple-600 text-base-content shadow-purple-500/40';
      default:
        return baseClasses;
    }
  };

  // Helper function to sort and group cards by vector (category) first, then by type
  const sortAndGroupCards = (hand: any[]) => {
    if (!hand || hand.length === 0) return [];

    // Define the order for attacker cards
    const attackerTypeOrder = ['exploit', 'attack', 'counter-attack', 'counter', 'wildcard'];
    // Define the order for defender cards
    const defenderTypeOrder = ['shield', 'fortify', 'response', 'reaction', 'wildcard'];
    
    // Define category/vector order (network, web, social, malware, physical, any)
    const categoryOrder = ['network', 'web', 'social', 'physical', 'malware', 'any'];
    
    const typeOrder = isAttacker ? attackerTypeOrder : defenderTypeOrder;
    
    // Group cards by category/vector first
    const groupedByCategory = hand.reduce((groups: any, card: any) => {
      const category = card.metadata?.category || card.category || 'any';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(card);
      return groups;
    }, {});
    
    // Within each category, sort by type order, then by name
    Object.keys(groupedByCategory).forEach(category => {
      groupedByCategory[category].sort((a: any, b: any) => {
        const aType = a.type || a.cardType;
        const bType = b.type || b.cardType;
        
        // First sort by type order
        const aTypeIndex = typeOrder.indexOf(aType);
        const bTypeIndex = typeOrder.indexOf(bType);
        
        // If both types are in the order, sort by index
        if (aTypeIndex !== -1 && bTypeIndex !== -1) {
          if (aTypeIndex !== bTypeIndex) {
            return aTypeIndex - bTypeIndex;
          }
        } else if (aTypeIndex !== -1) {
          return -1; // a comes first
        } else if (bTypeIndex !== -1) {
          return 1; // b comes first
        }
        
        // Then sort by name
        return (a.name || '').localeCompare(b.name || '');
      });
    });
    
    // Flatten back to array in category order
    const sortedCards: any[] = [];
    categoryOrder.forEach(category => {
      if (groupedByCategory[category]) {
        sortedCards.push(...groupedByCategory[category]);
      }
    });
    
    // Add any remaining categories not in the predefined order
    Object.keys(groupedByCategory).forEach(category => {
      if (!categoryOrder.includes(category)) {
        sortedCards.push(...groupedByCategory[category]);
      }
    });
    
    return sortedCards;
  };

  // Render player hand (face-up cards)
  const renderPlayerHand = () => {
    const hand = currentPlayerObj?.hand || [];
    const sortedHand = sortAndGroupCards(hand);
    
    return (
      <div 
        className="flex flex-wrap justify-center max-w-5xl overflow-visible"
        style={{ gap: `${scaling.cardGap}px` }}
      >
        <AnimatePresence mode="popLayout">
          {sortedHand.map((card: any) => {
          const isSelected = selectedCard === card.id;
          const cardType = card.type || card.cardType;
          const currentStage = ctx.activePlayers && playerID ? ctx.activePlayers[playerID] : null;
          const isInReactionMode = currentStage === 'reaction';
          const isInActionMode = currentStage === 'action';
          
          // Proper reaction mode filtering - only reactive cards can be played
          let isPlayable = false;
          
          // Debug logging for defender tutorial
          if (card.name === 'Firewall') {
            console.log('🎯 TUTORIAL: Firewall playability check:', {
              cardName: card.name,
              targetMode,
              isActive,
              ctxPhase: ctx.phase,
              currentStage,
              isInActionMode,
              isInReactionMode,
              cardPlayable: card.playable,
              playerID,
              currentPlayer: ctx.currentPlayer
            });
            
            // TEMPORARY FIX: Force defender cards to be playable in tutorial during specific steps
            const currentTutorialStep = document.querySelector('[data-tutorial-step]')?.getAttribute('data-tutorial-step');
            const isDefenderTutorialStep = ['shield_card', 'fortify_card', 'response_card'].includes(currentTutorialStep || '');
            
            if (!card.playable && currentStage === 'action' && isActive && isDefenderTutorialStep) {
              console.log(`🎯 TUTORIAL: Forcing ${card.name} to be playable for ${currentTutorialStep} step`);
              card.playable = true;
            }
          }
          
          if (!targetMode && isActive && ctx.phase === 'playing') {
            // Special handling for D307 - can be played in both normal and reaction modes
            const isD307 = card.id?.startsWith('D307') || card.specialEffect === 'emergency_restore_shield';
            
            if (isInReactionMode) {
              // In reaction mode, only reactive cards can be played
              const isReactiveCard = isReactiveCardObject(card, G);
              console.log('🎯 TUTORIAL: Reaction mode card check:', { 
                cardName: card.name, 
                cardType: card.type, 
                isReactive: card.isReactive, 
                isReactiveCard, 
                cardPlayable: card.playable,
                isInReactionMode 
              });
              if (isReactiveCard && card.playable) {
                if (isD307) {
                  // D307 special condition: only playable if there's compromised infrastructure
                  const hasCompromisedInfra = G.infrastructure?.some(infra => infra.state === 'compromised') || false;
                  isPlayable = hasCompromisedInfra;
                } else {
                  isPlayable = true;
                }
              }
            } else if (isInActionMode) {
              // In action mode, all playable cards can be played
              if (isD307) {
                // D307 special condition: only playable if there's compromised infrastructure
                const hasCompromisedInfra = G.infrastructure?.some(infra => infra.state === 'compromised') || false;
                isPlayable = card.playable && hasCompromisedInfra;
              } else {
                isPlayable = card.playable;
              }
            }
          }
          
          // Card type border colors
          const borderColorClass = cardType === 'attacker' ? 'border-l-error' :
                                 cardType === 'defender' ? 'border-l-primary' :
                                 cardType === 'wildcard' ? 'border-l-warning' :
                                 cardType === 'reaction' ? 'border-l-accent' :
                                 cardType === 'counter-attack' ? 'border-l-accent' :
                                 'border-l-accent';
          
          // Special styling for reactive cards in reaction mode
          const isReactiveCard = isReactiveCardObject(card, G);
          const reactionModeClass = isInReactionMode && isReactiveCard ?
            'ring-2 ring-accent animate-pulse bg-accent/10' : '';
          
          return (
            <motion.div
              key={card.id}
              data-card-id={card.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{
                width: `${scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl' ? scaling.cardWidthLg : scaling.cardWidth}px`,
                height: `${scaling.breakpoint === 'lg' || scaling.breakpoint === 'xl' || scaling.breakpoint === '2xl' ? scaling.cardHeightLg : scaling.cardHeight}px`,
                padding: `${scaling.containerPadding}px`
              }}
              className={`
                group relative border-2 rounded-xl
                flex flex-col justify-center items-center transition-all duration-500 cursor-pointer
                font-mono text-xs
                ${getPlayerCardClasses(cardType, isAttacker)}
                ${borderColorClass} border-l-4
                ${reactionModeClass}
                ${isSelected ? 'border-warning shadow-lg shadow-warning/50 -translate-y-2 scale-105 z-30' : ''}
                ${isPlayable ? 'border-success shadow-md shadow-success/30 hover:scale-110 hover:z-[90] hover:shadow-2xl transform-gpu' : 'hover:scale-110 hover:z-[90] hover:shadow-2xl transform-gpu'}
                ${!isPlayable && !targetMode ? 'cursor-not-allowed' : ''}
              `}
              onClick={(event) => {
                if (!isPlayable) {
                  console.log('🚫 Card not playable:', {
                    cardName: card.name,
                    isInReactionMode,
                    isReactive: isReactiveCardObject(card, G),
                    playable: card.playable
                  });
                  return;
                }
                
                // Check if this card needs targeting (let useCardActions decide)
                // This includes: attack, exploit, reaction, counter-attack, shield, fortify, response
                const needsTargeting = cardType === 'attack' || cardType === 'exploit' || 
                                     cardType === 'reaction' || cardType === 'counter-attack' || 
                                     cardType === 'counter' || cardType === 'shield' || 
                                     cardType === 'fortify' || cardType === 'response';
                
                if (needsTargeting) {
                  console.log('🎯 Selecting card for targeting:', card.name, 'type:', cardType);
                  selectCardToThrow(card);
                } else {
                  console.log('🃏 Playing card directly:', card.name, 'type:', cardType);
                  playCard(card, event);
                }
              }}
            >
              {/* Compact Card View */}
              <div className={`group-hover:opacity-0 transition-opacity duration-300 flex flex-col justify-between h-full text-center p-1 ${!isPlayable && !targetMode ? 'opacity-60' : ''}`}>
                {/* Top section - Cost and Type Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className="lg:w-6 lg:h-6 w-5 h-5 bg-amber-600 text-amber-100 rounded-full flex items-center justify-center lg:text-xs text-[9px] font-bold">
                    {card.cost}
                  </div>
                  <div className={`
                    lg:w-8 lg:h-8 w-7 h-7 rounded-lg flex items-center justify-center
                    ${isPlayable 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-base-300/50 text-base-content/50 border border-base-content/20'
                    }
                  `}>
                    {getCardTypeIcon(cardType)}
                  </div>
                </div>
                
                {/* Middle section - Card name */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="font-bold lg:text-[11px] text-[9px] leading-tight px-1 text-center break-words hyphens-auto">
                    {card.name}
                  </div>
                </div>
                
                {/* Bottom section - Type and Category */}
                <div className="space-y-1">
                  <div className="lg:text-xs text-[10px] font-semibold uppercase text-base-content/70">
                    {cardType}
                  </div>
                  {card.metadata?.category && (
                    <div className={`
                      inline-block lg:text-[10px] text-[9px] rounded-full px-2 py-1 font-bold uppercase tracking-wide
                      ${card.metadata.category === 'network' ? 'bg-blue-500 text-blue-100' :
                        card.metadata.category === 'web' ? 'bg-green-500 text-green-100' :
                        card.metadata.category === 'social' ? 'bg-purple-500 text-purple-100' :
                        card.metadata.category === 'physical' ? 'bg-orange-500 text-orange-100' :
                        card.metadata.category === 'malware' ? 'bg-red-500 text-red-100' :
                        'bg-gray-500 text-gray-100'}
                    `}>
                      {card.metadata.category}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Card View (on hover) - Card-like proportions - Always fully visible regardless of playable state */}
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:!opacity-100 transition-all duration-300 bg-base-200/95 backdrop-blur-sm rounded-xl border-2 border-base-content/20 z-[100] transform scale-125 origin-bottom shadow-2xl p-3 flex flex-col pointer-events-none"
                style={{
                  width: `${scaling.expandedCardWidth}px`,
                  height: `${scaling.expandedCardHeight}px`
                }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-amber-600 text-amber-100 rounded-full flex items-center justify-center text-xs font-bold">
                      {card.cost}
                    </div>
                  </div>
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isPlayable 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-base-300/50 text-base-content/50 border border-base-content/20'
                    }
                  `}>
                    {getCardTypeIcon(cardType)}
                  </div>
                </div>

                {/* Card Name and Type */}
                <div className="text-center mb-2 border-b border-current/30 pb-2">
                  <div className="font-bold text-sm text-base-content leading-tight mb-1">
                    {card.name}
                  </div>
                  <div className="text-xs opacity-70 uppercase text-base-content/70 font-semibold">
                    {cardType}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 justify-center">
                    {card.metadata?.category && (
                      <span className={`
                        inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-base-content
                        ${card.metadata.category === 'network' ? 'bg-blue-600' :
                          card.metadata.category === 'web' ? 'bg-green-600' :
                          card.metadata.category === 'social' ? 'bg-purple-600' :
                          card.metadata.category === 'physical' ? 'bg-orange-600' :
                          card.metadata.category === 'malware' ? 'bg-red-600' :
                          'bg-gray-600'}
                      `}>
                        {card.metadata.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Description */}
                <div className="flex-1 mb-2">
                  <div className="text-xs text-base-content/70 leading-tight mb-2">
                    {card.description}
                  </div>
                  
                  {/* Effects */}
                  {(card as any).effects && (card as any).effects.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-info mb-1 uppercase">Effects:</div>
                      {(card as any).effects.map((effect: any, idx: number) => (
                        <div key={idx} className="text-[10px] text-info bg-info/10 rounded px-1.5 py-0.5 mb-1">
                          <span className="font-semibold">{effect.type}:</span> {effect.description}
                          {effect.value && <span className="ml-1 text-info font-bold">({effect.value})</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flavor Text */}
                  {card.metadata?.flavor && (
                    <div className="border-t border-current/20 pt-1.5">
                      <div className="text-[10px] italic text-warning leading-tight">
                        "{card.metadata.flavor}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer - Special Properties */}
                <div className="space-y-1">
                  {(card as any).isReactive && (
                    <div className="text-center text-[10px] font-bold bg-info text-base-content py-0.5 px-1.5 rounded">
                      REACTIVE
                    </div>
                  )}
                  
                  {(card as any).preventReaction && (
                    <div className="text-center text-[10px] font-bold bg-error text-base-content py-0.5 px-1.5 rounded">
                      NO REACTIONS
                    </div>
                  )}
                </div>
              </div>

              {/* Special indicators */}
              {isReactiveCard && (
                <div className="absolute top-1 left-1 bg-info/90 text-base-content rounded px-1 text-[6px] font-bold z-60">
                  REACTIVE
                </div>
              )}
              
              {isInReactionMode && isReactiveCard && (
                <div className="absolute -top-1 -right-1 bg-info text-base-content rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold animate-pulse z-60">
                  ⚡
                </div>
              )}
              
              {/* Enhanced Per-card cycle button with animations */}
              {!targetMode && !isInReactionMode && isActive && (
                <CycleCardButton
                  cardId={card.id}
                  cardName={card.name}
                  onCycle={cycleCard}
                />
              )}
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div 
      className={`
        flex justify-between items-center gap-4 rounded-lg relative border backdrop-blur-md shadow-lg overflow-visible
        ${isAttacker 
          ? 'bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-500/30' 
          : 'bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-500/30'
        }
        ${isActive ? 'ring-2 ring-current/50 shadow-xl shadow-current/20' : ''}
        ${isTransitioning ? 'transition-opacity duration-300 opacity-90' : ''}
      `}
      style={{
        height: scaling.playerHandHeight,
        padding: `${scaling.containerPadding}px`
      }}
    >
      {/* Player info */}
      <div className="flex items-center gap-3">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${isAttacker 
            ? 'bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/30' 
            : 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30'
          }
        `}>
          {isAttacker ? <Sword className="w-6 h-6 text-red-300" /> : <Shield className="w-6 h-6 text-blue-300" />}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-base-content/60" />
            <span className="font-bold text-sm font-mono uppercase tracking-wide">
              {currentPlayerObj?.username || playerID}
            </span>
          </div>
          <div className="text-xs text-base-content/60">
            {isAttacker ? 'ATTACKER' : 'DEFENDER'}
          </div>
        </div>
      </div>
      
      {/* Hand display - centered with overflow visible for card hover */}
      <div 
        className="flex-1 flex justify-center overflow-visible"
        style={{ 
          paddingTop: `${scaling.containerPadding}px`,
          paddingBottom: `${scaling.containerPadding * 1.5}px`
        }}
      >
        {renderPlayerHand()}
      </div>
      
      {/* Hand count and actions */}
      <div className="flex items-center gap-2">
        {targetMode && (
          <button 
            className="btn btn-sm gap-2 bg-warning/20 border-warning/50 text-warning hover:bg-warning/30 font-mono font-bold uppercase hover:scale-105 transition-all"
            onClick={() => {
              triggerClick();
              cancelTargeting();
            }}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">CANCEL</span>
          </button>
        )}
        
        <div className={`
          px-3 py-1.5 rounded-lg font-mono text-xs font-bold border
          ${isAttacker 
            ? 'bg-red-500/10 border-red-500/30 text-red-300' 
            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }
        `}>
          {currentPlayerObj?.hand?.length || 0} CARDS
        </div>
      </div>
    </div>
  );
};

// Enhanced Cycle Card Button Component with animations
interface CycleCardButtonProps {
  cardId: string;
  cardName: string;
  onCycle: (cardId: string) => void;
}

const CycleCardButton: React.FC<CycleCardButtonProps> = ({ cardId, cardName, onCycle }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { triggerClick } = useAudioManager();

  const handleCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isAnimating) return; // Prevent spam clicking
    
    setIsAnimating(true);
    triggerClick();
    console.log('🔄 Cycling card:', cardName);
    
    // Call the cycle function
    onCycle(cardId);
    
    // Reset animation state after a delay
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <AnimatePresence>
      <motion.button
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-amber-300/50 pointer-events-auto hover:shadow-amber-500/50"
        onClick={handleCycle}
        title="Cycle this card (draw new)"
        whileHover={{
          scale: 1.15,
          y: -2,
          boxShadow: "0 4px 20px rgba(251, 191, 36, 0.6)"
        }}
        whileTap={{ scale: 0.9 }}
        animate={isAnimating ? {
          scale: [1, 1.2, 1],
          boxShadow: [
            "0 2px 10px rgba(251, 191, 36, 0.4)",
            "0 4px 25px rgba(251, 191, 36, 0.8)",
            "0 2px 10px rgba(251, 191, 36, 0.4)"
          ]
        } : {
          scale: 1
        }}
        transition={{
          duration: isAnimating ? 0.8 : 0.2,
          ease: "easeInOut"
        }}
        disabled={isAnimating}
        style={{
          cursor: isAnimating ? 'wait' : 'pointer',
          zIndex: 50
        }}
      >
        <motion.div
          animate={isAnimating ? {
            rotate: [0, 360]
          } : {
            rotate: 0
          }}
          transition={{
            duration: isAnimating ? 0.8 : 0,
            ease: "easeInOut"
          }}
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </AnimatePresence>
  );
};

export default React.memo(PlayerHandArea);