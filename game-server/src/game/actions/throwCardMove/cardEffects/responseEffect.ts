import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';
import { createInfrastructureCards } from '../../../cards/infrastructureCardLoader';

/**
 * Get original vulnerabilities for an infrastructure card from its definition
 */
function getOriginalInfrastructureVulnerabilities(infrastructureId: string): string[] {
  const originalCards = createInfrastructureCards();
  const originalCard = originalCards.find(card => card.id === infrastructureId);
  
  if (originalCard && Array.isArray(originalCard.vulnerabilities)) {
    // Filter to only string vulnerabilities (original definition format)
    return originalCard.vulnerabilities.filter(v => typeof v === 'string') as string[];
  }
  
  return []; // Fallback to empty array if not found
}

/**
 * Apply response card effect to target infrastructure
 * Note: Persistent effect cleanup is handled at the throwCardMove level to avoid Immer violations
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
    console.log(`Response card ${card.name} restoring ${currentInfra.name} from compromised to secure`);
    
    // Get original vulnerabilities from infrastructure definition
    const originalVulnerabilities = getOriginalInfrastructureVulnerabilities(currentInfra.id);
    
    newInfrastructure[infraIndex] = {
      ...currentInfra,
      state: 'secure' as InfrastructureState,
      vulnerabilities: originalVulnerabilities, // Restore original vulnerabilities
      vulnerableVectors: currentInfra.vulnerableVectors // Explicitly preserve vulnerableVectors
    };
  }
  
  return newInfrastructure;
}
