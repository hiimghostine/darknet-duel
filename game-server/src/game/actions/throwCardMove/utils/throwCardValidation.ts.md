# throwCardValidation.ts

**Location:** `game-server/src/game/actions/throwCardMove/utils/throwCardValidation.ts`

---

## File Overview

This file provides validation utilities for the throw card move in Darknet Duel. It centralizes all validation logic for player turn, card existence, target infrastructure, and card type determination, ensuring maintainability and robust error handling.

- **Primary exports:** `validateThrowCardMove`, `ValidationContext`, `ValidationResult`, and supporting validation functions
- **Dependencies:** boardgame.io context, shared game and card types, type guards, wildcard utilities, and targeting validators.
- **Purpose:** To encapsulate all validation logic for the throw card action, supporting modular and testable code.

---

## Main Components

### 1. `ValidationContext` Interface
- **Purpose:** Defines the context for validating a throw card move (game state, context, player, card, and target IDs).

### 2. `ValidationResult` Interface
- **Purpose:** Defines the result of a validation pipeline, including validity, messages, and resolved entities.

### 3. `validatePlayerTurn(G, ctx, playerID)`
- **Purpose:** Validates that the player is allowed to act (either their turn or valid reaction mode).
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the acting player.
- **Returns:**
  - `{ valid, message, isAttacker }` — Whether the player can act, with context.

### 4. `validatePlayerAndCard(G, playerID, cardId)`
- **Purpose:** Validates that the player exists and the card is in their hand.
- **Parameters:**
  - `G`: The current game state.
  - `playerID`: The ID of the acting player.
  - `cardId`: The ID of the card to validate.
- **Returns:**
  - `{ valid, message, player, card, cardIndex }` — Validation result and resolved entities.

### 5. `validateTargetInfrastructure(G, targetInfrastructureId, card?)`
- **Purpose:** Validates that the target infrastructure exists, or handles hand-targeting cards.
- **Parameters:**
  - `G`: The current game state.
  - `targetInfrastructureId`: The ID of the target infrastructure.
  - `card`: (Optional) The card being played.
- **Returns:**
  - `{ valid, message, targetInfrastructure }` — Validation result and resolved entity.

### 6. `determineEffectiveCardType(card, targetInfrastructure)`
- **Purpose:** Determines the effective and validation card types for the move, handling wildcards and hand-targeting cards.
- **Parameters:**
  - `card`: The card being played.
  - `targetInfrastructure`: The target infrastructure (if any).
- **Returns:**
  - `{ effectiveCardType, validationCardType }` — Types for further validation.

### 7. `validateCardTargeting_Internal(...)`
- **Purpose:** Validates card targeting with the determined card type and attack vector.
- **Parameters:**
  - `validationCardType`, `targetInfrastructure`, `attackVector`, `G`, `card`, `playerID`
- **Returns:**
  - `{ valid, message }` — Targeting validation result.

### 8. `validateThrowCardMove(context)`
- **Purpose:** Complete validation pipeline for the throw card move.
- **Parameters:**
  - `context`: The validation context.
- **Returns:**
  - `ValidationResult` — Comprehensive validation result and resolved entities.
- **Logic:**
  - Validates player turn, player/card existence, target infrastructure, and determines card types.

---

## Example Usage

Used by the main throw card move logic to validate all aspects of the action before proceeding.

---

## Related Files
- `costCalculation.ts`, `attackVectorResolver.ts`: Additional modular logic for throw card moves.
- `validators.ts`: Card targeting validation logic.

---

## Notes
- The modular structure improves maintainability and testability.
- Debug logging is present for troubleshooting validation logic. 