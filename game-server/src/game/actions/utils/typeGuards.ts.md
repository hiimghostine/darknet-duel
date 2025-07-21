# typeGuards.ts

**Location:** `game-server/src/game/actions/utils/typeGuards.ts`

---

## File Overview

This file provides type guard utilities for card objects in Darknet Duel. It includes logic for checking if a card object has certain properties required for advanced card features.

- **Primary export:** `hasCardFeatures`
- **Dependencies:** Shared card types.
- **Purpose:** To encapsulate type guard logic for advanced card features.

---

## Main Components

### 1. `hasCardFeatures(card)`
- **Purpose:** Type guard to check if a card has certain properties from the Card interface.
- **Parameters:**
  - `card`: The card object to check.
- **Returns:**
  - `true` if the card has advanced features, `false` otherwise.
- **Logic:**
  - Checks that the card is a non-null object.

---

## Example Usage

Used by move handlers and effect logic to safely access advanced card properties.

---

## Related Files
- `validators.ts`: For targeting validation.

---

## Notes
- The function is robust to different card object shapes and includes safety checks for type guarding. 