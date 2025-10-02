# throwCardMove.ts

**Location:** `game-server/src/game/actions/throwCardMove/throwCardMove.ts`

---

## File Overview

This file provides the main logic for the "throw card" action in Darknet Duel, allowing a player to throw a card at an infrastructure target. It is a refactored, modular implementation that preserves all critical logic from the original monolithic version, with comprehensive validation, cost calculation, attack vector resolution, and effect application.

- **Primary export:** `throwCardMove`
- **Dependencies:** boardgame.io context, shared game and card types, modular validation, cost calculation, attack vector resolution, card effect application, temporary effects manager.
- **Purpose:** To encapsulate the logic for throwing cards, including validation, cost, wildcard handling, and state updates.

---

## Main Components

### 1. `throwCardMove({ G, ctx, playerID }, cardId, targetInfrastructureId)`
- **Purpose:** Handles the action of throwing a card at an infrastructure target, including validation, cost calculation, wildcard handling, and effect application.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player throwing the card.
  - `cardId`: The ID of the card to throw.
  - `targetInfrastructureId`: The ID of the target infrastructure.
- **Returns:**
  - Updated game state with the card thrown, effects applied, and state updated.
- **Logic:**
  - **Validation:** Uses `validateThrowCardMove` for comprehensive validation.
  - **Attack Vector Resolution:** Determines the correct attack vector for the card and target.
  - **Cost Calculation:** Applies cost reductions and checks for sufficient action points.
  - **Wildcard Handling:** Handles wildcards with auto-selection or player choice, applies special effects, and manages hand/discard updates.
  - **Effect Application:** Applies card effects using `applyCardEffect` and updates infrastructure state.
  - **Persistent Effects:** Processes persistent effects for infrastructure state changes.
  - **Action Logging:** Records the action in the game log.
  - **Chain Effects:** Handles pending chain choices and reaction triggers.

---

## Example Usage

Used by move handlers and phase logic to process throw card actions.

---

## Related Files
- `utils/throwCardValidation.ts`, `utils/costCalculation.ts`, `utils/attackVectorResolver.ts`: Modular validation and calculation logic.
- `cardEffects/`: Card effect handlers by type.
- `temporaryEffectsManager.ts`: For cost reduction and effect management.

---

## Notes
- The function is robust to different card types and includes validation for playability, cost, and targeting.
- Debug logging is present for troubleshooting throw card logic.
- The modular structure improves maintainability and testability. 