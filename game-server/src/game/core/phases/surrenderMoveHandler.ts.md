# surrenderMoveHandler.ts

**Location:** `game-server/src/game/core/phases/surrenderMoveHandler.ts`

---

## File Overview

This file provides centralized handlers for player surrender actions in Darknet Duel. It eliminates code duplication by providing a single place to handle surrender logic across all phases and stages.

- **Primary exports:** `handleSurrender`, `handleSurrenderInGameOver`
- **Dependencies:** Game state types, chat handler.
- **Purpose:** To encapsulate all logic for surrender actions, supporting modular and testable code.

---

## Main Components

### 1. `handleSurrender({ G, ctx, playerID, events })`
- **Purpose:** Handles player surrender, determines the winner, updates the game state, and transitions to the gameOver phase.
- **Parameters:** Move context.
- **Returns:** Updated game state with winner and message.
- **Logic:** Determines which player surrendered, sets the winner, adds a system message, and transitions to gameOver phase.
- **Side Effects:** Logs actions, updates chat, and sets boardgame.io phase.

### 2. `handleSurrenderInGameOver({ G, playerID })`
- **Purpose:** Handles surrender actions when the game is already over.
- **Parameters:** Move context.
- **Returns:** Updated game state with a system message.
- **Logic:** Adds a system message about the surrender without changing the winner.
- **Side Effects:** Logs actions and updates chat.

---

## Example Usage

Used by move handlers and phase logic to process surrender actions.

---

## Related Files
- `chatMoveHandler.ts`: For adding system messages to chat.

---

## Notes
- The functions are robust to different game phases and include safety checks for player IDs. 