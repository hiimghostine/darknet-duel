# cardLoader.ts

**Location:** `game-server/src/game/cards/cardLoader.ts`

---

## File Overview

This file defines the `CardLoader` class, which provides utilities for loading and accessing infrastructure card data from a JSON file. It supports retrieving all cards, a specific card by ID, or a random selection of cards.

- **Primary export:** `CardLoader` class and a singleton instance `cardLoader`
- **Dependencies:** Node.js `fs` and `path`, infrastructure card types.
- **Purpose:** To load and provide access to infrastructure card data for the game.

---

## Main Components

### 1. `CardLoader` Class

#### Constructor
- **Purpose:** Initializes the loader and loads all infrastructure card data from JSON.
- **Side Effects:**
  - Calls `loadInfrastructureCards` to populate the internal array.

#### `loadInfrastructureCards()`
- **Purpose:** Loads infrastructure cards from a JSON file.
- **Side Effects:**
  - Reads and parses `infrastructure.json`.
  - Populates the internal array.
  - Logs errors if loading fails.

#### `getInfrastructureCards()`
- **Purpose:** Returns all loaded infrastructure cards.
- **Returns:**
  - An array of `InfrastructureCard` objects.

#### `getInfrastructureCardById(id)`
- **Purpose:** Returns a specific infrastructure card by its ID.
- **Parameters:**
  - `id`: The card's unique identifier.
- **Returns:**
  - The matching `InfrastructureCard` object, or `undefined` if not found.

#### `getRandomInfrastructureCards(count)`
- **Purpose:** Returns a random selection of infrastructure cards.
- **Parameters:**
  - `count`: The number of cards to return.
- **Returns:**
  - An array of randomly selected `InfrastructureCard` objects.
- **Logic:**
  - Shuffles the internal array and returns the first `count` cards.

### 2. Singleton Export
- **Purpose:** Provides a single shared instance of `CardLoader` for use throughout the app.

---

## Example Usage

Used by game setup and deck-building logic to access infrastructure card data.

---

## Related Files
- `infrastructureCardLoader.ts`: Alternative infrastructure card creation logic.

---

## Notes
- The loader reads from a JSON file and is robust to loading errors.
- The singleton pattern ensures consistent access to card data. 