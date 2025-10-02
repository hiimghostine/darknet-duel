# Module 3, Transaction 3.3: Real-Time State Synchronization

## Transaction Name
**Real-Time State Synchronization (boardgame.io, Socket.IO)**

## User Interface Design
- Game board and all player UIs update in real time as game state changes (turns, card plays, AP, infrastructure, etc.).
- Visual feedback for connection status (connected/disconnected) only as it relates to state updates (not reconnection logic).
- Loading indicators and error messages for sync or connection issues.
- Notifies players of game end or abandonment as part of state updates.

## Frontend Components
- **GameClient.tsx** (React Component)
  - Connects to the boardgame.io server using Socket.IO, manages real-time state updates, and renders the game board.
- **BalatroGameBoard.tsx** (React Functional Component)
  - Renders the game state and updates UI in response to state changes.
- **useGameState.ts** (Custom Hook)
  - Handles derived state, player roles, and state update logic for the board.

## Backend Components
- **Game Server (boardgame.io + Socket.IO)**
  - Manages authoritative game state, synchronizes state to all connected clients in real time.
  - Main logic in `server/index.ts`, `game/DarknetDuel.ts`, `core/playerView.ts`.
  - **Endpoints:**
    - WebSocket API for real-time game state updates and events.
    - REST endpoints for match state polling and recovery.
- **LobbyCleanupService.ts** (Service)
  - Cleans up abandoned or stale lobbies and handles disconnection logic.
- **Backend Server (Express)**
  - Receives game results and history for persistence after game end.

## Sequence Overview
- Clients connect to the game server via Socket.IO.
- Game server sends real-time state updates to all connected clients as actions occur (turns, card plays, infrastructure changes, etc.).
- Clients update their UI in response to state changes.
- On game end, server synchronizes final state and results to backend for storage. 