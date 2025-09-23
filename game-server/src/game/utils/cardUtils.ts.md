# cardUtils.ts

**Location:** `game-server/src/game/utils/cardUtils.ts`

---

## File Overview

This file provides comprehensive utility functions for checking if a card is playable in the current game state in Darknet Duel. It considers turn, phase, action points, card type, and special game state conditions.

- **Primary export:** `isCardPlayable`
- **Dependencies:** Shared game and card types, boardgame.io context.
- **Purpose:** To encapsulate all logic for card playability checks, supporting modular and testable code.

---

## Main Components

### 1. `isCardPlayable(G, ctx, playerID, card, player, debug)`
- **Purpose:** Checks if a card is playable in the current game state and context, considering all relevant factors.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player trying to play the card.
  - `card`: The card being evaluated.
  - `player`: The player object (optional, will be determined if not provided).
  - `debug`: Whether to log debugging info (default: false).
- **Returns:**
  - `true` if the card is playable, `false` otherwise.
- **Logic:**
  - Checks for player existence, game phase, action points, turn, reaction phase, and card type requirements.
  - Handles both reactive and non-reactive cards, and special rules for each.
  - Provides detailed debug logging if enabled.

---

## Example Usage

Used by move handlers and effect logic to check if a card can be played before proceeding.

---

## Related Files
- `validators.ts`, `actionStageMoves.ts`: For targeting validation and move logic.

---

## Notes
- The function is robust to different card types, player states, and game phases.
- Debug logging is available for troubleshooting playability checks. 