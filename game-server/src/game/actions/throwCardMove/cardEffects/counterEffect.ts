import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Apply counter-attack card effect to target infrastructure
 */
export function counterEffect(
  currentInfra: InfrastructureCard,
  infraIndex: number,
  updatedInfrastructure: InfrastructureCard[],
  card: Card
): InfrastructureCard[] {
  // Make a copy of the infrastructure array
  const newInfrastructure = [...updatedInfrastructure];
  
  console.log(`Processing counter-attack card ${card.name} targeting ${currentInfra.name}`);
  
  // Counter-attack cards can ONLY cancel out shield effects on shielded infrastructure
  // They CANNOT break down fortified infrastructure (that requires special attack cards)
  if (currentInfra.state === 'shielded') {
    console.log(`Cancelling shield on infrastructure ${currentInfra.name}`);
    newInfrastructure[infraIndex] = {
      ...currentInfra,
      state: 'secure' as InfrastructureState,
      shields: [] // Clear shields
    };
    console.log(`Infrastructure ${currentInfra.name} returned to secure state`);
  } else if (currentInfra.state === 'fortified') {
    console.log(`Target infrastructure ${currentInfra.name} is fortified - counter-attack cards cannot break down fortified infrastructure`);
  } else {
    console.log(`Target infrastructure ${currentInfra.name} is not shielded, counter-attack had no effect`);
  }
  
  return newInfrastructure;
}
