import { Card, AttackVector } from 'shared-types/card.types';
import { hasCardFeatures } from '../../utils/typeGuards';

/**
 * Attack vector resolution utilities for throw card move
 * Handles attack vector determination and fallback logic
 */

export interface AttackVectorContext {
  card: Card;
  targetInfrastructure: any;
}

export interface AttackVectorResult {
  attackVector: AttackVector;
  source: 'explicit' | 'metadata' | 'wildcard_target' | 'fallback';
  reason: string;
}

/**
 * Gets attack vector from card's explicit attackVector property
 */
export function getExplicitAttackVector(card: Card): AttackVector | undefined {
  const extendedCard = hasCardFeatures(card) ? card : card;
  return extendedCard.attackVector as AttackVector | undefined;
}

/**
 * Gets attack vector from card's metadata.category or direct category property
 */
export function getMetadataAttackVector(card: Card): AttackVector | undefined {
  const extendedCard = hasCardFeatures(card) ? card : card;
  
  // If no explicit attackVector, try to get it from metadata.category
  if (extendedCard.metadata && extendedCard.metadata.category &&
      extendedCard.metadata.category !== 'any') {
    // Cast the category to AttackVector if it's one of our known values
    return extendedCard.metadata.category as AttackVector;
  }
  
  // For non-wildcard cards, try to get attack vector from card data category property
  if (card.type !== 'wildcard') {
    const cardWithCategory = card as any;
    if (cardWithCategory.category && cardWithCategory.category !== 'any') {
      return cardWithCategory.category as AttackVector;
    }
  }
  
  return undefined;
}

/**
 * Gets attack vector for wildcards based on target infrastructure
 */
export function getWildcardAttackVector(card: Card, targetInfrastructure: any): AttackVector | undefined {
  if (card.type !== 'wildcard' || !targetInfrastructure) {
    return undefined;
  }
  
  // Use the target infrastructure's first vulnerable vector as default
  if (targetInfrastructure.vulnerableVectors && targetInfrastructure.vulnerableVectors.length > 0) {
    const vector = targetInfrastructure.vulnerableVectors[0] as AttackVector;
    console.log(`Using default attack vector for wildcard: ${vector}`);
    return vector;
  }
  
  return undefined;
}

/**
 * Provides fallback attack vector when no other source is available
 */
export function getFallbackAttackVector(): AttackVector {
  // Ultimate fallback - use 'network' as default
  const fallback = 'network' as AttackVector;
  console.log(`Using fallback attack vector: ${fallback}`);
  return fallback;
}

/**
 * Resolves attack vector with comprehensive fallback logic
 */
export function resolveAttackVector(context: AttackVectorContext): AttackVectorResult {
  const { card, targetInfrastructure } = context;
  
  console.log(`=== ATTACK VECTOR RESOLUTION START ===`);
  console.log(`Resolving attack vector for card: ${card.name} (${card.id})`);
  
  // Priority 1: Explicit attack vector
  const explicitVector = getExplicitAttackVector(card);
  if (explicitVector) {
    console.log(`Card ${card.name} has explicit attack vector: ${explicitVector}`);
    return {
      attackVector: explicitVector,
      source: 'explicit',
      reason: 'Card has explicit attackVector property'
    };
  }
  
  // Priority 2: Metadata category
  const metadataVector = getMetadataAttackVector(card);
  if (metadataVector) {
    console.log(`Card ${card.name} has metadata attack vector: ${metadataVector}`);
    return {
      attackVector: metadataVector,
      source: 'metadata',
      reason: 'Derived from card metadata.category'
    };
  }
  
  // Priority 3: Wildcard target-based vector
  const wildcardVector = getWildcardAttackVector(card, targetInfrastructure);
  if (wildcardVector) {
    console.log(`Card ${card.name} using wildcard attack vector: ${wildcardVector}`);
    return {
      attackVector: wildcardVector,
      source: 'wildcard_target',
      reason: 'Derived from target infrastructure vulnerable vectors'
    };
  }
  
  // Priority 4: Ultimate fallback
  const fallbackVector = getFallbackAttackVector();
  console.log(`Card ${card.name} using fallback attack vector: ${fallbackVector}`);
  return {
    attackVector: fallbackVector,
    source: 'fallback',
    reason: 'No specific attack vector found, using network as default'
  };
}

/**
 * Validates that the resolved attack vector is compatible with the target
 */
export function validateAttackVectorCompatibility(
  attackVector: AttackVector,
  targetInfrastructure: any
): { compatible: boolean; reason?: string } {
  // Check if target infrastructure is vulnerable to this attack vector
  if (targetInfrastructure.vulnerableVectors && 
      targetInfrastructure.vulnerableVectors.length > 0) {
    const isCompatible = targetInfrastructure.vulnerableVectors.includes(attackVector);
    
    if (!isCompatible) {
      return {
        compatible: false,
        reason: `Target infrastructure is not vulnerable to ${attackVector} attacks. Vulnerable to: ${targetInfrastructure.vulnerableVectors.join(', ')}`
      };
    }
  }
  
  return { compatible: true };
}

/**
 * Complete attack vector resolution with validation
 */
export function resolveAndValidateAttackVector(context: AttackVectorContext): {
  success: boolean;
  attackVector?: AttackVector;
  source?: string;
  reason?: string;
  error?: string;
} {
  const resolution = resolveAttackVector(context);
  const validation = validateAttackVectorCompatibility(resolution.attackVector, context.targetInfrastructure);
  
  if (!validation.compatible) {
    return {
      success: false,
      error: validation.reason
    };
  }
  
  console.log(`Attack vector resolution successful: ${resolution.attackVector} (${resolution.source})`);
  
  return {
    success: true,
    attackVector: resolution.attackVector,
    source: resolution.source,
    reason: resolution.reason
  };
}