# attackerCardLoader.ts

**Location:** `game-server/src/game/cards/attackerCardLoader.ts`

---

## File Overview

This file provides utilities for loading, converting, and shuffling attacker cards for Darknet Duel. It also defines the logic for constructing a properly distributed attacker deck for gameplay, based on card type and category.

- **Primary exports:** `loadAttackerCards`, `shuffleCards`, `createAttackerDeck`
- **Dependencies:** Node.js `fs` and `path`, shared card types, attacker card type definitions.
- **Purpose:** To load attacker card data from JSON, convert to game format, and build a balanced deck for play.

---

## Main Components

### 1. `loadAttackerCards()`
- **Purpose:** Loads attacker cards from a JSON file and converts them to the standard game `Card` type.
- **Returns:**
  - An array of `Card` objects representing attacker cards.
- **Logic:**
  - Reads `attacker.json`, parses the data, and maps each card to the standard format.
  - Handles special fields (e.g., `specialEffect`, `wildcardType`, `costReduction`).
  - Adds debug logging for specific cards.
- **Error Handling:**
  - Logs errors and returns an empty array if loading fails.

### 2. `shuffleCards(array)`
- **Purpose:** Shuffles an array using the Fisher-Yates algorithm.
- **Parameters:**
  - `array`: The array to shuffle.
- **Returns:**
  - The shuffled array.

### 3. `createAttackerDeck()`
- **Purpose:** Creates a shuffled, balanced deck of attacker cards for gameplay.
- **Returns:**
  - A shuffled array of `Card` objects, distributed by type and category.
- **Logic:**
  - Loads all attacker cards and groups them by type and category.
  - Ensures required counts for each category, duplicating cards as needed.
  - Assigns unique IDs to duplicates for serialization safety.
  - Logs warnings if there are not enough unique cards for any category.
  - Returns a shuffled deck ready for play.

---

## Example Usage

Used by player initialization and deck-building logic to provide attacker decks for each match.

---

## Related Files
- `defenderCardLoader.ts`: Similar logic for defender cards.
- `cardTypes.ts`: Attacker card type definitions.

---

## Notes
- Deck construction is robust to missing or insufficient card data, duplicating as needed.
- Debug logging is present for troubleshooting card loading and deck building. 