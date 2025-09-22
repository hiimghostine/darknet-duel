# effectHandling.ts

**Location:** `game-server/src/game/actions/utils/effectHandling.ts`

---

## File Overview

This file provides utility functions for applying special effects from cards in Darknet Duel. It includes logic for handling special effect types and updating the game state accordingly.

- **Primary export:** `applySpecialEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate logic for applying special effects from cards.

---

## Main Components

### 1. `applySpecialEffect(G, effectType, playerID)`
- **Purpose:** Applies a special effect from a card to the game state.
- **Parameters:**
  - `G`: The current game state.
  - `effectType`: The type of special effect to apply.
  - `playerID`: The ID of the acting player.
- **Returns:**
  - The updated game state after applying the effect.
- **Logic:**
  - Handles different effect types (e.g., 'draw_card').
  - Placeholder for more complex effect handling.

---

## Example Usage

Used by move handlers and effect logic to apply special effects after card plays.

---

## Related Files
- `validators.ts`: For targeting validation.

---

## Notes
- The function is a placeholder for more complex special effect logic.
- Extend this function as new special effects are added. 