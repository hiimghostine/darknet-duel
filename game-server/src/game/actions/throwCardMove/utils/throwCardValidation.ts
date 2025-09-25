import { Ctx } from 'boardgame.io';
import { GameState } from 'shared-types/game.types';
import { Card, CardType, AttackVector } from 'shared-types/card.types';
import { hasCardFeatures } from '../../utils/typeGuards';
import { getEffectiveCardType } from '../../../utils/wildcardUtils';
import { validateCardTargeting } from '../../utils/validators';
import { TemporaryEffectsManager } from '../../temporaryEffectsManager';

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
  // FIXED: Use boardgame.io player IDs for turn validation
  // playerID is the boardgame.io ID ("0" or "1"), not the real user UUID
  const isAttacker = playerID === '0';
  const isDefender = playerID === '1';
  
  // Verify it's the player's turn or a valid reaction
  const isCurrentPlayerTurn = (G.currentTurn === 'attacker' && isAttacker) ||
                             (G.currentTurn === 'defender' && isDefender);
  
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
  // FIXED: Use boardgame.io player IDs for validation
  const isAttacker = playerID === '0';
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
export function validateTargetInfrastructure(G: GameState, targetInfrastructureId: string, card?: Card): {
  valid: boolean;
  message?: string;
  targetInfrastructure?: any;
} {
  // Special handling for Memory Corruption Attack and other hand-targeting cards
  if (card && (card.id.startsWith('A307') || (card as any).target === 'opponent_hand')) {
    console.log(`🎯 Hand-targeting card detected: ${card.name} (${card.id})`);
    // For hand-targeting cards, we don't need infrastructure validation
    return { valid: true, targetInfrastructure: null };
  }
  
  // Special handling for Emergency Response Team (D303) and other all-infrastructure cards
  if (card && (card.id === 'D303' || card.id.startsWith('D303') || (card as any).target === 'all_infrastructure' || (card as any).target === 'game_state')) {
    console.log(`🚨 All-infrastructure targeting card detected: ${card.name} (${card.id})`);
    // For all-infrastructure cards, we don't need specific infrastructure validation
    return { valid: true, targetInfrastructure: null };
  }
  
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
export function determineEffectiveCardType(card: Card, targetInfrastructure: any, isAttacker?: boolean): {
  effectiveCardType: CardType;
  validationCardType: CardType;
} {
  // Use our type guard to handle the Card interface properties
  const extendedCard = hasCardFeatures(card) ? card : card;
  
  // Special handling for Memory Corruption Attack and other hand-targeting cards
  if (card.id.startsWith('A307') || (card as any).target === 'opponent_hand') {
    console.log(`🎯 Hand-targeting card ${card.name} uses special validation`);
    return {
      effectiveCardType: 'special',
      validationCardType: 'special'
    };
  }
  
  // Special handling for Emergency Response Team (D303) and other all-infrastructure cards
  if (card.id === 'D303' || card.id.startsWith('D303') || (card as any).target === 'all_infrastructure' || (card as any).target === 'game_state') {
    console.log(`🚨 All-infrastructure targeting card ${card.name} uses special validation`);
    return {
      effectiveCardType: 'special',
      validationCardType: 'special'
    };
  }
  
  // Handle card type-specific targeting validation
  // For wildcard cards, determine the effective card type using our utility function
  const effectiveCardType = getEffectiveCardType(card.type, extendedCard.wildcardType);
  
  console.log(`DEBUG: Card ${card.name} (${card.type}) with wildcardType: ${extendedCard.wildcardType} -> effective type: ${effectiveCardType}`);
  
  // For wildcard cards, we need to validate against the intended type, not 'wildcard'
  let validationCardType = effectiveCardType;
  if (effectiveCardType === 'wildcard' && card.wildcardType) {
    // Handle special wildcards differently based on player role
    if (card.wildcardType === 'special') {
      if (isAttacker && targetInfrastructure) {
        // Attacker special wildcards: select based on infrastructure state
        switch (targetInfrastructure.state) {
          case 'secure':
          case 'fortified':
          case 'fortified_weaken':
          case 'shielded':
            validationCardType = 'exploit';
            break;
          case 'vulnerable':
            validationCardType = 'attack';
            break;
          default:
            validationCardType = 'exploit';
            break;
        }
        console.log(`Special wildcard validation: Using ${validationCardType} type for attacker targeting ${targetInfrastructure.state} infrastructure`);
      } else {
        // Defender special wildcards or no target
        validationCardType = 'special';
        console.log(`Special wildcard validation: Using special type for ${card.name}`);
      }
    } else if (targetInfrastructure) {
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
  // Special handling for exploit-attack wildcards - override effectiveCardType logic
  else if (card.wildcardType === 'exploit-attack' && targetInfrastructure) {
    // For exploit-attack wildcards, choose the type based on target infrastructure state
    if (targetInfrastructure.state === 'vulnerable') {
      validationCardType = 'attack'; // attack can target vulnerable infrastructure
      console.log(`🎯 Exploit-attack wildcard validation: Using ATTACK type for vulnerable infrastructure ${targetInfrastructure.name}`);
    } else if (targetInfrastructure.state === 'secure' || targetInfrastructure.state === 'fortified' || targetInfrastructure.state === 'fortified_weaken') {
      validationCardType = 'exploit'; // exploit can target secure/fortified infrastructure
      console.log(`🎯 Exploit-attack wildcard validation: Using EXPLOIT type for ${targetInfrastructure.state} infrastructure ${targetInfrastructure.name}`);
    } else {
      validationCardType = 'exploit'; // default to exploit for other states
      console.log(`🎯 Exploit-attack wildcard validation: Using EXPLOIT type (default) for ${targetInfrastructure.state} infrastructure ${targetInfrastructure.name}`);
    }
  }
  // Special handling for shield-fortify wildcards - override effectiveCardType logic
  else if (card.wildcardType === 'shield_or_fortify' && targetInfrastructure) {
    // For shield-fortify wildcards, choose the type based on target infrastructure state
    if (targetInfrastructure.state === 'shielded') {
      validationCardType = 'fortify'; // fortify can target shielded infrastructure
      console.log(`🛡️ Shield-fortify wildcard validation: Using FORTIFY type for shielded infrastructure ${targetInfrastructure.name}`);
    } else if (targetInfrastructure.state === 'secure') {
      validationCardType = 'shield'; // shield can target secure infrastructure
      console.log(`🛡️ Shield-fortify wildcard validation: Using SHIELD type for secure infrastructure ${targetInfrastructure.name}`);
    } else {
      validationCardType = 'shield'; // default to shield for other states
      console.log(`🛡️ Shield-fortify wildcard validation: Using SHIELD type (default) for ${targetInfrastructure.state} infrastructure ${targetInfrastructure.name}`);
    }
  }
  // Special handling for ANY wildcards - intelligent role-based validation
  else if (card.wildcardType === 'any' && targetInfrastructure) {
    // Determine player role
    const isAttackerCard = card.id.startsWith('A');
    const playerRole = isAttackerCard ? 'attacker' : 'defender';
    
    // Choose validation type based on infrastructure state AND player role
    switch (targetInfrastructure.state) {
      case 'secure':
        validationCardType = isAttackerCard ? 'exploit' : 'shield';
        console.log(`🌟 ANY wildcard validation: ${playerRole} targeting secure -> ${validationCardType.toUpperCase()} type`);
        break;
      case 'vulnerable':
        validationCardType = isAttackerCard ? 'attack' : 'reaction';
        console.log(`🌟 ANY wildcard validation: ${playerRole} targeting vulnerable -> ${validationCardType.toUpperCase()} type`);
        break;
      case 'shielded':
        validationCardType = isAttackerCard ? 'counter-attack' : 'fortify';
        console.log(`🌟 ANY wildcard validation: ${playerRole} targeting shielded -> ${validationCardType.toUpperCase()} type`);
        break;
      case 'fortified':
      case 'fortified_weaken':
        validationCardType = 'exploit'; // Both roles can exploit fortified infrastructure
        console.log(`🌟 ANY wildcard validation: ${playerRole} targeting ${targetInfrastructure.state} -> EXPLOIT type`);
        break;
      case 'compromised':
        validationCardType = 'response'; // Both roles can respond to compromised infrastructure
        console.log(`🌟 ANY wildcard validation: ${playerRole} targeting compromised -> RESPONSE type`);
        break;
      default:
        validationCardType = isAttackerCard ? 'exploit' : 'shield';
        console.log(`🌟 ANY wildcard validation: ${playerRole} targeting ${targetInfrastructure.state} -> ${validationCardType.toUpperCase()} type (default)`);
        break;
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
  const infraValidation = validateTargetInfrastructure(G, targetInfrastructureId, playerCardValidation.card);
  if (!infraValidation.valid) {
    return { valid: false, message: infraValidation.message };
  }
  
  // Step 4: Check for D301 Advanced Threat Defense blocking reactive attacks
  const card = playerCardValidation.card!;
  const targetInfrastructure = infraValidation.targetInfrastructure;
  
  if (targetInfrastructure && (card.type === 'counter-attack' || (card.type === 'wildcard' && card.isReactive))) {
    const hasPreventReactions = TemporaryEffectsManager.hasEffect(G, 'prevent_reactions', targetInfrastructure.id);
    if (hasPreventReactions) {
      console.log(`🛡️ D301 BLOCK: Reactive attack card ${card.name} blocked by prevent_reactions effect on infrastructure ${targetInfrastructure.name}`);
      return {
        valid: false,
        message: `${card.name} is blocked by Advanced Threat Defense on ${targetInfrastructure.name}`
      };
    }
  }
  
  // Step 5: Determine effective card types
  const { effectiveCardType, validationCardType } = determineEffectiveCardType(
    card,
    targetInfrastructure,
    turnValidation.isAttacker
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