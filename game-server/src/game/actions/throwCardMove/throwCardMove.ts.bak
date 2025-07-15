import { Ctx } from 'boardgame.io';
import { GameState, GameAction } from 'shared-types/game.types';
import { Card, CardType, AttackVector } from 'shared-types/card.types';
import { hasCardFeatures } from '../utils/typeGuards';
import { getEffectiveCardType, getAvailableCardTypes } from '../../utils/wildcardUtils';
import { applyCardEffect } from './cardEffects';
import { validateCardTargeting } from '../utils/validators';
import { calculateScores } from '../utils/scoring';
import { TemporaryEffectsManager } from '../temporaryEffectsManager';

/**
 * Action to throw a card at an infrastructure target
 * This deducts AP and applies card effects to target infrastructure
 * @returns GameState - The updated game state
 */
export const throwCardMove = ({ G, ctx, playerID }: { G: GameState; ctx: Ctx; playerID: string }, cardId: string, targetInfrastructureId: string): GameState => {
  console.log(`=== THROWCARD MOVE START ===`);
  console.log(`Player: ${playerID}, Card: ${cardId}, Target: ${targetInfrastructureId}`);
  
  // Verify it's the player's turn or a valid reaction
  const isCurrentPlayerTurn = (G.currentTurn === 'attacker' && playerID === G.attacker?.id) ||
                             (G.currentTurn === 'defender' && playerID === G.defender?.id);
  
  // Check if player is in reaction mode - important for counter-attack cards
  const isInReactionMode = ctx.activePlayers && 
                       playerID in ctx.activePlayers && 
                       ctx.activePlayers[playerID] === 'reaction';
  
  // In reaction mode, the non-active player can play counter-attack and reaction cards
  if (!isCurrentPlayerTurn && !isInReactionMode) {
    // Not this player's turn and not in reaction mode
    return {
      ...G,
      message: "Cannot throw cards when it's not your turn"
    };
  }
  
  const isAttacker = playerID === G.attacker?.id;
  const player = isAttacker ? G.attacker : G.defender;
  
  if (!player) return G;
  
  // Find the card in player's hand
  const cardIndex = player.hand.findIndex(card => card.id === cardId);
  if (cardIndex === -1) return G; // Card not found
  
  const card = player.hand[cardIndex];
  // Use our type guard to handle the Card interface properties
  const extendedCard = hasCardFeatures(card) ? card : card;
  
  // Find the target infrastructure
  const targetInfrastructure = G.infrastructure?.find(infra => infra.id === targetInfrastructureId);
  if (!targetInfrastructure) {
    return { 
      ...G,
      message: "Target infrastructure not found"
    };
  }
  
  // Record action so it's available throughout the function
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType: 'throwCard',
    timestamp: Date.now(),
    payload: { cardId, targetInfrastructureId, cardType: card.type }
  };
  
  // Handle card type-specific targeting validation
  // For wildcard cards, determine the effective card type using our utility function
  const effectiveCardType = getEffectiveCardType(card.type, extendedCard.wildcardType);
  
  console.log(`DEBUG: Card ${card.name} (${card.type}) with wildcardType: ${extendedCard.wildcardType} -> effective type: ${effectiveCardType}`);
  
  // Get attack vector if available, or fall back to metadata.category
  let attackVector = extendedCard.attackVector as AttackVector | undefined;
  
  // If no explicit attackVector, try to get it from metadata.category
  if (!attackVector && extendedCard.metadata && extendedCard.metadata.category &&
      extendedCard.metadata.category !== 'any') {
    // Cast the category to AttackVector if it's one of our known values
    attackVector = extendedCard.metadata.category as AttackVector;
  }
  
  // For wildcards without attack vector, provide a default based on target infrastructure
  if (!attackVector && card.type === 'wildcard' && targetInfrastructure) {
    // Use the target infrastructure's first vulnerable vector as default
    if (targetInfrastructure.vulnerableVectors && targetInfrastructure.vulnerableVectors.length > 0) {
      attackVector = targetInfrastructure.vulnerableVectors[0] as AttackVector;
      console.log(`Using default attack vector for wildcard: ${attackVector}`);
    } else {
      // Ultimate fallback - use 'network' as default
      attackVector = 'network' as AttackVector;
      console.log(`Using fallback attack vector for wildcard: ${attackVector}`);
    }
  }
  
  console.log(`Card ${card.name} (${card.id}) has attack vector: ${attackVector || 'NONE'}`);

  // For wildcard cards, we need to validate against the intended type, not 'wildcard'
  let validationCardType = effectiveCardType;
  if (effectiveCardType === 'wildcard' && card.wildcardType) {
    // Handle special wildcards differently
    if (card.wildcardType === 'special') {
      validationCardType = 'special'; // Special cards like Lateral Movement
      console.log(`Special wildcard validation: Using special type for ${card.name}`);
    } else {
      // For other wildcards, determine the intended type based on target infrastructure
      if (targetInfrastructure.state === 'secure') {
        validationCardType = 'exploit'; // exploit can target secure infrastructure
      } else if (targetInfrastructure.state === 'vulnerable') {
        validationCardType = 'attack'; // attack can target vulnerable infrastructure
      } else if (targetInfrastructure.state === 'compromised') {
        validationCardType = 'response'; // response can target compromised infrastructure
      } else if (targetInfrastructure.state === 'shielded') {
        validationCardType = 'fortify'; // fortify can target shielded infrastructure
      } else {
        validationCardType = 'exploit'; // default to exploit for wildcards
      }
      
      console.log(`Wildcard validation: Using ${validationCardType} type for ${targetInfrastructure.state} infrastructure`);
    }
  }
  
  // Validate targeting for the card
  // This will also check for special cost reduction cases in Phase 2
  const validationResult = validateCardTargeting(
    validationCardType,
    targetInfrastructure,
    attackVector,
    G, // Pass the full game state for effect checking
    card, // Pass the card for special card handling
    playerID // Pass playerID for player-specific effect checks
  );

  if (!validationResult.valid) {
    console.log(`VALIDATION FAILED: ${validationResult.message}`);
    console.log(`Card: ${card.name}, Type: ${card.type}, Effective Type: ${effectiveCardType}`);
    console.log(`Target: ${targetInfrastructure.name}, State: ${targetInfrastructure.state}`);
    return {
      ...G,
      message: validationResult.message || "Invalid target for this card"
    };
  }
  
  console.log(`VALIDATION PASSED: ${card.name} -> ${targetInfrastructure.name}`);

  // Calculate effective card cost, applying any cost reductions
  let effectiveCost = card.cost;
  
  // Handle cost reductions based on validation result bypassCost flag
  // This covers Living Off The Land (A302) and other special cases
  if (validationResult.bypassCost) {
    effectiveCost = Math.max(0, card.cost - 1);
    console.log(`Wildcard cost reduction: Cost reduced from ${card.cost} to ${effectiveCost}`);
  }
  
  // Additional cost reduction check for Living Off The Land (A302)
  if (card.id === 'A302' && targetInfrastructure.type === 'user') {
    const originalCost = effectiveCost;
    effectiveCost = Math.max(0, effectiveCost - 1);
    console.log(`Living Off The Land cost reduction: ${originalCost} -> ${effectiveCost} (user systems target)`);
  }
  
  // Check for card-specific cost reduction properties
  const cardWithCostReduction = card as any;
  if (cardWithCostReduction.costReduction && targetInfrastructure.type === cardWithCostReduction.costReduction.target.replace('_systems', '')) {
    const originalCost = effectiveCost;
    effectiveCost = Math.max(0, effectiveCost - cardWithCostReduction.costReduction.amount);
    console.log(`Card-specific cost reduction: ${originalCost} -> ${effectiveCost} (${cardWithCostReduction.costReduction.target} target)`);
  }
  
  // Check for cost_reduction temporary effects
  if (TemporaryEffectsManager.hasEffect(G as GameState, 'cost_reduction', targetInfrastructure.id)) {
    const reduction = 1; // Default reduction amount
    effectiveCost = Math.max(0, effectiveCost - reduction);
    console.log(`Cost reduction effect applied: Cost reduced to ${effectiveCost}`);
  }
  
  // Check if player has enough action points for effective cost
  if (player.actionPoints < effectiveCost) {
    return { 
      ...G,
      message: "Not enough action points to throw this card"
    };
  }
  
  // Remove card from hand
  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  
  // IMPORTANT: Check if this is a wildcard card BEFORE removing from hand and adding to discard
  if (card.type === 'wildcard' && card.wildcardType) {
    console.log(`Wildcard card detected at source: ${card.name} with wildcardType: ${card.wildcardType}`);
    
    // Get available types for this wildcard
    const availableTypes = getAvailableCardTypes(card.wildcardType);
    console.log(`Available wildcard types:`, availableTypes);
    
    // Smart auto-selection: Choose the best type based on target infrastructure state
    let autoSelectedType: CardType | null = null;
    
    // Handle auto-selection logic
    if (targetInfrastructure && availableTypes.length >= 1) {
      // For special wildcards with only one type, auto-select it
      if (card.wildcardType === 'special' && availableTypes.length === 1) {
        autoSelectedType = availableTypes[0];
        console.log(`Special wildcard ${card.name} - auto-selecting single type: ${autoSelectedType}`);
      } else if (card.wildcardType === 'special') {
        console.log(`Special wildcard ${card.name} - skipping auto-selection (multiple types)`);
        autoSelectedType = null;
      } else if (availableTypes.length === 1) {
        // Handle single-type wildcards by auto-selecting the only available type
        autoSelectedType = availableTypes[0];
        console.log(`Single-type wildcard ${card.name} - auto-selecting ${autoSelectedType}`);
      } else {
        // Multi-type wildcard - use smart selection based on infrastructure state
        switch (targetInfrastructure.state) {
          case 'secure':
            // For secure infrastructure, prioritize exploit
            if (availableTypes.includes('exploit')) {
              autoSelectedType = 'exploit';
            }
            break;
          case 'vulnerable':
            // For vulnerable infrastructure, prioritize attack
            if (availableTypes.includes('attack')) {
              autoSelectedType = 'attack';
            }
            break;
          case 'compromised':
            // For compromised infrastructure, prioritize response (if defender) or special effects
            if (availableTypes.includes('response') && !isAttacker) {
              autoSelectedType = 'response';
            } else if (availableTypes.includes('special')) {
              autoSelectedType = 'special';
            }
            break;
          case 'shielded':
            // For shielded infrastructure, prioritize fortify (if defender) or counter-attack (if attacker)
            if (availableTypes.includes('fortify') && !isAttacker) {
              autoSelectedType = 'fortify';
            } else if (availableTypes.includes('counter-attack') && isAttacker) {
              autoSelectedType = 'counter-attack';
            }
            break;
        }
      }
    }
    
    // If we have an auto-selected type, use it directly
    if (autoSelectedType) {
      console.log(`Auto-selected wildcard type: ${autoSelectedType} for ${targetInfrastructure.state} infrastructure`);
      
      // Create a deep copy of the card to ensure all properties are preserved
      const cardCopy = JSON.parse(JSON.stringify(card));
      
      // Additional cost reduction check for Living Off The Land (A302) in auto-selection path
      let finalEffectiveCost = effectiveCost;
      if (card.id === 'A302' && targetInfrastructure.type === 'user') {
        const originalCost = finalEffectiveCost;
        finalEffectiveCost = Math.max(0, finalEffectiveCost - 1);
        console.log(`Living Off The Land cost reduction (auto-selection): ${originalCost} -> ${finalEffectiveCost} (user systems target)`);
      }
      
      // Check for card-specific cost reduction properties in auto-selection path
      const cardWithCostReduction = card as any;
      if (cardWithCostReduction.costReduction && targetInfrastructure.type === cardWithCostReduction.costReduction.target.replace('_systems', '')) {
        const originalCost = finalEffectiveCost;
        finalEffectiveCost = Math.max(0, finalEffectiveCost - cardWithCostReduction.costReduction.amount);
        console.log(`Card-specific cost reduction (auto-selection): ${originalCost} -> ${finalEffectiveCost} (${cardWithCostReduction.costReduction.target} target)`);
      }
      
      // Create the updated player state - we move the card from hand to discard
      const updatedPlayer = {
        ...player,
        hand: newHand,
        discard: [...player.discard, cardCopy], // Add to discard pile immediately
        actionPoints: player.actionPoints - finalEffectiveCost
      };
      
      // Apply the card effect directly with the auto-selected type
      console.log(`Applying auto-selected card effect: ${autoSelectedType} on ${targetInfrastructure.name}`);
      
      // First, apply wildcard-specific effects
      const { WildcardResolver } = require('../wildcardResolver');
      const wildcardContext = {
        gameState: G,
        playerRole: isAttacker ? 'attacker' : 'defender',
        card: extendedCard,
        targetInfrastructure: targetInfrastructure,
        chosenType: autoSelectedType,
        playerID: playerID
      };
      
      console.log(`Applying wildcard effects for ${card.name}`);
      const gameStateWithWildcardEffects = WildcardResolver.applyWildcardEffects(extendedCard, wildcardContext);
      
      console.log(`DEBUG: pendingChainChoice after wildcard effects: ${gameStateWithWildcardEffects.pendingChainChoice ? 'YES' : 'NO'}`);
      
      const effectResult = applyCardEffect(
        autoSelectedType,
        targetInfrastructure,
        G.infrastructure?.findIndex(infra => infra.id === targetInfrastructureId) || 0,
        G.infrastructure ? [...G.infrastructure] : [],
        extendedCard,
        attackVector,
        playerID,
        gameStateWithWildcardEffects // Use the updated game state with wildcard effects
      );
      
      console.log(`DEBUG: pendingChainChoice after applyCardEffect: ${gameStateWithWildcardEffects.pendingChainChoice ? 'YES' : 'NO'}`);
      
      console.log(`Card effect result type:`, typeof effectResult);
      console.log(`Card effect result:`, effectResult);
      
      // Handle the effect result
      if (effectResult && Array.isArray(effectResult)) {
        const { attackerScore, defenderScore } = calculateScores(effectResult);
        
        console.log(`Infrastructure updated, returning new game state`);
        
        // Create a clean infrastructure array without Immer draft objects
        const cleanInfrastructure = effectResult.map(infra => {
          // If it's an Immer draft, extract clean data
          if (infra && typeof infra === 'object' && ('base_' in infra || 'type_' in infra)) {
            // Use JSON serialization to get clean object
            return JSON.parse(JSON.stringify(infra));
          }
          // Otherwise, create a clean copy
          return { ...infra };
        });
        
        // Check if we have a pending chain choice - if so, don't trigger reactions yet
        const hasPendingChainChoice = gameStateWithWildcardEffects.pendingChainChoice || G.pendingChainChoice;
        
        const finalState = {
          ...G, // Use original game state as base
          attacker: isAttacker ? updatedPlayer : G.attacker,
          defender: !isAttacker ? updatedPlayer : G.defender,
          infrastructure: cleanInfrastructure,
          actions: [...G.actions, newAction],
          message: gameStateWithWildcardEffects.message || `${card.name} played as ${autoSelectedType} on ${targetInfrastructure.name}`,
          attackerScore,
          defenderScore,
          // Only include specific wildcard effects properties
          temporaryEffects: gameStateWithWildcardEffects.temporaryEffects || G.temporaryEffects,
          pendingCardChoice: gameStateWithWildcardEffects.pendingCardChoice || G.pendingCardChoice,
          // Include chain choice (important for Lateral Movement) - prioritize the one from wildcard effects
          pendingChainChoice: gameStateWithWildcardEffects.pendingChainChoice || G.pendingChainChoice
        };
        
        console.log(`DEBUG: Final state has pendingChainChoice: ${finalState.pendingChainChoice ? 'YES' : 'NO'}`);
        
        return finalState;
      } else {
        console.log(`Card effect failed or returned non-array result, continuing to fallback`);
      }
    }
    
    // If no auto-selection or single type, show choice UI
    // Create a deep copy of the card to ensure all properties are preserved
    const cardCopy = JSON.parse(JSON.stringify(card));
    
    // Create the updated player state - we move the card from hand to discard
    const updatedPlayer = {
      ...player,
      hand: newHand,
      discard: [...player.discard, cardCopy], // Add to discard pile immediately
      actionPoints: player.actionPoints - effectiveCost
    };
    
    // Create the updated game state with pending wildcard choice
    return {
      ...G,
      attacker: isAttacker ? updatedPlayer : G.attacker,
      defender: !isAttacker ? updatedPlayer : G.defender,
      actions: [...G.actions, newAction],
      pendingWildcardChoice: {
        cardId: card.id,
        playerId: playerID,
        availableTypes: availableTypes,
        targetInfrastructure: targetInfrastructureId,
        timestamp: Date.now()
      },
      message: `Choose how to play ${card.name}`
    };
  }
  
  // Create a deep copy of the card to ensure all properties are preserved during serialization
  const cardCopy = JSON.parse(JSON.stringify(card));
  
  // Add card to discard pile
  const updatedPlayer = {
    ...player,
    hand: newHand,
    discard: [...player.discard, cardCopy],
    actionPoints: player.actionPoints - effectiveCost // Use effective action points with reductions applied
  };
  
  // Log the card removal for debugging
  console.log(`CARD REMOVED: ${card.name} (${card.id}) from ${isAttacker ? 'attacker' : 'defender'}'s hand. Hand size: ${player.hand.length} -> ${newHand.length}`);
  
  // Handle infrastructure state changes - clone everything first
  const updatedInfrastructure = G.infrastructure ? [...G.infrastructure] : [];
  const infraIndex = updatedInfrastructure.findIndex(infra => infra.id === targetInfrastructureId);
  
  // Only proceed if we found the target infrastructure
  if (infraIndex === -1) {
    return G; // Should not happen as we checked earlier
  }
  
  // Clone the target infrastructure object to avoid direct mutation
  const currentInfra = {
    ...updatedInfrastructure[infraIndex]
  };
  
  // Apply card effects based on the effective card type
  // Note: For wildcard cards, we now need to pass the gameState for proper handling
  const effectResult = applyCardEffect(
    effectiveCardType, 
    targetInfrastructure, 
    infraIndex, 
    updatedInfrastructure, 
    extendedCard,
    attackVector,
    playerID,
    G // Pass the current game state for wildcard resolution
  );
  
  // Handle the various possible outcomes from applying the card effect
  if (effectResult === null) {
    // Attack was not possible for some reason
    return {
      ...G,
      message: `This infrastructure is not vulnerable to ${attackVector} attacks`
    };
  } else if ('victory' in effectResult) {
    // Attacker has won
    return {
      ...G,
      attacker: isAttacker ? updatedPlayer : G.attacker,
      defender: !isAttacker ? updatedPlayer : G.defender,
      infrastructure: updatedInfrastructure,
      actions: [...G.actions, newAction],
      message: `Game over! Attacker wins by compromising infrastructure!`,
      gamePhase: 'gameOver' as const,
      winner: 'attacker'
    } as GameState;
  } else if ('pendingChoice' in effectResult) {
    // Wildcard card needs player choice
    return {
      ...G,
      attacker: isAttacker ? updatedPlayer : G.attacker,
      defender: !isAttacker ? updatedPlayer : G.defender,
      // Don't update infrastructure yet - will be updated after choice
      actions: [...G.actions], // We'll add the action after the choice is made
      message: `Select a type to play this wildcard as`,
      // pendingWildcardChoice was added to GameState in the wildcard resolver
    };
  }
  
  // Normal case - card effect applied successfully
  const newInfrastructure = effectResult;
  
  // Check if this card should trigger reaction phase
  const shouldTriggerReaction = !extendedCard.preventReaction && 
                              (effectiveCardType === 'attack' || effectiveCardType === 'exploit');
  
  // Calculate scores based on infrastructure states
  const { attackerScore, defenderScore } = calculateScores(newInfrastructure);
  
  console.log(`Updated scores - Attacker: ${attackerScore}, Defender: ${defenderScore}`);
  
  // Check if there's a pending chain choice from the card effect
  const finalGameState = {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    infrastructure: newInfrastructure,
    actions: [...G.actions, newAction],
    message: G.message || `${card.name} thrown at ${targetInfrastructure.name}`,
    attackerScore,
    defenderScore,
    // Add pending reaction if needed
    pendingReactions: shouldTriggerReaction ? [
      ...(G.pendingReactions || []),
      {
        card: cardCopy,
        source: playerID,
        target: isAttacker ? G.defender?.id || '' : G.attacker?.id || ''
      }
    ] : G.pendingReactions,
    // Include any pending chain choice that might have been set
    pendingChainChoice: G.pendingChainChoice
  } as GameState;
  
  console.log(`Final game state - pendingChainChoice: ${finalGameState.pendingChainChoice ? 'YES' : 'NO'}`);
  
  return finalGameState;
};
