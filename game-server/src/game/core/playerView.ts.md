# playerView.ts

**Location:** `game-server/src/game/core/playerView.ts`

---

## File Overview

This file defines the logic for filtering the game state for each player or spectator. It ensures that players only see information they are allowed to see (e.g., their own hand, not their opponent's), and provides a special view for spectators. It also marks which cards are playable for the current player.

- **Primary export:** `createPlayerView`
- **Dependencies:** boardgame.io context, shared game and card types, card utility functions.
- **Purpose:** To provide a secure, role-aware, and debuggable view of the game state for each client.

---

## Main Components

### 1. `createPlayerView({ G, ctx, playerID })`
- **Purpose:** Returns a filtered version of the game state for the requesting player or spectator.
- **Parameters:**
  - `G`: The full game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the requesting player (or null for spectators).
- **Returns:**
  - A filtered `GameState` object with hidden opponent information and playability flags for cards.
- **Logic:**
  - Determines the role of the player (attacker, defender, or spectator).
  - Hides sensitive information (hand, deck) from the opponent.
  - Adds a `playable` property to each card in the player's hand.
  - Provides debug metadata for the client.
- **Side Effects:**
  - Logs extensive debug information for troubleshooting role detection and view filtering.

### 2. `filterGameStateForSpectators(G)`
- **Purpose:** Returns a filtered game state for spectators, hiding all player hands and decks.
- **Parameters:**
  - `G`: The full game state.
- **Returns:**
  - A filtered `GameState` object for spectators.

### 3. `filterPlayerForSpectator(player)`
- **Purpose:** Hides hand and deck details for a player, used in spectator view.
- **Parameters:**
  - `player`: The player object to filter.
- **Returns:**
  - A filtered `Player` object with hidden hand and deck.

### 4. `hideCardDetails(card)`
- **Purpose:** Hides sensitive card details, keeping only minimal info for display.
- **Parameters:**
  - `card`: The card object to hide details for.
- **Returns:**
  - A card object with only id, type, and placeholder values for other fields.

---

## Example Usage

Used by the game server to provide each client with a secure, filtered view of the game state.

---

## Related Files
- `cardUtils.ts`: Card utility functions, including playability checks.

---

## Notes
- The function is robust to different player ID formats and includes multiple role detection strategies.
- Debug logging is extensive to aid in troubleshooting view issues. 