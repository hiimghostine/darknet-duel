import { Ctx } from 'boardgame.io';
import { GameState } from 'shared-types/game.types';
import { Card, CardType, AttackVector } from 'shared-types/card.types';
import { hasCardFeatures } from '../../utils/typeGuards';
import { getEffectiveCardType } from '../../../utils/wildcardUtils';
import { validateCardTargeting } from '../../utils/validators';

/**
 * Validation utilities for throw card move
 * Centralizes all validation logic for better maintainability
 */

export interface ValidationContext {
  G: GameState;
  ctx: Ctx;
  playerID: string;
  cardId: string;
  targetInfrastructureId: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  player?: any;
  card?: Card;
  targetInfrastructure?: any;
  isAttacker?: boolean;
  effectiveCardType?: CardType;
  attackVector?: AttackVector;
  validationCardType?: CardType;
  targetingResult?: any;
}

/**
 * Validates player turn permissions and reaction mode
 */
export function validatePlayerTurn(G: GameState, ctx: Ctx, playerID: string): { valid: boolean; message?: string; isAttacker?: boolean } {
  // Verify it's the player's turn or a valid reaction
  const isCurrentPlayerTurn = (G.currentTurn === 'attacker' && playerID === G.attacker?.id) ||
                             (G.currentTurn === 'defender' && playerID === G.defender?.id);
  
  // Check if player is in reaction mode - important for counter-attack cards
  const isInReactionMode = ctx.activePlayers && 
                       playerID in ctx.activePlayers && 
                       ctx.activePlayers[playerID] === 'reaction';
  
  // In reaction mode, the non-active player can play counter-attack and reaction cards
  if (!isCurrentPlayerTurn && !isInReactionMode) {
    return {
      valid: false,
      message: "Cannot throw cards when it's not your turn"
    };
  }
  
  const isAttacker = playerID === G.attacker?.id;
  return { valid: true, isAttacker };
}

/**
 * Validates player existence and card availability
 */
export function validatePlayerAndCard(G: GameState, playerID: string, cardId: string): {
  valid: boolean;
  message?: string;
  player?: any;
  card?: Card;
  cardIndex?: number;
} {
  const isAttacker = playerID === G.attacker?.id;
  const player = isAttacker ? G.attacker : G.defender;
  
  if (!player) {
    return { valid: false, message: "Player not found" };
  }
  
  // Find the card in player's hand
  const cardIndex = player.hand.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    return { valid: false, message: "Card not found in hand" };
  }
  
  const card = player.hand[cardIndex];
  return { valid: true, player, card, cardIndex };
}

/**
 * Validates target infrastructure exists
 */
export function validateTargetInfrastructure(G: GameState, targetInfrastructureId: string): {
  valid: boolean;
  message?: string;
  targetInfrastructure?: any;
} {
  const targetInfrastructure = G.infrastructure?.find(infra => infra.id === targetInfrastructureId);
  if (!targetInfrastructure) {
    return { 
      valid: false,
      message: "Target infrastructure not found"
    };
  }
  
  return { valid: true, targetInfrastructure };
}

/**
 * Determines the effective card type for validation
 */
export function determineEffectiveCardType(card: Card, targetInfrastructure: any): {
  effectiveCardType: CardType;
  validationCardType: CardType;
} {
  // Use our type guard to handle the Card interface properties
  const extendedCard = hasCardFeatures(card) ? card : card;
  
  // Handle card type-specific targeting validation
  // For wildcard cards, determine the effective card type using our utility function
  const effectiveCardType = getEffectiveCardType(card.type, extendedCard.wildcardType);
  
  console.log(`DEBUG: Card ${card.name} (${card.type}) with wildcardType: ${extendedCard.wildcardType} -> effective type: ${effectiveCardType}`);
  
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
  
  return { effectiveCardType, validationCardType };
}

/**
 * Validates card targeting with the determined card type
 */
export function validateCardTargeting_Internal(
  validationCardType: CardType,
  targetInfrastructure: any,
  attackVector: AttackVector | undefined,
  G: GameState,
  card: Card,
  playerID: string
): any {
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
    console.log(`Card: ${card.name}, Type: ${card.type}, Effective Type: ${validationCardType}`);
    console.log(`Target: ${targetInfrastructure.name}, State: ${targetInfrastructure.state}`);
    return {
      valid: false,
      message: validationResult.message || "Invalid target for this card"
    };
  }
  
  console.log(`VALIDATION PASSED: ${card.name} -> ${targetInfrastructure.name}`);
  return { valid: true, result: validationResult };
}

/**
 * Complete validation pipeline for throw card move
 */
export function validateThrowCardMove(context: ValidationContext): ValidationResult {
  const { G, ctx, playerID, cardId, targetInfrastructureId } = context;
  
  console.log(`=== VALIDATION START ===`);
  console.log(`Player: ${playerID}, Card: ${cardId}, Target: ${targetInfrastructureId}`);
  
  // Step 1: Validate player turn
  const turnValidation = validatePlayerTurn(G, ctx, playerID);
  if (!turnValidation.valid) {
    return { valid: false, message: turnValidation.message };
  }
  
  // Step 2: Validate player and card
  const playerCardValidation = validatePlayerAndCard(G, playerID, cardId);
  if (!playerCardValidation.valid) {
    return { valid: false, message: playerCardValidation.message };
  }
  
  // Step 3: Validate target infrastructure
  const infraValidation = validateTargetInfrastructure(G, targetInfrastructureId);
  if (!infraValidation.valid) {
    return { valid: false, message: infraValidation.message };
  }
  
  // Step 4: Determine effective card types
  const { effectiveCardType, validationCardType } = determineEffectiveCardType(
    playerCardValidation.card!,
    infraValidation.targetInfrastructure!
  );
  
  return {
    valid: true,
    player: playerCardValidation.player,
    card: playerCardValidation.card,
    targetInfrastructure: infraValidation.targetInfrastructure,
    isAttacker: turnValidation.isAttacker,
    effectiveCardType,
    validationCardType
  };
}