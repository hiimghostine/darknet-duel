import { Card, CardType, AttackVector } from 'shared-types/card.types';

/**
 * Type guard to check if a card has certain properties from our Card interface
 */
export function hasCardFeatures(card: any): card is Card & { 
  wildcardType?: string | CardType[], 
  draw?: number, 
  specialEffect?: string, 
  isReactive?: boolean, 
  preventReaction?: boolean, 
  attackVector?: AttackVector 
} {
  return card !== null && typeof card === 'object';
}
