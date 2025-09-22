# README.md (Player Actions Module)

**Location:** `game-server/src/game/actions/README.md`

---

## File Overview

This README documents the structure, migration, and best practices for the player actions module in Darknet Duel. It explains the refactoring from a monolithic file to a modular directory, describes the directory structure, and provides guidance for maintainers and contributors.

---

## Directory Structure

- `playerActions.ts`: Main entry point, re-exports all player actions and utilities.
- `cycleCardMove.ts`: Card cycling logic.
- `playCardMove.ts`: Playing cards to the field.
- `throwCardMove/`: Complex throw card logic and card effect handlers.
- `turnManagement.ts`: End turn logic.
- `utils/`: Shared utility functions (type guards, effect handling, state updates, validators, scoring).

---

## Key Points

- **Better Organization:** Code is organized by functionality for maintainability.
- **Type Safety:** Handles shared types and backend/frontend differences.
- **Extensibility:** New card types can be added with new effect handlers.
- **Backward Compatibility:** Maintained via the main entry point.
- **Testing:** Modular structure makes unit testing easier.

---

## Migration Guide

- The main `playerActions.ts` re-exports all functions for backward compatibility.
- For new code, import from specialized modules directly for clarity.
- To add a new card type, create a new effect handler and update the effect router and validators.

---

## Working with Shared Types

- Handles flexible types for `wildcardType` and `vulnerabilities` between backend and frontend.
- Type checking and conversion are handled in the refactored code.

---

## Future Improvements

- Add comprehensive unit tests for each module.
- Further separate infrastructure state management.
- Improve error handling and logging.
- Consider event emitters for game events.

---

## Notes

- This README is essential for onboarding new contributors and maintaining consistency in the player actions module. 