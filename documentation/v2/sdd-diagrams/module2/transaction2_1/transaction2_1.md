# Module 2, Transaction 2.1: Lobby Browser

## Transaction Name
**Lobby Browser**

## User Interface Design
- Displays a list of active game lobbies (matches) with status, player info, and capacity.
- Allows users to refresh the lobby list, join public lobbies, or enter a private lobby ID to join a private lobby.
- Shows lobby state (waiting, ready, in progress, abandoned) with visual badges and icons.
- Provides feedback for loading, errors, and empty states (no lobbies found).
- Disables join buttons for full, in-progress, or abandoned lobbies.
- Allows users to create a new lobby via a dedicated button.
- Visual feedback (animations, loading spinners, toasts) for actions and errors.

## Frontend Components
- **LobbyBrowser.tsx** (React Functional Component)
  - Displays the lobby list, handles refresh, join, and private lobby entry.
  - Shows lobby state, player info, and join/create actions.
  - Handles polling for lobby updates and error/loading states.
- **lobby.service.ts** (Service Class)
  - Handles API requests for listing, joining, creating, and leaving lobbies.
  - Provides methods for joining private lobbies and updating player status.
- **auth.store.ts** (Zustand Store)
  - Provides current user info for lobby actions.

## Backend Components
- **boardgame.io server (index.ts)**
  - Hosts the game server and exposes lobby endpoints via boardgame.io and Koa.
  - Handles lobby creation, listing, joining, leaving, and player metadata.
  - Custom endpoints for health check, leave, and lobby config.
- **LobbyCleanupService** (Service Class)
  - Periodically removes abandoned or inactive lobbies from the server.
  - Configurable grace periods and TTLs for abandoned/inactive games.
- **Lobby Database (boardgame.io internal)**
  - Stores match/lobby metadata, player info, and connection status.

### Endpoints
- `GET /games/darknet-duel` — List all active lobbies (matches)
- `POST /games/darknet-duel` — Create a new lobby
- `POST /games/darknet-duel/:matchID/join` — Join a lobby
- `POST /games/darknet-duel/:matchID/leave` — Leave a lobby
- `GET /games/darknet-duel/:matchID` — Get lobby details
- (Other boardgame.io endpoints as needed)

---

## Sequence Overview
1. User navigates to the lobby browser page.
2. Frontend fetches the list of active lobbies from the game server.
3. User can refresh the list, join a public lobby, or enter a private lobby ID.
4. Frontend sends join request to the game server; server updates lobby metadata and player info.
5. LobbyCleanupService periodically removes abandoned/inactive lobbies from the list.
6. Frontend updates the UI to reflect lobby state and user actions. 