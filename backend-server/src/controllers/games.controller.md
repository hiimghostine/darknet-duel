# GamesController API Documentation

This document provides a comprehensive overview of all endpoints handled by `GamesController` in the backend-server.

## Endpoints

### 1. Save Game Results (Server-to-server)
- **Endpoint:** `POST /api/server/games/results`
- **Description:** Records game results sent from the game server for persistence and rating updates.
- **Security:** Server API key required.
- **Request Body:**
  - `application/json` with fields: `gameId`, `players` (array), `gameData` (object)
- **Responses:**
  - `200 OK`: Game results saved successfully.
  - `400 Bad Request`: Missing required data.
  - `401 Unauthorized`: Invalid server API key.
  - `500 Internal Server Error`: Server error.

### 2. Save Game History (Server-to-server)
- **Endpoint:** `POST /api/server/games/history`
- **Description:** Records detailed game history from the game server.
- **Security:** Server API key required.
- **Request Body:**
  - `application/json` with fields: `gameId`, `players` (array), `turns` (array)
- **Responses:**
  - `200 OK`: Game history saved successfully.
  - `400 Bad Request`: Missing required data.
  - `401 Unauthorized`: Invalid server API key.
  - `500 Internal Server Error`: Server error.

### 3. Update Player Ratings
- **Endpoint:** `POST /api/server/games/ratings`
- **Description:** Updates player ratings based on game results using the ELO algorithm.
- **Security:** Server API key required.
- **Request Body:**
  - `application/json` with fields: `gameId`, `players` (array)
- **Responses:**
  - `200 OK`: Player ratings updated successfully.
  - `400 Bad Request`: Missing required data.
  - `401 Unauthorized`: Invalid server API key.
  - `500 Internal Server Error`: Server error.

### 4. Validate Server Connection
- **Endpoint:** `GET /api/server/validate`
- **Description:** Validates that the game server can communicate with the backend server.
- **Security:** Server API key required.
- **Responses:**
  - `200 OK`: Server connection validated successfully.
  - `401 Unauthorized`: Invalid server API key.
  - `500 Internal Server Error`: Server error.

### 5. Get User's Game History
- **Endpoint:** `GET /api/games/history`
- **Description:** Retrieves the authenticated user's game history with pagination support.
- **Security:** Bearer token required.
- **Query Parameters:**
  - `limit` (integer, default: 20, max: 100)
  - `offset` (integer, default: 0)
- **Responses:**
  - `200 OK`: Game history retrieved successfully.
  - `401 Unauthorized`: Invalid or missing token.
  - `500 Internal Server Error`: Server error.

### 6. Get Detailed Game Information
- **Endpoint:** `GET /api/games/{gameId}`
- **Description:** Retrieves detailed information about a specific game.
- **Security:** Bearer token required.
- **Path Parameter:**
  - `gameId` (string, required): The game ID to retrieve.
- **Responses:**
  - `200 OK`: Game details retrieved successfully.
  - `401 Unauthorized`: Invalid or missing token.
  - `403 Forbidden`: Not authorized to view this game.
  - `404 Not Found`: Game not found.
  - `500 Internal Server Error`: Server error.

## Error Handling
- All endpoints return a JSON object with `success` and `message` fields on error.
- Validation errors and missing/invalid parameters are handled with appropriate status codes and messages.

## Notes
- Server-to-server endpoints require a valid API key.
- User endpoints require authentication via bearer token. 