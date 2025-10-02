# serverAuth.ts

**Location:** `game-server/src/server/serverAuth.ts`

---

## File Overview

This file provides secure server-to-server communication utilities for the game server to interact with the backend server. It includes helpers for sending game results, recording game history, updating player ratings, and validating the server connection. All requests use a dedicated API key and robust retry logic.

- **Primary exports:** `serverToServerRequest`, `validateServerConnection`, `sendGameResults`, `recordGameHistory`, `updatePlayerRatings`
- **Dependencies:** Axios for HTTP requests, dotenv for environment variables.
- **Purpose:** To securely synchronize game data and results with the backend server.

---

## Main Components

### 1. `serverToServerRequest<T>(endpoint, method, data)`
- **Purpose:** Makes an authenticated HTTP request to the backend server using a server API key.
- **Parameters:**
  - `endpoint`: The backend API endpoint (string).
  - `method`: HTTP method (default: 'POST').
  - `data`: Request payload (optional).
- **Returns:**
  - The response data from the backend, typed as `T`.
- **Side Effects:**
  - Logs request and response details for debugging.
  - Throws on error.

### 2. `validateServerConnection()`
- **Purpose:** Checks if the game-server is properly authorized with the backend.
- **Returns:**
  - `true` if the connection is valid, `false` otherwise.
- **Side Effects:**
  - Retries up to 3 times on failure.
  - Logs status and errors.

### 3. `sendGameResults(gameResult)`
- **Purpose:** Sends game result data to the backend for storage and MMR processing.
- **Parameters:**
  - `gameResult`: The game result data object.
- **Returns:**
  - `true` if successful, `false` otherwise.
- **Side Effects:**
  - Retries up to 3 times on failure.
  - Logs payload and response.

### 4. `recordGameHistory(gameHistory)`
- **Purpose:** Records detailed game history for analytics and player statistics.
- **Parameters:**
  - `gameHistory`: The game history data object.
- **Returns:**
  - `true` if successful, `false` otherwise.
- **Side Effects:**
  - Retries up to 3 times on failure.
  - Logs payload and response.

### 5. `updatePlayerRatings(ratingData)`
- **Purpose:** Updates player ELO ratings based on game results.
- **Parameters:**
  - `ratingData`: The ELO rating update data object.
- **Returns:**
  - `true` if successful, `false` otherwise.
- **Side Effects:**
  - Retries up to 3 times on failure.
  - Skips update in development mode with test player IDs.
  - Logs payload and response.

---

## Types
- `GameResultData`, `GameHistoryData`, `EloRatingUpdateData`: Data structures for backend sync.

---

## Example Usage

Used by the game server to securely send game results, history, and rating updates to the backend server.

---

## Related Files
- `auth.ts`: Player authentication and result saving.

---

## Notes
- All requests use a dedicated server API key for authentication.
- Includes robust retry logic and detailed logging for reliability. 