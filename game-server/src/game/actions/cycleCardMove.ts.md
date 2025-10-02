# cycleCardMove.ts

**Location:** `game-server/src/game/actions/cycleCardMove.ts`

---

## File Overview

This file provides the logic for cycling (discarding and drawing) a card in Darknet Duel. It handles both free and paid card cycles, updates action points, and manages hand/discard updates.

- **Primary export:** `cycleCardMove`
- **Dependencies:** boardgame.io context, shared game and card types, player manager utilities.
- **Purpose:** To encapsulate the logic for cycling cards, including validation, cost, and state updates.

---

## Main Components

### 1. `cycleCardMove({ G, ctx, playerID }, cardId)`
- **Purpose:** Handles the action of cycling a card (discarding and drawing a new one).
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player cycling the card.
  - `cardId`: The ID of the card to cycle.
- **Returns:**
  - Updated game state with the card cycled, action points updated, and state preserved.
- **Logic:**
  - Validates player and card existence.
  - Handles free and paid cycles, updating action points and counters.
  - Draws a new card and records the action.
  - Preserves critical player role properties in the game state.

---

## Example Usage

Used by move handlers and phase logic to process card cycling actions.

---

## Related Files
- `playerManager.ts`: For drawing cards and player state management.

---

## Notes
- The function is robust to different player and card states and includes validation for free/paid cycles.
- Debug logging is present for troubleshooting card cycling logic. 