# wildcardResolver.ts

**Location:** `game-server/src/game/actions/wildcardResolver.ts`

---

## File Overview

This file implements the Wildcard Card Resolution System for Darknet Duel. It centralizes all logic related to wildcard cards, including type resolution, validation, and effect application. The main export is the `WildcardResolver` class, which provides static methods for handling wildcard card behavior in various game contexts.

- **Primary export:** `WildcardResolver` class
- **Dependencies:** Shared card and game types, wildcard utility functions, temporary effects manager, hand disruption handler.
- **Purpose:** To encapsulate all wildcard card logic for maintainability and consistency.

---

## Main Components

### 1. `WildcardPlayContext` Interface
- **Purpose:** Defines the context in which a wildcard card is played, including game state, player role, card, target infrastructure, and optional chosen type.
- **Fields:**
  - `gameState`, `playerRole`, `card`, `targetInfrastructure`, `chosenType`, `playerID`

### 2. `WildcardResolver` Class

#### `resolveWildcardType(card, chosenType)`
- **Purpose:** Resolves a wildcard card to a specific card type, using the player's choice if valid, or defaulting to the first available type.
- **Parameters:**
  - `card`: The wildcard card.
  - `chosenType`: Optional player-chosen type.
- **Returns:**
  - The resolved `CardType`.
- **Logic:**
  - If not a wildcard, returns the card's original type.
  - Uses `getAvailableCardTypes` to determine valid types.

#### `getAvailableTypes(card, context)`
- **Purpose:** Returns all valid card types that a wildcard can be played as, filtered by game context.
- **Parameters:**
  - `card`: The wildcard card.
  - `context`: The play context.
- **Returns:**
  - Array of valid `CardType` values.
- **Logic:**
  - Uses `getAvailableCardTypes` and filters with `canPlayAs`.

#### `canPlayAs(card, asType, context)`
- **Purpose:** Checks if a wildcard card can be played as a specific type in the current context.
- **Parameters:**
  - `card`: The wildcard card.
  - `asType`: The target card type.
  - `context`: The play context.
- **Returns:**
  - `true` if the card can be played as the specified type, `false` otherwise.
- **Logic:**
  - Validates type against available types and target infrastructure state.

#### `applyWildcardEffects(card, context)`
- **Purpose:** Applies special effects for wildcard cards, updating the game state as needed.
- **Parameters:**
  - `card`: The wildcard card.
  - `context`: The play context.
- **Returns:**
  - Updated `GameState` with effects applied.
- **Logic:**
  - Handles card-specific effects (e.g., A301, A302, A304, D301, D304, A307, A305, A306) and generic special effects.
  - Integrates with `TemporaryEffectsManager` and hand disruption logic.
  - Sets up pending choices for cards like A306 (AI-Powered Attack).

---

## Example Usage

Used by move handlers and game logic to resolve wildcard card plays, validate choices, and apply effects.

---

## Related Files
- `temporaryEffectsManager.ts`: Manages temporary and persistent effects.
- `wildcardUtils.ts`: Utility functions for wildcard type handling.
- `handDisruption.ts`: Logic for hand disruption effects.

---

## Notes
- The class is designed for extensibility and centralizes all wildcard logic for maintainability.
- Debug logging is present for troubleshooting effect application and card resolution. 