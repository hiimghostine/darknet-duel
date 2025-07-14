// Import shared types for consistency between frontend and backend
import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { AttackVector } from 'shared-types/card.types';

/**
 * Type adaptation helpers
 * 
 * These functions help bridge the gap between string literals used in the codebase
 * and the strongly typed shared interfaces. This approach allows us to gradually
 * migrate to shared types without breaking the existing code.
 */

/**
 * Convert a state string to InfrastructureState type
 * Used for the 'state' property of infrastructure cards
 */
const asInfraState = (state: string): InfrastructureState => state as InfrastructureState;

/**
 * Convert a single attack vector string to AttackVector type
 */
const asAttackVector = (v: string): AttackVector => v as AttackVector;

/**
 * Convert an array of attack vector strings to AttackVector[] type
 * Used for the 'vulnerableVectors' property of infrastructure cards
 */
const asAttackVectorArray = (vectors: string[]): AttackVector[] => 
  vectors.map(v => asAttackVector(v));

/**
 * Create a string array from vulnerability vectors
 * The shared type InfrastructureCard.vulnerabilities expects string[] not objects
 */
const asVulnStringArray = (vulns: string[]): string[] => vulns;

/**
 * No longer needed - the InfrastructureCard now uses string[] directly for vulnerabilities
 * This simplifies our code and makes it more compatible with the JSON data format
 */

/**
 * Helper to create properly typed infrastructure cards
 * @param card The card data
 * @param type The specific infrastructure type (network, web, data, user, critical)
 */
const asInfraCard = (card: Partial<InfrastructureCard>, type: string): InfrastructureCard => {
  return {
    type,
    ...card
  } as InfrastructureCard;
};

/**
 * Creates the infrastructure cards for the game
 * Infrastructure Cards (5 cards total):
 * 1. Server - Core computing system
 * 2. Firewall - Network security
 * 3. Database - Information storage
 * 4. Website - Public web presence
 * 5. Cloud - Remote services
 * 
 * Each card has:
 * - id: Unique identifier
 * - name: Display name
 * - description: Short description
 * - flavor: Flavor text for immersion
 * - vulnerableVectors: Which attack vectors this card is vulnerable to
 * - vulnerabilities: Any current vulnerabilities on the card
 * - state: Current state of the card (neutral, secure, vulnerable, etc)
 * - img: Path to card image
 */
export const createInfrastructureCards = (): InfrastructureCard[] => {
  return [
    // Core infrastructure elements based on the JSON data
    asInfraCard({
      id: 'I001',
      name: 'Enterprise Firewall',
      description: 'Primary perimeter defense system',
      flavor: 'The first line of defense against external threats',
      vulnerableVectors: asAttackVectorArray(['network']),
      vulnerabilities: ['network'],
      img: 'assets/cards/infra/firewall.png',
      state: asInfraState('secure'), // Initial state is secure, not neutral
    }, 'network'),
    
    asInfraCard({
      id: 'I003',
      name: 'Corporate Website',
      description: 'Public-facing web presence',
      flavor: 'Your company\'s digital storefront',
      vulnerableVectors: asAttackVectorArray(['web']),
      vulnerabilities: ['web'],
      img: 'assets/cards/infra/website.png',
      state: asInfraState('secure'), // Initial state is secure, not neutral
    }, 'web'),
    
    asInfraCard({
      id: 'I005',
      name: 'Main Database Cluster', 
      description: 'Primary data storage for all operations',
      flavor: 'The crown jewels of corporate information',
      vulnerableVectors: asAttackVectorArray(['network', 'web']),
      vulnerabilities: ['network', 'web'],
      img: 'assets/cards/infra/database.png',
      state: asInfraState('secure'), // Initial state is secure, not neutral
    }, 'data'),
    
    asInfraCard({
      id: 'I007',
      name: 'Employee Workstations',
      description: 'End-user computing devices',
      flavor: 'As secure as the humans using them',
      vulnerableVectors: asAttackVectorArray(['social', 'malware']),
      vulnerabilities: ['social', 'malware'],
      img: 'assets/cards/infra/workstation.png',
      state: asInfraState('secure'), // Initial state is secure, not neutral
    }, 'user'),
    
    asInfraCard({
      id: 'I009',
      name: 'Financial System',
      description: 'Core accounting and payment platform',
      flavor: 'Where the money moves - a prime target',
      vulnerableVectors: asAttackVectorArray(['network', 'web', 'malware']),
      vulnerabilities: ['network', 'web', 'malware'],
      img: 'assets/cards/infra/financial.png',
      state: asInfraState('secure'), // Initial state is secure, not neutral
    }, 'critical')
  ];
};

/**
 * Creates a shuffled infrastructure deck
 * @returns Shuffled array of infrastructure cards
 */
export const createInfrastructureDeck = (): InfrastructureCard[] => {
  // In the standard game, we always use all 5 infrastructure cards
  return createInfrastructureCards();
};
