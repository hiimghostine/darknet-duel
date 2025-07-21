import { Ctx } from 'boardgame.io';
import { GameState, GameAction } from 'shared-types/game.types';

/**
 * Move to handle choosing a card from deck selection
 * Used for AI-Powered Attack and similar effects
 *
 * ROBUST VERSION: Enhanced with proper state validation and defensive programming
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
  
  // DEFENSIVE: Validate input parameters
  if (!selectedCardId || typeof selectedCardId !== 'string') {
    console.error(`🎯 DECK CHOICE ERROR: Invalid selectedCardId: ${selectedCardId}`);
    return {
      ...G,
      message: "Invalid card selection - no card ID provided"
    };
  }
  
  // DEFENSIVE: Verify player is the one who triggered the card choice
  if (!G.pendingCardChoice) {
    console.error(`🎯 DECK CHOICE ERROR: No pending card choice found`);
    return {
      ...G,
      message: "No card selection in progress"
    };
  }
  
  if (G.pendingCardChoice.playerId !== playerID) {
    console.error(`🎯 DECK CHOICE ERROR: Wrong player - expected ${G.pendingCardChoice.playerId}, got ${playerID}`);
    return {
      ...G,
      message: "You cannot choose a card at this time"
    };
  }
  
  // DEFENSIVE: Validate availableCards array
  if (!G.pendingCardChoice.availableCards || !Array.isArray(G.pendingCardChoice.availableCards)) {
    console.error(`🎯 DECK CHOICE ERROR: Invalid availableCards array`);
    return {
      ...G,
      pendingCardChoice: undefined, // Clear the invalid state
      message: "Invalid card selection state - please try again"
    };
  }
  
  // Verify the selected card is in the available cards
  console.log(`🎯 DECK CHOICE DEBUG: Available card IDs:`, G.pendingCardChoice.availableCards.map(c => c.id));
  console.log(`🎯 DECK CHOICE DEBUG: Looking for selectedCardId: ${selectedCardId}`);
  
  const selectedCard = G.pendingCardChoice.availableCards.find(card => card && card.id === selectedCardId);
  if (!selectedCard) {
    console.error(`🎯 DECK CHOICE ERROR: Card not found in available cards!`);
    return {
      ...G,
      message: "Invalid card selection - card not available"
    };
  }
  
  console.log(`🎯 DECK CHOICE DEBUG: Card found successfully: ${selectedCard.name}`);
  
  const isAttacker = playerID === G.attacker?.id;
  const currentPlayer = isAttacker ? G.attacker : G.defender;
  
  // DEFENSIVE: Validate player exists
  if (!currentPlayer) {
    console.error(`🎯 DECK CHOICE ERROR: Current player not found`);
    return {
      ...G,
      pendingCardChoice: undefined, // Clear the pending choice
      message: "Player not found - please refresh and try again"
    };
  }
  
  // DEFENSIVE: Validate player has deck and hand
  if (!currentPlayer.deck || !Array.isArray(currentPlayer.deck)) {
    console.error(`🎯 DECK CHOICE ERROR: Player deck is invalid`);
    return {
      ...G,
      pendingCardChoice: undefined, // Clear the pending choice
      message: "Invalid player deck state"
    };
  }
  
  if (!currentPlayer.hand || !Array.isArray(currentPlayer.hand)) {
    console.error(`🎯 DECK CHOICE ERROR: Player hand is invalid`);
    return {
      ...G,
      pendingCardChoice: undefined, // Clear the pending choice
      message: "Invalid player hand state"
    };
  }
  
  // ROBUST: Find the selected card in deck with enhanced debugging
  console.log(`🎯 DECK CHOICE DEBUG: Current player deck size: ${currentPlayer.deck.length}`);
  console.log(`🎯 DECK CHOICE DEBUG: Current player deck card IDs:`, currentPlayer.deck.map(c => c.id));
  
  const selectedCardIndex = currentPlayer.deck.findIndex(card => card && card.id === selectedCardId);
  
  if (selectedCardIndex === -1) {
    console.error(`🎯 DECK CHOICE ERROR: Card not found in player deck!`);
    console.error(`🎯 DECK CHOICE ERROR: This indicates deck state changed between card selection setup and execution`);
    console.error(`🎯 DECK CHOICE ERROR: Available cards were: ${G.pendingCardChoice.availableCards.map(c => c.id)}`);
    console.error(`🎯 DECK CHOICE ERROR: Current deck cards: ${currentPlayer.deck.map(c => c.id)}`);
    
    // FALLBACK: Instead of failing, try to add the card from availableCards directly
    // This handles the case where deck state changed but the card selection is still valid
    const cardFromAvailableCards = G.pendingCardChoice.availableCards.find(c => c.id === selectedCardId);
    
    if (cardFromAvailableCards) {
      console.log(`🎯 DECK CHOICE RECOVERY: Using card from availableCards as fallback`);
      
      // Add the card directly to hand without removing from deck (since it's not there)
      const updatedHand = [...currentPlayer.hand, cardFromAvailableCards];
      
      const updatedPlayer = {
        ...currentPlayer,
        hand: updatedHand
      };
      
      // Record the action with recovery note
      const newAction: GameAction = {
        playerRole: isAttacker ? 'attacker' : 'defender',
        actionType: 'chooseCardFromDeck',
        timestamp: Date.now(),
        payload: {
          sourceCardId: G.pendingCardChoice.sourceCardId,
          selectedCardId: selectedCardId,
          cardName: cardFromAvailableCards.name,
          choiceType: G.pendingCardChoice.choiceType || 'deck_selection',
          remainingCards: G.pendingCardChoice.availableCards.length - 1,
          recovery: 'deck_state_mismatch'
        }
      };
      
      const finalState: GameState = {
        ...G,
        attacker: isAttacker ? updatedPlayer : G.attacker,
        defender: !isAttacker ? updatedPlayer : G.defender,
        actions: [...G.actions, newAction],
        pendingCardChoice: undefined,
        message: `${cardFromAvailableCards.name} added to hand (recovered from deck state mismatch)`
      };
      
      console.log(`🎯 DECK CHOICE RECOVERY: Successfully recovered from deck state mismatch`);
      return finalState;
    }
    
    // Ultimate fallback - clear the choice and report error
    return {
      ...G,
      pendingCardChoice: undefined,
      message: "Card selection failed due to deck state change - please try again"
    };
  }
  
  // ROBUST: Create deep copies to avoid reference issues
  const updatedDeck = [...currentPlayer.deck];
  updatedDeck.splice(selectedCardIndex, 1);
  
  // Add the selected card to hand (create new array)
  const updatedHand = [...currentPlayer.hand, { ...selectedCard }];
  
  // Update the player with all properties preserved
  const updatedPlayer = {
    ...currentPlayer,
    deck: updatedDeck,
    hand: updatedHand
  };
  
  // Record the action with enhanced payload
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType: 'chooseCardFromDeck',
    timestamp: Date.now(),
    payload: {
      sourceCardId: G.pendingCardChoice.sourceCardId,
      selectedCardId: selectedCardId,
      cardName: selectedCard.name,
      choiceType: G.pendingCardChoice.choiceType || 'deck_selection',
      remainingCards: G.pendingCardChoice.availableCards.length - 1
    }
  };
  
  // CRITICAL: Create a completely new state object to ensure proper state sync
  const finalState: GameState = {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    actions: [...G.actions, newAction],
    pendingCardChoice: undefined, // CRITICAL: Clear the pending choice
    message: `${selectedCard.name} added to hand`
  };
  
  console.log(`🎯 DECK CHOICE DEBUG: STATE TRANSITION COMPLETE`);
  console.log(`🎯 DECK CHOICE DEBUG: pendingCardChoice cleared: ${!finalState.pendingCardChoice}`);
  console.log(`🎯 DECK CHOICE DEBUG: Final state message: ${finalState.message}`);
  console.log(`🎯 DECK CHOICE DEBUG: Updated hand size: ${updatedPlayer.hand.length}`);
  console.log(`🎯 DECK CHOICE DEBUG: State transition completed at: ${Date.now()}`);
  
  return finalState;
};