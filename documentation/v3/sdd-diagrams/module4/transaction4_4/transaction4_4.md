# Module 4, Transaction 4.4: Game State Visualization

## Transaction Name
**Game State Visualization (Frontend Game Board, Hand, Infrastructure, Overlays)**

## User Interface Design
- The game board visually displays all infrastructure cards, player hands, scores, and current game state (turn, phase, round, AP, etc.).
- Infrastructure cards show their state (secure, vulnerable, compromised, etc.), vulnerabilities, shields, and effects with color, icons, and animations.
- Player hands are rendered with card art, playability indicators, and overlays for targeting or pending choices.
- Overlays and modals are used for wildcard type selection, chain effects, hand disruption, and post-game chat.
- The UI updates in real time as the game state changes, with smooth transitions and feedback for all actions.
- Spectator and player views are supported, with sensitive information hidden as appropriate.
- Side panels and overlays display scores, infrastructure status, and game messages.

## Endpoints
- **WebSocket (boardgame.io protocol)**
  - **URL:** `/socket.io/` (relative to game server)
  - **Purpose:** Real-time communication for all game moves, state updates, and synchronization between frontend and backend.
  - **Used by:** All core game actions (playCard, throwCard, endTurn, cycleCard, surrender, etc.) and state visualization updates.
- **REST API (if applicable)**
  - **Example:** `POST /games/:name/:id/leave` (explicit leave)
  - **Purpose:** Auxiliary actions outside the real-time game loop.

## Frontend Components
- **BalatroGameBoard.tsx** (React Component)
  - Main game board UI; renders infrastructure, player hands, overlays, and all state visualizations.
- **GameBoardLayout.tsx** (React Component)
  - Organizes the board into player, opponent, and infrastructure areas.
- **InfrastructureArea.tsx** (React Component)
  - Displays all infrastructure cards in play.
- **PlayerHand.tsx** (React Component)
  - Renders the player's hand with playability and targeting overlays.
- **PendingChoicesOverlay.tsx** (React Component)
  - Shows overlays for wildcard, chain, and hand disruption choices.
- **PowerBar.tsx, PlayerInfo.tsx, GameStatus.tsx** (React Components)
  - Display scores, AP, hand size, round, phase, and win/loss messages.
- **Stylesheets** (`gameboard-v2.css`, `infrastructure-card.css`, etc.)
  - Provide layout, color, animation, and responsive design for all visual elements.
- **useGameBoardData.ts, useGameState.ts** (Custom Hooks)
  - Process and memoize game state for efficient rendering.

## Backend Components
- **playerView.ts** (Player View Logic)
  - Filters and prepares the game state for each player or spectator, hiding sensitive info and marking playability.
- **gameState.ts** (Game State)
  - Defines the structure of the game state and all visualized properties.
- **DarknetDuel.ts** (Game Definition)
  - Integrates playerView and state logic for boardgame.io.
- **stateUpdates.ts** (State Update Utilities)
  - Updates and synchronizes game state after actions.
- **Backend Server (Express, boardgame.io)**
  - Exposes WebSocket endpoints for real-time state updates and synchronization.

## Sequence Overview
- The backend maintains the full game state and filters it for each player or spectator using playerView logic.
- The frontend receives the filtered game state and renders the board, hands, infrastructure, overlays, and all visual elements.
- As players take actions, the backend updates the game state and pushes changes to all clients.
- The frontend updates the UI in real time, animating state changes and displaying overlays as needed.
- Overlays and modals are shown for pending choices, hand disruption, and post-game chat.
- The UI provides a seamless, responsive, and visually rich experience for all players and spectators. 