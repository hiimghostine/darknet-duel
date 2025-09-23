# cardTypes.ts

**Location:** `game-server/src/game/cards/cardTypes.ts`

---

## File Overview

This file defines the main TypeScript types and interfaces for attacker and defender cards in Darknet Duel. It extends shared card types with game-specific fields and provides collection types for loading card data from JSON files.

- **Primary exports:** `CardType`, `CardCategory`, `CardTarget`, `GameCard`, `AttackerCard`, `DefenderCard`, `AttackerCardCollection`, `DefenderCardCollection`
- **Dependencies:** Shared card types from `shared-types/card.types`.
- **Purpose:** To provide canonical type definitions for all card-related data structures used in the backend.

---

## Main Components

### 1. `CardType`
- **Purpose:** Alias for the shared card type enum, representing all possible card types.

### 2. `CardCategory`
- **Purpose:** Enumerates the main categories for cards (network, web, data, social, malware, any).

### 3. `CardTarget`
- **Purpose:** Enumerates possible targets for card effects (infrastructure, vulnerable, compromised, etc).

### 4. `GameCard`
- **Purpose:** Extends the shared `Card` type with additional properties for the game server.
- **Fields:**
  - `category`, `flavor`, `effect`, `img`, `target`

### 5. `AttackerCard`
- **Purpose:** Specialized card type for attacker cards, with additional fields for vulnerabilities, special effects, and more.
- **Fields:**
  - `vulnerability`, `leadsTo`, `wildcardType`, `specialEffect`, `counterType`, `attackValue`, `requires`, `onCompromise`, `costReduction`, `draw`, `lookAt`

### 6. `DefenderCard`
- **Purpose:** Specialized card type for defender cards, with additional fields for wildcards, draw, and additional plays.
- **Fields:**
  - `wildcardType`, `draw`, `additionalPlays`

### 7. `CardCollection<T>`
- **Purpose:** Generic collection type for loading card data from JSON files, with versioning and metadata.
- **Fields:**
  - `version`, `lastUpdated`, `cards`

### 8. `AttackerCardCollection`, `DefenderCardCollection`
- **Purpose:** Specialized collection types for attacker and defender cards.

---

## Example Usage

Used by card loader utilities to type-check card data loaded from JSON files.

---

## Related Files
- `types.ts`: Canonical source of truth for card-related types.
- `attackerCardLoader.ts`, `defenderCardLoader.ts`: Card loader logic.

---

## Notes
- Any changes to these types should be reflected in the frontend for consistency. 