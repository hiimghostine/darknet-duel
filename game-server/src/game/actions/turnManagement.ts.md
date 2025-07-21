# turnManagement.ts

**Location:** `game-server/src/game/actions/turnManagement.ts`

---

## File Overview

This file provides a utility for ending a player's turn in Darknet Duel, including processing temporary effects and resetting per-turn counters.

- **Primary export:** `endTurnMove`
- **Dependencies:** boardgame.io context, shared game types, temporary effects manager.
- **Purpose:** To encapsulate end-of-turn logic for use in phases or move handlers.

---

## Main Components

### 1. `endTurnMove({ G, ctx, events })`
- **Purpose:** Ends the current player's turn, processes temporary effects, and resets free card cycle counters.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `events`: The boardgame.io events API.
- **Returns:**
  - Updated game state with temporary effects processed and per-turn counters reset.
- **Logic:**
  - Calls `TemporaryEffectsManager.processTurnStart` to update effects.
  - Calls `events.endTurn()` to advance the turn.
  - Resets `freeCardCyclesUsed` for both players.

---

## Example Usage

Used by phase or move handlers to process the end of each player's turn.

---

## Related Files
- `temporaryEffectsManager.ts`: Manages temporary and persistent effects.

---

## Notes
- This function is a utility and may be integrated into phase logic or used for custom turn handling. 