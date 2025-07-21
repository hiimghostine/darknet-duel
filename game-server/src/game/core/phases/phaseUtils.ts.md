# phaseUtils.ts

**Location:** `game-server/src/game/core/phases/phaseUtils.ts`

---

## File Overview

This file provides utility functions and helpers for managing game phases in Darknet Duel. It centralizes logic used across multiple phases, including end condition checks, player initialization, turn transitions, and win condition evaluation.

- **Primary exports:** Utility functions for phase management.
- **Dependencies:** Game state types, boardgame.io context.
- **Purpose:** To encapsulate all logic for phase management, supporting modular and testable code.

---

## Main Components

### 1. `debugLog(message)`
- **Purpose:** Logs a debug message with consistent formatting.
- **Parameters:** Message string.
- **Side Effects:** Logs to console.

### 2. `checkEndConditions(G, ctx, events)`
- **Purpose:** Checks if the turn should end due to end conditions (no action points or no cards).
- **Parameters:** Game state, context, events.
- **Returns:** Updated game state.
- **Side Effects:** May end the turn via events.

### 3. `areBothPlayersInitialized(G)`
- **Purpose:** Checks if both players are initialized in the game state.
- **Parameters:** Game state.
- **Returns:** Boolean.

### 4. `areBothPlayersConnected(ctx)`
- **Purpose:** Checks if both players are connected in the boardgame.io context.
- **Parameters:** Context.
- **Returns:** Boolean.

### 5. `canGameStart(G, ctx)`
- **Purpose:** Checks if the game can start (both players initialized and connected).
- **Parameters:** Game state, context.
- **Returns:** Boolean.

### 6. `getOpponentId(G, playerID)`
- **Purpose:** Gets the opponent's player ID.
- **Parameters:** Game state, player ID.
- **Returns:** Opponent's player ID or undefined.

### 7. `switchToStage(events, playerId, stage)`
- **Purpose:** Switches active players to a specific stage.
- **Parameters:** Events, player ID, stage name.
- **Side Effects:** Sets active players via events.

### 8. `switchCurrentPlayerToStage(events, stage)`
- **Purpose:** Switches the current player to a specific stage.
- **Parameters:** Events, stage name.
- **Side Effects:** Sets active players via events.

### 9. `isReactionEligible(cardType)`
- **Purpose:** Checks if a card type is eligible for reactions.
- **Parameters:** Card type string.
- **Returns:** Boolean.

### 10. `checkWinConditions(G)`
- **Purpose:** Checks for win conditions (round limit, infrastructure control).
- **Parameters:** Game state.
- **Returns:** Object with winner info and reason.

### 11. `createTurnMessage(nextTurn, currentRound)`
- **Purpose:** Creates a turn transition message.
- **Parameters:** Next turn ('attacker' or 'defender'), current round number.
- **Returns:** Message string.

### 12. `cleanStateForTurnTransition(G, nextTurn)`
- **Purpose:** Cleans the game state for turn transitions.
- **Parameters:** Game state, next turn.
- **Returns:** Partial game state with updated turn info.

---

## Example Usage

Used by phase and move handlers to manage game flow and transitions.

---

## Related Files
- `actionStageMoves.ts`, `reactionStageMoves.ts`, `surrenderMoveHandler.ts`: Phase and move logic.

---

## Notes
- The functions are robust to different game states and include safety checks for phase management. 