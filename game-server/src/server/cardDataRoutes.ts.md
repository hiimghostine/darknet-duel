# cardDataRoutes.ts

**Location:** `game-server/src/server/cardDataRoutes.ts`

---

## File Overview

This file defines API routes for retrieving card data (attacker and defender cards) for the Darknet Duel game. It uses Koa Router to expose endpoints that return card data loaded from the game logic. These endpoints are primarily used for development tools, cheat panels, or admin interfaces.

- **Primary export:** Koa Router instance with card data endpoints.
- **Dependencies:** Card loader functions from `../game/cards/attackerCardLoader` and `../game/cards/defenderCardLoader`.
- **Purpose:** To provide HTTP endpoints for accessing card data for frontend or admin tools.

---

## Main Components

### 1. GET `/api/cards/attacker`
- **Purpose:** Returns all attacker cards.
- **Logic:**
  - Calls `loadAttackerCards()` to get the list of attacker cards.
  - Responds with a JSON object containing the cards and their count.
- **Error Handling:**
  - On error, logs the error, returns status 500, and an empty card list.

### 2. GET `/api/cards/defender`
- **Purpose:** Returns all defender cards.
- **Logic:**
  - Calls `loadDefenderCards()` to get the list of defender cards.
  - Responds with a JSON object containing the cards and their count.
- **Error Handling:**
  - On error, logs the error, returns status 500, and an empty card list.

### 3. GET `/api/cards/all`
- **Purpose:** Returns both attacker and defender cards in a single response.
- **Logic:**
  - Calls both `loadAttackerCards()` and `loadDefenderCards()`.
  - Responds with a JSON object containing both sets of cards, their counts, and the total.
- **Error Handling:**
  - On error, logs the error, returns status 500, and empty card lists for both types.

---

## Example Usage

These endpoints are used by the frontend or admin tools to fetch card data for display, debugging, or cheat panel features.

---

## Related Files
- `attackerCardLoader.ts`, `defenderCardLoader.ts`: Card loader logic.

---

## Notes
- These endpoints are not part of the main game API, but are useful for development and admin purposes.
- All endpoints return a `success` flag and card counts for easy frontend handling. 