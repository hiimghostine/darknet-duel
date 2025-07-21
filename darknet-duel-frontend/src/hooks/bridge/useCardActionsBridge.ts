import { useCallback, useMemo } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { ExtendedCard } from '../../components/game/board-components/types';
import { useCardActionsStore, cardActionsSelectors } from '../../store/game/cardActions.store';
import { useGameUIStore, gameUISelectors } from '../../store/game/gameUI.store';
import { useGameBoardStore, gameBoardSelectors } from '../../store/game/gameBoard.store';
import { isAttackerCard } from '../../types/card.types';
import { logMoveAttempt, debugWildcardTargeting, debugVectorCompatibility } from '../../utils/gameDebugUtils';
import type { InfrastructureCard, AttackVector } from '../../types/game.types';
import { getAvailableCardTypes } from '../../utils/wildcardTypeUtils';

/**
 * Bridge hook that provides the same interface as useCardActions 
 * but uses the new Zustand stores under the hood.
 * This allows for gradual migration without breaking existing components.
 */
export function useCardActionsBridge(props: BoardProps & {
  triggerClick?: () => void;
  triggerPositiveClick?: () => void;
  triggerNegativeClick?: () => void;
}) {
  const { G, moves, isActive, triggerClick, triggerPositiveClick, triggerNegativeClick } = props;
  
  // Store state and actions
  const selectedCard = cardActionsSelectors.useSelectedCard();
  const targetMode = cardActionsSelectors.useTargetMode();
  const targetedInfraId = cardActionsSelectors.useTargetedInfraId();
  const validTargets = cardActionsSelectors.useValidTargets();
  const animatingThrow = cardActionsSelectors.useAnimatingThrow();
  const processing = cardActionsSelectors.useProcessing();
  
  // Store actions
  const cardActionsStore = useCardActionsStore();
  const gameUIStore = useGameUIStore();
  const gameBoardStore = useGameBoardStore();

  /**
   * Determine if a card requires targeting based on its type and properties
   * (Preserved from original useCardActions logic)
   */
  const cardNeedsTarget = useCallback((card: ExtendedCard): boolean => {
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
   * (Preserved from original useCardActions logic)
   */
  const getValidTargets = useCallback((card: ExtendedCard): string[] => {
    if (!card) return [];
    
    // If card has predefined valid targets, use those
    if (card.validTargets && card.validTargets.length > 0) {
      return card.validTargets;
    }
    
    // Get the card's attack vector - but skip for pure wildcards
    const cardAttackVector = card.type === 'wildcard' ? undefined : getCardAttackVector(card);
    console.log(`🔍 Card ${card.name} has attack vector: ${cardAttackVector || 'NONE'} ${card.type === 'wildcard' ? '(wildcard - vector validation skipped)' : ''}`);
    
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
                // Exploit cards can target secure, fortified, or fortified_weaken infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'secure' || infra.state === 'fortified' || infra.state === 'fortified_weaken';
                    const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'attack':
                // Attack cards can only target vulnerable infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'vulnerable';
                    const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'shield':
                // Shield cards can ONLY target secure infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'secure';
                    const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'fortify':
                // Fortify cards can only target shielded infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'shielded';
                    const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'response':
                // Response cards can only target compromised infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'compromised';
                    const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'reaction':
                // Reaction cards can target vulnerable or compromised infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'vulnerable' || infra.state === 'compromised';
                    const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                    return stateMatch && vectorMatch;
                  })
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'counter-attack':
              case 'counter':
                // Counter-attack cards can target shielded infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => {
                    const stateMatch = infra.state === 'shielded';
                    const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
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
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
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
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For shield cards, target ONLY secure infrastructure + vector compatibility
      else if (effectiveCardType === 'shield') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'secure';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For fortify cards, target shielded infrastructure + vector compatibility
      else if (effectiveCardType === 'fortify') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'shielded';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For response cards, target compromised infrastructure + vector compatibility
      else if (effectiveCardType === 'response') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'compromised';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For reaction cards, target vulnerable/compromised infrastructure + vector compatibility
      else if (effectiveCardType === 'reaction') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'vulnerable' || infra.state === 'compromised';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For counter-attack cards, target shielded infrastructure + vector compatibility
      else if (effectiveCardType === 'counter-attack' || effectiveCardType === 'counter') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'shielded';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
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
          case 'shield': return infra.state === 'secure';
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
  }, [G.infrastructure, getCardAttackVector, checkVectorCompatibility]);

  /**
   * Play a card - handles both direct play and targeted play
   */
  const playCard = useCallback((card: ExtendedCard, event?: React.MouseEvent) => {
    if (!card || !isActive) return;
    if (event) event.stopPropagation();
    if (triggerClick) triggerClick(); // Play click SFX on any card click
    if (targetMode) return;
    
    // Special handling for Memory Corruption Attack - use throwCard with dummy target
    if (card.id.startsWith('A307') || (card as any).target === 'opponent_hand') {
      console.log("🔥 Playing Memory Corruption Attack directly");
      if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
      moves.throwCard(card.id, 'dummy_target');
      return;
    }
    
    // Special handling for Emergency Response Team (D303) - use throwCard with dummy target
    if (card.id === 'D303' || card.id.startsWith('D303') || (card as any).target === 'all_infrastructure') {
      console.log("🚨 Playing Emergency Response Team directly");
      if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
      moves.throwCard(card.id, 'dummy_target');
      return;
    }
    
    // Check if the card requires targeting
    if (cardNeedsTarget(card)) {
      console.log("Card requires targeting:", card.name);
      const targets = getValidTargets(card);
      
      if (targets.length > 0) {
        // Update stores with targeting information
        cardActionsStore.setSelectedCard(card);
        cardActionsStore.setTargetMode(true, 'play');
        cardActionsStore.setValidTargets(targets);
        gameUIStore.setTargetMode(true);
        gameUIStore.setValidTargets(targets);
        gameBoardStore.setTargetableInfrastructure(targets);
        return;
      } else {
        console.log("Card requires targeting but no valid targets available");
        if (triggerNegativeClick) triggerNegativeClick(); // Play negative SFX on invalid move
        return;
      }
    }
    
    // Direct play for cards that don't need targeting
    console.log("Playing card:", card.name);
    if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
    moves.playCard(card.id);
  }, [isActive, targetMode, triggerClick, triggerPositiveClick, triggerNegativeClick, moves, cardNeedsTarget, getValidTargets, cardActionsStore, gameUIStore, gameBoardStore]);

  /**
   * Cycle a card in the player's hand
   */
  const cycleCard = useCallback((cardId: string) => {
    if (!isActive) return;
    if (targetMode) return;
    
    logMoveAttempt('cycleCard', cardId);
    cardActionsStore.setProcessing(true);
    
    // Try to execute the move after a short delay to allow for UI update
    setTimeout(() => {
      if (moves && typeof moves.cycleCard === 'function') {
        moves.cycleCard(cardId);
      } else {
        console.error('cycleCard function not available');
      }
      
      // Reset processing state after a short delay
      setTimeout(() => cardActionsStore.setProcessing(false), 300);
    }, 50);
  }, [moves, isActive, targetMode, cardActionsStore]);

  /**
   * Throw a card for attack or exploit
   */
  const throwCard = useCallback((card: ExtendedCard) => {
    if (!card || !isActive) return;
    if (triggerClick) triggerClick(); // Play click SFX on any card click
    if (targetMode) return;
    
    // Check if this card needs targeting - handles both regular and wildcard cards
    if (cardNeedsTarget(card)) {
      console.log(`Throwing card:`, card.name, card.type, card.wildcardType);
      const targets = getValidTargets(card);
      
      if (targets.length > 0) {
        // Update stores with targeting information
        cardActionsStore.setSelectedCard(card);
        cardActionsStore.setSelectedForThrow(card);
        cardActionsStore.setTargetMode(true, 'throw');
        cardActionsStore.setValidTargets(targets);
        gameUIStore.setTargetMode(true);
        gameUIStore.setValidTargets(targets);
        gameBoardStore.setTargetableInfrastructure(targets);
      } else {
        console.log(`No valid targets found for ${card.name} card`);
        if (triggerNegativeClick) triggerNegativeClick(); // Play negative SFX on invalid move
      }
    }
  }, [isActive, targetMode, triggerClick, triggerNegativeClick, cardNeedsTarget, getValidTargets, cardActionsStore, gameUIStore, gameBoardStore]);

  /**
   * Target an infrastructure card
   */
  const targetInfrastructure = useCallback((infraId: string, event?: React.MouseEvent) => {
    if (!selectedCard || !targetMode) return;
    if (event) event.stopPropagation();
    
    // Check if this is a valid target
    if (!validTargets.includes(infraId)) {
      console.log("Invalid target:", infraId);
      if (triggerNegativeClick) triggerNegativeClick(); // Play negative SFX on invalid move
      return;
    }
    
    cardActionsStore.setTargetedInfraId(infraId);
    console.log("Targeting infra:", infraId, "with card:", selectedCard.name);
    
    // Use a short timeout to allow animation to play
    cardActionsStore.setAnimatingThrow(true, infraId);
    setTimeout(() => {
      // Use throwCard for targeted card plays instead of playCard
      console.log(`DEBUG: Calling moves.throwCard with cardId: ${selectedCard.id}, infraId: ${infraId}`);
      if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
      moves.throwCard(selectedCard.id, infraId);
      resetTargeting();
    }, 300);
  }, [selectedCard, targetMode, validTargets, triggerNegativeClick, triggerPositiveClick, moves, cardActionsStore]);

  /**
   * Reset targeting mode
   */
  const cancelTargeting = useCallback(() => {
    resetTargeting();
  }, []);

  /**
   * Reset all targeting state
   */
  const resetTargeting = useCallback(() => {
    cardActionsStore.resetTargeting();
    gameUIStore.clearTargeting();
    gameBoardStore.clearInfrastructureStates();
  }, [cardActionsStore, gameUIStore, gameBoardStore]);

  // Alias for backwards compatibility
  const selectCardToThrow = throwCard;
  const handleInfrastructureTarget = targetInfrastructure;
  const cancelThrow = cancelTargeting;

  // Return the same interface as the original useCardActions hook
  return useMemo(() => ({
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
    setProcessing: cardActionsStore.setProcessing,
    resetTargeting
  }), [
    selectedCard,
    targetMode,
    targetedInfraId,
    processing,
    validTargets,
    animatingThrow,
    playCard,
    cycleCard,
    throwCard,
    targetInfrastructure,
    cancelTargeting,
    selectCardToThrow,
    handleInfrastructureTarget,
    cancelThrow,
    cardActionsStore.setProcessing,
    resetTargeting
  ]);
}