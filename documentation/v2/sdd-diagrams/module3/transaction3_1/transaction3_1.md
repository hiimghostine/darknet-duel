# Module 3, Transaction 3.1: Game Creation and Initialization

## Transaction Name
**Game Creation and Initialization**

## User Interface Design
- Allows users to create or join a game lobby (match) via the lobby browser or direct invite.
- Shows a waiting room/lobby interface until both players are present and ready.
- Displays game configuration (mode, player roles, initial resources, etc.) before starting.
- Provides feedback for lobby state (waiting, ready, in game, abandoned).
- On game start, transitions to the main game board UI.
- Main game board displays player hands, infrastructure grid, turn/round info, and action controls.
- Visual feedback for loading, errors, and connection status.

## Frontend Components
- **LobbyBrowser.tsx** (React Functional Component)
  - Lists available lobbies, allows joining/creating matches, and shows lobby state.
- **CreateLobby.tsx** (React Functional Component)
  - UI for creating a new lobby with game options.
- **LobbyService.ts** (Service)
  - Handles API calls for creating, joining, and starting matches (boardgame.io integration).
- **BalatroGameBoard.tsx** (React Functional Component)
  - Main game board UI; renders player hands, infrastructure, turn controls, and game state.
- **GameControls.tsx** (React Functional Component)
  - Provides controls for leaving the game, showing debug info, and connection status.
- **useGameState.ts** (Custom Hook)
  - Manages derived game state, player roles, and connection status for the board.

## Backend Components
- **Game Server (boardgame.io)**
  - Handles match creation, player joining, and game state management.
  - Exposes endpoints for match creation, joining, and state polling via WebSocket/REST.
  - Main logic in `DarknetDuel.ts`, `core/gameState.ts`, `core/gamePhases.ts`, `core/playerManager.ts`.
  - **Endpoints:**
    - `POST /games/darknet-duel` (create match)
    - `POST /games/darknet-duel/:matchID/join` (join match)
    - `GET /games/darknet-duel/:matchID` (get match state)
- **LobbyCleanupService.ts** (Service)
  - Cleans up abandoned or stale lobbies on the game server.
- **Backend Server (Express)**
  - Receives game results and history for persistence (not direct game creation).
  - **Endpoints:**
    - `POST /api/server/games/results` (save game results)
    - `POST /api/server/games/history` (save game history)

## Sequence Overview
- User creates or joins a lobby via the frontend.
- LobbyService calls the game server to create/join a match.
- When both players are present and ready, the game server initializes the game state.
- The frontend transitions to the main game board, which syncs state via boardgame.io.
- Game state is managed in real time by the game server; backend server is used for result persistence after the match. 