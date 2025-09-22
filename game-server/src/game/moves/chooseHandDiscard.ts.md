# chooseHandDiscard.ts

**Location:** `game-server/src/game/moves/chooseHandDiscard.ts`

---

## File Overview

This file implements the move for resolving a hand disruption effect by choosing cards to discard. It is used for effects where the opponent chooses cards from a player's hand to discard (e.g., Threat Intelligence).

- **Primary export:** `chooseHandDiscardMove`
- **Dependencies:** Game state types, hand disruption resolver.
- **Purpose:** To resolve the opponent's choice of cards to discard from a player's hand.

---

## Main Components

### 1. `chooseHandDiscardMove(G, ctx, playerID, cardIds)`
- **Purpose:** Resolves the hand disruption effect by discarding the chosen cards.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player making the move (the one viewing the hand).
  - `cardIds`: Array of card IDs chosen to be discarded.
- **Returns:**
  - Updated game state with the chosen cards discarded, or an error message if invalid.
- **Logic:**
  - Validates the pending hand choice and player.
  - Ensures the correct number of cards are chosen.
  - Calls `resolveHandChoice` to update the game state.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used when a hand disruption effect requires the opponent to choose cards to discard from a player's hand.

---

## Related Files
- `handDisruption.ts`: For resolving the discard effect.

---

## Notes
- The move includes validation for player identity and card count.
- Handles edge cases gracefully with error messages. 