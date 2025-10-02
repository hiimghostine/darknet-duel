# gamePhases.ts.bak

**Location:** `game-server/src/game/core/gamePhases.ts.bak`

---

## File Overview

This file is a legacy or backup version of the main phase configuration for Darknet Duel. It contains a more monolithic and detailed implementation of the game's phases, including setup, playing, and game over, with all logic in a single file. It is much longer and less modular than the refactored version, but preserves all critical logic for reference or rollback.

- **Primary exports:** `setupPhase`, `playingPhase`, `gameOverPhase`
- **Dependencies:** boardgame.io, shared game types, player manager, temporary effects manager.
- **Purpose:** To provide a complete, in-place implementation of all game phases, including detailed move and stage logic.

---

## Main Components

### 1. `setupPhase`
- **Purpose:** Handles player registration, chat, and initial game setup.
- **Moves:**
  - `registerPlayerToken`: Registers a player's JWT token for mapping to real UUIDs.
  - `sendChatMessage`: Sends a chat message (mutation style).
  - `playCard`, `throwCard`, `cycleCard`, `endTurn`: Forwarded to player action handlers.
- **onBegin:** Initializes both players and infrastructure when both have joined, using either real or fallback IDs.
- **endIf:** Returns true when both players are initialized and connected, triggering transition to playing phase.
- **next:** 'playing'

### 2. `playingPhase`
- **Purpose:** Main gameplay phase, handling turns, moves, and transitions.
- **onBegin:** Sets up turn state, resets reactions, and sets the current stage.
- **Moves:**
  - `sendChatMessage`, `surrender`: Core moves for chat and surrender.
- **Turn:**
  - `onBegin`: Processes temporary effects and sets the active player.
  - `onEnd`: Handles round/turn transitions, checks for end conditions, and updates scores.
  - **Stages:**
    - `action`: Player action moves, including chat, surrender, playCard, cycleCard, throwCard, endTurn, chooseChainTarget.
    - `reaction`: Reaction moves, including chat, surrender, playCard, throwCard, playReaction, skipReaction.
    - `end`: Finalizes the turn, draws cards, and ends the turn.

### 3. `gameOverPhase`
- **Purpose:** Handles the end-of-game state, allowing for chat, rematch requests, and surrender.
- **Turn:**
  - All players are in the 'gameOver' stage.
  - No moves allowed except chat, rematch, and surrender.
  - **onBegin:** Logs game over, calculates stats, and sets the final message and chat.

---

## Notable Differences from Refactored Version
- All logic is in a single file, making it longer and harder to maintain.
- Uses mutation style for chat and some moves.
- Contains legacy or fallback logic for player ID mapping and initialization.
- Useful as a reference for the full, detailed implementation of all phase logic.

---

## Example Usage

This file is not used in production but serves as a backup or reference for the main phase logic.

---

## Related Files
- `gamePhases.ts`: Refactored, modular version of this logic.
- `phases/`: Extracted logic for chat, surrender, action/reaction moves, and phase utilities.

---

## Notes
- This file is useful for debugging, rollback, or reference during refactoring.
- All phase logic is present in one place, making it easier to trace but harder to maintain. 