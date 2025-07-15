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
  console.log(`Player ${playerID} choosing card from deck: ${selectedCardId}`);
  
  // Verify player is the one who triggered the card choice
  if (!G.pendingCardChoice || G.pendingCardChoice.playerId !== playerID) {
    return {
      ...G,
      message: "You cannot choose a card at this time"
    };
  }
  
  // Verify the selected card is in the available cards
  const selectedCard = G.pendingCardChoice.availableCards.find(card => card.id === selectedCardId);
  if (!selectedCard) {
    return {
      ...G,
      message: "Invalid card selection"
    };
  }
  
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
  return {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    actions: [...G.actions, newAction],
    pendingCardChoice: undefined, // Clear the pending choice
    message: `${selectedCard.name} added to hand`
  };
};