import { InfrastructureCard } from 'shared-types/game.types';
import { Card, AttackVector } from 'shared-types/card.types';
import { exploitEffect } from './exploitEffect';
import { attackEffect } from './attackEffect';
import { shieldEffect } from './shieldEffect';
import { fortifyEffect } from './fortifyEffect';
import { responseEffect } from './responseEffect';
import { reactionEffect } from './reactionEffect';
import { counterEffect } from './counterEffect';

/**
 * Apply card effect based on card type
 * Returns updated infrastructure array or special result
 */
export function applyCardEffect(
  cardType: string,
  currentInfra: InfrastructureCard,
  infraIndex: number,
  allInfrastructure: InfrastructureCard[],
  card: Card,
  attackVector?: AttackVector,
  playerID?: string
): InfrastructureCard[] | null | { victory: true } {
  switch (cardType) {
    case 'exploit':
      return exploitEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
      
    case 'attack':
      return attackEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
      
    case 'shield':
      return shieldEffect(currentInfra, infraIndex, allInfrastructure, card, attackVector, playerID);
      
    case 'fortify':
      return fortifyEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    case 'response':
      return responseEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    case 'reaction':
      return reactionEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    case 'counter-attack':
    case 'counter':
      return counterEffect(currentInfra, infraIndex, allInfrastructure, card);
      
    default:
      return allInfrastructure; // No change
  }
}

// Re-export all effect handlers for direct access
export {
  exploitEffect,
  attackEffect,
  shieldEffect,
  fortifyEffect,
  responseEffect,
  reactionEffect,
  counterEffect
};
