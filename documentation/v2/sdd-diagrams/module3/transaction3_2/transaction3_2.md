# Module 3, Transaction 3.2: Turn-Based Gameplay, AP Allocation, Card Play, and Targeting

## Transaction Name
**Turn-Based Gameplay, AP Allocation, Card Play, and Targeting**

## User Interface Design
- Displays turn indicator showing whose turn it is (attacker/defender).
- Shows current action points (AP) for each player, updating at the start of each turn.
- Highlights playable cards in the player's hand based on AP and game rules.
- Allows player to select and play a card; if the card requires a target, prompts for valid target selection (infrastructure, opponent, etc.).
- Provides visual feedback for valid/invalid actions (e.g., disabled cards, error toasts).
- Shows reaction phase indicator when the opponent can respond to a card play.
- Displays end turn button, cycle card button, and surrender option.
- Updates game state and notifies all players after each action.

## Frontend Components
- **BalatroGameBoard.tsx** (React Functional Component)
  - Main game board UI; manages turn state, card play, targeting, and AP display.
- **PlayerHand.tsx** (React Functional Component)
  - Renders the player's hand, highlights playable cards, and handles card selection.
- **GameControls.tsx** (React Functional Component)
  - Provides controls for ending turn, cycling cards, surrendering, and shows turn/AP info.
- **useCardActions.ts** (Custom Hook)
  - Handles card play logic, targeting, and move validation.
- **useTurnActions.ts** (Custom Hook)
  - Manages end turn, skip reaction, and related turn-based actions.

## Backend Components
- **Game Server (boardgame.io)**
  - Handles turn order, AP allocation, card play, targeting, and reaction phase.
  - Main logic in `core/gamePhases.ts`, `core/turnManager.ts`, `core/playerManager.ts`, `actions/playCardMove.ts`, `actions/throwCardMove/throwCardMove.ts`, `actions/cycleCardMove.ts`.
  - **Endpoints:**
    - WebSocket API for real-time game state updates and moves (playCard, throwCard, endTurn, cycleCard, etc.).
- **TurnManager** (Utility)
  - Handles start of turn (draw card, allocate AP) and end of turn logic.
- **ActionStageMoves** (Phase Logic)
  - Defines available moves during the action stage (playCard, throwCard, cycleCard, endTurn, etc.).

## Sequence Overview
- System determines which player's turn it is and allocates AP.
- Player selects and plays a card from their hand.
- If the card requires a target, player selects valid target(s).
- System enters reaction phase, allowing opponent to respond.
- System validates and resolves all actions and updates game state.
- Turn passes to the next player. 