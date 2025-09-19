# Module 5, Transaction 5.2: Player Performance Statistics (ELO, Win/Loss, Charts)

## Transaction Name
**Player Performance Statistics (ELO, Win/Loss, Charts)**

## User Interface Design
- The UI displays player performance statistics, including:
  - ELO rating (current, change after match)
  - Win/loss record (total, recent)
  - Match history (recent games, opponents, results)
  - Visual charts (ELO over time, win/loss streaks, pie/bar charts)
- Statistics are updated in real time after each match and are visible on the profile page and post-game result screen.
- Players can view detailed match history and statistics for themselves and (optionally) for other players.
- The UI provides feedback for rating changes (e.g., +10 ELO, -5 ELO) and highlights milestones or streaks.

## Endpoints
- **WebSocket (boardgame.io protocol)**
  - **URL:** `/socket.io/` (relative to game server)
  - **Purpose:** Real-time communication for match result, statistics update, and notification of rating changes.
  - **Used by:** Game over notification, statistics update, and post-game feedback.
- **REST API (backend-server)**
  - **GET /api/stats/:userId** — Fetch player statistics (ELO, win/loss, history, charts)
  - **GET /api/history/:userId** — Fetch detailed match history
  - **POST /api/game-results** — Record game result and update statistics
  - **POST /api/players/ratings** — Update player ELO ratings
  - **Purpose:** Persistent storage, retrieval, and update of player statistics and history.

## Frontend Components
- **ProfilePage.tsx** (React Component)
  - Displays player statistics, ELO, win/loss, and charts.
- **StatsChart.tsx** (React Component)
  - Renders ELO and win/loss charts.
- **MatchHistory.tsx** (React Component)
  - Shows recent matches, opponents, and results.
- **GameStatus.tsx, WinnerLobby.tsx** (React Components)
  - Show ELO changes and updated stats after a match.
- **Services/api.ts, stats.service.ts** (API Services)
  - Fetch and update statistics from backend via REST API.
- **Stylesheets**
  - Style statistics panels, charts, and feedback.

## Backend Components
- **serverAuth.ts** (Backend API Communication)
  - Sends game results, records history, and updates ELO ratings via REST API.
- **index.ts** (Game Server)
  - Triggers statistics update after match ends.
- **Backend Server (Express)**
  - Exposes REST API endpoints for statistics, history, and ELO updates.
- **Database**
  - Stores player statistics, match history, and ELO ratings.

## Sequence Overview
- At the end of a match, the backend calculates and updates player statistics (ELO, win/loss, history).
- The backend sends updated statistics to the frontend via WebSocket and/or REST API.
- The frontend receives updated statistics and displays them in the profile page, result screen, and charts.
- Players can view their statistics and match history at any time; data is fetched from the backend via REST API.
- All statistics are kept up to date in real time after each match. 