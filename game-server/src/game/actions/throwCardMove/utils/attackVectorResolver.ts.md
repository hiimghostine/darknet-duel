# attackVectorResolver.ts

**Location:** `game-server/src/game/actions/throwCardMove/utils/attackVectorResolver.ts`

---

## File Overview

This file provides attack vector resolution utilities for the throw card move in Darknet Duel. It handles all logic for determining the correct attack vector for a card, including explicit, metadata, wildcard, and fallback sources, as well as compatibility validation.

- **Primary exports:** `resolveAttackVector`, `resolveAndValidateAttackVector`, and supporting functions
- **Dependencies:** Shared card types, type guards.
- **Purpose:** To encapsulate all attack vector determination and validation logic for the throw card action.

---

## Main Components

### 1. `AttackVectorContext` Interface
- **Purpose:** Defines the context for resolving the attack vector (card and target infrastructure).

### 2. `AttackVectorResult` Interface
- **Purpose:** Defines the result of an attack vector resolution, including source and reason.

### 3. `getExplicitAttackVector(card)`
- **Purpose:** Gets the attack vector from the card's explicit property.
- **Parameters:**
  - `card`: The card being played.
- **Returns:**
  - The explicit `AttackVector`, or `undefined` if not present.

### 4. `getMetadataAttackVector(card)`
- **Purpose:** Gets the attack vector from the card's metadata category.
- **Parameters:**
  - `card`: The card being played.
- **Returns:**
  - The metadata-derived `AttackVector`, or `undefined` if not present.

### 5. `getWildcardAttackVector(card, targetInfrastructure)`
- **Purpose:** Gets the attack vector for wildcards based on the target infrastructure's vulnerable vectors.
- **Parameters:**
  - `card`: The card being played.
  - `targetInfrastructure`: The target infrastructure.
- **Returns:**
  - The derived `AttackVector`, or `undefined` if not applicable.

### 6. `getFallbackAttackVector()`
- **Purpose:** Provides a fallback attack vector ('network') if no other source is available.
- **Returns:**
  - The fallback `AttackVector`.

### 7. `resolveAttackVector(context)`
- **Purpose:** Resolves the attack vector for a card using all available sources, with debug logging.
- **Parameters:**
  - `context`: The attack vector context.
- **Returns:**
  - `AttackVectorResult` — The resolved attack vector, source, and reason.

### 8. `validateAttackVectorCompatibility(attackVector, targetInfrastructure)`
- **Purpose:** Validates that the resolved attack vector is compatible with the target infrastructure's vulnerabilities.
- **Parameters:**
  - `attackVector`: The resolved attack vector.
  - `targetInfrastructure`: The target infrastructure.
- **Returns:**
  - `{ compatible, reason }` — Compatibility result.

### 9. `resolveAndValidateAttackVector(context)`
- **Purpose:** Complete attack vector resolution with compatibility validation.
- **Parameters:**
  - `context`: The attack vector context.
- **Returns:**
  - `{ success, attackVector, source, reason, error }` — Resolution and validation result.

---

## Example Usage

Used by the main throw card move logic to resolve the correct attack vector before proceeding.

---

## Related Files
- `throwCardValidation.ts`, `costCalculation.ts`: Additional modular logic for throw card moves.

---

## Notes
- The modular structure improves maintainability and testability.
- Debug logging is present for troubleshooting attack vector resolution logic. 