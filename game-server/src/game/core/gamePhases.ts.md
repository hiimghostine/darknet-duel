# gamePhases.ts

**Location:** `game-server/src/game/core/gamePhases.ts`

---

## File Overview

This file defines the main phase configuration for the Darknet Duel game using boardgame.io's phase system. It organizes the game into three main phases: setup, playing, and game over. Each phase has its own moves, handlers, and transition logic. The file also imports and delegates much of the detailed logic to extracted modules for maintainability.

- **Primary exports:** `setupPhase`, `playingPhase`, `gameOverPhase`
- **Dependencies:** boardgame.io, shared game types, player manager, temporary effects manager, and extracted phase modules.
- **Purpose:** To structure the game's lifecycle and transitions between setup, play, and end states.

---

## Main Components

### 1. `setupPhase`
- **Purpose:** Handles player registration, initial game setup, and transitions to the playing phase.
- **Moves:**
  - `registerPlayerToken`: Registers a player's JWT token for mapping to real UUIDs.
  - `sendChatMessage`: Sends a chat message (immutable handler).
  - `devCheatAddCard`: Developer move to add a card to a player's hand.
  - `playCard`, `throwCard`, `cycleCard`, `endTurn`: Forwarded to player action handlers.
- **onBegin:** Initializes both players and infrastructure when both have joined.
- **endIf:** Returns true when both players are initialized and connected, triggering transition to playing phase.
- **next:** 'playing'

### 2. `playingPhase`
- **Purpose:** Main gameplay phase, handling turns, moves, and transitions.
- **onBegin:** Sets up turn state, resets reactions, and sets the current stage.
- **Moves:**
  - `sendChatMessage`, `surrender`, `devCheatAddCard`: Core moves for chat, surrender, and dev tools.
- **Turn:**
  - `onBegin`: Processes temporary effects and sets the active player.
  - `onEnd`: Handles round/turn transitions, checks for end conditions, and updates scores.
  - **Stages:**
    - `action`: Player action moves (from `actionStageMoves`), including hand disruption.
    - `reaction`: Reaction moves (from `reactionStageMoves`), including hand disruption.
    - `end`: Finalizes the turn, draws cards, and ends the turn.

### 3. `gameOverPhase`
- **Purpose:** Handles the end-of-game state, allowing for chat, rematch requests, and surrender.
- **Turn:**
  - All players are in the 'gameOver' stage.
  - No moves allowed except chat, rematch, and surrender.
  - **onBegin:** Logs game over, calculates stats, and sets the final message and chat.

---

## Example Usage

These phase configurations are imported by the main game definition and used by boardgame.io to manage the game lifecycle.

---

## Related Files
- `phases/`: Extracted logic for chat, surrender, action/reaction moves, and phase utilities.
- `playerManager.ts`: Player initialization and hand management.
- `temporaryEffectsManager.ts`: Handles temporary effects at turn start.

---

## Notes
- The file is highly modular, delegating most logic to extracted modules for maintainability.
- Each phase is responsible for its own moves and transition logic.
- Debug logging is present throughout for traceability. 