# chooseCardFromDeck.ts

**Location:** `game-server/src/game/moves/chooseCardFromDeck.ts`

---

## File Overview

This file implements the move for handling card selection from the deck, used for effects like AI-Powered Attack. It allows a player to select a card from their deck to add to their hand.

- **Primary export:** `chooseCardFromDeckMove`
- **Dependencies:** Game state types, card types.
- **Purpose:** To resolve the player's choice of card from the deck and update the game state accordingly.

---

## Main Components

### 1. `chooseCardFromDeckMove(G, ctx, playerID, selectedCardId)`
- **Purpose:** Handles the selection of a card from the deck and adds it to the player's hand.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player making the selection.
  - `selectedCardId`: The ID of the card selected from the deck.
- **Returns:**
  - Updated game state with the selected card added to the player's hand, or an error message if invalid.
- **Logic:**
  - Validates the pending card choice and player.
  - Ensures the selected card is valid and present in the deck.
  - Updates the player's deck and hand, and records the action.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used when a card effect allows a player to select a card from their deck to add to their hand.

---

## Related Files
- `actionStageMoves.ts`, `chooseWildcardType.ts`: For effect resolution and move integration.

---

## Notes
- The move includes validation for player identity and card validity.
- Handles edge cases gracefully with error messages. 