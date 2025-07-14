import * as fs from 'fs';
import * as path from 'path';
// Use shared types
import { Card, CardType, AttackVector } from 'shared-types/card.types';
import { DefenderCardCollection, DefenderCard } from './cardTypes';
import { shuffleCards } from './attackerCardLoader';

/**
 * Loads defender cards from JSON file and converts them to game Card type
 * @returns Array of defender cards
 */
export const loadDefenderCards = (): Card[] => {
  try {
    // Read the JSON file
    const filePath = path.join(__dirname, 'defender.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const cardData: DefenderCardCollection = JSON.parse(rawData);
    
    console.log(`Loaded ${cardData.cards.length} defender cards`);
    
    // Convert DefenderCard to standard Card format
    return cardData.cards.map((defenderCard: DefenderCard): Card => {
      // Ensure type is a valid CardType
      const cardType = defenderCard.type as CardType;
      
      // Map specialEffect to preventReaction if it matches
      const preventReaction = defenderCard.specialEffect === 'prevent_reactions';
      
      // Handle wildcardType which can be string or array in shared types
      let wildcardType: string | CardType[] | undefined = undefined;
      if (defenderCard.wildcardType) {
        // In the backend, we can store the original string value directly
        // This is compatible with shared types which accepts string | CardType[]
        wildcardType = defenderCard.wildcardType;
      }
      
      return {
        id: defenderCard.id,
        name: defenderCard.name,
        type: cardType,
        cost: defenderCard.cost,
        power: defenderCard.cost, // Use cost as a base power value
        description: `${defenderCard.description}\n${defenderCard.effect}`,
        // Map fields needed by our new card system
        isReactive: defenderCard.isReactive || false,
        wildcardType: wildcardType,
        specialEffect: defenderCard.specialEffect,
        preventReaction,
        // Draw effect if applicable
        draw: defenderCard.draw,
        // Determine attackVector from the category for shield cards
        attackVector: defenderCard.type === 'shield' || defenderCard.type === 'fortify' ? 
          defenderCard.category as AttackVector | undefined : undefined,
        
        // Add custom effects as needed
        effects: [
          {
            type: defenderCard.type,
            value: defenderCard.cost,
            description: defenderCard.effect
          },
          // Add additional effects based on specialized fields
          ...(defenderCard.additionalPlays ? [{
            type: 'additional_plays',
            value: defenderCard.additionalPlays,
            description: `Allows ${defenderCard.additionalPlays} additional card plays`
          }] : [])
        ],
        // Add custom metadata
        metadata: {
          category: defenderCard.category,
          isReactive: defenderCard.isReactive,
          target: defenderCard.target,
          img: defenderCard.img,
          flavor: defenderCard.flavor,
          // Add specialized fields
          ...(defenderCard.wildcardType && { wildcardType: defenderCard.wildcardType }),
          ...(defenderCard.draw && { draw: defenderCard.draw })
        }
      };
    });
  } catch (error) {
    console.error('Error loading defender cards:', error);
    return []; // Return empty array on error
  }
};

/**
 * Creates a deck of defender cards, shuffled and ready for play, following
 * distribution rules:
 * - Shield Cards (32 total):
 *   - 8 Network Shields
 *   - 8 Web Shields
 *   - 8 Social Engineering Shields
 *   - 8 Malware Shields
 * - Fortify Cards (20 total):
 *   - 5 Network Fortifications
 *   - 5 Web Fortifications
 *   - 5 Social Engineering Fortifications
 *   - 5 Malware Fortifications
 * - Response Cards (8 total):
 *   - 2 Network Responses
 *   - 2 Web Responses
 *   - 2 Social Engineering Responses
 *   - 2 Malware Responses
 * - Wildcard Cards (6 total)
 * 
 * @returns Shuffled deck of defender cards
 */
export const createDefenderDeck = (): Card[] => {
  const allCards = loadDefenderCards();
  
  // Group cards by type
  const shieldCards = allCards.filter(card => card.type === 'shield');
  const fortifyCards = allCards.filter(card => card.type === 'fortify');
  const responseCards = allCards.filter(card => card.type === 'response');
  const reactionCards = allCards.filter(card => card.type === 'reaction');
  const wildcardCards = allCards.filter(card => card.type === 'wildcard');
  
  // Log the found card counts
  console.log(`Found ${shieldCards.length} shield cards`);
  console.log(`Found ${fortifyCards.length} fortify cards`);
  console.log(`Found ${responseCards.length} response cards`);
  console.log(`Found ${reactionCards.length} reaction cards`);
  console.log(`Found ${wildcardCards.length} wildcard cards`);
  
  // Further categorize each card type by target/category
  const networkShields = shieldCards.filter(card => card.metadata?.category === 'network');
  const webShields = shieldCards.filter(card => card.metadata?.category === 'web');
  const socialShields = shieldCards.filter(card => card.metadata?.category === 'social');
  const malwareShields = shieldCards.filter(card => card.metadata?.category === 'malware');
  
  const networkFortify = fortifyCards.filter(card => card.metadata?.category === 'network');
  const webFortify = fortifyCards.filter(card => card.metadata?.category === 'web');
  const socialFortify = fortifyCards.filter(card => card.metadata?.category === 'social');
  const malwareFortify = fortifyCards.filter(card => card.metadata?.category === 'malware');
  
  const networkResponse = responseCards.filter(card => card.metadata?.category === 'network');
  const webResponse = responseCards.filter(card => card.metadata?.category === 'web');
  const socialResponse = responseCards.filter(card => card.metadata?.category === 'social');
  const malwareResponse = responseCards.filter(card => card.metadata?.category === 'malware');

  // Categorize reaction cards by target/category
  const networkReaction = reactionCards.filter(card => card.metadata?.category === 'network');
  const webReaction = reactionCards.filter(card => card.metadata?.category === 'web');
  const socialReaction = reactionCards.filter(card => card.metadata?.category === 'social');
  const malwareReaction = reactionCards.filter(card => card.metadata?.category === 'malware');
  // Include any wildcard reactions or reactions with 'any' category
  const wildcardReaction = reactionCards.filter(card => card.metadata?.category === 'any');
  
  // Log warnings if we don't have enough unique cards
  const logCardShortage = (cards: Card[], category: string, required: number) => {
    if (cards.length === 0) {
      console.warn(`No ${category} cards found! Will use other cards to substitute.`);
    } else if (cards.length < required) {
      console.warn(`Not enough ${category} cards: ${cards.length}/${required}. Will duplicate existing cards.`);
    }
  };
  
  logCardShortage(networkShields, 'Network Shield', 8);
  logCardShortage(webShields, 'Web Shield', 8);
  logCardShortage(socialShields, 'Social Engineering Shield', 8);
  logCardShortage(malwareShields, 'Malware Shield', 8);
  
  logCardShortage(networkFortify, 'Network Fortification', 5);
  logCardShortage(webFortify, 'Web Fortification', 5);
  logCardShortage(socialFortify, 'Social Engineering Fortification', 5);
  logCardShortage(malwareFortify, 'Malware Fortification', 5);
  
  logCardShortage(networkResponse, 'Network Response', 2);
  logCardShortage(webResponse, 'Web Response', 2);
  logCardShortage(socialResponse, 'Social Engineering Response', 2);
  logCardShortage(malwareResponse, 'Malware Response', 2);

  // Log shortage warnings for reaction cards
  logCardShortage(networkReaction, 'Network Reaction', 2);
  logCardShortage(webReaction, 'Web Reaction', 2);
  logCardShortage(socialReaction, 'Social Engineering Reaction', 2);
  logCardShortage(malwareReaction, 'Malware Reaction', 2);
  logCardShortage(wildcardReaction, 'Wildcard Reaction', 2);
  
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
      const duplicatedCard = {
        ...originalCard,
        id: `${originalCard.id}-dup-${i}` // Add a suffix to make ID unique
      };
      result.push(duplicatedCard);
      index++;
    }
    
    return result;
  };
  
  // Create final deck with required counts per category
  const deck = [
    // Shield cards - 32 total
    ...duplicateCards(networkShields, 8),
    ...duplicateCards(webShields, 8),
    ...duplicateCards(socialShields, 8),
    ...duplicateCards(malwareShields, 8),
    
    // Fortify cards - 20 total
    ...duplicateCards(networkFortify, 5),
    ...duplicateCards(webFortify, 5),
    ...duplicateCards(socialFortify, 5),
    ...duplicateCards(malwareFortify, 5),
    
    // Response cards - 8 total
    ...duplicateCards(networkResponse, 2),
    ...duplicateCards(webResponse, 2),
    ...duplicateCards(socialResponse, 2),
    ...duplicateCards(malwareResponse, 2),
    
    // Reaction cards - 10 total
    ...duplicateCards(networkReaction, 2),
    ...duplicateCards(webReaction, 2),
    ...duplicateCards(socialReaction, 2),
    ...duplicateCards(malwareReaction, 2),
    ...duplicateCards(wildcardReaction, 2),
    
    // Wildcard cards - 6 total
    ...duplicateCards(wildcardCards, 6)
  ];
  
  // Calculate reaction card counts
  const networkReactionCount = duplicateCards(networkReaction, 2).length;
  const webReactionCount = duplicateCards(webReaction, 2).length;
  const socialReactionCount = duplicateCards(socialReaction, 2).length;
  const malwareReactionCount = duplicateCards(malwareReaction, 2).length;
  const wildcardReactionCount = duplicateCards(wildcardReaction, 2).length;
  const totalReactionCount = networkReactionCount + webReactionCount + socialReactionCount + malwareReactionCount + wildcardReactionCount;
  
  console.log(`Created defender deck with ${deck.length} cards:`);
  console.log(`- Shields: ${duplicateCards(networkShields, 8).length + duplicateCards(webShields, 8).length + 
               duplicateCards(socialShields, 8).length + duplicateCards(malwareShields, 8).length} cards`);
  console.log(`  - Network: ${duplicateCards(networkShields, 8).length}`);
  console.log(`  - Web: ${duplicateCards(webShields, 8).length}`);
  console.log(`  - Social: ${duplicateCards(socialShields, 8).length}`);
  console.log(`  - Malware: ${duplicateCards(malwareShields, 8).length}`);
  
  console.log(`- Fortifications: ${duplicateCards(networkFortify, 5).length + duplicateCards(webFortify, 5).length +
               duplicateCards(socialFortify, 5).length + duplicateCards(malwareFortify, 5).length} cards`);
  console.log(`  - Network: ${duplicateCards(networkFortify, 5).length}`);
  console.log(`  - Web: ${duplicateCards(webFortify, 5).length}`);
  console.log(`  - Social: ${duplicateCards(socialFortify, 5).length}`);
  console.log(`  - Malware: ${duplicateCards(malwareFortify, 5).length}`);
  
  console.log(`- Responses: ${duplicateCards(networkResponse, 2).length + duplicateCards(webResponse, 2).length + 
               duplicateCards(socialResponse, 2).length + duplicateCards(malwareResponse, 2).length} cards`);

  console.log(`- Reactions: ${totalReactionCount} cards`);
  console.log(`  - Network: ${networkReactionCount}`);
  console.log(`  - Web: ${webReactionCount}`);
  console.log(`  - Social: ${socialReactionCount}`);
  console.log(`  - Malware: ${malwareReactionCount}`);
  console.log(`  - Wildcard: ${wildcardReactionCount}`);

  console.log(`- Wildcards: ${duplicateCards(wildcardCards, 6).length} cards`);
  
  return shuffleCards(deck);
};
