# chooseWildcardType.ts

**Location:** `game-server/src/game/moves/chooseWildcardType.ts`

---

## File Overview

This file implements the move for choosing a type when playing a wildcard card. It continues the card effect that was started in the throw card move and applies the chosen type's effect to the target infrastructure.

- **Primary export:** `chooseWildcardTypeMove`
- **Dependencies:** Game state types, card types, effect handlers, scoring utilities, temporary effects manager, wildcard resolver.
- **Purpose:** To resolve the player's choice of wildcard type and apply the corresponding effect.

---

## Main Components

### 1. `chooseWildcardTypeMove({ G, ctx, playerID }, chosenType)`
- **Purpose:** Resolves the player's choice of wildcard type and applies the effect to the target infrastructure.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player making the choice.
  - `chosenType`: The card type chosen for the wildcard.
- **Returns:**
  - Updated game state with the effect applied, or an error message if invalid.
- **Logic:**
  - Validates the pending wildcard choice and player.
  - Finds the card and target infrastructure.
  - Applies the chosen type's effect using `applyCardEffect`.
  - Handles victory, reaction, and score updates as needed.
  - Applies any wildcard-specific effects and checks for reaction triggers.
- **Side Effects:**
  - May update infrastructure, trigger reactions, or end the game.

---

## Example Usage

Used when a player plays a wildcard card and must choose its type before the effect is resolved.

---

## Related Files
- `throwCardMove.ts`, `wildcardResolver.ts`, `temporaryEffectsManager.ts`: For effect resolution and validation.

---

## Notes
- The move is robust to different wildcard types and game states.
- Includes detailed validation and error handling for edge cases. 