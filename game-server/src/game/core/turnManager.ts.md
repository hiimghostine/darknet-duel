# turnManager.ts

**Location:** `game-server/src/game/core/turnManager.ts`

---

## File Overview

This file provides a utility for handling the start of a player's turn in Darknet Duel. It includes logic for drawing a card and updating action points at the start of each turn.

- **Primary export:** `handleTurnStart`
- **Dependencies:** boardgame.io context, shared game types, player manager utilities.
- **Purpose:** To encapsulate turn start logic for use in phases or move handlers.

---

## Main Components

### 1. `handleTurnStart(G, ctx)`
- **Purpose:** Handles the start of a player's turn, including drawing a card and updating action points.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context (not used in this function but included for extensibility).
- **Returns:**
  - Updated game state with a card drawn and action points updated for the current player.
- **Logic:**
  - Determines if it's the attacker's or defender's turn.
  - Draws a card for the current player.
  - Updates action points based on player role and game config.

---

## Example Usage

Used by phase or turn handlers to process the start of each player's turn.

---

## Related Files
- `playerManager.ts`: Player initialization and action point logic.

---

## Notes
- This function is a utility and may be integrated into phase logic or used for custom turn handling. 