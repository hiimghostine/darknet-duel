# wildcardUtils.ts

**Location:** `game-server/src/game/utils/wildcardUtils.ts`

---

## File Overview

This file provides utility functions for handling wildcard card types and behavior in Darknet Duel. It centralizes logic for determining effective card types, available types, playability, and display names for wildcard cards.

- **Primary exports:** `getEffectiveCardType`, `getAvailableCardTypes`, `canPlayWildcardAs`, `getWildcardTypeDisplay`
- **Dependencies:** Shared card types.
- **Purpose:** To encapsulate all logic for wildcard card handling, supporting modular and testable code.

---

## Main Components

### 1. `getEffectiveCardType(cardType, wildcardType)`
- **Purpose:** Determines the effective card type for a wildcard card, handling both string and array formats.
- **Parameters:**
  - `cardType`: The original card type.
  - `wildcardType`: The wildcardType property (string or array).
- **Returns:**
  - The effective card type to use.
- **Logic:**
  - Handles array and string formats, special cases, and defaults.

### 2. `getAvailableCardTypes(wildcardType)`
- **Purpose:** Returns a list of all card types a wildcard can be played as.
- **Parameters:**
  - `wildcardType`: The wildcardType property from the card.
- **Returns:**
  - Array of valid card types.
- **Logic:**
  - Handles array and string formats, special cases, and defaults.

### 3. `canPlayWildcardAs(wildcardType, asType)`
- **Purpose:** Checks if a wildcard card can be played as a specific card type.
- **Parameters:**
  - `wildcardType`: The wildcardType property from the card.
  - `asType`: The target card type to check.
- **Returns:**
  - `true` if the wildcard can be played as the specified type, `false` otherwise.
- **Logic:**
  - Checks available types and special cases.

### 4. `getWildcardTypeDisplay(wildcardType)`
- **Purpose:** Returns a user-friendly display name for the wildcard type.
- **Parameters:**
  - `wildcardType`: The wildcardType property from the card.
- **Returns:**
  - A user-friendly string for display.
- **Logic:**
  - Handles array and string formats, special cases, and defaults.

---

## Example Usage

Used by move handlers and effect logic to determine wildcard card behavior and display.

---

## Related Files
- `chooseWildcardType.ts`, `throwCardMove.ts`: For wildcard effect resolution.

---

## Notes
- The functions are robust to different wildcard type formats and include safety checks for type handling. 