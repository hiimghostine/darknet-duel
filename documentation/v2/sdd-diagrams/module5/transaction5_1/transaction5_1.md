# Module 5, Transaction 5.1: Match Result Display (Victory/Defeat, Win Condition)

## Transaction Name
**Match Result Display (Victory/Defeat, Win Condition)**

## User Interface Design
- At the end of a match, the UI displays a result screen showing victory, defeat, or draw, along with the win condition (e.g., "Attacker controlled 3 infrastructure cards").
- The result screen includes:
  - Winner/loser announcement (with team color and icon)
  - Win reason (e.g., "Maximum rounds reached - defender wins by default", "Attacker controlled 3 infrastructure cards")
  - Game statistics (duration, cards played, infrastructure changed)
  - Option to request a rematch or return to lobby
  - Post-game chat panel for both players
- The UI updates in real time as soon as the backend determines the game is over.
- Spectators see the same result screen, but without rematch controls.

## Endpoints
- **WebSocket (boardgame.io protocol)**
  - **URL:** `/socket.io/` (relative to game server)
  - **Purpose:** Real-time communication for all game moves, state updates, and match result synchronization between frontend and backend.
  - **Used by:** Game over notification, result data, rematch requests, post-game chat.
- **REST API (if applicable)**
  - **Example:** `POST /games/:name/:id/leave` (explicit leave)
  - **Purpose:** Auxiliary actions outside the real-time game loop.

## Frontend Components
- **BalatroGameBoard.tsx** (React Component)
  - Detects game over state and triggers result display.
- **GameStatus.tsx** (React Component)
  - Displays victory/defeat/draw message and win reason.
- **WinnerLobby.tsx** (React Component)
  - Shows the result screen, statistics, and rematch/return options.
- **PostGameChat.tsx** (React Component)
  - Enables chat between players after the match ends.
- **PowerBar.tsx, PlayerInfo.tsx** (React Components)
  - Show final scores and infrastructure status.
- **Stylesheets**
  - Style the result screen, overlays, and feedback.

## Backend Components
- **gamePhases.ts** (Phase Logic)
  - Handles transition to game over, determines winner, win reason, and triggers result state.
- **gameState.ts** (Game State)
  - Stores winner, win reason, and game statistics.
- **phaseUtils.ts** (Rule Utilities)
  - Calculates win conditions and reasons.
- **server/index.ts** (Game Server)
  - Monitors for game over, processes results, and sends to backend API if needed.
- **serverAuth.ts** (Backend API Communication)
  - Sends game results, history, and rating updates to backend server.
- **Backend Server (Express, boardgame.io)**
  - Exposes WebSocket endpoints for game over notification, result data, rematch, and post-game chat.

## Sequence Overview
- The backend detects game over (victory, defeat, or draw) based on win conditions.
- The backend updates the game state with winner, win reason, and statistics, and notifies all clients via WebSocket.
- The frontend receives the updated game state and displays the result screen with all relevant information.
- Players can request a rematch or return to the lobby; post-game chat is enabled.
- The backend processes rematch requests and manages post-game chat via WebSocket. 