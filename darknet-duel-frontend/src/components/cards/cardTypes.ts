// Card types for Darknet Duel
import { Card, CardType as SharedCardType, AttackVector, CardEffect } from 'shared-types/card.types';

// Re-export shared card type for usage in the game server
export type CardType = SharedCardType;

// Category types
export type CardCategory = 'network' | 'web' | 'data' | 'social' | 'malware' | 'any';

// Target types
export type CardTarget = 'infrastructure' | 'vulnerable' | 'compromised' | 'any' | 'shield' | 'fortify' | 'opponent_hand' | 'self' | 'shielded';

// Common base type for the specialized cards - extends the shared Card type
export interface GameCard extends Card {
  // Additional properties specific to the game server
  category: CardCategory | string;
  flavor: string;
  effect: string;
  img: string;
  target: CardTarget | string;
}

// Attacker card specific fields
export interface AttackerCard extends GameCard {
  // Fields specific to attacker cards
  vulnerability?: string; // For "exploit" cards
  leadsTo?: string[]; // Card IDs this can lead to
  wildcardType?: string; // For "wildcard" cards
  specialEffect?: string;
  counterType?: string; // For "counter-attack" cards
  attackValue?: number;
  requires?: string;
  onCompromise?: { effect: string; amount: number };
  costReduction?: { target: string; amount: number };
  draw?: number;
  lookAt?: number;
}

// Defender card specific fields
export interface DefenderCard extends GameCard {
  // Fields specific to defender cards
  wildcardType?: string;
  draw?: number;
  additionalPlays?: number;
}

// Collection types for the JSON files
export interface CardCollection<T> {
  version: string;
  lastUpdated: string;
  cards: T[];
}

export interface AttackerCardCollection extends CardCollection<AttackerCard> {}
export interface DefenderCardCollection extends CardCollection<DefenderCard> {}
