# stateUpdates.ts

**Location:** `game-server/src/game/actions/utils/stateUpdates.ts`

---

## File Overview

This file provides utility functions for updating player and game state after card plays in Darknet Duel. It includes logic for removing cards from hand, updating discard piles, action points, and recording actions.

- **Primary export:** `updatePlayerStateAfterCardPlay`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate logic for updating player and game state after card plays.

---

## Main Components

### 1. `updatePlayerStateAfterCardPlay(G, player, isAttacker, card, cardIndex, actionType, payload?)`
- **Purpose:** Updates player and game state after a card is played.
- **Parameters:**
  - `G`: The current game state.
  - `player`: The player object.
  - `isAttacker`: Boolean indicating if the player is the attacker.
  - `card`: The card being played.
  - `cardIndex`: The index of the card in the player's hand.
  - `actionType`: The type of action performed.
  - `payload`: (Optional) Additional payload for the action log.
- **Returns:**
  - The updated game state with player and action log updated.
- **Logic:**
  - Removes the card from hand, adds to discard, updates action points, and records the action.
  - Preserves critical player role properties in the game state.

---

## Example Usage

Used by move handlers and effect logic to update player and game state after card plays.

---

## Related Files
- `validators.ts`: For targeting validation.

---

## Notes
- The function is robust to different player and card states and includes safety checks for state updates. 