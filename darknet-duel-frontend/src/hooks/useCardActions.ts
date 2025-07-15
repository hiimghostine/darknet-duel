import { useState, useCallback } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { ExtendedCard } from '../components/game/board-components/types';
import { isAttackerCard } from '../types/card.types';
import { logMoveAttempt, debugWildcardTargeting } from '../utils/gameDebugUtils';
import type { InfrastructureCard } from '../types/game.types';
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
                // Exploit cards can target secure, fortified, or fortified_weaken infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) =>
                    infra.state === 'secure' ||
                    infra.state === 'fortified' ||
                    infra.state === 'fortified_weaken'
                  )
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'attack':
                // Attack cards can only target vulnerable infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => infra.state === 'vulnerable')
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'shield':
                // Shield cards can target non-shielded/fortified infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) =>
                    infra.state !== 'shielded' && infra.state !== 'fortified'
                  )
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'fortify':
                // Fortify cards can only target shielded infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => infra.state === 'shielded')
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'response':
                // Response cards can only target compromised infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) => infra.state === 'compromised')
                  .map((infra: InfrastructureCard) => infra.id);
                break;
              case 'reaction':
                // Reaction cards can target vulnerable or compromised infrastructure
                potentialTargets = G.infrastructure
                  .filter((infra: InfrastructureCard) =>
                    infra.state === 'vulnerable' || infra.state === 'compromised'
                  )
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
      // For special cards like Lateral Movement, prioritize compromised infrastructure
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
      // For attack cards, only vulnerable infrastructure is a valid target
      else if ((isAttackerCard(effectiveCardType) && effectiveCardType === 'attack') || 
          (card.type === 'wildcard' && card.wildcardType === 'attack')) {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => infra.state === 'vulnerable')
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For exploit cards, target secure or shielded infrastructure
      else if ((isAttackerCard(effectiveCardType) && effectiveCardType === 'exploit') || 
               (card.type === 'wildcard' && card.wildcardType === 'exploit')) {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => 
            infra.state === 'secure' || 
            infra.state === 'shielded'
          )
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For all other card types, provide all infrastructure as targets
      else {
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
