# actionStageMoves.ts

**Location:** `game-server/src/game/core/phases/actionStageMoves.ts`

---

## File Overview

This file defines all moves available during the action stage of a turn in Darknet Duel. It includes chat, surrender, card play, card cycling, card throwing, end turn, chain target selection, card selection from deck, and developer cheat moves. The moves are designed to be used with the boardgame.io framework and handle both mutation and immutable update styles as needed.

- **Primary export:** `actionStageMoves` (object)
- **Dependencies:** Game state types, player manager, move handlers, and utility functions.
- **Purpose:** To encapsulate all logic for the action stage, supporting modular and testable code.

---

## Main Components

### 1. `sendChatMessage`
- **Purpose:** Handles chat messages sent by players during the action stage.
- **Parameters:** Move context and message content.
- **Logic:** Adds a new message to the chat array in the game state.
- **Side Effects:** Mutates the game state chat array.

### 2. `surrender`
- **Purpose:** Handles player surrender using a centralized handler.
- **Parameters:** Move context.
- **Logic:** Calls `handleSurrender` to update the game state and determine the winner.

### 3. `playCard`
- **Purpose:** Handles playing a card from the player's hand.
- **Parameters:** Move context and card ID.
- **Logic:** Delegates to `playCardMove`, checks for reaction eligibility, and may switch to the reaction stage.
- **Side Effects:** May end the turn or switch to reaction stage.

### 4. `cycleCard`
- **Purpose:** Handles cycling a card (discarding and drawing a new one).
- **Parameters:** Move context and card ID.
- **Logic:** Delegates to `cycleCardMove` and checks end conditions.

### 5. `throwCard`
- **Purpose:** Handles throwing a card at a target infrastructure.
- **Parameters:** Move context, card ID, and target infrastructure ID.
- **Logic:** Delegates to `throwCardMove`, checks for pending chain or card choices, and may switch to reaction stage.

### 6. `endTurn`
- **Purpose:** Handles ending the player's turn.
- **Parameters:** Move context.
- **Logic:** Draws cards, resets counters, adds action points, and ends the turn.

### 7. `chooseChainTarget`
- **Purpose:** Handles selecting a target for a chain effect.
- **Parameters:** Move context and target ID.
- **Logic:** Delegates to `chooseChainTargetMove` and may switch to reaction stage.

### 8. `chooseCardFromDeck`
- **Purpose:** Handles selecting a card from the deck (e.g., for AI-Powered Attack).
- **Parameters:** Move context and selected card ID.
- **Logic:** Delegates to `chooseCardFromDeckMove` and may switch to reaction stage.

### 9. `devCheatAddCard`
- **Purpose:** Developer-only move to add a card to a player's hand for testing.
- **Parameters:** Move context and card object.
- **Logic:** Delegates to `devCheatAddCardMove`.

---

## Example Usage

Used by the boardgame.io game definition to provide all action stage moves.

---

## Related Files
- `playerActions.ts`, `cycleCardMove.ts`, `throwCardMove.ts`, `chooseChainTarget.ts`, `chooseCardFromDeck.ts`, `devCheatAddCard.ts`: Move handlers.

---

## Notes
- The file uses both mutation and immutable update styles as appropriate for boardgame.io.
- Debug logging is present for troubleshooting move logic. 