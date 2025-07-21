# validators.ts

**Location:** `game-server/src/game/actions/utils/validators.ts`

---

## File Overview

This file provides validation utilities for card targeting and action legality in Darknet Duel. It centralizes all logic for validating whether a card can target a given infrastructure, taking into account card type, infrastructure state, attack vectors, temporary effects, and special card rules.

- **Primary export:** `validateCardTargeting`
- **Dependencies:** Shared game and card types, temporary effects manager.
- **Purpose:** To encapsulate all validation logic for card targeting and action legality, supporting modular and testable code.

---

## Main Components

### 1. `validateCardTargeting(cardType, infrastructure, attackVector?, gameState?, card?, playerID?)`
- **Purpose:** Validates that a card can target a given infrastructure, considering card type, infrastructure state, attack vectors, temporary effects, and special card rules.
- **Parameters:**
  - `cardType`: The type of card being played.
  - `infrastructure`: The target infrastructure card.
  - `attackVector`: (Optional) The attack vector being used.
  - `gameState`: (Optional) The current game state.
  - `card`: (Optional) The card being played.
  - `playerID`: (Optional) The ID of the acting player.
- **Returns:**
  - `{ valid, message, bypassCost }` — Validation result, error message, and cost bypass flag for special cases.
- **Logic:**
  - Checks for temporary effects that may prevent actions (e.g., prevent reactions, prevent restore, chain vulnerability, restrict targeting).
  - Handles special card rules (e.g., Zero Trust Architecture, Quantum Resistant Cryptography, Honeypot, Living Off The Land).
  - Validates standard card targeting rules for each card type.
  - Handles legacy card types for backward compatibility.
- **Side Effects:**
  - Logs actions for debugging.

---

## Example Usage

Used by move handlers and effect logic to validate card targeting before applying effects.

---

## Related Files
- `temporaryEffectsManager.ts`: For checking temporary effects.
- `throwCardValidation.ts`: For full validation pipelines.

---

## Notes
- The function is robust to different card types, infrastructure states, and temporary effects.
- Debug logging is present for troubleshooting validation logic. 