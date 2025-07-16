/**
 * Frontend Wildcard Utilities
 * 
 * These utilities help handle wildcard card types in the frontend,
 * providing a consistent approach to wildcard handling across the application.
 */
import type { CardType } from '../../../shared-types/card.types';

/**
 * Get the effective card type for a wildcard card
 * 
 * @param cardType The original card type
 * @param wildcardType The wildcardType property (string or array)
 * @returns The effective card type to use
 */
export function getEffectiveCardType(
  cardType: CardType, 
  wildcardType?: CardType[] | string
): CardType {
  // If not a wildcard or no wildcardType specified, return the original type
  if (cardType !== 'wildcard' || !wildcardType) {
    return cardType;
  }
  
  // Handle array format (frontend style)
  if (Array.isArray(wildcardType) && wildcardType.length > 0) {
    return wildcardType[0];
  }
  
  // Handle string format (backend style)
  if (typeof wildcardType === 'string') {
    // Special case handling for compound types
    switch (wildcardType) {
      case 'shield_or_fortify':
        return 'shield';
      case 'exploit-attack':
        return 'exploit';
      case 'any':
        return 'wildcard'; // Keep as wildcard, will need special handling later
      default:
        // Try to cast to a valid CardType
        if (isValidCardType(wildcardType)) {
          return wildcardType as CardType;
        }
    }
  }
  
  // Default fallback
  return cardType;
}

/**
 * Check if a string is a valid CardType
 */
function isValidCardType(type: string): boolean {
  const validTypes = [
    'exploit', 'attack', 'counter-attack', 'wildcard',
    'shield', 'fortify', 'response', 'reaction', 'counter', 'special'
  ];
  return validTypes.includes(type);
}

/**
 * Get a list of all card types a wildcard can be played as
 * 
 * @param wildcardType The wildcardType property from the card
 * @returns Array of valid card types
 */
export function getAvailableCardTypes(wildcardType?: CardType[] | string): CardType[] {
  if (!wildcardType) {
    return [];
  }
  
  // Handle array format
  if (Array.isArray(wildcardType)) {
    return wildcardType.filter(isValidCardType);
  }
  
  // Handle string format
  switch (wildcardType) {
    case 'any':
      // For 'any' wildcards, return all possible card types in strategic order
      // Prioritize types that are more likely to have valid targets
      return ['special', 'exploit', 'attack', 'shield', 'fortify', 'response', 'reaction', 'counter-attack', 'counter'];
    case 'shield_or_fortify':
      return ['shield', 'fortify'];
    case 'exploit-attack':
      return ['exploit', 'attack'];
    case 'special':
      // Special effects cards - usually need targeting for chain effects
      return ['special'];
    case 'exploit':
      return ['exploit'];
    case 'attack':
      return ['attack'];
    case 'shield':
      return ['shield'];
    case 'fortify':
      return ['fortify'];
    case 'response':
      return ['response'];
    case 'reaction':
      return ['reaction'];
    default:
      // Try to interpret as a single card type
      return isValidCardType(wildcardType) ? [wildcardType as CardType] : [];
  }
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

/**
 * Determine if a wildcard card can be played as a specified type
 */
export function canPlayWildcardAs(
  wildcardType: CardType[] | string | undefined, 
  asType: CardType
): boolean {
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
