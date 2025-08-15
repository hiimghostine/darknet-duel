# Module 2, Transaction 2.2: Create/Join/Leave Lobbies

## Transaction Name
**Create/Join/Leave Lobbies**

## User Interface Design
- Allows users to create a new lobby with options for name, privacy, and game mode.
- Provides a form for lobby creation with feedback for errors and loading state.
- Lets users join public lobbies from the browser or enter a private lobby ID to join a private lobby.
- Shows join/leave status and disables actions as appropriate (e.g., joining, full, in-progress).
- Allows users to leave a lobby at any time, updating the lobby state and player list.
- Displays lobby chat for communication between players in the same lobby.
- Visual feedback (animations, loading spinners, toasts) for actions and errors.

## Frontend Components
- **CreateLobby.tsx** (React Functional Component)
  - Renders the lobby creation form and handles creation logic.
  - Submits lobby settings and joins the created lobby as host.
- **LobbyBrowser.tsx** (React Functional Component)
  - Handles joining public or private lobbies.
- **LobbyChat.tsx** (React Functional Component)
  - Provides real-time chat for users in the same lobby.
- **lobby.service.ts** (Service Class)
  - Handles API requests for creating, joining, and leaving lobbies.
  - Provides methods for joining private lobbies and updating player status.
- **auth.store.ts** (Zustand Store)
  - Provides current user info for lobby actions.

## Backend Components
- **boardgame.io server (index.ts)**
  - Hosts the game server and exposes endpoints for creating, joining, and leaving lobbies.
  - Handles player metadata, lobby state, and custom join/leave logic.
- **LobbyCleanupService** (Service Class)
  - Periodically removes abandoned or inactive lobbies from the server.
- **Lobby Database (boardgame.io internal)**
  - Stores match/lobby metadata, player info, and connection status.

### Endpoints
- `POST /games/darknet-duel` — Create a new lobby
- `POST /games/darknet-duel/:matchID/join` — Join a lobby
- `POST /games/darknet-duel/:matchID/leave` — Leave a lobby
- `GET /games/darknet-duel/:matchID` — Get lobby details
- (Other boardgame.io endpoints as needed)

---

## Sequence Overview
1. User fills out the create lobby form and submits.
2. Frontend sends a create request to the game server; server creates the lobby and returns the match ID.
3. User is automatically joined to the new lobby as host.
4. Other users can join public lobbies or enter a private lobby ID to join.
5. Users can leave the lobby at any time; server updates lobby metadata and player list.
6. LobbyCleanupService periodically removes abandoned/inactive lobbies.
7. Frontend updates the UI to reflect lobby state and user actions. 