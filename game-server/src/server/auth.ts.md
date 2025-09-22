# auth.ts

**Location:** `game-server/src/server/auth.ts`

---

## File Overview

This file provides authentication utilities for the game server, including token validation, middleware for action authorization, and a helper for saving game results to the backend. It is used to ensure that only authenticated players can perform game actions and that game results are securely sent to the backend API.

- **Primary exports:** `validateToken`, `authMiddleware`, `saveGameResults`
- **Dependencies:** Axios for HTTP requests, boardgame.io context types.
- **Purpose:** To provide authentication and authorization logic for the game server.

---

## Main Components

### 1. `validateToken(token: string)`
- **Purpose:** Validates a JWT or similar authentication token against the backend server and retrieves the user's UUID.
- **Parameters:**
  - `token`: The authentication token to validate.
- **Returns:**
  - `{ valid: boolean, user?: any }` — Indicates if the token is valid and, if so, includes user data.
- **Side Effects:**
  - Logs authentication attempts and errors.

### 2. `authMiddleware`
- **Purpose:** Middleware for boardgame.io to validate player credentials before allowing game actions.
- **Methods:**
  - `beforeAction(ctx, action)`: Checks if the player is authenticated before allowing the action.
- **Parameters:**
  - `ctx`: The boardgame.io context, extended with `playerID` and `credentials`.
  - `action`: The game action being attempted.
- **Returns:**
  - The action if valid, or `false` to block unauthorized actions.
- **Side Effects:**
  - Calls `validateToken` and logs errors.

### 3. `saveGameResults(gameData, token)`
- **Purpose:** Sends game results to the backend server for storage and processing.
- **Parameters:**
  - `gameData`: The game result data to send.
  - `token`: The authentication token for the request.
- **Returns:**
  - `true` if successful, `false` otherwise.
- **Side Effects:**
  - Logs errors if the request fails.

---

## Example Usage

Used by the game server to authenticate players and securely send game results to the backend API.

---

## Related Files
- `serverAuth.ts`: Server-to-server authentication and backend sync.

---

## Notes
- The middleware is designed to be used with boardgame.io's action hooks.
- Token validation is performed via a backend `/auth/profile` endpoint. 