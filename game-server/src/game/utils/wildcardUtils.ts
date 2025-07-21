/**
 * Wildcard Card Utilities
 * 
 * Centralized functions to handle wildcard card types and behavior
 */
import { CardType } from 'shared-types/card.types';

/**
 * Get the effective card type for a wildcard card
 * Handles both string and array formats for wildcardType consistently
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
      case 'special':
        return 'wildcard'; // Keep as wildcard, will need special handling later
      default:
        // For single card types like 'exploit', 'attack', etc., keep as wildcard
        // This ensures they go through the wildcard system for proper processing
        if (isValidCardType(wildcardType)) {
          return 'wildcard'; // Keep as wildcard to trigger proper wildcard processing
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
      return ['attack', 'exploit', 'counter-attack', 'counter',
              'shield', 'response', 'fortify', 'reaction'];
    case 'shield_or_fortify':
      return ['shield', 'fortify'];
    case 'exploit-attack':
      return ['exploit', 'attack'];
    case 'special':
      // Special cards like Security Automation Suite can be shield or fortify
      return ['shield', 'fortify'];
    default:
      // Try to interpret as a single card type
      return isValidCardType(wildcardType) ? [wildcardType as CardType] : [];
  }
}

/**
 * Check if a wildcard card can be played as a specific card type
 * 
 * @param wildcardType The wildcardType property from the card
 * @param asType The target card type to check
 * @returns true if the wildcard can be played as the specified type
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

/**
 * Get a display name for the wildcard type
 * 
 * @param wildcardType The wildcardType property from the card
 * @returns A user-friendly string for display
 */
export function getWildcardTypeDisplay(wildcardType?: CardType[] | string): string {
  if (!wildcardType) {
    return '';
  }
  
  // Handle array format
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
    default:
      // Try to capitalize the first letter
      return wildcardType.charAt(0).toUpperCase() + wildcardType.slice(1);
  }
}
