# lobbyCleanupService.ts

**Location:** `game-server/src/services/lobbyCleanupService.ts`

---

## File Overview

This file defines the `LobbyCleanupService` class, which is responsible for periodically cleaning up abandoned or inactive game lobbies from the server. It removes games that are marked as abandoned or have no connected players for a configurable period, helping to keep the lobby list clean and performant.

- **Primary export:** `LobbyCleanupService` class
- **Dependencies:** boardgame.io server, shared game state types
- **Purpose:** To automate the removal of abandoned and inactive games from the server database.

---

## Main Components

### 1. `LobbyCleanupService` Class

#### Constructor
- **Purpose:** Initializes the service with a reference to the boardgame.io server.
- **Parameters:**
  - `server`: The boardgame.io server instance.

#### `start()`
- **Purpose:** Starts the periodic cleanup interval and runs an initial cleanup.
- **Side Effects:**
  - Sets up a timer to call `cleanupAbandonedGames` at the configured interval.

#### `setCleanupInterval(intervalMs)`
- **Purpose:** Sets the interval (in ms) for periodic cleanup.
- **Parameters:**
  - `intervalMs`: Interval in milliseconds (minimum 1000ms).
- **Side Effects:**
  - Restarts the interval if already running.

#### `setAbandonedGameTTL(ttlMs)`
- **Purpose:** Sets the time-to-live for abandoned games before removal.
- **Parameters:**
  - `ttlMs`: TTL in milliseconds (0 = immediate removal).

#### `setInactiveGameTTL(ttlMs)`
- **Purpose:** Sets the time-to-live for inactive games before removal.
- **Parameters:**
  - `ttlMs`: TTL in milliseconds (0 = immediate removal).

#### `stop()`
- **Purpose:** Stops the cleanup interval.

#### `removeAbandonedGame(matchID)`
- **Purpose:** Immediately removes a specific abandoned game from the server.
- **Parameters:**
  - `matchID`: The match ID to remove.
- **Returns:**
  - `true` if removed, `false` otherwise.
- **Side Effects:**
  - Logs actions and errors.

#### `cleanupAbandonedGames()` (private)
- **Purpose:** Main routine to remove abandoned or inactive games.
- **Logic:**
  - Lists all matches, checks their state and metadata.
  - Removes games marked as abandoned after a grace period.
  - Removes inactive games with no connected players after a longer period.
- **Side Effects:**
  - Logs actions and errors.

---

## Example Usage

Used by the game server to keep the lobby list clean and performant by removing abandoned/inactive games.

---

## Related Files
- `index.ts`: Main server file that instantiates and uses this service.

---

## Notes
- Grace periods and TTLs are configurable for flexibility.
- All actions are logged for monitoring and debugging. 