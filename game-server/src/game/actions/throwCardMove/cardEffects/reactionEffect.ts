import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Apply reaction card effect to target infrastructure
 * Note: Persistent effect cleanup is handled at the throwCardMove level to avoid Immer violations
 */
export function reactionEffect(
  currentInfra: InfrastructureCard,
  infraIndex: number,
  updatedInfrastructure: InfrastructureCard[],
  card: Card
): InfrastructureCard[] {
  // Make a copy of the infrastructure array
  const newInfrastructure = [...updatedInfrastructure];
  
  console.log(`Processing reaction card ${card.name} targeting ${currentInfra.name}`);
  
  // Reaction cards can ONLY cancel out exploit effects on vulnerable infrastructure
  // They CANNOT restore compromised infrastructure (that requires special cards like D307)
  if (currentInfra.state === 'vulnerable') {
    console.log(`Cancelling vulnerability on infrastructure ${currentInfra.name}`);
    
    newInfrastructure[infraIndex] = {
      ...currentInfra,
      state: 'secure' as InfrastructureState,
      vulnerabilities: [] // Clear vulnerabilities
    };
    console.log(`Infrastructure ${currentInfra.name} returned to secure state`);
  } else if (currentInfra.state === 'compromised') {
    console.log(`Target infrastructure ${currentInfra.name} is compromised - reaction cards cannot restore compromised infrastructure`);
  } else {
    console.log(`Target infrastructure ${currentInfra.name} is not vulnerable, reaction had no effect`);
  }
  
  return newInfrastructure;
}
