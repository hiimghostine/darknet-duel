/**
 * Wildcard Type Utilities
 * 
 * These utilities standardize the handling of wildcard types across both
 * frontend and backend codebases.
 */
import { CardType } from '../card.types';

/**
 * Normalized representation of wildcard types that can handle
 * both string and array formats consistently
 */
export type NormalizedWildcardType = CardType | 'any' | 'special' | 'shield_or_fortify' | 'exploit-attack' | 'draw' | 'disrupt';

/**
 * Get available card types from a wildcardType property
 * Handles both string and array representations
 * 
 * @param wildcardType The wildcardType property from a card (can be string or array)
 * @returns An array of available card types
 */
export function getAvailableCardTypes(wildcardType?: CardType[] | string): CardType[] {
  if (!wildcardType) {
    return [];
  }
  
  // Handle array format
  if (Array.isArray(wildcardType)) {
    return wildcardType;
  }
  
  // Handle string format
  // Map special combined types to their component types
  switch (wildcardType) {
    case 'any':
      // Only include valid CardType values from the union type
      return ['attack', 'exploit', 'counter-attack', 'counter', 'shield', 'response', 'fortify', 'reaction', 'wildcard'];
    case 'shield_or_fortify':
      return ['shield', 'fortify'];
    case 'exploit-attack':
      return ['exploit', 'attack'];
    // Handle other special string types
    case 'shield':
    case 'response':
    case 'attack':
    case 'exploit':
      return [wildcardType as CardType];
    case 'special':
    case 'draw':
    case 'disrupt':
      // These are special effect wildcards that don't map directly to card types
      return [];
    default:
      // Try to interpret as a single card type
      return [wildcardType as CardType];
  }
}

/**
 * Normalize wildcardType to a consistent format regardless of
 * whether it's a string or array in the original data
 * 
 * @param wildcardType The wildcardType property from a card
 * @returns A normalized representation of the wildcard type
 */
export function normalizeWildcardType(wildcardType?: CardType[] | string): NormalizedWildcardType | undefined {
  if (!wildcardType) {
    return undefined;
  }
  
  // If it's already an array, use the first type as the primary type
  if (Array.isArray(wildcardType)) {
    return wildcardType.length > 0 ? wildcardType[0] : undefined;
  }
  
  // If it's a string, return it directly
  return wildcardType as NormalizedWildcardType;
}

/**
 * Determines if a card with the given wildcardType can be played as the specified type
 * 
 * @param wildcardType The wildcardType property of the card
 * @param asType The card type to check if playable as
 * @returns true if the card can be played as the specified type
 */
export function canPlayWildcardAs(wildcardType: CardType[] | string | undefined, asType: CardType): boolean {
  if (!wildcardType) {
    return false;
  }
  
  const availableTypes = getAvailableCardTypes(wildcardType);
  
  // Special case for 'any' wildcard type
  if (typeof wildcardType === 'string' && wildcardType === 'any') {
    return true;
  }
  
  return availableTypes.includes(asType);
}

/**
 * Get a display string for wildcard types to show in UI
 * 
 * @param wildcardType The wildcardType property from a card
 * @returns A user-friendly string representing the wildcard options
 */
export function getWildcardTypeDisplay(wildcardType?: CardType[] | string): string {
  if (!wildcardType) {
    return '';
  }
  
  // If array, join the types
  if (Array.isArray(wildcardType)) {
    return wildcardType.join(', ');
  }
  
  // Handle special string formats
  switch (wildcardType) {
    case 'any':
      return 'Any Card Type';
    case 'shield_or_fortify':
      return 'Shield or Fortify';
    case 'exploit-attack':
      return 'Exploit or Attack';
    case 'special':
      return 'Special Effect';
    case 'draw':
      return 'Draw Effect';
    case 'disrupt':
      return 'Disruption Effect';
    default:
      // Try to capitalize the first letter
      return wildcardType.charAt(0).toUpperCase() + wildcardType.slice(1);
  }
}
