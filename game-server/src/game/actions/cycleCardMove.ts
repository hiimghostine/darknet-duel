import { Ctx } from 'boardgame.io';
import { GameState, GameAction, Player } from 'shared-types/game.types';
import { drawCard } from '../core/playerManager';

/**
 * Action to cycle (discard and draw) a card
 */
export const cycleCardMove = ({ G, ctx, playerID }: { G: GameState; ctx: Ctx; playerID: string }, cardId: string): GameState => {
  // IMPORTANT: Make sure cardId is a string to avoid serialization issues
  const cardIdStr = String(cardId);
  
  // Ensure we have proper player role properties preserved
  // FIXED: Use boardgame.io player IDs for validation
  const isAttacker = playerID === '0';
  const player = isAttacker ? G.attacker : G.defender;
  
  // Exit early if player data is missing
  if (!player) {
    console.error('cycleCardMove: Player data missing');
    return G;
  }
  
  // Find the card in player's hand
  const cardIndex = player.hand.findIndex(card => card.id === cardIdStr);
  if (cardIndex === -1) {
    console.error(`cycleCardMove: Card ${cardIdStr} not found in hand`);
    return G; // Card not found
  }
  
  // Remove card from hand
  const newHand = [...player.hand];
  const [discardedCard] = newHand.splice(cardIndex, 1);
  
  // Create a deep copy of the card to ensure all properties are preserved during serialization
  const cardCopy = JSON.parse(JSON.stringify(discardedCard));
  
  // Add card to discard pile
  let updatedPlayer = {
    ...player,
    hand: newHand,
    discard: [...player.discard, cardCopy],
  };
  
  // Check if this is a free card cycle for the turn
  // Each player gets 1 free cycle per turn (freeCardCyclesPerTurn)
  const isFreeCardCycle = updatedPlayer.freeCardCyclesUsed < G.gameConfig.freeCardCyclesPerTurn;
  
  // If not free, spend an action point
  if (!isFreeCardCycle) {
    // Check if player has action points to spend
    if (updatedPlayer.actionPoints < 1) {
      console.error('cycleCardMove: Not enough action points');
      return G;
    }
    
    // Spend 1 action point
    updatedPlayer.actionPoints -= 1;
  } else {
    // Increment the free card cycles used counter
    updatedPlayer.freeCardCyclesUsed += 1;
  }
  
  // DEBUG: Log hand state before drawing
  console.log(`[CYCLE DEBUG] Before draw - Hand size: ${updatedPlayer.hand.length}, Cards:`,
    updatedPlayer.hand.map(c => ({ id: c.id, name: c.name })));
  console.log(`[CYCLE DEBUG] Cycling card at index ${cardIndex}: ${discardedCard.id} (${discardedCard.name})`);
  
  // Draw a new card - this will add it to the end of the hand
  const playerWithNewCard = drawCard(updatedPlayer);
  const newCard = playerWithNewCard.hand[playerWithNewCard.hand.length - 1]; // Get the newly drawn card
  
  // DEBUG: Log state after drawCard
  console.log(`[CYCLE DEBUG] After drawCard - Hand size: ${playerWithNewCard.hand.length}, New card:`,
    { id: newCard.id, name: newCard.name });
  
  // CRITICAL BUG FIX: Use playerWithNewCard.hand, remove the last card (newly drawn),
  // and insert it at the original position
  const finalHand = [...playerWithNewCard.hand];
  finalHand.pop(); // Remove the newly drawn card from the end
  finalHand.splice(cardIndex, 0, newCard); // Insert it at the original position
  
  // Update the player with the corrected hand
  updatedPlayer = {
    ...playerWithNewCard,
    hand: finalHand
  };
  
  // DEBUG: Log final hand state
  console.log(`[CYCLE DEBUG] After reorder - Final hand size: ${updatedPlayer.hand.length}, Cards:`,
    updatedPlayer.hand.map(c => ({ id: c.id, name: c.name })));
  
  // Record action
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType: isFreeCardCycle ? 'freeCardCycle' : 'paidCardCycle',
    timestamp: Date.now(),
    payload: { cardId: cardIdStr }
  };
  
  // CRITICAL FIX: Explicitly preserve player role properties
  return {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    actions: [...G.actions, newAction],
    // Explicitly preserve these critical properties
    playerRole: G.playerRole,
    isAttacker: G.isAttacker,
    isDefender: G.isDefender,
    playerID: G.playerID
  };
};
