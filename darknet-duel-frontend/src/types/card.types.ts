// IMPORTANT: Re-export everything from shared-types
// We want a true single source of truth without local duplications

// Direct exports from shared-types using path aliases configured in tsconfig.app.json
// When using Vite, we need to use the main index.ts export
export * from 'shared-types';

// Frontend-specific type extensions
// These are only for UI-specific needs that don't exist in the shared types
import type { CardEffect, CardType } from 'shared-types';

/**
 * Frontend-specific extensions to CardEffect
 * Only add properties that are truly frontend-only
 */
export interface FrontendCardEffect extends CardEffect {
  // UI-specific properties for effects
  isAnimating?: boolean;
  visualDuration?: number; // Visual duration for UI animations
}

/**
 * Helpers for card types
 */

// Determine if a card is an attacker card
export function isAttackerCard(type: CardType): boolean {
  const attackerCardTypes = ['exploit', 'attack', 'counter-attack', 'wildcard', 'counter'];
  return attackerCardTypes.includes(type);
}

// Determine if a card is a defender card
export function isDefenderCard(type: CardType): boolean {
  const defenderCardTypes = ['shield', 'fortify', 'response', 'reaction'];
  return defenderCardTypes.includes(type);
}

// Determine if a card can be played as a reaction
export function isReactiveCard(type: CardType): boolean {
  return type === 'reaction' || type === 'counter-attack' || type === 'counter';
}

// Determine if a card object can be played as a reaction
export function isReactiveCardObject(
  card: { type: CardType, isReactive?: boolean, id?: string, specialEffect?: string },
  gameState?: { infrastructure?: Array<{ state: string }> }
): boolean {
  // Check both isReactive flag and the proper card types
  const isProperReactiveType = card.type === 'reaction' || card.type === 'counter-attack';
  const isReactiveWildcard = card.type === 'wildcard' && card.isReactive === true;
  const isD307 = card.id?.startsWith('D307') || card.specialEffect === 'emergency_restore_shield';
  
  // Special condition for D307: only reactive if there's compromised infrastructure
  if (isD307 && gameState) {
    const hasCompromisedInfra = gameState.infrastructure?.some(infra => infra.state === 'compromised') || false;
    return hasCompromisedInfra;
  }
  
  return isProperReactiveType || isReactiveWildcard || isD307;
}
