/**
 * SHARED CARD TYPES
 * This file contains the definitive source of truth for card-related types
 * used by both frontend and backend.
 */

// Import InfrastructureState from game types
import type { InfrastructureState } from './game.types';

/**
 * Attack vectors for vulnerabilities
 * 
 * This has been updated to match the strings actually used in the backend.
 * The backend uses these values as strings in arrays, e.g. ['exploit', 'ddos', 'attack']
 */
export type AttackVector = 'exploit' | 'ddos' | 'attack' | 'network' | 'web' | 'social' | 'malware';

// Note: InfrastructureState is now defined in game.types.ts
// Import it from there instead of here

/**
 * Card types for both attacker and defender
 */
export type CardType = 
  // Attacker card types (Red Team)
  | 'exploit'        // Creates vulnerabilities in infrastructure (1 AP)
  | 'attack'         // Compromises vulnerable infrastructure (1 AP)
  | 'counter-attack' // Disrupts defender actions (reactive) (1 AP)
  | 'wildcard'       // Versatile cards (can be any type) (2 AP)
  
  // Defender card types (Blue Team)
  | 'shield'         // Protects infrastructure (1 AP)
  | 'fortify'        // Strengthens shielded infrastructure (2 AP)
  | 'response'       // Recovers compromised infrastructure (1 AP)
  | 'reaction'       // Counters attacker cards reactively (1 AP)
  
  // Legacy/Backend compatibility types
  | 'counter';       // Alias for 'counter-attack' used in backend code

/**
 * Effect that a card can have
 */
export interface CardEffect {
  type: string;
  value: number;
  description: string;
}

/**
 * Core Card interface - used by both frontend and backend
 * Any changes here should be synchronized to both systems
 */
export interface Card {
  // Core properties - essential for both systems
  id: string;
  name: string;
  type: CardType;
  cost: number;
  description: string;
  
  // These numeric values are legacy/optional - the game primarily uses state transitions
  power?: number;  // Optional: Only used if you need numeric impact values
  defense?: number; // Optional: Only used if you need numeric defense values
  
  // Target infrastructure state change (optional, describes the state this card creates)
  targetState?: InfrastructureState; // e.g., 'vulnerable', 'compromised', 'secure', 'fortified'
  
  // Card effects and behavior
  effects?: CardEffect[];
  isReactive?: boolean;    // Whether card can be played out of turn
  attackVector?: AttackVector; // The type of attack vector
  
  // Special abilities
  wildcardType?: CardType[] | string; // Types this wildcard can be played as (string in backend, array in frontend)
  draw?: number;          // Number of cards to draw when played
  lookAt?: number;        // Number of cards to look at
  specialEffect?: string; // Special effect identifier
  preventReaction?: boolean; // Whether card prevents reactions
  
  // Additional properties
  leadsTo?: string[];     // Cards this can lead to
  
  // Legacy/flexibility field for additional properties
  metadata?: Record<string, any>; // For storing additional card metadata
}

/**
 * Vulnerability applied to an infrastructure
 *
 * Note: The backend uses multiple formats for vulnerabilities:
 * 1. Simple strings in infrastructureCardLoader.ts (e.g., 'exploit', 'attack')
 * 2. Complex objects in playerActions.ts with vector, appliedBy, etc.
 * 3. AttackVector enum values directly
 * 
 * This type supports all these use cases.
 */
export type Vulnerability = AttackVector | string | {
  vector: AttackVector | string;  // Type of vulnerability
  appliedBy: string;       // ID of the card that applied it
  appliedByPlayer: string; // ID of the player who applied it
  timestamp: number;       // When it was applied
}

/**
 * Helper type for infrastructure vulnerabilities arrays
 * Used in infrastructureCardLoader.ts for the 'vulnerabilities' property
 */
export type VulnerabilityArray = Array<Vulnerability> | string[];

/**
 * Shield applied to an infrastructure
 */
export interface Shield {
  vector: AttackVector;     // Type of attack vector this shields against
  appliedBy: string;        // ID of the card that applied it
  appliedByPlayer: string;  // ID of the player who applied it
  timestamp: number;        // When it was applied
}
