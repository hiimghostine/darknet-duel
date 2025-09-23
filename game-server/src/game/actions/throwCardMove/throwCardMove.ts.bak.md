# throwCardMove.ts.bak

**Location:** `game-server/src/game/actions/throwCardMove/throwCardMove.ts.bak`

---

## File Overview

This file is the legacy, monolithic implementation of the "throw card" action for Darknet Duel. It contains the original logic for throwing cards at infrastructure, including validation, cost calculation, wildcard handling, and effect application. It has since been refactored into a modular structure, but is preserved here for reference and rollback.

- **Primary export:** `throwCardMove`
- **Purpose:** To provide a complete, in-place implementation of the throw card action before modularization.

---

## Main Components

- Card validation and targeting logic
- Cost calculation and reductions
- Wildcard handling and auto-selection
- Card effect application and infrastructure state updates
- Persistent effect processing
- Action logging and state updates

---

## Legacy Structure

- All logic is contained in a single file, making it harder to maintain and test.
- Type guards and utility functions are defined inline.
- Special effect handling is less modular than in the refactored version.

---

## Migration Notes

- The codebase now uses a modular structure, with validation, cost calculation, and effect handling in separate files.
- The main `throwCardMove.ts` file now imports and uses these modules for maintainability.
- This file is preserved for reference and rollback, but new development should use the modular files.

---

## Differences from Refactored Version

- Logic is now split into `utils/throwCardValidation.ts`, `utils/costCalculation.ts`, `utils/attackVectorResolver.ts`, and `cardEffects/`.
- Special effect handling and targeting validation are now in dedicated utility files.
- Type safety and maintainability are improved in the new structure.

---

## Notes

- Use this file only for reference or rollback during major refactoring.
- All new development should use the modular files for maintainability and testability. 