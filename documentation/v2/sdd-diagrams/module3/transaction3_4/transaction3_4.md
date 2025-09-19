# Module 3, Transaction 3.4: Disconnection/Reconnection Handling

## Transaction Name
**Disconnection/Reconnection Handling**

## User Interface Design
- Disconnection and reconnection are handled in the background; the user interface does not display explicit notifications for these events.
- The game continues to function seamlessly as long as the connection is restored; if a player leaves or the game is abandoned, standard game end or lobby removal flows apply.
- No chat interface is present in this transaction.

## Frontend Components
- **useGameConnection.ts** (Custom Hook)
  - Manages connection status, automatic reconnection logic, and leave notifications for the game server in the background.
- **GameClient.tsx** (React Component)
  - Integrates connection management into the main game client, ensuring seamless gameplay during network interruptions.
- **LobbyDetail.tsx** (React Component)
  - Handles player leave/disconnect and updates lobby/game state accordingly.

## Backend Components
- **Game Server (boardgame.io + Socket.IO)**
  - Tracks player connections/disconnections, manages reconnection, and updates game/lobby state accordingly.
  - Handles player leave events and marks games as abandoned if all players disconnect.
  - Main logic in `server/index.ts`, `LobbyCleanupService.ts`.
  - **Endpoints:**
    - WebSocket API for connection and disconnection events.
    - REST endpoint for explicit leave notifications (`POST /games/:name/:id/leave`).
- **LobbyCleanupService.ts** (Service)
  - Cleans up abandoned or stale lobbies and handles disconnection logic.
- **Backend Server (Express)**
  - Receives game results and history for persistence after game end.

## Sequence Overview
- Clients connect to the game server via Socket.IO.
- Game server tracks player connections, disconnections, and reconnections in the background.
- On disconnection, server updates player state and, if all players disconnect, marks the game as abandoned.
- Clients attempt automatic reconnection and recover state on success, with no explicit UI notification.
- On explicit leave, client notifies server and updates lobby/game state. 