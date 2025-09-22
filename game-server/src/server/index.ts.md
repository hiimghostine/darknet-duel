# index.ts

**Location:** `game-server/src/server/index.ts`

---

## File Overview

This file is the main entry point for the game server, built on [boardgame.io](https://boardgame.io/) and Koa. It configures the game server, sets up custom API endpoints, manages lobby and player state, handles game lifecycle events, and synchronizes game results with a backend API. It also includes robust logic for handling player disconnections, abandoned games, and game result reporting.

- **Primary role:** Game server initialization, API routing, event handling, and backend sync.
- **Dependencies:** boardgame.io, Koa, axios, custom game logic, and backend API endpoints.
- **Purpose:** To provide a real-time, persistent, and robust multiplayer game server for Darknet Duel.

---

## Main Components

### 1. Server Initialization
- **Creates a boardgame.io server** with the `DarknetDuel` game.
- **Custom UUID generation** for match IDs to avoid conflicts.
- **CORS configuration** to allow connections from frontend and backend during development and production.

### 2. Lobby and Player Management
- **Lobby join interception:**
  - Captures real user data (UUID, username) from lobby metadata when a player joins.
  - Updates the game state with real user data for attacker and defender.
- **Leave endpoint:**
  - Custom `/games/:name/:id/leave` POST endpoint to handle explicit player leave notifications.
  - Updates player metadata to mark as left/disconnected.

### 3. API Endpoints
- **/health:** Health check endpoint for server status.
- **/validate-token:** Forwards token validation requests to the main backend.
- **/game-results:** Forwards game result data to the backend for storage and MMR processing.
- **Card data API:** Exposes card data endpoints for dev cheat panel.

### 4. Game Lifecycle Hooks
- **handleGameStart:** Logs when a game starts.
- **handleGameEnd:**
  - Processes completed games, extracts player and winner info, and sends results/history/rating updates to the backend.
  - Handles various game state structures and overlays real user data from lobby metadata.
  - Handles abandoned games (no winner).
- **Game over monitoring:**
  - Periodically checks all matches for completion and triggers backend sync.
  - Avoids duplicate processing with a processed set and timeouts.

### 5. Disconnection and Abandonment Handling
- **checkAndHandleAbandonment:**
  - Checks if all players have disconnected from a match and marks the game as abandoned if so.
  - Updates game state and removes abandoned games immediately.
- **checkAllGamesForDisconnections:**
  - Iterates all matches, checks player connection status, and marks games as abandoned if all real players are disconnected and the game is not new.
  - Handles host transfer if the host disconnects but other players remain.
  - Skips abandonment for new games within a grace period.
- **LobbyCleanupService:**
  - Periodically cleans up abandoned games and manages their TTL (grace period before removal).

### 6. Server Startup
- **Runs the server** on the configured port.
- **Starts lobby cleanup and game over monitoring services.**
- **Logs server status and configuration.**

---

## Key Functions and Logic

### `handleGameEnd(gameID, matchData)`
- **Purpose:** Processes a completed game, extracts player/winner info, and sends results to the backend.
- **Parameters:**
  - `gameID`: The match ID.
  - `matchData`: Full match data from boardgame.io (state, metadata, etc).
- **Logic:**
  - Extracts real user data from lobby metadata if available.
  - Determines winner, player roles, and game mode.
  - Prepares and sends game result, history, and ELO rating update data to the backend.
  - Handles abandoned games (no winner).
  - Logs all steps for debugging.

### `checkAndHandleAbandonment(matchID)`
- **Purpose:** Checks if all players have disconnected and marks the game as abandoned.
- **Parameters:**
  - `matchID`: The match ID.
- **Logic:**
  - Fetches match data and checks player connection status.
  - If all players are disconnected, updates game state and removes the game.

### `checkAllGamesForDisconnections()`
- **Purpose:** Iterates all matches and marks as abandoned if all real players are disconnected.
- **Logic:**
  - Handles host transfer if host disconnects but others remain.
  - Skips new games within a grace period.

### `startGameOverMonitoring()`
- **Purpose:** Periodically checks for completed games and triggers backend sync.
- **Logic:**
  - Uses a processed set to avoid duplicate processing.
  - Removes games from the set after an hour to avoid memory leaks.

### Custom API Endpoints
- **/health:** Returns server status and timestamp.
- **/validate-token:** Forwards token validation to backend.
- **/game-results:** Forwards game results to backend.

---

## Types
- `ServerMatchData`: Used for boardgame.io match data (typed as `any` for flexibility).
- `GameResultData`, `GameHistoryData`, `EloRatingUpdateData`: Imported types for backend sync.

---

## Example Usage

This file is run as the main process for the game server. It is not imported by other modules, but is started directly (e.g., via `node src/server/index.ts`).

---

## Related Files
- `DarknetDuel.ts`: Game logic definition.
- `serverAuth.ts`: Backend API communication helpers.
- `lobbyCleanupService.ts`: Lobby/game cleanup logic.
- `cardDataRoutes.ts`: Card data API endpoints.

---

## Notes
- The file is highly robust to edge cases (abandonment, disconnections, host transfer, etc).
- All major actions are logged for debugging and monitoring.
- Designed for extensibility and integration with a main backend for persistent data and MMR. 