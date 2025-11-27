import { useState, useCallback } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { ExtendedCard } from '../components/game/board-components/types';
import { isAttackerCard } from '../types/card.types';
import { logMoveAttempt, debugWildcardTargeting } from '../utils/gameDebugUtils';
import type { InfrastructureCard, AttackVector } from '../types/game.types';
import { getAvailableCardTypes } from '../utils/wildcardTypeUtils';

/**
 * Hook for card action management in the game
 * Handles playing cards, cycling cards, targeting, and card throws
 */
export function useCardActions(props: BoardProps & {
  triggerClick?: () => void;
  triggerPositiveClick?: () => void;
  triggerNegativeClick?: () => void;
}) {
  const { G, moves, isActive, triggerClick, triggerPositiveClick, triggerNegativeClick } = props;
  
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
   * Helper function to check if infrastructure has a temporary effect that prevents certain card types
   * Matches backend's TemporaryEffectsManager.hasEffect logic
   */
  const hasTemporaryEffect = useCallback((effectType: string, infrastructureId: string): boolean => {
    if (!G.temporaryEffects || G.temporaryEffects.length === 0) {
      return false;
    }
    
    return G.temporaryEffects.some((effect: any) => 
      effect.type === effectType && 
      effect.targetId === infrastructureId &&
      effect.duration > 0 // Only active effects
    );
  }, [G.temporaryEffects]);

  /**
   * Determine valid targets for a card with vector validation
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
    
    // Handle wildcard cards differently - for multi-type wildcards, allow BOTH types of targets
    let effectiveCardType = card.type;
    let isExploitAttackWildcard = false;
    let isShieldFortifyWildcard = false;
    let isAnyWildcard = false;
    
    if (card.type === 'wildcard' && card.wildcardType) {
      console.log('Getting targets for wildcard:', card.name, card.wildcardType);
      
      // Debug wildcard targeting
      debugWildcardTargeting(card, G);
      
      // Get the potential types this wildcard can be played as
      const availableTypes = getAvailableCardTypes(card.wildcardType);
      
      // Special handling for multi-type wildcards - they should target BOTH types
      if (card.wildcardType === 'exploit-attack' || (availableTypes.includes('exploit') && availableTypes.includes('attack'))) {
        isExploitAttackWildcard = true;
        effectiveCardType = 'wildcard'; // Keep as wildcard for special combined targeting
        console.log('Detected exploit-attack wildcard - will allow targeting both secure and vulnerable infrastructure');
      } else if (card.wildcardType === 'shield_or_fortify' || (availableTypes.includes('shield') && availableTypes.includes('fortify'))) {
        isShieldFortifyWildcard = true;
        effectiveCardType = 'wildcard'; // Keep as wildcard for special combined targeting
        console.log('Detected shield-fortify wildcard - will allow targeting both secure and shielded infrastructure');
      } else if (card.wildcardType === 'any') {
        isAnyWildcard = true;
        effectiveCardType = 'wildcard'; // Keep as wildcard for special combined targeting
        console.log('Detected ANY wildcard - will allow targeting ALL valid infrastructure types');
      } else {
        // For other wildcards, use the original single-type selection logic
        // Priority order: exploit, attack, shield, fortify, response, reaction, special
        console.log('Available infrastructure states:', G.infrastructure?.map((i: InfrastructureCard) => `${i.name}: ${i.state}`));
        
        const typeToTry = ['exploit', 'attack', 'shield', 'fortify', 'response', 'reaction', 'special'];
        
        for (const type of typeToTry) {
          if (availableTypes.includes(type as any)) {
            // Test if this type would have valid targets by checking infrastructure states
            let potentialTargets: string[] = [];
            
            if (G.infrastructure) {
              switch (type) {
                case 'special':
                  potentialTargets = G.infrastructure
                    .filter((infra: InfrastructureCard) => infra.state === 'compromised')
                    .map((infra: InfrastructureCard) => infra.id);
                  if (potentialTargets.length === 0) {
                    potentialTargets = G.infrastructure.map((infra: InfrastructureCard) => infra.id);
                  }
                  break;
                case 'exploit':
                  potentialTargets = G.infrastructure
                    .filter((infra: InfrastructureCard) => {
                      const stateMatch = infra.state === 'secure' || infra.state === 'fortified' || infra.state === 'fortified_weaken';
                      const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                      const notProtected = !hasTemporaryEffect('prevent_exploits', infra.id);
                      return stateMatch && vectorMatch && notProtected;
                    })
                    .map((infra: InfrastructureCard) => infra.id);
                  break;
                case 'attack':
                  potentialTargets = G.infrastructure
                    .filter((infra: InfrastructureCard) => {
                      const stateMatch = infra.state === 'vulnerable';
                      const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                      return stateMatch && vectorMatch;
                    })
                    .map((infra: InfrastructureCard) => infra.id);
                  break;
                case 'shield':
                  potentialTargets = G.infrastructure
                    .filter((infra: InfrastructureCard) => {
                      const stateMatch = infra.state === 'secure';
                      const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                      return stateMatch && vectorMatch;
                    })
                    .map((infra: InfrastructureCard) => infra.id);
                  break;
                case 'fortify':
                  potentialTargets = G.infrastructure
                    .filter((infra: InfrastructureCard) => {
                      const stateMatch = infra.state === 'shielded';
                      const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                      return stateMatch && vectorMatch;
                    })
                    .map((infra: InfrastructureCard) => infra.id);
                  break;
                case 'response':
                  potentialTargets = G.infrastructure
                    .filter((infra: InfrastructureCard) => {
                      const stateMatch = infra.state === 'compromised';
                      const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                      const notProtected = !hasTemporaryEffect('prevent_restore', infra.id);
                      return stateMatch && vectorMatch && notProtected;
                    })
                    .map((infra: InfrastructureCard) => infra.id);
                  break;
                case 'reaction':
                  potentialTargets = G.infrastructure
                    .filter((infra: InfrastructureCard) => {
                      const stateMatch = infra.state === 'vulnerable' || infra.state === 'compromised';
                      const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
                      const notProtected = !hasTemporaryEffect('prevent_reactions', infra.id);
                      return stateMatch && vectorMatch && notProtected;
                    })
                    .map((infra: InfrastructureCard) => infra.id);
                  break;
                case 'counter-attack':
                case 'counter':
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
      }
      
      console.log('Using effective card type for targeting:', effectiveCardType);
    }
    
    // Otherwise determine targets based on card type
    let targets: string[] = [];
    
    if (G.infrastructure) {
      // Special handling for exploit-attack wildcards - allow BOTH types of targets
      if (isExploitAttackWildcard) {
        console.log('🎯 Processing exploit-attack wildcard - combining exploit and attack targets');
        
        // Get exploit targets (secure/fortified infrastructure)
        const exploitTargets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'secure' || infra.state === 'fortified' || infra.state === 'fortified_weaken';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            const notProtected = !hasTemporaryEffect('prevent_exploits', infra.id);
            return stateMatch && vectorMatch && notProtected;
          })
          .map((infra: InfrastructureCard) => infra.id);
        
        // Get attack targets (vulnerable infrastructure)
        const attackTargets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'vulnerable';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
        
        // Combine both types of targets
        targets = [...exploitTargets, ...attackTargets];
        console.log(`🎯 Exploit-attack wildcard targets: ${exploitTargets.length} exploit + ${attackTargets.length} attack = ${targets.length} total`);
      }
      // Special handling for shield-fortify wildcards - allow BOTH types of targets
      else if (isShieldFortifyWildcard) {
        console.log('🛡️ Processing shield-fortify wildcard - combining shield and fortify targets');
        
        // Get shield targets (secure infrastructure)
        const shieldTargets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'secure';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
        
        // Get fortify targets (shielded infrastructure)
        const fortifyTargets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'shielded';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
        
        // Combine both types of targets
        targets = [...shieldTargets, ...fortifyTargets];
        console.log(`🛡️ Shield-fortify wildcard targets: ${shieldTargets.length} shield + ${fortifyTargets.length} fortify = ${targets.length} total`);
      }
      // Special handling for ANY wildcards - intelligent role-based targeting
      else if (isAnyWildcard) {
        console.log('🌟 Processing ANY wildcard - intelligent role-based targeting for all infrastructure');
        
        // Determine if this is an attacker or defender card
        const isAttackerCard = card.id.startsWith('A');
        const playerRole = isAttackerCard ? 'attacker' : 'defender';
        
        // Get ALL infrastructure as potential targets - ANY wildcard adapts based on what it's targeting
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            // Check vector compatibility
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            
            // ANY wildcard can target any infrastructure state - the backend will determine the appropriate card type
            const stateMatch = ['secure', 'vulnerable', 'shielded', 'fortified', 'fortified_weaken', 'compromised'].includes(infra.state);
            
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
        
        console.log(`🌟 ANY wildcard (${playerRole}) targets: ALL infrastructure (${targets.length} total) - backend will determine appropriate card type based on target state`);
      }
      // Apply state-based filtering first, then vector compatibility
      else if (effectiveCardType === 'special') {
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
      else if (isAttackerCard(effectiveCardType) && effectiveCardType === 'attack') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'vulnerable';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            return stateMatch && vectorMatch;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For exploit cards, target secure/fortified infrastructure + vector compatibility
      else if (isAttackerCard(effectiveCardType) && effectiveCardType === 'exploit') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'secure' || infra.state === 'fortified' || infra.state === 'fortified_weaken';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            const notProtected = !hasTemporaryEffect('prevent_exploits', infra.id);
            return stateMatch && vectorMatch && notProtected;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For shield cards, target secure or fortified_weaken infrastructure + vector compatibility
      // fortified_weaken infrastructure can be re-shielded to maintain protection
      else if (effectiveCardType === 'shield') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'secure' || infra.state === 'fortified_weaken';
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
            const notProtected = !hasTemporaryEffect('prevent_restore', infra.id);
            return stateMatch && vectorMatch && notProtected;
          })
          .map((infra: InfrastructureCard) => infra.id);
      }
      // For reaction cards, target ONLY vulnerable infrastructure (not compromised)
      else if (effectiveCardType === 'reaction') {
        targets = G.infrastructure
          .filter((infra: InfrastructureCard) => {
            const stateMatch = infra.state === 'vulnerable';
            const vectorMatch = card.type === 'wildcard' || !cardAttackVector || checkVectorCompatibility(cardAttackVector, infra);
            const notProtected = !hasTemporaryEffect('prevent_reactions', infra.id);
            return stateMatch && vectorMatch && notProtected;
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
      // For wildcards that haven't matched any specific type, return empty array
      // This happens when a wildcard has no valid targets for its allowed types
      else if (card.type === 'wildcard' && effectiveCardType === 'wildcard') {
        console.log(`⚠️ Wildcard ${card.name} with wildcardType ${card.wildcardType} has no valid targets for its allowed types`);
        targets = [];
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
          case 'reaction': return infra.state === 'vulnerable';
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
  }, [G.infrastructure, G.temporaryEffects, getCardAttackVector, checkVectorCompatibility, hasTemporaryEffect]); // Updated dependencies

  /**
   * Play a card - handles both direct play and targeted play
   */
  const playCard = (card: ExtendedCard, event?: React.MouseEvent) => {
    if (!card || !isActive) return;
    if (event) event.stopPropagation();
    if (triggerClick) triggerClick(); // Play click SFX on any card click
    if (targetMode) return;
    
    // Special handling for Memory Corruption Attack - use throwCard with dummy target
    if (card.id.startsWith('A307') || (card as any).target === 'opponent_hand') {
      console.log("🔥 Playing Memory Corruption Attack directly");
      if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
      // Use throwCard with a dummy target since validation will skip infrastructure checks
      moves.throwCard(card.id, 'dummy_target');
      return;
    }
    
    // Special handling for Emergency Response Team (D303) - use throwCard with dummy target
    if (card.id === 'D303' || card.id.startsWith('D303') || (card as any).target === 'all_infrastructure') {
      console.log("🚨 Playing Emergency Response Team directly");
      if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
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
        if (triggerNegativeClick) triggerNegativeClick(); // Play negative SFX on invalid move
        return;
      }
    }
    
    // Direct play for cards that don't need targeting
    console.log("Playing card:", card.name);
    if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
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
    if (triggerClick) triggerClick(); // Play click SFX on any card click
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
        if (triggerNegativeClick) triggerNegativeClick(); // Play negative SFX on invalid move
      }
    }
  };

  /**
   * Target an infrastructure card
   */
  const targetInfrastructure = (infraId: string, event?: React.MouseEvent, startAnimation?: (cardId: string, targetId: string, cardElement: HTMLElement, targetElement: HTMLElement) => Promise<void>) => {
    if (!selectedCard || !targetMode) return;
    if (event) event.stopPropagation();
    
    // Check if this is a valid target
    if (!validTargets.includes(infraId)) {
      console.log("Invalid target:", infraId);
      if (triggerNegativeClick) triggerNegativeClick(); // Play negative SFX on invalid move
      return;
    }
    
    setTargetedInfraId(infraId);
    console.log("Targeting infra:", infraId, "with card:", selectedCard.name);
    
    // If animation function is provided, use it
    if (startAnimation) {
      // Find the card and target elements
      const cardElement = document.querySelector(`[data-card-id="${selectedCard.id}"]`) as HTMLElement;
      const targetElement = document.querySelector(`[data-infra-id="${infraId}"]`) as HTMLElement;
      
      if (cardElement && targetElement) {
        setAnimatingThrow(true);
        
        // Start animation and wait for completion
        startAnimation(selectedCard.id, infraId, cardElement, targetElement)
          .then(() => {
            // Execute the actual move after animation completes
            console.log(`DEBUG: Calling moves.throwCard with cardId: ${selectedCard.id}, infraId: ${infraId}`);
            if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
            moves.throwCard(selectedCard.id, infraId);
            resetTargeting();
          })
          .catch((error) => {
            console.error('Animation failed:', error);
            // Fallback to immediate execution
            if (triggerPositiveClick) triggerPositiveClick();
            moves.throwCard(selectedCard.id, infraId);
            resetTargeting();
          });
      } else {
        // Fallback if elements not found
        console.warn('Card or target element not found, executing move immediately');
        if (triggerPositiveClick) triggerPositiveClick();
        moves.throwCard(selectedCard.id, infraId);
        resetTargeting();
      }
    } else {
      // Original behavior without animation
      setAnimatingThrow(true);
      setTimeout(() => {
        console.log(`DEBUG: Calling moves.throwCard with cardId: ${selectedCard.id}, infraId: ${infraId}`);
        if (triggerPositiveClick) triggerPositiveClick(); // Play positive SFX on move
        moves.throwCard(selectedCard.id, infraId);
        resetTargeting();
      }, 300);
    }
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
