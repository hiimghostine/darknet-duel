import { GameState, GameAction, PlayerRole } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Interface for pending hand disruption choice
 */
export interface PendingHandChoice {
  type: 'discard_from_hand';
  targetPlayerId: string;
  revealedHand: Card[];
  count?: number; // Number of cards to discard, defaults to 1 if not specified
}

/**
 * Handles hand disruption effects like Memory Corruption and Threat Intelligence
 * 
 * @param gameState Current game state
 * @param effectType Type of hand disruption effect
 * @param targetPlayerId ID of the player whose hand is being disrupted
 * @param count Optional count of cards to affect (for view_and_discard)
 * @returns Updated game state with the hand disruption applied or pending
 */
export function handleHandDisruption(
  gameState: GameState,
  effectType: 'discard_redraw' | 'view_and_discard',
  targetPlayerId: string,
  count: number = 1
): GameState {
  const targetPlayer = gameState.attacker?.id === targetPlayerId ? gameState.attacker : gameState.defender;
  
  if (!targetPlayer) return gameState;
  
  switch (effectType) {
    case 'discard_redraw':
      // Memory Corruption Attack effect - discard entire hand and redraw
      const handSize = targetPlayer.hand.length;
      
      // Safety check for deck size
      if (targetPlayer.deck.length < handSize) {
        // Not enough cards to redraw, let's combine discard and deck first
        const reshuffledDeck = [...targetPlayer.discard, ...targetPlayer.deck];
        // Shuffle the combined deck
        const shuffledDeck = shuffleArray(reshuffledDeck);
        
        // Now handle the redraw
        const newHand = shuffledDeck.slice(0, handSize);
        const newDeck = shuffledDeck.slice(handSize);
        
        return {
          ...gameState,
          [targetPlayerId === gameState.attacker?.id ? 'attacker' : 'defender']: {
            ...targetPlayer,
            hand: newHand,
            deck: newDeck,
            discard: targetPlayer.hand // Old hand goes to discard
          },
          message: `${targetPlayerId === gameState.attacker?.id ? 'Attacker' : 'Defender'} discarded their hand and drew ${handSize} new cards!`
        };
      }
      
      // Normal case - enough cards in deck
      const newHand = targetPlayer.deck.slice(0, handSize);
      const newDeck = targetPlayer.deck.slice(handSize);
      
      // Add a game action to record this effect
      const newAction: GameAction = {
        playerRole: targetPlayerId === gameState.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole,
        actionType: 'handDisruption',
        timestamp: Date.now(),
        payload: { 
          effectType: 'discard_redraw',
          targetPlayerId,
          cardCount: handSize
        }
      };
      
      return {
        ...gameState,
        [targetPlayerId === gameState.attacker?.id ? 'attacker' : 'defender']: {
          ...targetPlayer,
          hand: newHand,
          deck: newDeck,
          discard: [...targetPlayer.discard, ...targetPlayer.hand]
        },
        actions: [...gameState.actions, newAction],
        message: `${targetPlayerId === gameState.attacker?.id ? 'Attacker' : 'Defender'} discarded their hand and drew ${handSize} new cards!`
      };
      
    case 'view_and_discard':
      // Threat Intelligence effect - opponent needs to select cards to discard
      // Add a game action for viewing the hand
      const viewAction: GameAction = {
        playerRole: targetPlayerId === gameState.attacker?.id ? 'defender' as PlayerRole : 'attacker' as PlayerRole,
        actionType: 'viewOpponentHand',
        timestamp: Date.now(),
        payload: { 
          targetPlayerId
        }
      };
      
      return {
        ...gameState,
        pendingHandChoice: {
          type: 'discard_from_hand',
          targetPlayerId,
          revealedHand: targetPlayer.hand,
          count // Number of cards to discard
        },
        actions: [...gameState.actions, viewAction],
        message: `Opponent is viewing your hand and will choose ${count} card${count > 1 ? 's' : ''} to discard`
      };
  }
  
  return gameState;
}

/**
 * Resolves a pending hand choice, discarding the selected cards
 * 
 * @param gameState Current game state
 * @param cardIds IDs of the cards to discard
 * @returns Updated game state with the cards discarded
 */
export function resolveHandChoice(
  gameState: GameState,
  cardIds: string[]
): GameState {
  if (!gameState.pendingHandChoice) {
    return gameState;
  }
  
  const { targetPlayerId, count = 1 } = gameState.pendingHandChoice;
  const targetPlayer = gameState.attacker?.id === targetPlayerId ? gameState.attacker : gameState.defender;
  
  if (!targetPlayer) {
    return gameState;
  }
  
  // Ensure we're not discarding more cards than allowed
  const validCardIds = cardIds.slice(0, count);
  
  // Create a new hand without the discarded cards
  const newHand = targetPlayer.hand.filter(card => !validCardIds.includes(card.id));
  
  // Get the discarded cards
  const discardedCards = targetPlayer.hand.filter(card => validCardIds.includes(card.id));
  
  // Add a game action to record the discard
  const discardAction: GameAction = {
    playerRole: targetPlayerId === gameState.attacker?.id ? 'defender' as PlayerRole : 'attacker' as PlayerRole,
    actionType: 'discardFromHand',
    timestamp: Date.now(),
    payload: { 
      targetPlayerId,
      cardIds: validCardIds
    }
  };
  
  // Update the target player's hand and discard pile
  return {
    ...gameState,
    [targetPlayerId === gameState.attacker?.id ? 'attacker' : 'defender']: {
      ...targetPlayer,
      hand: newHand,
      discard: [...targetPlayer.discard, ...discardedCards]
    },
    actions: [...gameState.actions, discardAction],
    pendingHandChoice: undefined,
    message: `${discardedCards.length} card${discardedCards.length !== 1 ? 's' : ''} discarded from ${targetPlayerId === gameState.attacker?.id ? 'Attacker' : 'Defender'}'s hand`
  };
}

/**
 * Helper function to shuffle an array
 * Uses Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
