import { Ctx } from 'boardgame.io';
import { GameState, GameAction } from 'shared-types/game.types';

/**
 * Move to handle choosing a card from deck selection
 * Used for AI-Powered Attack and similar effects
 */
export const chooseCardFromDeckMove = (
  G: GameState,
  ctx: Ctx,
  playerID: string,
  selectedCardId: string
): GameState => {
  console.log(`🎯 DECK CHOICE DEBUG: Player ${playerID} choosing card from deck: ${selectedCardId}`);
  console.log(`🎯 DECK CHOICE DEBUG: selectedCardId type: ${typeof selectedCardId}`);
  console.log(`🎯 DECK CHOICE DEBUG: G.pendingCardChoice exists: ${!!G.pendingCardChoice}`);
  console.log(`🎯 DECK CHOICE DEBUG: pendingCardChoice.playerId: ${G.pendingCardChoice?.playerId}`);
  console.log(`🎯 DECK CHOICE DEBUG: pendingCardChoice.availableCards count: ${G.pendingCardChoice?.availableCards?.length}`);
  
  // Verify player is the one who triggered the card choice
  if (!G.pendingCardChoice || G.pendingCardChoice.playerId !== playerID) {
    return {
      ...G,
      message: "You cannot choose a card at this time"
    };
  }
  
  // Verify the selected card is in the available cards
  console.log(`🎯 DECK CHOICE DEBUG: Available card IDs:`, G.pendingCardChoice.availableCards.map(c => c.id));
  console.log(`🎯 DECK CHOICE DEBUG: Looking for selectedCardId: ${selectedCardId}`);
  
  const selectedCard = G.pendingCardChoice.availableCards.find(card => card.id === selectedCardId);
  if (!selectedCard) {
    console.log(`🎯 DECK CHOICE DEBUG: CARD NOT FOUND! Returning early with error.`);
    return {
      ...G,
      message: "Invalid card selection"
    };
  }
  
  console.log(`🎯 DECK CHOICE DEBUG: Card found successfully: ${selectedCard.name}`);
  
  const isAttacker = playerID === G.attacker?.id;
  const currentPlayer = isAttacker ? G.attacker : G.defender;
  
  if (!currentPlayer) {
    return G;
  }
  
  // Remove the selected card from deck
  const selectedCardIndex = currentPlayer.deck.findIndex(card => card.id === selectedCardId);
  if (selectedCardIndex === -1) {
    return {
      ...G,
      message: "Card not found in deck"
    };
  }
  
  // Create updated deck without the selected card
  const updatedDeck = [...currentPlayer.deck];
  updatedDeck.splice(selectedCardIndex, 1);
  
  // Add the selected card to hand
  const updatedHand = [...currentPlayer.hand, selectedCard];
  
  // Update the player
  const updatedPlayer = {
    ...currentPlayer,
    deck: updatedDeck,
    hand: updatedHand
  };
  
  // Record the action
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType: 'chooseCardFromDeck',
    timestamp: Date.now(),
    payload: { 
      sourceCardId: G.pendingCardChoice.sourceCardId,
      selectedCardId: selectedCardId,
      cardName: selectedCard.name
    }
  };
  
  // Return updated game state
  const finalState = {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    actions: [...G.actions, newAction],
    pendingCardChoice: undefined, // Clear the pending choice
    message: `${selectedCard.name} added to hand`
  };
  
  console.log(`🎯 DECK CHOICE DEBUG: Clearing pendingCardChoice - was ${!!G.pendingCardChoice}, now ${!!finalState.pendingCardChoice}`);
  console.log(`🎯 DECK CHOICE DEBUG: Final state message: ${finalState.message}`);
  console.log(`🎯 DECK CHOICE DEBUG: Updated hand size: ${updatedPlayer.hand.length}`);
  
  return finalState;
};