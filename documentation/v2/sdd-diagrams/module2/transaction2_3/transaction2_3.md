# Module 2, Transaction 2.3: Real-Time Lobby Updates

## Transaction Name
**Real-Time Lobby Updates**

## User Interface Design
- Lobby browser and lobby views update automatically to reflect changes (new lobbies, player joins/leaves, lobby state changes).
- Users see real-time updates to player lists, lobby status, and game state without manual refresh.
- Visual feedback for lobby state transitions (waiting, ready, in progress, abandoned).
- Error and loading states are handled gracefully during updates.
- Lobby chat updates in real-time as messages are sent/received.

## Frontend Components
- **LobbyBrowser.tsx** (React Functional Component)
  - Polls the server for lobby updates at regular intervals (e.g., every 5 seconds).
  - Updates the UI in real-time as lobbies are created, joined, or abandoned.
- **LobbyChat.tsx** (React Functional Component)
  - Uses WebSockets (Socket.IO) for real-time chat updates in the lobby.
- **lobby.service.ts** (Service Class)
  - Provides methods for fetching lobby state and details.
  - Handles polling and state management for lobby updates.
- **auth.store.ts** (Zustand Store)
  - Provides current user info for lobby actions.

## Backend Components
- **boardgame.io server (index.ts)**
  - Exposes endpoints for listing, joining, and leaving lobbies.
  - Updates lobby metadata and player state in real-time as users join/leave.
  - Handles polling requests from frontend for lobby state.
  - Optionally, could use WebSockets for push updates (future enhancement).
- **LobbyCleanupService** (Service Class)
  - Periodically removes abandoned or inactive lobbies from the server.
- **Lobby Database (boardgame.io internal)**
  - Stores match/lobby metadata, player info, and connection status.

### Endpoints
- `GET /games/darknet-duel` — List all active lobbies (matches)
- `GET /games/darknet-duel/:matchID` — Get lobby details (for polling)
- (Other boardgame.io endpoints as needed)

---

## Sequence Overview
1. User opens the lobby browser or lobby view.
2. Frontend polls the server for lobby updates at regular intervals.
3. Server responds with the latest lobby state, including player list and status.
4. Frontend updates the UI in real-time to reflect changes.
5. Lobby chat uses WebSockets for instant message delivery.
6. LobbyCleanupService removes abandoned/inactive lobbies, which disappear from the UI in real-time. 