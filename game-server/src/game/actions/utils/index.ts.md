# index.ts (utils)

**Location:** `game-server/src/game/actions/utils/index.ts`

---

## File Overview

This file serves as the main export for all utility functions in the actions module of Darknet Duel. It re-exports all utility functions from their respective files for use throughout the codebase.

- **Purpose:** To provide a single entry point for all utility logic related to player actions and card effects.

---

## Main Components

### 1. Re-exports
- **typeGuards:** Type guard utilities.
- **effectHandling:** Special effect application utilities.
- **stateUpdates:** State update utilities for player and game state.
- **validators:** Card targeting and action validation utilities.
- **scoring:** Score calculation and victory check utilities.

---

## Example Usage

Used by move handlers and effect logic to access all utility logic from a single import.

---

## Related Files
- `typeGuards.ts`, `effectHandling.ts`, `stateUpdates.ts`, `validators.ts`, `scoring.ts`: Utility logic for actions and effects.

---

## Notes
- This file is primarily for organization and maintainability.
- All utility logic is accessible from this single entry point. 