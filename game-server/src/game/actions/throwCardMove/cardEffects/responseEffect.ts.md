# responseEffect.ts

**Location:** `game-server/src/game/actions/throwCardMove/cardEffects/responseEffect.ts`

---

## File Overview

This file provides the effect handler for response cards in Darknet Duel. It defines the logic for applying a response effect to a target infrastructure, specifically recovering compromised infrastructure.

- **Primary export:** `responseEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate the logic for response card effects.

---

## Main Components

### 1. `responseEffect(currentInfra, infraIndex, updatedInfrastructure, card)`
- **Purpose:** Applies the effect of a response card to the target infrastructure.
- **Parameters:**
  - `currentInfra`: The target infrastructure card.
  - `infraIndex`: The index of the target infrastructure in the array.
  - `updatedInfrastructure`: The full array of infrastructure cards.
  - `card`: The card being played.
- **Returns:**
  - The updated infrastructure array after applying the effect.
- **Logic:**
  - If the target is compromised, removes vulnerabilities and sets the state to 'secure'.
  - Otherwise, no effect is applied.

---

## Example Usage

Used by the main card effect router to process response card effects during a throw card move.

---

## Related Files
- `attackEffect.ts`: Logic for compromising infrastructure.

---

## Notes
- The function is robust to infrastructure state and includes safety checks for recovery. 