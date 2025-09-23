# costCalculation.ts

**Location:** `game-server/src/game/actions/throwCardMove/utils/costCalculation.ts`

---

## File Overview

This file provides cost calculation utilities for the throw card move in Darknet Duel. It handles all logic for cost reductions, including validation bypass, card-specific reductions, temporary effects, and action point validation.

- **Primary exports:** `calculateEffectiveCost`, `CostCalculationContext`, `CostCalculationResult`, and supporting reduction functions
- **Dependencies:** Shared game and card types, temporary effects manager.
- **Purpose:** To encapsulate all cost calculation and reduction logic for the throw card action.

---

## Main Components

### 1. `CostCalculationContext` Interface
- **Purpose:** Defines the context for calculating the effective cost of a throw card move.

### 2. `CostCalculationResult` Interface
- **Purpose:** Defines the result of a cost calculation, including effective cost, affordability, and applied reductions.

### 3. `calculateValidationBypassReduction(baseCost, validationResult)`
- **Purpose:** Calculates cost reduction from validation bypass (e.g., wildcards).
- **Parameters:**
  - `baseCost`: The starting cost of the card.
  - `validationResult`: The result of the validation pipeline.
- **Returns:**
  - `{ cost, reduction }` — New cost and reduction details.

### 4. `calculateLivingOffTheLandReduction(baseCost, card, targetInfrastructure)`
- **Purpose:** Calculates cost reduction for the "Living Off The Land" card (A302) when targeting user systems.
- **Parameters:**
  - `baseCost`: The starting cost of the card.
  - `card`: The card being played.
  - `targetInfrastructure`: The target infrastructure.
- **Returns:**
  - `{ cost, reduction }` — New cost and reduction details.

### 5. `calculateCardSpecificReduction(baseCost, card, targetInfrastructure)`
- **Purpose:** Calculates card-specific cost reductions based on card properties.
- **Parameters:**
  - `baseCost`: The starting cost of the card.
  - `card`: The card being played.
  - `targetInfrastructure`: The target infrastructure.
- **Returns:**
  - `{ cost, reduction }` — New cost and reduction details.

### 6. `calculateTemporaryEffectsReduction(baseCost, G, targetInfrastructure)`
- **Purpose:** Calculates cost reduction from temporary effects on the target infrastructure.
- **Parameters:**
  - `baseCost`: The starting cost of the card.
  - `G`: The current game state.
  - `targetInfrastructure`: The target infrastructure.
- **Returns:**
  - `{ cost, reduction }` — New cost and reduction details.

### 7. `validateActionPointsAffordability(player, effectiveCost)`
- **Purpose:** Validates if the player can afford the effective cost with their current action points.
- **Parameters:**
  - `player`: The acting player.
  - `effectiveCost`: The final calculated cost.
- **Returns:**
  - `{ canAfford, message }` — Affordability result.

### 8. `calculateEffectiveCost(context)`
- **Purpose:** Complete cost calculation pipeline for the throw card move.
- **Parameters:**
  - `context`: The cost calculation context.
- **Returns:**
  - `CostCalculationResult` — Final effective cost, affordability, and applied reductions.
- **Logic:**
  - Applies all relevant reductions in order and validates affordability.

---

## Example Usage

Used by the main throw card move logic to calculate the effective cost before proceeding.

---

## Related Files
- `throwCardValidation.ts`, `attackVectorResolver.ts`: Additional modular logic for throw card moves.
- `temporaryEffectsManager.ts`: For temporary cost reduction effects.

---

## Notes
- The modular structure improves maintainability and testability.
- Debug logging is present for troubleshooting cost calculation logic. 