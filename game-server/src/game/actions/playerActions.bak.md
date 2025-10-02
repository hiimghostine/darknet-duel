# playerActions.bak

**Location:** `game-server/src/game/actions/playerActions.bak`

---

## File Overview

This file is a backup of the legacy, monolithic implementation of all player actions for Darknet Duel. It contains the original logic for card cycling, playing, throwing, and turn management, as well as special effect handling and targeting validation. It is preserved here for reference and rollback.

- **Primary exports:** `cycleCardMove`, `playCardMove`, `throwCardMove`, `endTurnMove`, and utility functions
- **Purpose:** To provide a complete, in-place backup of all player actions before modularization.

---

## Main Components

- Card cycling, playing, and throwing logic
- Turn management and end turn logic
- Special effect application
- Card targeting validation
- Type guards for card features
- Action logging and state updates

---

## Legacy Structure

- All logic is contained in a single file, making it harder to maintain and test.
- Type guards and utility functions are defined inline.
- Special effect handling is less modular than in the refactored version.
- Some logic (e.g., auto-draw effects) is commented out or disabled.

---

## Migration Notes

- The codebase now uses a modular structure, with each action and utility in its own file.
- The main `playerActions.ts` file re-exports all actions for backward compatibility.
- This file is preserved for reference and rollback, but new development should use the modular files.

---

## Differences from Refactored Version

- Logic is now split into `cycleCardMove.ts`, `playCardMove.ts`, `throwCardMove/`, `turnManagement.ts`, and `utils/`.
- Special effect handling and targeting validation are now in dedicated utility files.
- Type safety and maintainability are improved in the new structure.

---

## Notes

- Use this file only for reference or rollback during major refactoring.
- All new development should use the modular files for maintainability and testability. 