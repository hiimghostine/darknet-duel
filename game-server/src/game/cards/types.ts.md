# types.ts

**Location:** `game-server/src/game/cards/types.ts`

---

## File Overview

This file is the canonical source of truth for all card-related types used in the backend of Darknet Duel. It defines attack vectors, infrastructure states, card types, and all interfaces for cards, effects, vulnerabilities, shields, and collections. It is critical for type safety and must be kept in sync with the frontend.

- **Primary exports:** `AttackVector`, `InfrastructureState`, `CardType`, `Vulnerability`, `Shield`, `InfrastructureCard`, `CardEffect`, `Card`, `CardCollection`, `InfrastructureCollection`, `AttackerCollection`, `DefenderCollection`
- **Purpose:** To provide a comprehensive and authoritative set of type definitions for all card and infrastructure data in the game.

---

## Main Components

### 1. `AttackVector`
- **Purpose:** Enumerates the possible attack vectors for vulnerabilities (network, web, social, malware).

### 2. `InfrastructureState`
- **Purpose:** Enumerates the possible states for infrastructure cards (secure, vulnerable, shielded, compromised, fortified).

### 3. `CardType`
- **Purpose:** Enumerates all possible card types for both attacker and defender cards.
- **Values:**
  - Attacker: exploit, attack, counter-attack, wildcard
  - Defender: shield, fortify, response

### 4. `Vulnerability`
- **Purpose:** Represents a vulnerability applied to an infrastructure card.
- **Fields:**
  - `vector`, `appliedBy`, `appliedByPlayer`, `timestamp`

### 5. `Shield`
- **Purpose:** Represents a shield applied to an infrastructure card.
- **Fields:**
  - `vector`, `appliedBy`, `appliedByPlayer`, `timestamp`

### 6. `InfrastructureCard`
- **Purpose:** Represents an infrastructure card in the game.
- **Fields:**
  - `id`, `name`, `type`, `description`, `flavor`, `vulnerableVectors`, `vulnerabilities`, `shields`, `img`, `state`

### 7. `CardEffect`
- **Purpose:** Represents an effect that a card can have.
- **Fields:**
  - `type`, `value`, `description`

### 8. `Card`
- **Purpose:** Base interface for all game cards.
- **Fields:**
  - `id`, `name`, `type`, `cost`, `description`, `isReactive`, `attackVector`, `effects`, `leadsTo`, `wildcardType`, `specialEffect`, `draw`, `lookAt`, `preventReaction`, `playable`

### 9. `CardCollection<T>`
- **Purpose:** Generic collection type for loading card data from JSON files, with versioning and metadata.
- **Fields:**
  - `version`, `lastUpdated`, `cards`

### 10. `InfrastructureCollection`, `AttackerCollection`, `DefenderCollection`
- **Purpose:** Specialized collection types for infrastructure, attacker, and defender cards.

---

## Example Usage

Used throughout the backend for type safety in card logic, deck building, and infrastructure management.

---

## Related Files
- `cardTypes.ts`: Game-specific extensions of these types.
- `attackerCardLoader.ts`, `defenderCardLoader.ts`: Card loader logic.

---

## Notes
- Any changes to these types must be reflected in the frontend for consistency.
- This file is critical for maintaining type safety across the codebase. 