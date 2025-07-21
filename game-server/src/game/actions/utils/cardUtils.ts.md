# cardUtils.ts

**Location:** `game-server/src/game/actions/utils/cardUtils.ts`

---

## File Overview

This file provides utility functions for card playability checks in Darknet Duel. It includes logic for determining if a card is playable in the current game state, with special handling for counter-attack and counter cards.

- **Primary export:** `isCardPlayable`
- **Dependencies:** Shared game and card types, boardgame.io context.
- **Purpose:** To encapsulate logic for checking if a card can be played in the current context.

---

## Main Components

### 1. `isCardPlayable(G, ctx, playerID, card, player)`
- **Purpose:** Checks if a card is playable in the current game state and context.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the acting player.
  - `card`: The card being checked.
  - `player`: The player object.
- **Returns:**
  - `true` if the card is playable, `false` otherwise.
- **Logic:**
  - Counter-attack and counter cards are only playable in reaction to specific events (pending reactions targeting the player).
  - All other card types are generally playable during the player's turn.

---

## Example Usage

Used by move handlers and effect logic to check if a card can be played before proceeding.

---

## Related Files
- `validators.ts`: For targeting validation.

---

## Notes
- The function is a placeholder for more complex playability logic.
- Debug logging can be added for troubleshooting playability checks. 