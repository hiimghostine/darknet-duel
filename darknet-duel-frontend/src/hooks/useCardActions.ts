import { useState, useCallback } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { ExtendedCard } from '../components/game/board-components/types';
import { isAttackerCard } from '../types/card.types';
import { logMoveAttempt } from '../utils/gameDebugUtils';
import type { InfrastructureCard } from '../types/game.types';

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
    // Check if the card inherently requires targeting
    if (card.requiresTarget) return true;
    
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
  }, []);
  
  /**
   * Determine valid targets for a card
   */
  const getValidTargets = useCallback((card: ExtendedCard): string[] => {
    if (!card) return [];
    
    // If card has predefined valid targets, use those
    if (card.validTargets && card.validTargets.length > 0) {
      return card.validTargets;
    }
    
    // Otherwise determine targets based on card type
    let targets: string[] = [];
    
    if (G.infrastructure) {
      // For attack cards, only vulnerable infrastructure is a valid target
      if (isAttackerCard(card.type) && card.type === 'attack') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => infra.state === 'vulnerable')
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For exploit cards, target secure, fortified, or fortified_weaken infrastructure
      else if (isAttackerCard(card.type) && card.type === 'exploit') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => 
            infra.state === 'secure' || 
            infra.state === 'fortified' || 
            infra.state === 'fortified_weaken'
          )
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For shield cards, only secure infrastructure is a valid target
      else if (card.type === 'shield') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => infra.state === 'secure')
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For fortify cards, only shielded infrastructure is a valid target
      else if (card.type === 'fortify') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => infra.state === 'shielded')
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For response/reaction cards, target compromised or vulnerable infrastructure
      else if (card.type === 'response' || card.type === 'reaction') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => 
            infra.state === 'compromised' || 
            infra.state === 'vulnerable' || 
            infra.vulnerabilities?.length > 0
          )
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For counter-attack and counter cards, all infrastructure are valid targets
      else if (card.type === 'counter-attack' || card.type === 'counter') {
        targets = G.infrastructure
          .map((infra: InfrastructureCard) => infra.id);
      }
      
      console.log(`Found ${targets.length} valid targets for ${card.type} card:`, targets);
    } else {
      console.warn("No infrastructure found in game state", G);
    }
    
    return targets;
  }, [G.infrastructure]); // Updated dependency to G.infrastructure

  /**
   * Play a card - handles both direct play and targeted play
   */
  const playCard = (card: ExtendedCard, event?: React.MouseEvent) => {
    if (!card || !isActive) return;
    if (event) event.stopPropagation();
    if (targetMode) return;
    
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
    
    // If it's a card that needs targeting (any card that requires infrastructure targeting)
    if ((isAttackerCard(card.type) && (card.type === 'attack' || card.type === 'exploit' || card.type === 'counter-attack' || card.type === 'counter')) || 
        (card.type === 'shield' || card.type === 'fortify' || card.type === 'response' || card.type === 'reaction')) {
      console.log(`Throwing ${card.type} card:`, card.name);
      const targets = getValidTargets(card);
      
      if (targets.length > 0) {
        setSelectedCard(card);
        setTargetMode(true);
        setValidTargets(targets);
      } else {
        console.log(`No valid targets found for ${card.type} card`);
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
