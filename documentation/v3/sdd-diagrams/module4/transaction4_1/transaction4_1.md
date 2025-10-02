# Module 4, Transaction 4.1: Card Play, Targeting, and Effect Resolution

## Transaction Name
**Card Play, Targeting, and Effect Resolution**

## User Interface Design
- Players can select cards from their hand to play or throw at targets.
- Cards that require targeting prompt the user to select an infrastructure card as the target.
- Wildcard and special cards may prompt for additional choices (e.g., type selection, chain effect, hand disruption).
- Visual feedback is provided for valid/invalid targets, targeting mode, and card play animations.
- The result of card effects (e.g., state changes, persistent effects, hand disruption) is reflected immediately on the game board.
- Pending choices (wildcard type, chain effect, hand disruption) are shown in overlay UIs.

## Endpoints
- **WebSocket (boardgame.io protocol)**
  - **URL:** `/socket.io/` (relative to game server)
  - **Purpose:** Real-time communication for all game moves, state updates, and synchronization between frontend and backend.
  - **Used by:** All core game actions (playCard, throwCard, endTurn, cycleCard, surrender, etc.) and effect resolution updates.
- **REST API (if applicable)**
  - **Example:** `POST /games/:name/:id/leave` (explicit leave)
  - **Purpose:** Auxiliary actions outside the real-time game loop.

## Frontend Components
- **BalatroGameBoard.tsx** (React Component)
  - Main game board UI; handles rendering player hands, infrastructure, and card play interactions.
- **PlayerHand.tsx** (React Component)
  - Displays the player's hand and handles card selection and play logic.
- **useCardActions.ts** (Custom Hook)
  - Manages card play, targeting, throw actions, and pending choices.
- **PendingChoicesOverlay.tsx** (React Component)
  - Renders overlays for wildcard type selection, chain effect, and hand disruption choices.
- **InfrastructureCardDisplay.tsx** (React Component)
  - Displays infrastructure cards and handles target selection.
- **CardDisplay.tsx** (React Component)
  - Renders individual cards with playability, selection, and targeting feedback.

## Backend Components
- **playCardMove.ts** (Move Handler)
  - Handles playing a card from hand, including wildcards, cost reductions, and effect application.
- **throwCardMove.ts** (Move Handler)
  - Handles throwing a card at a target infrastructure, including validation and effect resolution.
- **cardEffects/index.ts** (Effect Router)
  - Centralizes effect application for all card types, including wildcards and special effects.
- **wildcardResolver.ts** (Wildcard Logic)
  - Handles wildcard card logic, type selection, and special effect application.
- **temporaryEffectsManager.ts** (Effect Manager)
  - Manages temporary and persistent effects applied by cards.
- **cardUtils.ts** (Utility)
  - Validates card playability and targeting.
- **actionStageMoves.ts** (Phase Move Set)
  - Exposes playCard and throwCard moves to the game phases.
- **Backend Server (Express, boardgame.io)**
  - Exposes WebSocket endpoints for card play and effect resolution via boardgame.io protocol.

## Sequence Overview
- Player selects a card from their hand.
- If the card requires targeting, the UI prompts the player to select a valid infrastructure target.
- The frontend sends a playCard or throwCard move to the backend via WebSocket.
- The backend validates the move, applies the card effect (including wildcards and special effects), and updates the game state.
- The updated game state is sent to all clients, reflecting the result of the card play and any resulting effects or pending choices.
- If a pending choice is required (wildcard type, chain effect, hand disruption), the frontend displays the appropriate overlay for player input. 