# Module 3, Transaction 3.5: Game State Persistence and Recovery

## Transaction Name
**Game State Persistence and Recovery**

## User Interface Design
- Game state is automatically persisted on the server; users do not interact directly with save/load features.
- If a player disconnects and reconnects, the game state is recovered seamlessly and the player resumes from the latest state.
- If a game is abandoned or completed, it is removed from the lobby and no longer accessible.
- No explicit UI for manual save/load; all persistence and recovery is transparent to the user.

## Frontend Components
- **GameClient.tsx** (React Component)
  - Connects to the game server and automatically receives the latest game state on reconnect or page reload.
- **useGameConnection.ts** (Custom Hook)
  - Handles reconnection and ensures the client receives the current state from the server.
- **LobbyDetail.tsx** (React Component)
  - Handles lobby/game removal if the game is abandoned or completed.

## Backend Components
- **Game Server (boardgame.io + Socket.IO)**
  - Persists game state in memory or database for each match.
  - On client reconnect, serves the latest game state to the reconnecting client.
  - Removes completed or abandoned games from storage (via `LobbyCleanupService.ts`).
  - Main logic in `server/index.ts`, `LobbyCleanupService.ts`, `game/DarknetDuel.ts`.
  - **Endpoints:**
    - WebSocket API for state sync and recovery.
    - REST endpoints for match state polling and removal.
- **LobbyCleanupService.ts** (Service)
  - Removes completed or abandoned games from storage.
- **Backend Server (Express)**
  - Receives final game results and history for persistence after game end.

## Sequence Overview
- Game state is persisted on the server for each match.
- If a client disconnects and reconnects, the server provides the latest game state for recovery.
- When a game is completed or abandoned, the server removes it from storage and updates the lobby.
- All persistence and recovery is handled transparently, with no manual intervention required by users. 