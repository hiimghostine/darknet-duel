# Darknet Duel Game Server – Comprehensive Software Definition

## Overview

The `game-server` is the backend engine for **Darknet Duel**, a real-time, turn-based, multiplayer card game themed around cybersecurity. It manages all game logic, state, player actions, and server-to-backend communication. The codebase is modular, robust, and thoroughly documented, with each file and function described in adjacent `.md` files for maintainability and onboarding.

---

## Tech Stack & Libraries

- **TypeScript**: Strong typing for maintainable, scalable code.
- **Node.js**: JavaScript runtime for server-side logic.
- **boardgame.io**: Multiplayer game state management, turn logic, and networking.
- **Koa**: Lightweight web framework for custom API endpoints.
- **Axios**: HTTP client for backend communication.
- **dotenv**: Environment variable management.
- **Custom shared types**: Ensures type safety and consistency between frontend and backend.

---

## Example Cards

### Attacker Cards
1. **Port Scanner** – Identifies open network services. Makes an infrastructure card vulnerable to Network attacks.
2. **Packet Sniffer** – Captures and analyzes network traffic. Makes an infrastructure card vulnerable to Network attacks.
3. **Log4Shell** – Remote code execution in Java logging. Makes an infrastructure card vulnerable to Network attacks.
4. **SQL Injection Scanner** – Exploits cross-site scripting vulnerabilities. Makes an infrastructure card vulnerable to Web attacks.

### Defender Cards
1. **Firewall** – Blocks unauthorized network access. Shields infrastructure against Network attacks.
2. **Intrusion Detection** – Monitors network for suspicious activity. Reactively shields infrastructure against Network attacks during the attacker's turn.
3. **Network Monitoring** – Continuous traffic analysis. Shields infrastructure against Network attacks.
4. **WAF Implementation** – Web Application Firewall protection. Shields infrastructure against Web attacks.

### Infrastructure Cards
1. **Enterprise Firewall** – Primary perimeter defense system. Vulnerable to Network attacks.
2. **Corporate Website** – Public-facing web presence. Vulnerable to Web attacks.
3. **Main Database Cluster** – Primary data storage for all operations. Vulnerable to Network and Web attacks.
4. **Employee Workstations** – End-user computing devices. Vulnerable to Social and Malware attacks.

---

## Directory Structure & File-by-File Documentation

### `src/game/` – Core Game Logic

#### `DarknetDuel.ts`
- **Purpose**: Main game definition for boardgame.io, integrating all phases, moves, and player view logic. Entry point for the game logic.
- **See**: `DarknetDuel.ts.md` for detailed function and type documentation.

#### `core/` – Game State, Phases, Player & Turn Management
- **gameState.ts**: Initializes and manages the game state, including setup and end conditions. See `gameState.ts.md`.
- **playerView.ts**: Filters game state for each player, hiding secret information. See `playerView.ts.md`.
- **gamePhases.ts**: Defines the phases of the game (setup, play, gameOver) and their transitions. See `gamePhases.ts.md`.
- **gamePhases.ts.bak**: Legacy monolithic phase logic, preserved for reference. See `gamePhases.ts.bak.md`.
- **playerManager.ts**: Handles player initialization, card drawing, and action point (AP) management. See `playerManager.ts.md`.
- **turnManager.ts**: Manages turn transitions and start-of-turn logic. See `turnManager.ts.md`.
- **phases/**: Contains move and utility logic for each phase:
  - **actionStageMoves.ts**: Implements player actions during the action phase. See `actionStageMoves.ts.md`.
  - **reactionStageMoves.ts**: Handles reactions to actions. See `reactionStageMoves.ts.md`.
  - **chatMoveHandler.ts**: Manages in-game chat moves. See `chatMoveHandler.ts.md`.
  - **surrenderMoveHandler.ts**: Handles player surrender logic. See `surrenderMoveHandler.ts.md`.
  - **phaseUtils.ts**: Utility functions for phase transitions and validation. See `phaseUtils.ts.md`.

#### `actions/` – Modularized Player Action Handlers
- **playerActions.ts**: Main entry point, re-exporting all modularized player action logic. See `playerActions.ts.md`.
- **cycleCardMove.ts**: Handles cycling cards in hand. See `cycleCardMove.ts.md`.
- **playCardMove.ts**: Handles playing cards from hand. See `playCardMove.ts.md`.
- **turnManagement.ts**: Manages turn-related player actions. See `turnManagement.ts.md`.
- **chainEffects.ts**: Handles chain effect resolution. See `chainEffects.ts.md`.
- **handDisruption.ts**: Implements hand disruption effects. See `handDisruption.ts.md`.
- **temporaryEffectsManager.ts**: Manages temporary effects and their expiration. See `temporaryEffectsManager.ts.md`.
- **wildcardResolver.ts**: Handles wildcard card resolution and player choices. See `wildcardResolver.ts.md`.
- **README.md**: Explains the modular structure and migration from legacy code. See `README.md.md`.
- **playerActions.bak / playerActions.ts.old**: Legacy monolithic action handler, preserved for reference. See their respective `.md` files.
- **throwCardMove/**: Handles the complex "throw card" action, including effect handlers for each card type:
  - **throwCardMove.ts**: Main logic for throw card actions. See `throwCardMove.ts.md`.
  - **throwCardMove.ts.bak**: Legacy version for reference. See `throwCardMove.ts.bak.md`.
  - **index.ts**: Entry point for throw card move logic. See `index.ts.md`.
  - **cardEffects/**: Effect handlers for each card type:
    - **attackEffect.ts, exploitEffect.ts, shieldEffect.ts, fortifyEffect.ts, responseEffect.ts, reactionEffect.ts, counterEffect.ts**: Each implements the effect logic for a specific card type. See their respective `.md` files.
    - **index.ts**: Aggregates all card effect handlers. See `index.ts.md`.
  - **utils/**: Utilities for throw card move:
    - **attackVectorResolver.ts**: Resolves attack vectors for throw card actions. See `attackVectorResolver.ts.md`.
    - **costCalculation.ts**: Calculates costs for throw card actions. See `costCalculation.ts.md`.
    - **throwCardValidation.ts**: Validates throw card actions. See `throwCardValidation.ts.md`.

- **utils/**: General action utilities:
  - **cardUtils.ts**: Card-related utility functions. See `cardUtils.ts.md`.
  - **effectHandling.ts**: Handles effect application and resolution. See `effectHandling.ts.md`.
  - **index.ts**: Aggregates utilities. See `index.ts.md`.
  - **scoring.ts**: Scoring logic for actions. See `scoring.ts.md`.
  - **stateUpdates.ts**: State update utilities. See `stateUpdates.ts.md`.
  - **typeGuards.ts**: Type guard functions for action types. See `typeGuards.ts.md`.
  - **validators.ts**: Validation logic for actions. See `validators.ts.md`.

#### `moves/` – Specialized Move Handlers
- **chooseWildcardType.ts**: Handles player choice when playing wildcard cards. See `chooseWildcardType.ts.md`.
- **chooseHandDiscard.ts**: Handles hand disruption effects. See `chooseHandDiscard.ts.md`.
- **chooseChainTarget.ts**: Handles chain effect targeting. See `chooseChainTarget.ts.md`.
- **chooseCardFromDeck.ts**: Handles card selection from deck (e.g., AI-Powered Attack). See `chooseCardFromDeck.ts.md`.
- **devCheatAddCard.ts**: Developer-only move for testing. See `devCheatAddCard.ts.md`.

#### `cards/` – Card Data Loaders & Types
- **attackerCardLoader.ts, defenderCardLoader.ts, infrastructureCardLoader.ts, cardLoader.ts**: Loaders for card data from JSON files. See their respective `.md` files.
- **types.ts, cardTypes.ts**: Canonical type definitions for all cards, effects, and infrastructure. See their respective `.md` files.
- **attacker.json, defender.json, infrastructure.json**: Card data (not TypeScript, but referenced by loaders).

#### `utils/` – Utility Functions
- **wildcardUtils.ts**: Utility functions for wildcard logic. See `wildcardUtils.ts.md`.
- **cardUtils.ts**: Utility functions for card playability. See `cardUtils.ts.md`.

---

### `src/server/` – Server Entrypoint & API
- **index.ts**: Main entry point. Configures the boardgame.io server, sets up API endpoints, manages lobby and player state, and synchronizes results with the backend. See `index.ts.md`.
- **auth.ts**: Token validation, authentication middleware, and secure result submission. See `auth.ts.md`.
- **serverAuth.ts**: Secure server-to-server communication helpers (game results, history, ELO updates). See `serverAuth.ts.md`.
- **cardDataRoutes.ts**: Koa router exposing card data endpoints for dev/admin tools. See `cardDataRoutes.ts.md`.

---

### `src/services/` – Background Services
- **lobbyCleanupService.ts**: Periodically cleans up abandoned or inactive games, keeping the lobby performant and up-to-date. See `lobbyCleanupService.ts.md`.

---

### `src/types/` – Type Definitions
- **game.types.ts.bak**: Backup of shared game state types (for reference or rollback).

---

## Excluded Files & Directories
- **/tests**: All test directories and files are excluded from this documentation.
- **verifyRefactor.ts**: Developer migration/verification script, not part of production logic.

---

## How the Game Server Works (Summary)

1. **Server Startup**: `index.ts` initializes the boardgame.io server, configures CORS, and sets up custom API endpoints.
2. **Lobby & Player Management**: Handles player join/leave, lobby metadata, and real user data mapping.
3. **Game Lifecycle**: Manages game creation, turn logic, phase transitions, and end conditions using boardgame.io and custom logic.
4. **Player Actions**: Modularized action handlers process all player moves, card effects, and special abilities.
5. **Backend Sync**: On game end, results are sent to the backend for storage, history, and rating updates.
6. **Abandonment & Cleanup**: Detects abandoned games and cleans them up using `LobbyCleanupService`.
7. **API Endpoints**: Exposes health checks, card data, and validation endpoints for frontend and admin tools.

---

## Notable Features

- **Extensible modular structure**: Easy to add new card types, effects, or phases.
- **Robust multiplayer support**: Handles disconnections, abandonment, and host transfer.
- **Secure backend integration**: All results and sensitive actions are validated and synchronized.
- **Comprehensive documentation**: Every file and function is documented for maintainability.

---

## Conclusion

The `game-server` is a robust, extensible, and well-documented backend for Darknet Duel, leveraging modern TypeScript, boardgame.io, and best practices in multiplayer game server design. Its modular structure, comprehensive type safety, and detailed documentation make it easy to maintain, extend, and integrate with frontend and backend systems. 
The `game-server` is a robust, extensible, and well-documented backend for Darknet Duel, leveraging modern TypeScript, boardgame.io, and best practices in multiplayer game server design. Its modular structure, comprehensive type safety, and detailed documentation make it easy to maintain, extend, and integrate with frontend and backend systems. 