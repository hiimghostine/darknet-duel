# defenderCardLoader.ts

**Location:** `game-server/src/game/cards/defenderCardLoader.ts`

---

## File Overview

This file provides utilities for loading, converting, and shuffling defender cards for Darknet Duel. It also defines the logic for constructing a properly distributed defender deck for gameplay, based on card type and category.

- **Primary exports:** `loadDefenderCards`, `createDefenderDeck`
- **Dependencies:** Node.js `fs` and `path`, shared card types, defender card type definitions, attacker card shuffler.
- **Purpose:** To load defender card data from JSON, convert to game format, and build a balanced deck for play.

---

## Main Components

### 1. `loadDefenderCards()`
- **Purpose:** Loads defender cards from a JSON file and converts them to the standard game `Card` type.
- **Returns:**
  - An array of `Card` objects representing defender cards.
- **Logic:**
  - Reads `defender.json`, parses the data, and maps each card to the standard format.
  - Handles special fields (e.g., `specialEffect`, `wildcardType`, `draw`, `additionalPlays`).
  - Adds debug logging for card counts.
- **Error Handling:**
  - Logs errors and returns an empty array if loading fails.

### 2. `createDefenderDeck()`
- **Purpose:** Creates a shuffled, balanced deck of defender cards for gameplay.
- **Returns:**
  - A shuffled array of `Card` objects, distributed by type and category.
- **Logic:**
  - Loads all defender cards and groups them by type and category.
  - Ensures required counts for each category, duplicating cards as needed.
  - Assigns unique IDs to duplicates for serialization safety.
  - Logs warnings if there are not enough unique cards for any category.
  - Returns a shuffled deck ready for play.

---

## Example Usage

Used by player initialization and deck-building logic to provide defender decks for each match.

---

## Related Files
- `attackerCardLoader.ts`: Similar logic for attacker cards.
- `cardTypes.ts`: Defender card type definitions.

---

## Notes
- Deck construction is robust to missing or insufficient card data, duplicating as needed.
- Debug logging is present for troubleshooting card loading and deck building. 