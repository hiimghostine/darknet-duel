# reactionEffect.ts

**Location:** `game-server/src/game/actions/throwCardMove/cardEffects/reactionEffect.ts`

---

## File Overview

This file provides the effect handler for reaction cards in Darknet Duel. It defines the logic for applying a reaction effect to a target infrastructure, specifically canceling exploit effects on vulnerable infrastructure.

- **Primary export:** `reactionEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate the logic for reaction card effects.

---

## Main Components

### 1. `reactionEffect(currentInfra, infraIndex, updatedInfrastructure, card)`
- **Purpose:** Applies the effect of a reaction card to the target infrastructure.
- **Parameters:**
  - `currentInfra`: The target infrastructure card.
  - `infraIndex`: The index of the target infrastructure in the array.
  - `updatedInfrastructure`: The full array of infrastructure cards.
  - `card`: The card being played.
- **Returns:**
  - The updated infrastructure array after applying the effect.
- **Logic:**
  - If the target is vulnerable, removes vulnerabilities and sets the state to 'secure'.
  - Otherwise, no effect is applied.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used by the main card effect router to process reaction card effects during a throw card move.

---

## Related Files
- `exploitEffect.ts`: Logic for applying vulnerabilities.

---

## Notes
- The function is robust to infrastructure state and includes safety checks for vulnerability removal.
- Debug logging is present for troubleshooting effect logic. 