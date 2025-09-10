# Darknet Duel - Complete Game Map & Documentation

## Table of Contents
1. [Game Overview](#game-overview)
2. [Architecture](#architecture)
3. [Game Components](#game-components)
4. [Game Mechanics](#game-mechanics)
5. [Card System](#card-system)
6. [Infrastructure System](#infrastructure-system)
7. [Gameplay Flow](#gameplay-flow)
8. [Win Conditions](#win-conditions)
9. [Technical Implementation](#technical-implementation)
10. [Development Structure](#development-structure)

---

## Game Overview

**Darknet Duel** is a cybersecurity-themed strategic card game where two players engage in digital warfare. One player takes the role of an **Attacker (Red Team)** attempting to compromise digital infrastructure, while the other plays as a **Defender (Blue Team)** working to protect and secure these systems.

### Core Concept
- **Theme**: Cybersecurity warfare simulation
- **Players**: 2 (Attacker vs Defender)
- **Game Type**: Turn-based strategy card game
- **Objective**: Control digital infrastructure through strategic card play
- **Duration**: 15 rounds maximum (typically 20-30 minutes)

---

## Architecture

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Game Server   │    │  Backend API    │
│   (React/Vite)  │◄──►│  (BoardGame.io) │◄──►│   (Node.js)     │
│                 │    │                 │    │                 │
│ - Game UI       │    │ - Game Logic    │    │ - User Auth     │
│ - Card Display  │    │ - State Mgmt    │    │ - Game History  │
│ - Player Actions│    │ - Turn Mgmt     │    │ - Ratings       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Game Engine**: BoardGame.io
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Shared Types**: TypeScript interfaces across all components

---

## Game Components

### 1. Infrastructure Cards (5 total)
The central objectives of the game - digital systems that players fight to control:

| Card ID | Name | Type | Vulnerable To | Description |
|---------|------|------|---------------|-------------|
| I001 | Enterprise Firewall | Network | Network, Malware | Primary perimeter defense system |
| I003 | Corporate Website | Web | Web, Social | Public-facing web presence |
| I005 | Main Database Cluster | Data | Network, Web | Primary data storage for all operations |
| I007 | Employee Workstations | User | Social, Malware | End-user computing devices |
| I009 | Financial System | Critical | Network, Web, Malware | Core accounting and payment platform |

### 2. Player Decks

#### Attacker Deck (70 cards total)
- **36 Exploit Cards**: Create vulnerabilities in infrastructure
  - 9 Network Exploits
  - 9 Web Exploits  
  - 9 Social Engineering Exploits
  - 9 Malware Exploits
- **20 Attack Cards**: Compromise vulnerable infrastructure
  - 5 Network Attacks
  - 5 Web Attacks
  - 5 Social Engineering Attacks
  - 5 Malware Attacks
- **8 Counter-Attack Cards**: Disrupt defender actions
  - 2 Network Counter-Attacks
  - 2 Web Counter-Attacks
  - 2 Social Engineering Counter-Attacks
  - 2 Malware Counter-Attacks
- **6 Wildcard Cards**: Versatile cards (can be any type)

#### Defender Deck (76 cards total)
- **32 Shield Cards**: Protect infrastructure from specific attack vectors
  - 8 Network Shields
  - 8 Web Shields
  - 8 Social Engineering Shields
  - 8 Malware Shields
- **20 Fortify Cards**: Strengthen shielded infrastructure
  - 5 Network Fortifications
  - 5 Web Fortifications
  - 5 Social Engineering Fortifications
  - 5 Malware Fortifications
- **8 Response Cards**: Recover compromised infrastructure
  - 2 Network Responses
  - 2 Web Responses
  - 2 Social Engineering Responses
  - 2 Malware Responses
- **10 Reaction Cards**: Counter attacker cards reactively
  - 2 Network Reactions
  - 2 Web Reactions
  - 2 Social Engineering Reactions
  - 2 Malware Reactions
  - 2 Wildcard Reactions
- **6 Wildcard Cards**: Versatile cards (can be any type)

---

## Game Mechanics

### Action Points (AP) System
- **Attacker**: Starts with 2 AP, gains 2 AP per turn (max 10 AP)
- **Defender**: Starts with 2 AP, gains 3 AP per turn (max 10 AP)
- **Card Costs**: Most cards cost 1-2 AP to play
- **AP Carryover**: Unused AP carries over between turns up to the maximum

### Turn Structure
1. **Start of Turn**: Gain AP, draw cards
2. **Action Phase**: Play cards, use abilities
3. **Reaction Phase**: Opponent can play reactive cards
4. **End of Turn**: Resolve effects, check win conditions

### Card Cycling
- **Free Cycles**: 1 free card cycle per turn (discard + draw)
- **Additional Cycles**: Cost resources or AP
- **Hand Limit**: Maximum 7 cards in hand

### Resource Management
- **Starting Resources**: 5 per player
- **Resource Generation**: Varies by game events and cards
- **Uses**: Card cycling, special abilities

---

## Card System

### Card Types

#### Attacker Cards
1. **Exploit Cards** (1 AP)
   - Create vulnerabilities in infrastructure
   - Transition: `secure` → `vulnerable`
   - Must match infrastructure's vulnerable vectors

2. **Attack Cards** (1 AP)
   - Compromise vulnerable infrastructure
   - Transition: `vulnerable` → `compromised`
   - Requires existing vulnerability

3. **Counter-Attack Cards** (1 AP)
   - Reactive cards to disrupt defender actions
   - Can be played during opponent's turn
   - Various disruptive effects

4. **Wildcard Cards** (2 AP)
   - Can be played as any other card type
   - Player chooses type when playing
   - More expensive but versatile

#### Defender Cards
1. **Shield Cards** (1 AP)
   - Protect infrastructure from specific attack vectors
   - Transition: `secure` → `shielded`
   - Prevents matching exploit/attack cards

2. **Fortify Cards** (2 AP)
   - Strengthen shielded infrastructure
   - Transition: `shielded` → `fortified`
   - Requires existing shield

3. **Response Cards** (1 AP)
   - Recover compromised infrastructure
   - Transition: `compromised` → `secure`
   - Removes attacker control

4. **Reaction Cards** (1 AP)
   - Counter attacker cards reactively
   - Can be played during opponent's turn
   - Prevents or mitigates attacks

5. **Wildcard Cards** (2 AP)
   - Can be played as any other card type
   - Player chooses type when playing

### Attack Vectors
- **Network**: Infrastructure network vulnerabilities
- **Web**: Web application vulnerabilities  
- **Social**: Social engineering attacks
- **Malware**: Malicious software attacks

---

## Infrastructure System

### Infrastructure States
Each infrastructure card progresses through different states based on player actions:

#### Attacker Path (Compromise)
```
secure → vulnerable → compromised
```

#### Defender Path (Protection)
```
secure → shielded → fortified → fortified_weaken → secure
```

### State Descriptions
- **Secure**: Default state, no special effects
- **Vulnerable**: Has exploits, can be attacked
- **Compromised**: Controlled by attacker (counts toward victory)
- **Shielded**: Protected by defender shields
- **Fortified**: Fully protected and strengthened
- **Fortified_Weaken**: Weakened fortification (returns to secure)

### State Transitions
| From State | To State | Required Action | Player |
|------------|----------|-----------------|---------|
| Secure | Vulnerable | Play Exploit Card | Attacker |
| Vulnerable | Compromised | Play Attack Card | Attacker |
| Secure | Shielded | Play Shield Card | Defender |
| Shielded | Fortified | Play Fortify Card | Defender |
| Compromised | Secure | Play Response Card | Defender |
| Fortified | Fortified_Weaken | Special Effects | Various |
| Fortified_Weaken | Secure | Automatic | System |

---

## Gameplay Flow

### Game Setup
1. **Player Assignment**: Random or chosen (Attacker = Player 0, Defender = Player 1)
2. **Infrastructure Deployment**: All 5 infrastructure cards placed in `secure` state
3. **Deck Creation**: Each player gets their role-specific deck
4. **Initial Draw**: Each player draws 5 cards
5. **Starting Resources**: Each player gets 5 resources and 2 AP

### Turn Sequence
1. **Turn Start**
   - Current player gains AP (2 for attacker, 3 for defender)
   - Draw 2 cards (if deck has cards)
   - Reset free card cycles to 1

2. **Action Phase**
   - Play cards by spending AP
   - Target infrastructure or players
   - Use special abilities
   - Cycle cards (1 free per turn)

3. **Reaction Phase**
   - Opponent can play reactive cards
   - Resolve reactions and counter-reactions
   - Apply final effects

4. **End Phase**
   - Resolve end-of-turn effects
   - Check win conditions
   - Pass turn to opponent

### Special Mechanics

#### Wildcard Resolution
When a wildcard is played:
1. Player chooses the card type to emulate
2. Game validates the choice is legal
3. Card functions as chosen type for remainder of play

#### Chain Effects (Phase 3)
- Some cards create chain effects across multiple infrastructure
- Player chooses targets from available options
- Effects propagate based on card specifications

#### Hand Disruption (Phase 3)
- Certain cards reveal opponent's hand
- Player chooses cards for opponent to discard
- Creates tactical information advantage

---

## Win Conditions

### Immediate Victory
- **Attacker**: Control ALL 5 infrastructure cards (all in `compromised` state)
- **Defender**: Fortify ALL 5 infrastructure cards (all in `fortified` state)

### Turn Limit Victory (After 15 rounds)
- **Majority Rule**: Player controlling 3+ infrastructure cards wins
- **Tie Breaker**: Defender wins ties (defender advantage)
- **Scoring**: 
  - Attacker: Count `compromised` infrastructure
  - Defender: Count `fortified` and `fortified_weaken` infrastructure

### Special Victory Conditions
- **Abandonment**: If a player disconnects for too long
- **Concession**: Player can forfeit the game

---

## Technical Implementation

### Game State Management
```typescript
interface GameState {
  // Players
  attacker?: Player;
  defender?: Player;
  
  // Infrastructure
  infrastructure?: InfrastructureCard[];
  
  // Turn Management
  currentTurn: PlayerRole;
  turnNumber: number;
  currentRound: number;
  gamePhase: 'setup' | 'playing' | 'gameOver';
  
  // Scoring
  attackerScore: number;
  defenderScore: number;
  
  // Special States
  pendingReactions?: PendingReaction[];
  pendingWildcardChoice?: WildcardChoice;
  pendingChainChoice?: ChainEffect;
  pendingHandChoice?: HandDisruptionChoice;
}
```

### Core Gameplay Files & Functions

#### Game Engine Core (`game-server/src/game/`)

**`DarknetDuel.ts`** - Main game definition
- `setup()` - Initializes minimal game state
- `playerView()` - Filters game state for each player
- Game moves: `sendChatMessage`, `cycleCard`, `playCard`, `throwCard`, `endTurn`
- Special moves: `chooseWildcardType`, `chooseChainTarget`, `chooseHandDiscard`

**`core/gameState.ts`** - Game state management
- `createInitialState()` - Creates initial game configuration
- `checkGameEnd()` - Determines win conditions and game end states
- Game config: AP system, turn limits, hand sizes, card draw rates

**`core/gamePhases.ts`** - Game phase management (496 lines)
- `setupPhase` - Player initialization and deck creation
- `playingPhase` - Main gameplay with action/reaction/end stages  
- `gameOverPhase` - Post-game chat and rematch handling
- Turn management: AP allocation, card drawing, maintenance costs

**`core/playerManager.ts`** - Player state management
- `initializePlayer()` - Creates player with role-specific deck
- `initializePlayerWithData()` - Creates player with real user data
- `drawCard()` - Handles card drawing from deck to hand
- `drawStartingHand()` - Initial hand creation
- `updateActionPoints()` - AP replenishment per turn (2 for attacker, 3 for defender)

#### Card System (`game-server/src/game/cards/`)

**`infrastructureCardLoader.ts`** - Infrastructure cards (5 total)
- `createInfrastructureCards()` - Creates all 5 infrastructure objectives
- Infrastructure types: Network (Firewall), Web (Website), Data (Database), User (Workstations), Critical (Financial)
- Each has vulnerableVectors and initial 'secure' state

**`attackerCardLoader.ts`** - Attacker deck creation (70 cards)
- `loadAttackerCards()` - Loads from JSON and converts to Card format
- `createAttackerDeck()` - Creates balanced deck with duplicates:
  - 36 Exploit cards (9 each: Network, Web, Social, Malware)
  - 20 Attack cards (5 each category)
  - 8 Counter-Attack cards (2 each category)  
  - 6 Wildcard cards
- `shuffleCards()` - Fisher-Yates shuffle algorithm

**`defenderCardLoader.ts`** - Defender deck creation (76 cards)
- `loadDefenderCards()` - Loads from JSON and converts to Card format
- `createDefenderDeck()` - Creates balanced deck:
  - 32 Shield cards (8 each category)
  - 20 Fortify cards (5 each category)
  - 8 Response cards (2 each category)
  - 10 Reaction cards (2 each category + 2 wildcard)
  - 6 Wildcard cards

#### Player Actions (`game-server/src/game/actions/`)

**`playerActions.ts`** - Main action entry point (re-exports all actions)
- `cycleCardMove()` - Discard and draw new card (1 free per turn)
- `playCardMove()` - Play card to field (unused in current game)
- `throwCardMove()` - Main card playing action (targets infrastructure)
- `endTurnMove()` - End current player's turn

**`throwCardMove/throwCardMove.ts`** - Core card playing logic (932 lines)
- **Phase 1**: Comprehensive validation (player, card, target, AP)
- **Phase 2**: Attack vector resolution and targeting validation
- **Phase 3**: Cost calculation with reductions and special effects
- **Phase 4**: Wildcard handling and auto-selection logic
- **Phase 5**: Tax effects (Honeypot Network) processing
- **Phase 6**: Hand management and card removal
- **Phase 7**: Effect application and infrastructure updates
- **Phase 8**: Score calculation and game state updates

**`throwCardMove/cardEffects/index.ts`** - Card effect router
- `applyCardEffect()` - Routes to specific effect handlers by card type
- `handleWildcardEffect()` - Manages wildcard type selection and effects
- `handleSpecialEffect()` - Processes special cards (chain effects, mass actions)
- Effect handlers: `exploitEffect`, `attackEffect`, `shieldEffect`, `fortifyEffect`, `responseEffect`, `reactionEffect`, `counterEffect`

**`wildcardResolver.ts`** - Wildcard card processing
- `getAvailableTypes()` - Determines valid card types for wildcard in context
- `applyWildcardEffects()` - Applies wildcard-specific special effects
- Auto-selection logic based on infrastructure state and player role

**`temporaryEffectsManager.ts`** - Special effects system
- `addEffect()` - Adds temporary effects (cost reduction, prevent reactions, etc.)
- `hasEffect()` - Checks for active effects on targets
- `processMaintenanceCosts()` - Handles recurring effect costs
- `processPersistentEffects()` - Triggers effects on state changes

#### Game Moves (`game-server/src/game/moves/`)

**`chooseWildcardType.ts`** - Wildcard type selection
- Handles player choice when wildcard needs type specification
- Validates chosen type against available options
- Applies chosen type and continues card resolution

**`chooseChainTarget.ts`** - Chain effect target selection  
- Handles lateral movement and chain vulnerability effects
- Player selects additional infrastructure targets
- Propagates effects across multiple infrastructure

**`chooseHandDiscard.ts`** - Hand disruption resolution
- Handles Memory Corruption Attack and similar effects
- Player selects cards to discard from opponent's revealed hand
- Processes Honeypot Network tax payments

**`chooseCardFromDeck.ts`** - Deck selection effects
- Handles AI-Powered Attack and similar cards
- Player views and selects cards from deck or discard
- Adds selected cards to hand

**`devCheatAddCard.ts`** - Development cheat commands
- Allows developers to add any card to player's hand
- Used for testing specific game scenarios
- Only available in development builds

#### Frontend Components (`darknet-duel-frontend/src/components/`)

**`game/`** - Game UI components
- `GameBoard.tsx` - Main game interface layout
- `InfrastructureGrid.tsx` - Shows 5 infrastructure cards and their states
- `PlayerHand.tsx` - Displays player's cards with drag-and-drop
- `ActionPointsDisplay.tsx` - Shows current AP and maximum
- `GameChat.tsx` - In-game chat system
- `CardPreview.tsx` - Detailed card information popup

**`ui/`** - Reusable UI components  
- `Card.tsx` - Individual card display component
- `Button.tsx` - Styled button components
- `Modal.tsx` - Modal dialog system
- `LoadingSpinner.tsx` - Loading indicators

**`lobby/`** - Pre-game lobby system
- `GameLobby.tsx` - Waiting room and matchmaking
- `LobbyChat.tsx` - Pre-game chat system
- `PlayerList.tsx` - Shows connected players

### Key Gameplay Functions

#### Infrastructure State Transitions
```typescript
// From throwCardMove/cardEffects/
exploitEffect() // secure → vulnerable
attackEffect() // vulnerable → compromised  
shieldEffect() // secure → shielded
fortifyEffect() // shielded → fortified
responseEffect() // compromised → secure
```

#### Action Point Management
```typescript
// From core/playerManager.ts
updateActionPoints(player, role, gameConfig) {
  const apToAdd = role === 'attacker' ? 2 : 3; // Asymmetric AP gain
  return Math.min(currentAP + apToAdd, 10); // Capped at 10 AP
}
```

#### Win Condition Checking
```typescript
// From core/gameState.ts
checkGameEnd(gameState) {
  // Immediate win: Control ALL 5 infrastructure
  if (attackerControlled === 5) return { winner: 'attacker' };
  if (defenderControlled === 5) return { winner: 'defender' };
  
  // Turn limit win: Majority rule after 15 rounds
  if (turnNumber > maxTurns) {
    return attackerControlled >= 3 ? 'attacker' : 'defender';
  }
}
```

#### Card Effect Processing Pipeline
1. **Validation** - Check player, card, target, AP costs
2. **Attack Vector Resolution** - Determine card's attack vector
3. **Targeting Validation** - Verify card can target infrastructure state
4. **Cost Calculation** - Apply cost reductions and special effects
5. **Effect Application** - Update infrastructure states
6. **Chain Processing** - Handle lateral movement and chain effects
7. **Score Update** - Recalculate control scores
8. **Persistent Effects** - Trigger conditional effects

### Development Features

#### Hot Reload & Development
- **Frontend**: Vite with React Fast Refresh
- **Game Server**: Nodemon with TypeScript compilation
- **Backend**: Express with auto-restart on changes

#### Type Safety
- **Shared Types**: Common interfaces across all components
- **Strict TypeScript**: Full type checking enabled
- **Runtime Validation**: Card targeting and move validation

#### Testing & Debugging
- **Developer Cheats**: Add any card to hand for testing
- **Extensive Logging**: Detailed console output for game state changes
- **State Inspection**: Game state visible in browser dev tools
- **Move Validation**: Comprehensive error messages for invalid moves

#### Database Integration
- **User Management**: Authentication and profiles
- **Game History**: Complete game records and statistics  
- **Rating System**: ELO-based player rankings
- **Chat Logs**: Persistent chat history

This technical implementation provides the foundation for Darknet Duel's complex card game mechanics while maintaining clean separation of concerns and robust error handling.

---

## Development Structure

### Project Layout
```
darknet-duel-fr-this-time/
├── backend-server/          # REST API and database
│   ├── src/
│   │   ├── controllers/     # API endpoints
│   │   ├── entities/        # Database models
│   │   ├── middleware/      # Auth and validation
│   │   └── routes/          # Route definitions
│   └── migrations/          # Database migrations
├── game-server/             # BoardGame.io game logic
│   └── src/
│       ├── game/
│       │   ├── actions/     # Player action handlers
│       │   ├── cards/       # Card definitions and loaders
│       │   ├── core/        # Core game logic
│       │   ├── moves/       # Game move implementations
│       │   └── utils/       # Utility functions
│       └── server/          # Game server setup
├── darknet-duel-frontend/   # React frontend
│   └── src/
│       ├── components/      # React components
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── utils/           # Frontend utilities
└── shared-types/            # Shared TypeScript types
    ├── card.types.ts        # Card-related types
    ├── game.types.ts        # Game state types
    └── chat.types.ts        # Chat system types
```

### Key Files
- `DarknetDuel.ts`: Main game definition
- `gameState.ts`: Game state management
- `playerActions.ts`: Player action handlers
- `infrastructureCardLoader.ts`: Infrastructure card definitions
- `attackerCardLoader.ts`: Attacker deck creation
- `defenderCardLoader.ts`: Defender deck creation

### Development Features
- **Hot Reload**: Vite for frontend, nodemon for backend
- **Type Safety**: Full TypeScript coverage
- **Shared Types**: Common interfaces across all components
- **Testing**: Unit tests for game logic
- **Debugging**: Developer cheat commands for testing

---

## Game Balance

### Design Philosophy
- **Asymmetric Balance**: Different strengths for each role
- **AP Advantage**: Defender gets more AP per turn (3 vs 2)
- **Deck Advantage**: Defender has more total cards (76 vs 70)
- **Win Condition**: Defender wins ties in turn-limit scenarios
- **Reactive Play**: Both sides have reactive cards for counterplay

### Strategic Depth
- **Resource Management**: AP and card cycling decisions
- **Information Warfare**: Hand disruption and hidden information
- **Timing**: When to play reactive cards vs proactive cards
- **Target Priority**: Which infrastructure to focus on
- **Risk Assessment**: Committing resources vs saving for reactions

---

This comprehensive game map covers all aspects of Darknet Duel, from high-level gameplay concepts to detailed technical implementation. The game combines strategic card play with cybersecurity themes to create an engaging competitive experience for two players.
