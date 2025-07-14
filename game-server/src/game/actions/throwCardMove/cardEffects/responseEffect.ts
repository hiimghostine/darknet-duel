import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Apply response card effect to target infrastructure
 */
export function responseEffect(
  currentInfra: InfrastructureCard,
  infraIndex: number,
  updatedInfrastructure: InfrastructureCard[],
  card: Card
): InfrastructureCard[] {
  // Make a copy of the infrastructure array
  const newInfrastructure = [...updatedInfrastructure];
  
  // Response cards recover compromised infrastructure
  if (currentInfra.state === 'compromised') {
    newInfrastructure[infraIndex] = {
      ...currentInfra,
      state: 'secure' as InfrastructureState,
      vulnerabilities: [] // Clear vulnerabilities
    };
  }
  
  return newInfrastructure;
}
