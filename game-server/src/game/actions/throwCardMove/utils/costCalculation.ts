import { GameState } from 'shared-types/game.types';
import { Card, AttackVector } from 'shared-types/card.types';
import { TemporaryEffectsManager } from '../../temporaryEffectsManager';

/**
 * Cost calculation utilities for throw card move
 * Handles all cost reduction logic and action point validation
 */

export interface CostCalculationContext {
  card: Card;
  targetInfrastructure: any;
  G: GameState;
  player: any;
  validationResult?: any;
}

export interface CostCalculationResult {
  effectiveCost: number;
  canAfford: boolean;
  reductions: Array<{
    type: string;
    amount: number;
    reason: string;
  }>;
}

/**
 * Calculates base cost reductions from validation bypass
 */
export function calculateValidationBypassReduction(
  baseCost: number,
  validationResult: any
): { cost: number; reduction?: { type: string; amount: number; reason: string } } {
  if (validationResult?.bypassCost) {
    const reduction = 1;
    const newCost = Math.max(0, baseCost - reduction);
    console.log(`Wildcard cost reduction: Cost reduced from ${baseCost} to ${newCost}`);
    
    return {
      cost: newCost,
      reduction: {
        type: 'validation_bypass',
        amount: reduction,
        reason: 'Wildcard validation bypass'
      }
    };
  }
  
  return { cost: baseCost };
}

/**
 * Calculates Living Off The Land (A302) specific cost reduction
 */
export function calculateLivingOffTheLandReduction(
  baseCost: number,
  card: Card,
  targetInfrastructure: any
): { cost: number; reduction?: { type: string; amount: number; reason: string } } {
  if (card.id === 'A302' && targetInfrastructure.type === 'user') {
    const reduction = 1;
    const newCost = Math.max(0, baseCost - reduction);
    console.log(`Living Off The Land cost reduction: ${baseCost} -> ${newCost} (user systems target)`);
    
    return {
      cost: newCost,
      reduction: {
        type: 'living_off_the_land',
        amount: reduction,
        reason: 'Living Off The Land targeting user systems'
      }
    };
  }
  
  return { cost: baseCost };
}

/**
 * Calculates card-specific cost reduction properties
 */
export function calculateCardSpecificReduction(
  baseCost: number,
  card: Card,
  targetInfrastructure: any
): { cost: number; reduction?: { type: string; amount: number; reason: string } } {
  const cardWithCostReduction = card as any;
  
  if (cardWithCostReduction.costReduction && 
      targetInfrastructure.type === cardWithCostReduction.costReduction.target.replace('_systems', '')) {
    const reductionAmount = cardWithCostReduction.costReduction.amount;
    const newCost = Math.max(0, baseCost - reductionAmount);
    console.log(`Card-specific cost reduction: ${baseCost} -> ${newCost} (${cardWithCostReduction.costReduction.target} target)`);
    
    return {
      cost: newCost,
      reduction: {
        type: 'card_specific',
        amount: reductionAmount,
        reason: `Card targets ${cardWithCostReduction.costReduction.target}`
      }
    };
  }
  
  return { cost: baseCost };
}

/**
 * Calculates temporary effects cost reduction
 */
export function calculateTemporaryEffectsReduction(
  baseCost: number,
  G: GameState,
  targetInfrastructure: any
): { cost: number; reduction?: { type: string; amount: number; reason: string } } {
  if (TemporaryEffectsManager.hasEffect(G, 'cost_reduction', targetInfrastructure.id)) {
    const reduction = 1; // Default reduction amount
    const newCost = Math.max(0, baseCost - reduction);
    console.log(`Cost reduction effect applied: Cost reduced to ${newCost}`);
    
    return {
      cost: newCost,
      reduction: {
        type: 'temporary_effect',
        amount: reduction,
        reason: 'Temporary cost reduction effect'
      }
    };
  }
  
  return { cost: baseCost };
}

/**
 * Validates if player can afford the effective cost
 */
export function validateActionPointsAffordability(
  player: any,
  effectiveCost: number
): { canAfford: boolean; message?: string } {
  if (player.actionPoints < effectiveCost) {
    return { 
      canAfford: false,
      message: "Not enough action points to throw this card"
    };
  }
  
  return { canAfford: true };
}

/**
 * Complete cost calculation pipeline
 */
export function calculateEffectiveCost(context: CostCalculationContext): CostCalculationResult {
  const { card, targetInfrastructure, G, player, validationResult } = context;
  
  console.log(`=== COST CALCULATION START ===`);
  console.log(`Base cost: ${card.cost} for card ${card.name}`);
  
  let currentCost = card.cost;
  const reductions: Array<{ type: string; amount: number; reason: string }> = [];
  
  // Apply validation bypass reduction
  const bypassResult = calculateValidationBypassReduction(currentCost, validationResult);
  currentCost = bypassResult.cost;
  if (bypassResult.reduction) {
    reductions.push(bypassResult.reduction);
  }
  
  // Apply Living Off The Land reduction
  const lotlResult = calculateLivingOffTheLandReduction(currentCost, card, targetInfrastructure);
  currentCost = lotlResult.cost;
  if (lotlResult.reduction) {
    reductions.push(lotlResult.reduction);
  }
  
  // Apply card-specific reduction
  const cardSpecificResult = calculateCardSpecificReduction(currentCost, card, targetInfrastructure);
  currentCost = cardSpecificResult.cost;
  if (cardSpecificResult.reduction) {
    reductions.push(cardSpecificResult.reduction);
  }
  
  // Apply temporary effects reduction
  const tempEffectResult = calculateTemporaryEffectsReduction(currentCost, G, targetInfrastructure);
  currentCost = tempEffectResult.cost;
  if (tempEffectResult.reduction) {
    reductions.push(tempEffectResult.reduction);
  }
  
  // Validate affordability
  const affordabilityResult = validateActionPointsAffordability(player, currentCost);
  
  console.log(`Final effective cost: ${currentCost} (original: ${card.cost})`);
  if (reductions.length > 0) {
    console.log(`Applied ${reductions.length} cost reductions:`, reductions);
  }
  
  return {
    effectiveCost: currentCost,
    canAfford: affordabilityResult.canAfford,
    reductions
  };
}