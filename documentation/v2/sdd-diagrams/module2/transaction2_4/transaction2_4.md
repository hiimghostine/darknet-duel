# Module 2, Transaction 2.4: Lobby Chat

## Transaction Name
**Lobby Chat**

## User Interface Design
- Provides a real-time chat interface within each lobby for players to communicate.
- Displays chat messages with timestamps, sender names, and roles (attacker/defender/system).
- Allows users to send and receive messages instantly while in a lobby.
- Shows system messages for game events (e.g., player joined, surrendered, rematch requested).
- Handles error and connection states gracefully.
- Visual feedback for sending/receiving messages (animations, sound, toasts).

## Frontend Components
- **LobbyChat.tsx** (React Functional Component)
  - Renders the chat UI, message list, and input box.
  - Connects to the backend via WebSockets (Socket.IO) for real-time updates.
  - Handles sending, receiving, and displaying chat messages.
  - Integrates with user profile popups and reporting features.
- **lobby.service.ts** (Service Class)
  - Provides methods for joining/leaving lobbies and managing chat state.
- **auth.store.ts** (Zustand Store)
  - Provides current user info for chat actions.

## Backend Components
- **boardgame.io server (index.ts)**
  - Handles chat messages as part of the game state using boardgame.io moves.
  - Updates the game state with new chat messages and system messages.
  - Exposes moves like `sendChatMessage` in all phases (setup, playing, game over, reaction).
- **Game Logic (DarknetDuel.ts, gamePhases.ts, chatMoveHandler.ts, actionStageMoves.ts, reactionStageMoves.ts)**
  - Defines the `sendChatMessage` move and chat message handling logic.
  - Stores chat messages in the game state (`G.chat.messages`).
  - Handles both player and system messages.
- **Lobby Database (boardgame.io internal)**
  - Stores match/game state, including chat history.

### Endpoints / Moves
- `sendChatMessage` (boardgame.io move) — Send a chat message in the current lobby/game
- (Other boardgame.io endpoints as needed for game state)

---

## Sequence Overview
1. User opens a lobby and sees the chat interface.
2. User sends a chat message; frontend emits the message via WebSocket or boardgame.io client.
3. Backend receives the message, updates the game state, and broadcasts the new message to all connected clients.
4. All users in the lobby see the new message in real-time.
5. System messages are generated for game events (join, leave, surrender, rematch, etc.).
6. Chat history is persisted in the game state for the duration of the lobby/game. 