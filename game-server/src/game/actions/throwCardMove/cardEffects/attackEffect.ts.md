# attackEffect.ts

**Location:** `game-server/src/game/actions/throwCardMove/cardEffects/attackEffect.ts`

---

## File Overview

This file provides the effect handler for attack cards in Darknet Duel. It defines the logic for applying an attack effect to a target infrastructure, specifically compromising vulnerable infrastructure and checking for victory conditions.

- **Primary export:** `attackEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate the logic for attack card effects.

---

## Main Components

### 1. `attackEffect(currentInfra, infraIndex, updatedInfrastructure, card, attackVector?, playerID?)`
- **Purpose:** Applies the effect of an attack card to the target infrastructure.
- **Parameters:**
  - `currentInfra`: The target infrastructure card.
  - `infraIndex`: The index of the target infrastructure in the array.
  - `updatedInfrastructure`: The full array of infrastructure cards.
  - `card`: The card being played.
  - `attackVector`: (Optional) The attack vector being used.
  - `playerID`: (Optional) The ID of the acting player.
- **Returns:**
  - The updated infrastructure array, or `null` if the attack couldn't be performed, or `{ victory: true }` if the attack results in victory.
- **Logic:**
  - Checks if the target is vulnerable to the attack vector and in the correct state.
  - If so, compromises the infrastructure and checks for victory conditions.
  - Otherwise, no effect is applied.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used by the main card effect router to process attack card effects during a throw card move.

---

## Related Files
- `exploitEffect.ts`: Logic for applying vulnerabilities.

---

## Notes
- The function is robust to infrastructure state and includes safety checks for attack application and victory checks.
- Debug logging is present for troubleshooting effect logic. 