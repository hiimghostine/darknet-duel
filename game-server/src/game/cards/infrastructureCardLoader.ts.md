# infrastructureCardLoader.ts

**Location:** `game-server/src/game/cards/infrastructureCardLoader.ts`

---

## File Overview

This file provides utilities for creating and managing infrastructure cards for Darknet Duel. It includes helpers for type adaptation and for constructing the set of infrastructure cards used in each match.

- **Primary exports:** `createInfrastructureCards`, `createInfrastructureDeck`
- **Dependencies:** Shared game and card types.
- **Purpose:** To define and instantiate the infrastructure cards for the game board.

---

## Main Components

### 1. Type Adaptation Helpers
- **Purpose:** Convert string literals to strongly typed shared interfaces for infrastructure state and attack vectors.
- **Functions:**
  - `asInfraState(state)`: Converts a string to `InfrastructureState`.
  - `asAttackVector(v)`: Converts a string to `AttackVector`.
  - `asAttackVectorArray(vectors)`: Converts an array of strings to `AttackVector[]`.
  - `asVulnStringArray(vulns)`: Returns the array as-is (for compatibility).
  - `asInfraCard(card, type)`: Constructs a properly typed `InfrastructureCard`.

### 2. `createInfrastructureCards()`
- **Purpose:** Creates the set of infrastructure cards for the game.
- **Returns:**
  - An array of `InfrastructureCard` objects, one for each core infrastructure type.
- **Logic:**
  - Defines five core infrastructure cards (firewall, website, database, workstations, financial system), each with unique properties and vulnerabilities.

### 3. `createInfrastructureDeck()`
- **Purpose:** Returns the set of infrastructure cards for the standard game.
- **Returns:**
  - An array of `InfrastructureCard` objects (all five core cards).
- **Logic:**
  - In the standard game, all five cards are always used.

---

## Example Usage

Used by game setup and player initialization to create the infrastructure board for each match.

---

## Related Files
- `gameState.ts`: Game state initialization logic.

---

## Notes
- Type adaptation helpers are included for compatibility with shared types and gradual migration.
- The infrastructure deck is not shuffled, as all cards are used in each game. 