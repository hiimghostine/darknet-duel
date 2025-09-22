# playerManager.ts

**Location:** `game-server/src/game/core/playerManager.ts`

---

## File Overview

This file provides player initialization and management utilities for Darknet Duel. It includes functions for creating players with role-specific decks, drawing cards, and updating action points at the start of a turn.

- **Primary exports:** `initializePlayer`, `initializePlayerWithData`, `drawCard`, `drawStartingHand`, `updateActionPoints`
- **Dependencies:** Shared game types, attacker/defender deck loaders.
- **Purpose:** To manage player state, deck, hand, and turn resources.

---

## Main Components

### 1. `initializePlayer(playerId, role, gameConfig)`
- **Purpose:** Initializes a player with a role-specific deck and starting resources.
- **Parameters:**
  - `playerId`: Unique player identifier.
  - `role`: Player role ('attacker' or 'defender').
  - `gameConfig`: Game configuration object.
- **Returns:**
  - A fully initialized `Player` object.
- **Logic:**
  - Loads the appropriate deck, sets resources, AP, and initializes hand/field/discard.

### 2. `initializePlayerWithData(playerId, role, gameConfig, userData)`
- **Purpose:** Initializes a player with real user data (UUID, name).
- **Parameters:**
  - `playerId`: Boardgame.io player identifier.
  - `role`: Player role.
  - `gameConfig`: Game configuration object.
  - `userData`: Object with `id` and `name`.
- **Returns:**
  - A fully initialized `Player` object with real user data.

### 3. `drawCard(player)`
- **Purpose:** Draws a card from the player's deck into their hand.
- **Parameters:**
  - `player`: The current player state.
- **Returns:**
  - Updated player state with a new card in hand.
- **Logic:**
  - Removes the top card from the deck and adds it to the hand.

### 4. `drawStartingHand(player, handSize)`
- **Purpose:** Draws the starting hand for a player.
- **Parameters:**
  - `player`: The current player state.
  - `handSize`: Number of cards to draw.
- **Returns:**
  - Updated player with initial hand.

### 5. `updateActionPoints(player, role, gameConfig)`
- **Purpose:** Updates a player's action points at the start of their turn.
- **Parameters:**
  - `player`: The current player state.
  - `role`: Player role.
  - `gameConfig`: Game configuration object.
- **Returns:**
  - Updated player with new action points.
- **Logic:**
  - Adds role-specific AP, capped at the maximum, and resets card cycles used.

---

## Example Usage

Used by the game phases and move handlers to initialize players, draw cards, and update turn resources.

---

## Related Files
- `gameState.ts`: Game state initialization and end logic.
- `attackerCardLoader.ts`, `defenderCardLoader.ts`: Deck creation logic.

---

## Notes
- All player initialization is role-aware and supports real user data for backend integration.
- Decks are deep-copied to ensure serialization safety. 