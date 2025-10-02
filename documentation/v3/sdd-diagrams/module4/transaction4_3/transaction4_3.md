# Module 4, Transaction 4.3: Game Rules Enforcement (AP, Hand Size, Win Conditions)

## Transaction Name
**Game Rules Enforcement (Action Points, Hand Size, Win Conditions)**

## User Interface Design
- The UI displays each player's current Action Points (AP), hand size, and maximum allowed hand size.
- Players are prevented from playing cards if they lack sufficient AP or if their hand is full.
- The UI provides feedback when a move is blocked due to AP, hand size, or rule violations (e.g., error toasts, disabled buttons).
- End turn, cycle card, and surrender buttons are available and context-sensitive.
- The game board displays the current round, turn, and phase, as well as win/loss/draw messages when the game ends.
- Score and infrastructure status are shown in side panels or overlays.

## Endpoints
- **WebSocket (boardgame.io protocol)**
  - **URL:** `/socket.io/` (relative to game server)
  - **Purpose:** Real-time communication for all game moves, state updates, and synchronization between frontend and backend.
  - **Used by:** All core game actions (playCard, throwCard, endTurn, cycleCard, surrender, etc.) and rule enforcement updates.
- **REST API (if applicable)**
  - **Example:** `POST /games/:name/:id/leave` (explicit leave)
  - **Purpose:** Auxiliary actions outside the real-time game loop.

## Frontend Components
- **BalatroGameBoard.tsx** (React Component)
  - Displays AP, hand size, round, phase, and win/loss messages; disables actions when rules are violated.
- **PlayerHand.tsx** (React Component)
  - Renders the player's hand and disables card play when hand is full or AP is insufficient.
- **PlayerInfo.tsx** (React Component)
  - Shows AP, hand size, and maintenance costs.
- **GameControls.tsx** (React Component)
  - Provides end turn, cycle card, and surrender buttons; disables them as appropriate.
- **GameStatus.tsx** (React Component)
  - Displays current phase, turn, and game over messages.
- **useTurnActions.ts** (Custom Hook)
  - Handles end turn, cycle card, and surrender logic.
- **game.types.ts** (Type Definitions)
  - Defines AP, hand size, and win condition properties in the game state.
- **Stylesheets**
  - Style AP, hand size, and win/loss/draw overlays and feedback.

## Backend Components
- **gameState.ts** (Game State)
  - Defines initial AP, hand size, max turns, and win condition logic.
- **playerManager.ts** (Player Management)
  - Initializes players, updates AP, draws cards, and enforces hand size.
- **gamePhases.ts** (Phase Logic)
  - Handles AP allocation, hand size enforcement, turn/round progression, and win condition checks.
- **actionStageMoves.ts** (Move Set)
  - Exposes playCard, cycleCard, endTurn, and surrender moves; checks for rule violations.
- **phaseUtils.ts** (Rule Utilities)
  - Checks end conditions, win conditions, and enforces rule compliance.
- **cardUtils.ts** (Validation)
  - Validates card playability based on AP, hand size, and turn.
- **Backend Server (Express, boardgame.io)**
  - Exposes WebSocket endpoints for all moves and state updates.

## Sequence Overview
- At the start of each turn, the backend allocates AP and draws cards up to the hand size limit.
- The frontend displays updated AP, hand size, and disables actions if rules are violated.
- When a player attempts a move, the backend validates AP, hand size, and turn; if invalid, the move is rejected and the frontend displays an error.
- End turn, cycle card, and surrender actions are processed according to game rules.
- The backend checks for win conditions (infrastructure control, max rounds, etc.) after each move or turn.
- When a win/loss/draw is detected, the game state is updated and the frontend displays the result. 