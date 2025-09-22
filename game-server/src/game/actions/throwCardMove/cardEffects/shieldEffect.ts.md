# shieldEffect.ts

**Location:** `game-server/src/game/actions/throwCardMove/cardEffects/shieldEffect.ts`

---

## File Overview

This file provides the effect handler for shield cards in Darknet Duel. It defines the logic for applying a shield effect to a target infrastructure, specifically adding a shield and updating the state to 'shielded'.

- **Primary export:** `shieldEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate the logic for shield card effects.

---

## Main Components

### 1. `shieldEffect(currentInfra, infraIndex, updatedInfrastructure, card, attackVector?, playerID?)`
- **Purpose:** Applies the effect of a shield card to the target infrastructure.
- **Parameters:**
  - `currentInfra`: The target infrastructure card.
  - `infraIndex`: The index of the target infrastructure in the array.
  - `updatedInfrastructure`: The full array of infrastructure cards.
  - `card`: The card being played.
  - `attackVector`: (Optional) The attack vector being shielded against.
  - `playerID`: (Optional) The ID of the acting player.
- **Returns:**
  - The updated infrastructure array after applying the effect.
- **Logic:**
  - Adds a new shield to the target infrastructure and sets its state to 'shielded'.
  - If no attack vector is provided, no effect is applied.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used by the main card effect router to process shield card effects during a throw card move.

---

## Related Files
- `counterEffect.ts`: Logic for removing shields.

---

## Notes
- The function is robust to infrastructure state and includes safety checks for shield application.
- Debug logging is present for troubleshooting effect logic. 