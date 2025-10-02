# counterEffect.ts

**Location:** `game-server/src/game/actions/throwCardMove/cardEffects/counterEffect.ts`

---

## File Overview

This file provides the effect handler for counter-attack cards in Darknet Duel. It defines the logic for applying a counter-attack effect to a target infrastructure, specifically canceling shield effects on shielded infrastructure.

- **Primary export:** `counterEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate the logic for counter-attack card effects.

---

## Main Components

### 1. `counterEffect(currentInfra, infraIndex, updatedInfrastructure, card)`
- **Purpose:** Applies the effect of a counter-attack card to the target infrastructure.
- **Parameters:**
  - `currentInfra`: The target infrastructure card.
  - `infraIndex`: The index of the target infrastructure in the array.
  - `updatedInfrastructure`: The full array of infrastructure cards.
  - `card`: The card being played.
- **Returns:**
  - The updated infrastructure array after applying the effect.
- **Logic:**
  - If the target is shielded, removes the shield and sets the state to 'secure'.
  - Otherwise, no effect is applied.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used by the main card effect router to process counter-attack card effects during a throw card move.

---

## Related Files
- `shieldEffect.ts`: Logic for applying shields.

---

## Notes
- The function is robust to infrastructure state and includes safety checks for shield removal.
- Debug logging is present for troubleshooting effect logic. 