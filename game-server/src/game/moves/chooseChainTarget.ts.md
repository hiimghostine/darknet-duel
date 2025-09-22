# chooseChainTarget.ts

**Location:** `game-server/src/game/moves/chooseChainTarget.ts`

---

## File Overview

This file implements the move for resolving a chain effect by choosing a target infrastructure. It is used for both chain vulnerability and chain compromise effects.

- **Primary export:** `chooseChainTargetMove`
- **Dependencies:** Game state types, chain effect resolver.
- **Purpose:** To resolve the player's choice of target for a chain effect.

---

## Main Components

### 1. `chooseChainTargetMove(G, ctx, playerID, targetInfrastructureId)`
- **Purpose:** Resolves the chain effect by applying it to the chosen target infrastructure.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player making the move.
  - `targetInfrastructureId`: The ID of the infrastructure being targeted.
- **Returns:**
  - Updated game state with the chain effect applied, or an error message if invalid.
- **Logic:**
  - Validates the pending chain choice and player.
  - Ensures the target is valid.
  - Calls `resolveChainEffect` to update the game state.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used when a chain effect requires the player to choose a target infrastructure.

---

## Related Files
- `chainEffects.ts`: For resolving the chain effect.

---

## Notes
- The move includes validation for player identity and target validity.
- Handles edge cases gracefully with error messages. 