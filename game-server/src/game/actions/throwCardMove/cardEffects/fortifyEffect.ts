import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Apply fortify card effect to target infrastructure
 */
export function fortifyEffect(
  currentInfra: InfrastructureCard,
  infraIndex: number,
  updatedInfrastructure: InfrastructureCard[],
  card: Card
): InfrastructureCard[] {
  // Make a copy of the infrastructure array
  const newInfrastructure = [...updatedInfrastructure];
  
  // Apply fortification only if infrastructure is shielded
  if (currentInfra.state === 'shielded') {
    newInfrastructure[infraIndex] = {
      ...currentInfra,
      state: 'fortified' as InfrastructureState
    };
  }
  
  return newInfrastructure;
}
