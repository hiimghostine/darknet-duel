# DarknetDuel.ts

**Location:** `game-server/src/game/DarknetDuel.ts`

---

## File Overview

This file defines the main game logic for the "Darknet Duel" game using the [boardgame.io](https://boardgame.io/) framework. It exports a `Game` object that encapsulates the rules, phases, moves, and player view logic for a cybersecurity-themed card game where players take on the roles of attacker and defender, competing to control digital infrastructure.

- **Primary export:** `DarknetDuel` (the game definition for boardgame.io)
- **Dependencies:** Core game logic, player view, phases, and move handlers are imported from other modules in the `game/` directory.
- **Purpose:** This file is the entry point for the game logic, integrating all phases, moves, and player interactions.

---

## Main Components

### 1. Game Setup

#### `setup({ ctx })`
- **Purpose:** Initializes the game state when a new match is created.
- **Parameters:**
  - `ctx`: The boardgame.io context object, containing player order and other match info.
- **Returns:** The initial game state object (from `createInitialState`).
- **Notes:**
  - Only creates a minimal state structure; player objects are initialized later in the setup phase.
  - Logs setup progress for debugging.

### 2. Player View

#### `playerView({ G, ctx, playerID })`
- **Purpose:** Filters the game state for each player, hiding secret information as needed.
- **Parameters:**
  - `G`: The full game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the requesting player.
- **Returns:** A filtered version of the game state, as produced by `createPlayerView`.

### 3. Phases

- **Phases defined:**
  - `setup`: Handles player joining and initial setup.
  - `playing`: Main gameplay phase.
  - `gameOver`: End-of-game logic.
- **Implementation:** Each phase is imported from `core/gamePhases`.

### 4. Moves

The `moves` object defines all actions players can take. Each move is a function that receives the game state and arguments, and returns an updated game state.

#### List of Moves:

- **sendChatMessage**: Adds a chat message to the game state.
  - Parameters: `{ G, playerID }, message`
  - Side effects: Appends to `G.chat.messages`.

- **cycleCard**: Discards a card and draws a new one.
  - Parameters: `props, args` (args can be a string or object)
  - Calls `cycleCardMove`.

- **playCard**: Plays a card from hand onto the field.
  - Parameters: `props, args` (args can be a string or object)
  - Calls `playCardMove`.

- **throwCard**: Throws a card at an infrastructure target.
  - Parameters: `props, args1, args2` (supports both object and separate param formats)
  - Calls `throwCardMove`.

- **endTurn**: Ends the current player's turn.
  - Parameters: `props`
  - Calls `endTurnMove`.

- **chooseWildcardType**: Selects a type for a wildcard card.
  - Parameters: `props, args` (args can be a string or object)
  - Calls `chooseWildcardTypeMove`.

- **chooseChainTarget**: Selects a target for a chain effect.
  - Parameters: `props, args` (args can be a string or object)
  - Calls `chooseChainTargetMove`.

- **chooseHandDiscard**: Selects cards to discard from opponent's hand.
  - Parameters: `props, args` (args can be array or object)
  - Calls `chooseHandDiscardMove`.

- **chooseCardFromDeck**: Selects a card from the deck (AI-Powered Attack effect).
  - Parameters: `props, args` (args can be string or object)
  - Calls `chooseCardFromDeckMove`.

- **devCheatAddCard**: Developer-only move to add any card to a player's hand.
  - Parameters: `props, args` (expects a card object)
  - Calls `devCheatAddCardMove`.
  - **Debugging:** Logs received arguments for troubleshooting.

- **skipReaction**: Skips a reaction during the reaction stage.
  - Parameters: `props`
  - Side effects: Updates `pendingReactions`, sets active players, and logs the action.

#### Move Function Signature
Each move typically receives an object with `{ G, ctx, playerID, ... }` and additional arguments, and returns a new game state or calls a move handler.

### 5. Game End Check

#### `endIf({ G })`
- **Purpose:** Checks if the game has ended.
- **Parameters:** `{ G }` (game state)
- **Returns:** The result of `checkGameEnd(G)`, which determines if the game should end.

### 6. Export

- **`export default DarknetDuel;`**
  - Exports the game definition for use by the server and frontend.

---

## Example Usage

This file is used by the game server to instantiate and run matches of Darknet Duel. The exported `DarknetDuel` object is passed to the boardgame.io server configuration.

---

## Related Files
- `core/gameState.ts`: Game state initialization and end logic.
- `core/playerView.ts`: Player-specific state filtering.
- `core/gamePhases.ts`: Phase definitions.
- `actions/playerActions.ts`: Move handlers for player actions.
- `moves/`: Additional move handlers.

---

## Notes
- The file is designed to be extensible; new moves and phases can be added as the game evolves.
- Debugging logs are present in several moves to aid development and troubleshooting.
- The move handlers are robust to different argument formats for compatibility with various frontend calls. 