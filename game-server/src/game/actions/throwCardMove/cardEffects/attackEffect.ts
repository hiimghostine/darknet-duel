import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { Card, AttackVector } from 'shared-types/card.types';

/**
 * Apply attack card effect to target infrastructure
 * Returns the updated infrastructure array or null if the attack couldn't be performed
 * Returns { victory: true } if the attack results in attacker victory
 */
export function attackEffect(
  currentInfra: InfrastructureCard,
  infraIndex: number,
  updatedInfrastructure: InfrastructureCard[],
  card: Card,
  attackVector?: AttackVector,
  playerID?: string
): InfrastructureCard[] | null | { victory: true } {
  // Check if infrastructure is vulnerable to this attack vector
  if (!attackVector || !currentInfra.vulnerabilities) {
    console.log(`Missing attack vector or vulnerabilities for infrastructure ${currentInfra.id}`);
    return null;
  }
  
  console.log(`Checking if infrastructure ${currentInfra.id} is vulnerable to attack vector: ${attackVector}`);
  console.log(`Current vulnerabilities:`, currentInfra.vulnerabilities);
  
  // First check if the infrastructure is in vulnerable state
  if (currentInfra.state !== 'vulnerable') {
    console.log(`Infrastructure ${currentInfra.id} is not in vulnerable state, current state: ${currentInfra.state}`);
    return null;
  }
  
  // Then check if there's a matching vulnerability
  const isVulnerable = Array.isArray(currentInfra.vulnerabilities) && 
    currentInfra.vulnerabilities.some(v => {
      const match = typeof v === 'string' ? 
        v === attackVector : 
        (v && typeof v === 'object' && v.vector === attackVector);
      
      console.log(`Checking vulnerability ${JSON.stringify(v)} against ${attackVector}: ${match}`);
      return match;
    });
  
  console.log(`Is infrastructure vulnerable to this attack? ${isVulnerable}`);
  
  if (!isVulnerable) {
    return null;
  }
  
  console.log(`Successfully compromising infrastructure ${currentInfra.id}`);
  
  // Create a new infrastructure array
  const newInfrastructure = [...updatedInfrastructure];
  
  // Update the target infrastructure
  newInfrastructure[infraIndex] = {
    ...currentInfra,
    state: 'compromised' as InfrastructureState
  };
  
  // Check if this attack caused attacker to win
  // Count how many infrastructure cards are now compromised
  const compromisedCount = newInfrastructure.filter(
    infra => infra.state === 'compromised'
  ).length;
  
  console.log(`Compromised infrastructure count: ${compromisedCount}`);
  
  // Win condition: if more than half the infrastructure is compromised
  const infrastructureThreshold = Math.ceil(newInfrastructure.length / 2) + 1; // 3+ out of 5
  console.log(`Win threshold: ${infrastructureThreshold}`);
  
  if (compromisedCount >= infrastructureThreshold) {
    console.log(`Attacker wins with ${compromisedCount} compromised infrastructure!`);
    return { victory: true };
  }
  
  return newInfrastructure;
}
