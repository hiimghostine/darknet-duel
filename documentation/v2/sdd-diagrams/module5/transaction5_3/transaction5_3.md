# Transaction 5.3: Match History Storage and Browsing

## User Interface Design
- Players can view a paginated list of their past matches (match history)
- Each match entry displays result (win/loss), opponent, role, mode, time, duration, turns, and rating change
- Players can expand a match entry to view detailed information (players, stats, outcome, timestamps)
- Supports loading more records (pagination)
- Handles loading, error, and empty states
- Cyberpunk-themed, responsive UI

## Frontend Components
1. **GameHistoryPage** (React Page Component)
   - Displays the user's match history, handles pagination, loading, and error states
   - File: `src/pages/GameHistoryPage.tsx`
2. **gameService** (Service Module)
   - Fetches match history and details from backend
   - File: `src/services/game.service.ts`
3. **useAuthStore** (Zustand Store)
   - Provides authentication and user info
   - File: `src/store/auth.store.ts`

## Backend Components
1. **GamesController** (Express Controller)
   - Handles REST API requests for match history
   - Endpoints:
     - `GET /games/history` — Get paginated match history for authenticated user
2. **GameService** (Service Class)
   - Retrieves and formats match history from the database
   - Methods:
     - `getPlayerGames(accountId, limit, offset)` — Fetches games for a player
     - `getPlayerGameCount(accountId)` — Gets total count for pagination
3. **GameHistory Entity**
   - Represents stored game history records
   - File: `src/entities/game-history.entity.ts`
4. **Database Tables**
   - `game_results`, `game_players`, `rating_history` (see ERD)

## Endpoints
- **REST API**
  - `GET /games/history?limit={limit}&offset={offset}` — Returns paginated match history for the authenticated user
  - (Internal) `POST /server/games/history` — Game server to backend for storing match history
- **WebSocket**
  - Not used for match history retrieval (REST only)

## Sequence Overview
1. Player navigates to Game History page
2. Frontend calls `GET /games/history` via `gameService`
3. Backend authenticates user, fetches and formats match history
4. Backend returns paginated match history to frontend
5. Frontend displays the list, supports expanding entries for details and loading more records 