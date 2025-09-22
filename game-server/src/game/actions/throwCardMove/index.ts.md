# index.ts (throwCardMove)

**Location:** `game-server/src/game/actions/throwCardMove/index.ts`

---

## File Overview

This file serves as the main export for the `throwCardMove` action in Darknet Duel. It re-exports the `throwCardMove` function from the main implementation file for use throughout the codebase.

- **Primary export:** `throwCardMove`
- **Purpose:** To provide a single entry point for the throw card action logic.

---

## Main Components

### 1. Re-export
- **throwCardMove:** From `throwCardMove.ts` — Handles the logic for throwing a card at infrastructure.

---

## Example Usage

Used by move handlers and phase logic to access the throw card action from a single import.

---

## Related Files
- `throwCardMove.ts`: Main implementation of the throw card action.

---

## Notes
- This file is primarily for organization and maintainability.
- All throw card logic is accessible from this single entry point. 