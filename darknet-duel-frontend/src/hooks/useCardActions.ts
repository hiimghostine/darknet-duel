import { useState, useCallback } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { ExtendedCard } from '../components/game/board-components/types';
import { isAttackerCard } from '../types/card.types';
import { logMoveAttempt, debugWildcardTargeting, debugVectorCompatibility } from '../utils/gameDebugUtils';
import type { InfrastructureCard, AttackVector } from '../types/game.types';
import { getAvailableCardTypes } from '../utils/wildcardTypeUtils';

/**
 * Hook for card action management in the game
 * Handles playing cards, cycling cards, targeting, and card throws
 */
export function useCardActions(props: BoardProps) {
  const { G, moves, isActive } = props;
  
  // Card selection and targeting states
  const [selectedCard, setSelectedCard] = useState<ExtendedCard | null>(null);
  const [targetMode, setTargetMode] = useState<boolean>(false);
  const [animatingThrow, setAnimatingThrow] = useState<boolean>(false);
  const [targetedInfraId, setTargetedInfraId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  
  // Track valid targets when in targeting mode
  const [validTargets, setValidTargets] = useState<string[]>([]);
  
  /**
   * Determine if a card requires targeting based on its type and properties
   */
  const cardNeedsTarget = useCallback((card: ExtendedCard): boolean => {
    // REMOVED: The early return that was preventing reaction cards from targeting
    // All reaction cards DO need targeting, regardless of reaction mode
    
    // Special handling for Memory Corruption Attack and other hand-targeting cards
    if (card.id.startsWith('A307') || (card as any).target === 'opponent_hand') {
      console.log('🎯 Hand-targeting card detected, no infrastructure target needed:', card.name);
      return false; // These cards don't need infrastructure targeting
    }
    
    // Special handling for Emergency Response Team (D303) and other all-infrastructure cards
    if (card.id === 'D303' || card.id.startsWith('D303') || (card as any).target === 'all_infrastructure') {
      console.log('🚨 All-infrastructure targeting card detected, no specific target needed:', card.name);
      return false; // These cards don't need specific infrastructure targeting
    }
    
    // Check if the card inherently requires targeting
    if (card.requiresTarget) return true;
    
    // Handle wildcard cards specially
    if (card.type === 'wildcard' && card.wildcardType) {
      console.log('Checking if wildcard needs target:', card.name, card.wildcardType);
      // Get available types for this wildcard
      const availableTypes = getAvailableCardTypes(card.wildcardType);
      console.log('Wildcard available types:', availableTypes);
      
      // Check if any available type requires targeting
      return availableTypes.some(type =>
        type === 'attack' || type === 'exploit' || type === 'counter-attack' ||
        type === 'shield' || type === 'fortify' || type === 'response' ||
        type === 'reaction' || type === 'counter' || type === 'special'
      );
    }
    
    // Check based on card type
    if (isAttackerCard(card.type)) {
      // Attack, exploit, and counter-attack cards need targets
      if (card.type === 'attack' || card.type === 'exploit' || card.type === 'counter-attack' || card.type === 'counter') {
        return true;
      }
    } else {
      // Check defender cards that need targeting
      if (card.type === 'shield' || card.type === 'fortify' || card.type === 'response' || card.type === 'reaction') {
        return true; // All defender cards require targeting
      }
    }
    
    // Return false for cards that don't need targeting
    return false;
  }, [props.ctx?.activePlayers, props.playerID]);
  
  /**
   * Helper function to get attack vector from card (matches backend logic)
   */
  const getCardAttackVector = useCallback((card: ExtendedCard): AttackVector | undefined => {
    // Priority 1: Explicit attack vector
    if (card.attackVector) {
      return card.attackVector as AttackVector;
    }
    
    // Priority 2: Metadata category
    if (card.metadata && card.metadata.category && card.metadata.category !== 'any') {
      return card.metadata.category as AttackVector;
    }
    
    // Priority 3: Card category property (from JSON data)
    const cardWithCategory = card as any;
    if (cardWithCategory.category && cardWithCategory.category !== 'any') {
      return cardWithCategory.category as AttackVector;
    }
    
    return undefined;
  }, []);

  /**
   * Helper function to check if attack vector matches infrastructure vulnerabilities
   */
  const checkVectorCompatibility = useCallback((attackVector: AttackVector | undefined, infrastructure: InfrastructureCard): boolean => {
    if (!attackVector) {
      return true; // No vector specified, allow it (for wildcards that haven't chosen type yet)
    }
    
    // Check if infrastructure has vulnerableVectors (for targeting)
    if (infrastructure.vulnerableVectors && infrastructure.vulnerableVectors.length > 0) {
      return infrastructure.vulnerableVectors.includes(attackVector);
    }
    
    return true; // If no vulnerableVectors specified, allow it
  }, []);

  /**
   * Determine valid targets for a card with vector validation
   */
  const getValidTargets = useCallback((card: ExtendedCard): string[] => {
    if (!card) return [];
    
    // If card has predefined valid targets, use those
    if (card.validTargets && card.validTargets.length > 0) {
      return card.validTargets;
    }
    
    // Get the card's attack vector
    const cardAttackVector = getCardAttackVector(card);
    console.log(`🔍 Card ${card.name} has attack vector: ${cardAttackVector || 'NONE'}`);
    
    // Handle wildcard cards differently
    let effectiveCardType = card.type;
    if (card.type === 'wildcard' && card.wildcardType) {
      console.log('Getting targets for wildcard:', card.name, card.wildcardType);
      
      // Debug wildcard targeting
      debugWildcardTargeting(card, G);
      
      // Get the potential types this wildcard can be played as
      const availableTypes = getAvailableCardTypes(card.wildcardType);
      
      // For wildcards, we'll find the first type that has valid targets
      // Priority order: exploit, attack, shield, fortify, response, reaction, special
      // NOTE: exploit comes before attack because exploit can target 'secure' infrastructure
      // while attack can only target 'vulnerable' infrastructure (which may not exist initially)
      // NOTE: special comes last because it's less common and should be used only when needed
      
      console.log('Available infrastructure states:', G.infrastructure?.map((i: InfrastructureCard) => `${i.name}: ${i.state}`));
      
      // Try each type in priority order and pick the first one that has valid targets
      const typeToTry = ['exploit', 'attack', 'shield', 'fortify', 'response', 'reaction', 'special'];
      
      for (const type of typeToTry) {
        if (availableTypes.includes(type as any)) {
          // Test if this type would have valid targets by checking infrastructure states
          let potentialTargets: string[] = [];
          
          if (G.infrastructure) {
            switch (type) {
              case 'special':
                // Special cards can target compromised infrastructure, fallback to all
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => infra.state === 'compromised')
                  .map((infra: InfrastructureCard) => infra.id);
                if (potentialTargets.length === 0) {
                  potentialTargets = G.infrastructure.map((infra: InfrastructureCard) => infra.id);
                }
                break;
              case 'exploit':
                // Exploit cards can target secure, fortified, or fortified_weaken infrastructure + vector compatibility
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'secure' || infra.state === 'fortified' || infra.state === 'fortified_weaken';
                    const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'attack':
                // Attack cards can only target vulnerable infrastructure + vector compatibility
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'vulnerable';
                    const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'shield':
                // Shield cards can target secure or vulnerable infrastructure + vector compatibility
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'secure' || infra.state === 'vulnerable';
                    const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'fortify':
                // Fortify cards can only target shielded infrastructure + vector compatibility
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'shielded';
                    const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'response':
                // Response cards can only target compromised infrastructure + vector compatibility
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'compromised';
                    const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'reaction':
                // Reaction cards can target vulnerable or compromised infrastructure + vector compatibility
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'vulnerable' || infra.state === 'compromised';
                    const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'counter-attack':
              case 'counter':
                // Counter-attack cards can target shielded infrastructure + vector compatibility
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'shielded';
                    const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              default:
                potentialTargets = G.infrastructure.map((infra: InfrastructureCard) => infra.id);
            }
          }
          
          console.log(`Testing ${type} type: ${potentialTargets.length} potential targets`);
          
          if (potentialTargets.length > 0) {
            effectiveCardType = type as any;
            console.log(`Selected ${type} as effective card type (${potentialTargets.length} targets available)`);
            break;
          }
        }
      }
      
      console.log('Using effective card type for targeting:', effectiveCardType);
    }
    
    // Otherwise determine targets based on card type
    let targets: string[] = [];
    
    if (G.infrastructure) {
      // Apply state-based filtering first, then vector compatibility
      if (effectiveCardType === 'special') {
        // For special effect cards (like lateral movement), prioritize compromised infrastructure
        const compromisedTargets = G.infrastructure
          .filter((infra: InfrastructureCard) => infra.state === 'compromised')
          .map((infra: InfrastructureCard) => infra.id);
          
        // If there are compromised targets, only use those (for lateral movement)
        if (compromisedTargets.length > 0) {
          targets = compromisedTargets;
        } else {
          // Fall back to other infrastructure as targets
          targets = G.infrastructure.map((infra: InfrastructureCard) => infra.id);
        }
      }
      // For attack cards, only vulnerable infrastructure + vector compatibility
      else if ((isAttackerCard(effectiveCardType) && effectiveCardType === 'attack') ||
          (card.type === 'wildcard' && card.wildcardType === 'attack')) {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'vulnerable';
            const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For exploit cards, target secure/fortified infrastructure + vector compatibility
      else if ((isAttackerCard(effectiveCardType) && effectiveCardType === 'exploit') ||
               (card.type === 'wildcard' && card.wildcardType === 'exploit')) {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'secure' || infra.state === 'fortified' || infra.state === 'fortified_weaken';
            const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For shield cards, target secure/vulnerable infrastructure + vector compatibility
      else if (effectiveCardType === 'shield') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'secure' || infra.state === 'vulnerable';
            const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For fortify cards, target shielded infrastructure + vector compatibility
      else if (effectiveCardType === 'fortify') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'shielded';
            const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For response cards, target compromised infrastructure + vector compatibility
      else if (effectiveCardType === 'response') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'compromised';
            const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For reaction cards, target vulnerable/compromised infrastructure + vector compatibility
      else if (effectiveCardType === 'reaction') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'vulnerable' || infra.state === 'compromised';
            const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For counter-attack cards, target shielded infrastructure + vector compatibility
      else if (effectiveCardType === 'counter-attack' || effectiveCardType === 'counter') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'shielded';
            const vectorMatch = !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For all other card types, provide all infrastructure as targets
      else {
        targets = G.infrastructure
          .map((infra: InfrastructureCard) => infra.id);
      }
      
      // Debug logging
      const totalInfra = G.infrastructure.length;
      const stateFiltered = G.infrastructure.filter((infra: InfrastructureCard) => {
        switch (effectiveCardType) {
          case 'attack': return infra.state === 'vulnerable';
          case 'exploit': return infra.state === 'secure' || infra.state === 'fortified' || infra.state === 'fortified_weaken';
          case 'shield': return infra.state === 'secure' || infra.state === 'vulnerable';
          case 'fortify': return infra.state === 'shielded';
          case 'response': return infra.state === 'compromised';
          case 'reaction': return infra.state === 'vulnerable' || infra.state === 'compromised';
          case 'counter-attack':
          case 'counter': return infra.state === 'shielded';
          default: return true;
        }
      }).length;
      
      console.log(`🎯 Card targeting: ${card.name} (${effectiveCardType}${cardAttackVector ? `, ${cardAttackVector}` : ', no vector'})`);
      console.log(`🎯 Infrastructure: Total: ${totalInfra}, State-compatible: ${stateFiltered}, Vector-compatible: ${targets.length}`);
      
      if (stateFiltered > targets.length && cardAttackVector) {
        console.log(`⚠️ Vector validation filtered out ${stateFiltered - targets.length} target(s) that were state-compatible but vector-incompatible`);
      }
    } else {
      console.warn("No infrastructure found in game state", G);
    }
    
    return targets;
  }, [G.infrastructure, getCardAttackVector, checkVectorCompatibility]); // Updated dependencies

  /**
   * Play a card - handles both direct play and targeted play
   */
  const playCard = (card: ExtendedCard, event?: React.MouseEvent) => {
    if (!card || !isActive) return;
    if (event) event.stopPropagation();
    if (targetMode) return;
    
    // Special handling for Memory Corruption Attack - use throwCard with dummy target
    if (card.id.startsWith('A307') || (card as any).target === 'opponent_hand') {
      console.log("🔥 Playing Memory Corruption Attack directly");
      // Use throwCard with a dummy target since validation will skip infrastructure checks
      moves.throwCard(card.id, 'dummy_target');
      return;
    }
    
    // Special handling for Emergency Response Team (D303) - use throwCard with dummy target
    if (card.id === 'D303' || card.id.startsWith('D303') || (card as any).target === 'all_infrastructure') {
      console.log("🚨 Playing Emergency Response Team directly");
      // Use throwCard with a dummy target since validation will skip infrastructure checks
      moves.throwCard(card.id, 'dummy_target');
      return;
    }
    
    // Check if the card requires targeting
    if (cardNeedsTarget(card)) {
      console.log("Card requires targeting:", card.name);
      const targets = getValidTargets(card);
      
      if (targets.length > 0) {
        setSelectedCard(card);
        setTargetMode(true);
        setValidTargets(targets);
        return;
      } else {
        console.log("Card requires targeting but no valid targets available");
        return;
      }
    }
    
    // Direct play for cards that don't need targeting
    console.log("Playing card:", card.name);
    moves.playCard(card.id);
  };

  /**
   * Cycle a card in the player's hand
   */
  const cycleCard = useCallback((cardId: string) => {
    if (!isActive) return;
    if (targetMode) return;
    
    logMoveAttempt('cycleCard', cardId);
    setProcessing(true);
    
    // Try to execute the move after a short delay to allow for UI update
    setTimeout(() => {
      if (moves && typeof moves.cycleCard === 'function') {
        moves.cycleCard(cardId);
      } else {
        console.error('cycleCard function not available');
      }
      
      // Reset processing state after a short delay
      setTimeout(() => setProcessing(false), 300);
    }, 50);
  }, [moves, isActive, targetMode]);

  /**
   * Throw a card for attack or exploit
   */
  const throwCard = (card: ExtendedCard) => {
    if (!card || !isActive) return;
    if (targetMode) return;
    
    // Check if this card needs targeting - handles both regular and wildcard cards
    if (cardNeedsTarget(card)) {
      console.log(`Throwing card:`, card.name, card.type, card.wildcardType);
      const targets = getValidTargets(card);
      
      if (targets.length > 0) {
        setSelectedCard(card);
        setTargetMode(true);
        setValidTargets(targets);
      } else {
        console.log(`No valid targets found for ${card.name} card`);
      }
    }
  };

  /**
   * Target an infrastructure card
   */
  const targetInfrastructure = (infraId: string, event?: React.MouseEvent) => {
    if (!selectedCard || !targetMode) return;
    if (event) event.stopPropagation();
    
    // Check if this is a valid target
    if (!validTargets.includes(infraId)) {
      console.log("Invalid target:", infraId);
      return;
    }
    
    setTargetedInfraId(infraId);
    console.log("Targeting infra:", infraId, "with card:", selectedCard.name);
    
    // Use a short timeout to allow animation to play
    setAnimatingThrow(true);
    setTimeout(() => {
      // Use throwCard for targeted card plays instead of playCard
      // throwCard properly handles both the card and infrastructure target
      console.log(`DEBUG: Calling moves.throwCard with cardId: ${selectedCard.id}, infraId: ${infraId}`);
      moves.throwCard(selectedCard.id, infraId);
      resetTargeting();
    }, 300);
  };

  /**
   * Reset targeting mode
   */
  const cancelTargeting = () => {
    resetTargeting();
  };

  /**
   * Reset all targeting state
   */
  const resetTargeting = () => {
    setTargetMode(false);
    setSelectedCard(null);
    setTargetedInfraId(null);
    setAnimatingThrow(false);
    setValidTargets([]);
  };

  // Alias for backwards compatibility
  const selectCardToThrow = throwCard;
  const handleInfrastructureTarget = targetInfrastructure;
  const cancelThrow = cancelTargeting;

  return {
    // States
    selectedCard,
    targetMode,
    targetedInfraId,
    processing,
    validTargets,
    animatingThrow,
    
    // Actions
    playCard,
    cycleCard,
    throwCard,
    targetInfrastructure,
    cancelTargeting,
    
    // Legacy action names (for backwards compatibility)
    selectCardToThrow,
    handleInfrastructureTarget,
    cancelThrow,
    
    // State setters
    setProcessing,
    resetTargeting
  };
}

export default useCardActions;
