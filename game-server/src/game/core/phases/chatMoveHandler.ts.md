# chatMoveHandler.ts

**Location:** `game-server/src/game/core/phases/chatMoveHandler.ts`

---

## File Overview

This file provides centralized handlers for chat messages in Darknet Duel. It eliminates code duplication by providing a single place to handle chat logic across all phases and stages, supporting both mutation and immutable update styles.

- **Primary exports:** `handleChatMessage`, `handleChatMessageImmutable`, `addSystemMessage`
- **Dependencies:** Game state types.
- **Purpose:** To encapsulate all logic for chat messaging, supporting modular and testable code.

---

## Main Components

### 1. `handleChatMessage({ G, playerID }, content)`
- **Purpose:** Handles chat messages using mutation style (for boardgame.io).
- **Parameters:** Move context and message content.
- **Logic:** Adds a new message to the chat array in the game state.
- **Side Effects:** Mutates the game state chat array.

### 2. `handleChatMessageImmutable({ G, playerID }, content)`
- **Purpose:** Handles chat messages using immutable style (returns new state).
- **Parameters:** Move context and message content.
- **Returns:** Updated game state with new message.
- **Logic:** Returns a new game state with the new message added.

### 3. `addSystemMessage(G, content)`
- **Purpose:** Adds a system message to the chat.
- **Parameters:** Game state and message content.
- **Logic:** Adds a system message to the chat array in the game state.
- **Side Effects:** Mutates the game state chat array.

---

## Example Usage

Used by move handlers and phase logic to process chat messages and system events.

---

## Related Files
- `surrenderMoveHandler.ts`: For adding system messages on surrender.

---

## Notes
- The functions are robust to different game phases and include safety checks for chat initialization. 