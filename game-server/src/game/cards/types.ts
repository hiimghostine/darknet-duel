// Card type definitions for Darknet Duel
// CANONICAL SOURCE OF TRUTH: This file contains the primary definitions
// for card-related types that are used throughout the game server.
// IMPORTANT: Any changes to these types must be reflected in the frontend types:
// - darknet-duel-frontend/src/types/card.types.ts

/**
 * Attack vectors for vulnerabilities
 */
export type AttackVector = 'network' | 'web' | 'social' | 'malware';

/**
 * Infrastructure card states
 */
export type InfrastructureState = 'secure' | 'vulnerable' | 'shielded' | 'compromised' | 'fortified';

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
  | 'response';      // Recovers compromised infrastructure (1 AP)

/**
 * Vulnerability applied to an infrastructure
 */
export interface Vulnerability {
  vector: AttackVector;    // Type of vulnerability
  appliedBy: string;      // ID of the card that applied it
  appliedByPlayer: string; // ID of the player who applied it
  timestamp: number;      // When it was applied
}

/**
 * Shield applied to an infrastructure
 */
export interface Shield {
  vector: AttackVector;     // Type of attack vector this shields against
  appliedBy: string;       // ID of the card that applied it
  appliedByPlayer: string;  // ID of the player who applied it
  timestamp: number;       // When it was applied
}

/**
 * Infrastructure card type
 */
export interface InfrastructureCard {
  id: string;
  name: string;
  type: 'network' | 'web' | 'data' | 'user' | 'critical';
  description: string;
  flavor: string;              // Flavor text
  vulnerableVectors: AttackVector[]; // Attack vectors this infrastructure is naturally susceptible to
  vulnerabilities: Vulnerability[]; // Currently applied vulnerabilities
  shields: Shield[];          // Currently applied shields
  img: string;                // Card image URL
  state: InfrastructureState; // Current infrastructure state
}

/**
 * Card effect definition
 */
export interface CardEffect {
  type: string;            // Type of effect
  value: number | string;  // Effect value or target
  description: string;     // Effect description
}

/**
 * Base game card
 */
export interface Card {
  id: string;
  name: string;
  type: CardType;              // Card type
  cost: number;                // Action point cost
  description: string;         // Card description
  isReactive?: boolean;        // Whether this card can be played during opponent's turn
  attackVector?: AttackVector; // For exploit/attack/shield cards - what vector they target
  effects?: CardEffect[];      // Card effects
  leadsTo?: string[];          // IDs of cards that synergize with this one
  wildcardType?: CardType[];   // For wildcard cards - what types they can be played as
  specialEffect?: string;      // Any special effects
  draw?: number;               // Number of cards to draw when played
  lookAt?: number;             // Number of cards to look at when played
  preventReaction?: boolean;   // Whether this card prevents reactions
  playable?: boolean;          // Whether this card is currently playable (client-side)
}

/**
 * Card collection containing metadata and cards
 */
export interface CardCollection<T> {
  version: string;
  lastUpdated: string;
  cards: T[];
}

// Specific collection for infrastructure cards
export type InfrastructureCollection = CardCollection<InfrastructureCard>;

// Specific collections for attacker and defender cards
export type AttackerCollection = CardCollection<Card>;
export type DefenderCollection = CardCollection<Card>;

