# Module 4, Transaction 4.2: Infrastructure State Tracking

## Transaction Name
**Infrastructure State Tracking (Secure, Vulnerable, Compromised, Fortified, etc.)**

## User Interface Design
- The game board displays all infrastructure cards with their current state (secure, vulnerable, compromised, shielded, fortified, etc.).
- State changes are visually indicated with color, icons, and animations (e.g., pulsing for vulnerable/compromised, shield glow for shielded/fortified).
- Players can see vulnerabilities, shields, and effects applied to each infrastructure card.
- State indicators and tooltips provide additional information about each state.
- Infrastructure state changes are updated in real time as a result of card effects or game events.
- The UI provides a summary of infrastructure status (e.g., number compromised, number fortified) in the sidebar or status panel.

## Endpoints
- **WebSocket (boardgame.io protocol)**
  - **URL:** `/socket.io/` (relative to game server)
  - **Purpose:** Real-time communication for all game moves, state updates, and synchronization between frontend and backend.
  - **Used by:** All core game actions (playCard, throwCard, endTurn, cycleCard, surrender, etc.) and infrastructure state updates.
- **REST API (if applicable)**
  - **Example:** `POST /games/:name/:id/leave` (explicit leave)
  - **Purpose:** Auxiliary actions outside the real-time game loop.

## Frontend Components
- **BalatroGameBoard.tsx** (React Component)
  - Renders the infrastructure grid, applies state-based classes, and displays state indicators and effects.
- **InfrastructureArea.tsx** (React Component)
  - Organizes and displays all infrastructure cards in play.
- **InfrastructureCardDisplay.tsx** (React Component)
  - Renders individual infrastructure cards, state indicators, vulnerabilities, shields, and effects.
- **game.types.ts** (Type Definitions)
  - Defines `InfrastructureCard`, `InfrastructureState`, and related types for state tracking.
- **Stylesheets** (`gameboard-v2.css`, `infrastructure-card.css`, `infrastructure.css`, `game-layout-fix.css`)
  - Provide visual feedback and animations for each infrastructure state.

## Backend Components
- **InfrastructureCard** (Type Definition)
  - Defines the structure and state of infrastructure cards (`secure`, `vulnerable`, `compromised`, `shielded`, `fortified`, etc.).
- **infrastructureCardLoader.ts** (Loader)
  - Initializes the set of infrastructure cards and their starting states.
- **exploitEffect.ts, attackEffect.ts, fortifyEffect.ts, reactionEffect.ts** (Effect Handlers)
  - Apply state transitions to infrastructure cards based on card effects.
- **throwCardMove/cardEffects/index.ts** (Effect Router)
  - Centralizes effect application and processes persistent effects on state change.
- **temporaryEffectsManager.ts** (Effect Manager)
  - Handles temporary and persistent effects that may alter infrastructure state.
- **gameState.ts, phaseUtils.ts** (Game State/Win Logic)
  - Track infrastructure state for win conditions and scoring.
- **Validators/Utils**
  - Validate card targeting and state transitions.
- **Backend Server (Express, boardgame.io)**
  - Exposes WebSocket endpoints for state updates and synchronization.

## Sequence Overview
- Infrastructure cards are initialized in the `secure` state at game start.
- As cards are played, effect handlers update the state of targeted infrastructure (e.g., secure → vulnerable → compromised, shielded → fortified).
- State changes trigger visual updates on the frontend and may activate persistent effects.
- The backend tracks all state changes and updates the game state accordingly.
- The frontend receives updated game state and re-renders infrastructure cards with their new states and effects.
- The UI provides real-time feedback and summary of infrastructure status throughout the game. 