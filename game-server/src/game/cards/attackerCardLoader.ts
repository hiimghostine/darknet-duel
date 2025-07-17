import * as fs from 'fs';
import * as path from 'path';
import { Card, CardType, CardEffect, AttackVector } from 'shared-types/card.types';
import { AttackerCardCollection, AttackerCard } from './cardTypes';

/**
 * Loads attacker cards from JSON file and converts them to game Card type
 * @returns Array of attacker cards
 */
export const loadAttackerCards = (): Card[] => {
  try {
    // Read the JSON file
    const filePath = path.join(__dirname, 'attacker.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const cardData: AttackerCardCollection = JSON.parse(rawData);
    
    console.log(`Loaded ${cardData.cards.length} attacker cards`);
    
    // Convert AttackerCard to standard Card format
    return cardData.cards.map((attackerCard: AttackerCard): Card => {
      // Debug logging for A302 specifically
      if (attackerCard.id === 'A302') {
        console.log(`🔧 CARD LOADER: Processing A302 - Living Off The Land`);
        console.log(`🔧 CARD LOADER: Original attackerCard:`, attackerCard);
        console.log(`🔧 CARD LOADER: costReduction property:`, (attackerCard as any).costReduction);
      }
      // Ensure type is a valid CardType
      const cardType = attackerCard.type as CardType;
      
      // Map specialEffect to preventReaction if it matches
      const preventReaction = attackerCard.specialEffect === 'prevent_reactions';
      
      // Handle wildcardType which can be string or array in shared types
      let wildcardType: string | CardType[] | undefined = undefined;
      if (attackerCard.wildcardType) {
        // In the backend, we can store the original string value directly
        // This is compatible with shared types which accepts string | CardType[]
        wildcardType = attackerCard.wildcardType;
      }
      
      return {
        id: attackerCard.id,
        name: attackerCard.name,
        type: cardType,
        cost: attackerCard.cost,
        power: attackerCard.cost, // Use cost as a base power value
        description: `${attackerCard.description}\n${attackerCard.effect}`,
        // Map fields needed by our new card system
        isReactive: attackerCard.isReactive || false,
        wildcardType: wildcardType,
        specialEffect: attackerCard.specialEffect,
        preventReaction,
        // Map vulnerability to attackVector for compatibility
        attackVector: attackerCard.vulnerability as AttackVector | undefined,

        effects: [
          {
            type: attackerCard.type,
            value: attackerCard.cost,
            description: attackerCard.effect
          },
          // Add additional effects based on specialized fields
          ...(attackerCard.specialEffect ? [{
            type: 'special',
            value: 0,
            description: attackerCard.specialEffect
          }] : [])
        ],
        // Add custom metadata
        metadata: {
          category: attackerCard.category,
          isReactive: attackerCard.isReactive,
          target: attackerCard.target,
          img: attackerCard.img,
          flavor: attackerCard.flavor,
          // Add specialized fields
          ...(attackerCard.vulnerability && { vulnerability: attackerCard.vulnerability }),
          ...(attackerCard.leadsTo && { leadsTo: attackerCard.leadsTo }),
          ...(attackerCard.wildcardType && { wildcardType: attackerCard.wildcardType }),
          ...(attackerCard.counterType && { counterType: attackerCard.counterType }),
          ...(attackerCard.requires && { requires: attackerCard.requires }),
          // Include cost reduction property if it exists
          ...((attackerCard as any).costReduction && { costReduction: (attackerCard as any).costReduction })
        }
      };
    });
  } catch (error) {
    console.error('Error loading attacker cards:', error);
    return []; // Return empty array on error
  }
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns The shuffled array
 */
export function shuffleCards<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a deck of attacker cards, shuffled and ready for play, following
 * distribution rules:
 * - Exploit cards (36 total):
 *   - 9 Network Exploits
 *   - 9 Web Exploits
 *   - 9 Social Engineering Exploits
 *   - 9 Malware Exploits
 * - Attack cards (20 total):
 *   - 5 Network Attacks
 *   - 5 Web Attacks
 *   - 5 Social Engineering Attacks
 *   - 5 Malware Attacks
 * - Counter-Attack cards (8 total):
 *   - 2 Network Counter-Attacks
 *   - 2 Web Counter-Attacks
 *   - 2 Social Engineering Counter-Attacks
 *   - 2 Malware Counter-Attacks
 * - Wildcard cards (6 total)
 * 
 * @returns Shuffled deck of attacker cards
 */
export const createAttackerDeck = (): Card[] => {
  const allCards = loadAttackerCards();
  
  // Group cards by type and subcategory using metadata.category
  const exploitCards = allCards.filter(card => card.type === 'exploit');
  const attackCards = allCards.filter(card => card.type === 'attack');
  const counterAttackCards = allCards.filter(card => card.type === 'counter-attack');
  const wildcardCards = allCards.filter(card => card.type === 'wildcard');
  
  // Further categorize each card type by target/category
  const networkExploits = exploitCards.filter(card => card.metadata?.category === 'network');
  const webExploits = exploitCards.filter(card => card.metadata?.category === 'web');
  const socialExploits = exploitCards.filter(card => card.metadata?.category === 'social');
  const malwareExploits = exploitCards.filter(card => card.metadata?.category === 'malware');
  
  const networkAttacks = attackCards.filter(card => card.metadata?.category === 'network');
  const webAttacks = attackCards.filter(card => card.metadata?.category === 'web');
  const socialAttacks = attackCards.filter(card => card.metadata?.category === 'social');
  const malwareAttacks = attackCards.filter(card => card.metadata?.category === 'malware');
  
  const networkCounters = counterAttackCards.filter(card => card.metadata?.category === 'network');
  const webCounters = counterAttackCards.filter(card => card.metadata?.category === 'web');
  const socialCounters = counterAttackCards.filter(card => card.metadata?.category === 'social');
  const malwareCounters = counterAttackCards.filter(card => card.metadata?.category === 'malware');
  
  // Log warnings if we don't have enough unique cards
  const logCardShortage = (cards: Card[], category: string, required: number) => {
    if (cards.length === 0) {
      console.warn(`No ${category} cards found! Will use other cards to substitute.`);
    } else if (cards.length < required) {
      console.warn(`Not enough ${category} cards: ${cards.length}/${required}. Will duplicate existing cards.`);
    }
  };
  
  logCardShortage(networkExploits, 'Network Exploit', 9);
  logCardShortage(webExploits, 'Web Exploit', 9);
  logCardShortage(socialExploits, 'Social Engineering Exploit', 9);
  logCardShortage(malwareExploits, 'Malware Exploit', 9);
  
  logCardShortage(networkAttacks, 'Network Attack', 5);
  logCardShortage(webAttacks, 'Web Attack', 5);
  logCardShortage(socialAttacks, 'Social Engineering Attack', 5);
  logCardShortage(malwareAttacks, 'Malware Attack', 5);
  
  logCardShortage(networkCounters, 'Network Counter-Attack', 2);
  logCardShortage(webCounters, 'Web Counter-Attack', 2);
  logCardShortage(socialCounters, 'Social Engineering Counter-Attack', 2);
  logCardShortage(malwareCounters, 'Malware Counter-Attack', 2);
  
  logCardShortage(wildcardCards, 'Wildcard', 6);
  
  // Helper function to duplicate cards to meet requirement
  const duplicateCards = (cards: Card[], requiredCount: number): Card[] => {
    if (cards.length === 0) return [];
    
    const result: Card[] = [];
    let index = 0;
    
    // Keep adding cards until we reach the required count
    for (let i = 0; i < requiredCount; i++) {
      // Create a duplicate with a unique ID
      const originalCard = cards[index % cards.length];
      
      // Create a deep copy to ensure all properties are preserved during serialization
      const cardCopy = JSON.parse(JSON.stringify(originalCard));
      
      // Update the ID to make it unique
      const duplicatedCard = {
        ...cardCopy,
        id: `${originalCard.id}-dup-${i}` // Add a suffix to make ID unique
      };
      result.push(duplicatedCard);
      index++;
    }
    
    return result;
  };
  
  // Create final deck with required counts per category
  const deck = [
    // Exploit cards - 36 total
    ...duplicateCards(networkExploits, 9),
    ...duplicateCards(webExploits, 9),
    ...duplicateCards(socialExploits, 9),
    ...duplicateCards(malwareExploits, 9),
    
    // Attack cards - 20 total
    ...duplicateCards(networkAttacks, 5),
    ...duplicateCards(webAttacks, 5),
    ...duplicateCards(socialAttacks, 5),
    ...duplicateCards(malwareAttacks, 5),
    
    // Counter-attack cards - 8 total
    ...duplicateCards(networkCounters, 2),
    ...duplicateCards(webCounters, 2),
    ...duplicateCards(socialCounters, 2),
    ...duplicateCards(malwareCounters, 2),
    
    // Wildcard cards - 6 total
    ...duplicateCards(wildcardCards, 6)
  ];
  
  console.log(`Created attacker deck with ${deck.length} cards:`);
  console.log(`- Exploits: ${duplicateCards(networkExploits, 9).length + duplicateCards(webExploits, 9).length + 
               duplicateCards(socialExploits, 9).length + duplicateCards(malwareExploits, 9).length} cards`);
  console.log(`  - Network: ${duplicateCards(networkExploits, 9).length}`);
  console.log(`  - Web: ${duplicateCards(webExploits, 9).length}`);
  console.log(`  - Social: ${duplicateCards(socialExploits, 9).length}`);
  console.log(`  - Malware: ${duplicateCards(malwareExploits, 9).length}`);
  
  console.log(`- Attacks: ${duplicateCards(networkAttacks, 5).length + duplicateCards(webAttacks, 5).length +
               duplicateCards(socialAttacks, 5).length + duplicateCards(malwareAttacks, 5).length} cards`);
  console.log(`  - Network: ${duplicateCards(networkAttacks, 5).length}`);
  console.log(`  - Web: ${duplicateCards(webAttacks, 5).length}`);
  console.log(`  - Social: ${duplicateCards(socialAttacks, 5).length}`);
  console.log(`  - Malware: ${duplicateCards(malwareAttacks, 5).length}`);
  
  console.log(`- Counter-Attacks: ${duplicateCards(networkCounters, 2).length + duplicateCards(webCounters, 2).length + 
               duplicateCards(socialCounters, 2).length + duplicateCards(malwareCounters, 2).length} cards`);
  console.log(`- Wildcards: ${duplicateCards(wildcardCards, 6).length} cards`);
  
  return shuffleCards(deck);
};
