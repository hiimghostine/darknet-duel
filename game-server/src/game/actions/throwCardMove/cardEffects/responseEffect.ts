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
  
  // Special handling for D307 - skip normal response logic as it's handled by wildcard effect
  if (card.id.startsWith('D307') || card.specialEffect === 'emergency_restore_shield') {
    console.log(`🚨 Skipping normal response effect for ${card.name} - special effect handles restoration and shielding`);
    return newInfrastructure; // Return unchanged - wildcard effect already handled it
  }
  
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
