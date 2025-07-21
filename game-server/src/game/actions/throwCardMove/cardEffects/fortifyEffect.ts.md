# fortifyEffect.ts

**Location:** `game-server/src/game/actions/throwCardMove/cardEffects/fortifyEffect.ts`

---

## File Overview

This file provides the effect handler for fortify cards in Darknet Duel. It defines the logic for applying a fortify effect to a target infrastructure, specifically strengthening shielded infrastructure.

- **Primary export:** `fortifyEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate the logic for fortify card effects.

---

## Main Components

### 1. `fortifyEffect(currentInfra, infraIndex, updatedInfrastructure, card)`
- **Purpose:** Applies the effect of a fortify card to the target infrastructure.
- **Parameters:**
  - `currentInfra`: The target infrastructure card.
  - `infraIndex`: The index of the target infrastructure in the array.
  - `updatedInfrastructure`: The full array of infrastructure cards.
  - `card`: The card being played.
- **Returns:**
  - The updated infrastructure array after applying the effect.
- **Logic:**
  - If the target is shielded, sets the state to 'fortified'.
  - Otherwise, no effect is applied.

---

## Example Usage

Used by the main card effect router to process fortify card effects during a throw card move.

---

## Related Files
- `shieldEffect.ts`: Logic for applying shields.

---

## Notes
- The function is robust to infrastructure state and includes safety checks for fortification. 