# reactionStageMoves.ts

**Location:** `game-server/src/game/core/phases/reactionStageMoves.ts`

---

## File Overview

This file defines all moves available during the reaction stage of a turn in Darknet Duel. It includes chat, surrender, card play, throw card, legacy play reaction, skip reaction, and developer cheat moves. The moves are designed to be used with the boardgame.io framework and handle both mutation and immutable update styles as needed.

- **Primary export:** `reactionStageMoves` (object)
- **Dependencies:** Game state types, move handlers, and utility functions.
- **Purpose:** To encapsulate all logic for the reaction stage, supporting modular and testable code.

---

## Main Components

### 1. `sendChatMessage`
- **Purpose:** Handles chat messages sent by players during the reaction stage.
- **Parameters:** Move context and message content.
- **Logic:** Delegates to `handleChatMessage`.

### 2. `surrender`
- **Purpose:** Handles player surrender using a centralized handler.
- **Parameters:** Move context.
- **Logic:** Calls `handleSurrender` to update the game state and determine the winner.

### 3. `playCard`
- **Purpose:** Handles playing a card from the player's hand during the reaction stage.
- **Parameters:** Move context and card ID.
- **Logic:** Delegates to `playCardMove`, then returns to the action player's stage.

### 4. `throwCard`
- **Purpose:** Handles throwing a card at a target infrastructure during the reaction stage.
- **Parameters:** Move context, card ID, and target infrastructure ID.
- **Logic:** Delegates to `throwCardMove`, clears pending reactions, and returns to the action player's stage.

### 5. `playReaction`
- **Purpose:** Legacy move for playing a reaction card (for backward compatibility).
- **Parameters:** Move context and card ID.
- **Logic:** Checks card validity, removes from hand, adds to field, updates action points, and returns to action stage.

### 6. `skipReaction`
- **Purpose:** Handles skipping a reaction.
- **Parameters:** Move context.
- **Logic:** Clears pending reactions, records the action, and returns to action stage if no more reactions are pending.

### 7. `devCheatAddCard`
- **Purpose:** Developer-only move to add a card to a player's hand for testing.
- **Parameters:** Move context and card object.
- **Logic:** Delegates to `devCheatAddCardMove`.

---

## Example Usage

Used by the boardgame.io game definition to provide all reaction stage moves.

---

## Related Files
- `playerActions.ts`, `throwCardMove.ts`, `devCheatAddCard.ts`: Move handlers.

---

## Notes
- The file uses both mutation and immutable update styles as appropriate for boardgame.io.
- Debug logging is present for troubleshooting move logic. 