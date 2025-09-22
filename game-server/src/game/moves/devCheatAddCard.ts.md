# devCheatAddCard.ts

**Location:** `game-server/src/game/moves/devCheatAddCard.ts`

---

## File Overview

This file implements a developer-only move for adding any card to a player's hand. It is intended strictly for testing and development purposes and is disabled in production mode.

- **Primary export:** `devCheatAddCardMove`
- **Dependencies:** Game state types, card types.
- **Purpose:** To allow developers to add arbitrary cards to a player's hand for debugging and testing.

---

## Main Components

### 1. `devCheatAddCardMove(G, ctx, playerID, card)`
- **Purpose:** Adds a specified card to the player's hand if in development mode.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player receiving the card.
  - `card`: The card object to add.
- **Returns:**
  - Updated game state with the card added to the player's hand, or an error message if not allowed.
- **Logic:**
  - Only allows the move in development mode (`NODE_ENV === 'development'`).
  - Validates the card object and player.
  - Adds the card to the player's hand and records the action.
  - Provides extensive debug logging for troubleshooting.
- **Side Effects:**
  - Logs actions and errors to the console.

---

## Example Usage

Used by developers during local testing to simulate card effects and edge cases.

---

## Related Files
- `actionStageMoves.ts`, `reactionStageMoves.ts`: Where this move is exposed for use in the game.

---

## Notes
- This move is strictly for development and should never be enabled in production.
- Includes robust validation and error handling for safe testing. 