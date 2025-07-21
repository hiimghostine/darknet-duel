# gameState.ts

**Location:** `game-server/src/game/core/gameState.ts`

---

## File Overview

This file provides the core game state initialization and end condition logic for Darknet Duel. It defines how the game state is created at the start of a match and how the game end is determined based on win conditions or abandonment.

- **Primary exports:** `createInitialState`, `checkGameEnd`
- **Dependencies:** Shared game types.
- **Purpose:** To initialize the game state and determine when the game ends.

---

## Main Components

### 1. `createInitialState()`
- **Purpose:** Creates and returns the initial game state for a new match.
- **Returns:**
  - A `GameState` object with default values for turn, phase, scores, config, and empty infrastructure.
- **Logic:**
  - Sets up the attacker to go first, round/turn counters, and default configuration for resources, hand size, AP, etc.

### 2. `checkGameEnd(G)`
- **Purpose:** Determines if the game has ended and who the winner is.
- **Parameters:**
  - `G`: The current game state.
- **Returns:**
  - An object with `{ winner: PlayerRole | 'abandoned' }` if the game has ended, or `undefined` if not.
- **Logic:**
  - Checks for max turns (defender wins if reached).
  - Checks for infrastructure control (majority wins for attacker or defender).
  - Checks for abandonment (all players disconnected).

---

## Example Usage

Used by the main game definition to initialize state and check for game end after each move or turn.

---

## Related Files
- `playerManager.ts`: Player initialization logic.

---

## Notes
- The configuration is designed for standard mode but can be extended for other modes.
- The infrastructure win threshold is calculated as a majority of the available cards. 