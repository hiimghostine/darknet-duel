# CEBU INSTITUTE OF TECHNOLOGY UNIVERSITY

# COLLEGE OF COMPUTER STUDIES

# Software Design Description for Darknet Duel

## Signature

| Name | Role | Date | Signature |
|------|------|------|-----------|
|      |      |      |           |
|      |      |      |           |

## Change History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0     | 2025-03-21 | Initial version | Capstone 1 Team 27 |

## Preface

This Software Design Description (SDD) document outlines the detailed design for the Darknet Duel web-based card game. It follows the IEEE Std. 1016-2009 standard and provides comprehensive information about the architectural and detailed design of the system. This document is intended for software developers, testers, and project stakeholders who need to understand the inner workings of the Darknet Duel system.

## Table of Contents

1. [Introduction](#1-introduction)
   1. [Purpose](#11-purpose)
   2. [Scope](#12-scope)
   3. [Definitions and Acronyms](#13-definitions-and-acronyms)
   4. [References](#14-references)
2. [Architectural Design](#2-architectural-design)
3. [Detailed Design](#3-detailed-design)
   - [Module 1: User Management and Authentication](#module-1-user-management-and-authentication)
   - [Module 2: Game Lobby System](#module-2-game-lobby-system)
   - [Module 3: Real-time Multiplayer Communication](#module-3-real-time-multiplayer-communication)
   - [Module 4: Core Game Engine](#module-4-core-game-engine)
   - [Module 5: Card System and Infrastructure Management](#module-5-card-system-and-infrastructure-management)
   - [Module 6: Game Statistics and Result Tracking](#module-6-game-statistics-and-result-tracking)

## 1. Introduction

### 1.1. Purpose

The purpose of this Software Design Description (SDD) document is to provide a comprehensive description of the software design for the Darknet Duel web-based card game. This document describes the architecture, components, interfaces, and data design that will be used to implement the system requirements specified in the Software Requirements Specification (SRS). This document serves as a blueprint for developers to understand the system structure, component interactions, and implementation details.

The target audience for this document includes:
- Software developers responsible for implementing the system
- Quality assurance testers who need to understand the system architecture
- Project managers overseeing development progress
- Game designers who need to understand how game mechanics are implemented
- Stakeholders evaluating technical aspects of the project

### 1.2. Scope

This SDD covers the design for all components of the Darknet Duel web-based card game as specified in the SRS document. The design encompasses the following system components:

1. User Management and Authentication system for handling player accounts
2. Game Lobby system for matchmaking and game session management
3. Real-time Multiplayer Communication framework for synchronizing game states
4. Core Game Engine implementing the rules and mechanics of Darknet Duel
5. Card System and Infrastructure Management for handling game elements
6. Game Statistics and Result Tracking for post-game analytics

The design addresses both frontend and backend components, data storage, communication protocols, and security measures required to implement the full functionality of the Darknet Duel game.

### 1.3. Definitions and Acronyms

| Term | Definition |
|------|------------|
| AP | Action Points, the resource used by players to perform actions in the game |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete - basic operations for persistent storage |
| DTO | Data Transfer Object, a design pattern used to transfer data between subsystems |
| ERD | Entity Relationship Diagram |
| JSON | JavaScript Object Notation, a lightweight data-interchange format |
| JWT | JSON Web Token, a compact, URL-safe means of representing claims to be transferred between two parties |
| MVC | Model-View-Controller, a software architectural pattern |
| ORM | Object-Relational Mapping, a technique for converting data between incompatible type systems |
| REST | Representational State Transfer, an architectural style for distributed systems |
| SDD | Software Design Description |
| SPA | Single Page Application |
| SRS | Software Requirements Specification |
| WebSocket | A communication protocol providing full-duplex communication channels over a single TCP connection |
| Red Team | Attacker player role within the game |
| Blue Team | Defender player role within the game |
| Infrastructure | Game cards representing company assets |
| Exploit | Card type used to create vulnerabilities |
| Attack | Card type used to compromise infrastructure |
| Defense | Card type used to protect infrastructure |
| Response | Card type used to recover compromised infrastructure |
| Lobby | Virtual waiting room where players can find matches |

### 1.4. References

1. IEEE Std 1016-2009, IEEE Standard for Information Technology—Systems Design—Software Design Descriptions
2. Darknet Duel System Requirements Specification (SRS) document v3.0
4. Darknet Duel Software Project Proposal
5. React.js Documentation - https://reactjs.org/docs/getting-started.html
6. Spring Boot Documentation - https://spring.io/projects/spring-boot
7. WebSocket Protocol RFC 6455 - https://tools.ietf.org/html/rfc6455
8. JWT Documentation - https://jwt.io/introduction/
9. MySQL Documentation - https://dev.mysql.com/doc/

## 2. Architectural Design

The Darknet Duel system follows a modern web application architecture based on the client-server model with a clear separation of concerns. The system is designed to support real-time multiplayer interactions while maintaining responsive user experiences and robust security.

The high-level architecture consists of the following components:

1. **Client Application (Frontend)**
   - Single Page Application built with React.js
   - Material UI component library for consistent styling
   - STOMP.js for real-time communication
   - Responsive design for desktop support

2. **Server Application (Backend)**
   - Spring Boot application serving as the core backend
   - RESTful API for standard HTTP requests
   - Spring WebSocket with STOMP for real-time game state updates
   - JWT-based authentication system
   - Business logic implementation of game rules

3. **Database Layer**
   - MySQL relational database for persistent storage
   - Database access through Hibernate ORM

4. **External Services**
   - Cloudflare for domain name and proxy

### System Architecture Diagram

![System Architecture Diagram](diagrams/architecture/system_architecture_diagram.png)

The system follows a layered architecture pattern:

1. **Presentation Layer** - Client-side React application handling UI rendering and user interactions
2. **Communication Layer** - REST API and WebSocket endpoints facilitating client-server communication
3. **Business Logic Layer** - Core game engine and service implementations
4. **Data Access Layer** - Repository interfaces and database connectivity
5. **Persistence Layer** - Database schemas and data storage

### Component Interactions

- The client application communicates with the server through RESTful HTTP requests for non-real-time operations (user authentication, lobby management, etc.)
- WebSocket connections are established for real-time game state updates during active gameplay
- The server maintains game state and enforces game rules, sending updates to connected clients
- Database transactions occur for persistent operations like user profile updates and match history

### Technology Stack

#### 3.1.1 Frontend
- **Primary Framework**: React.js
- **UI Component Library**: Material-UI
- **WebSocket Client**: STOMP.js
- **Target Platform**: Desktop (primary focus for MVP)

#### 3.1.2 Backend
- **Framework**: Spring Boot
- **WebSocket**: Spring WebSocket with STOMP
- **Authentication**: JWT-based authentication
- **RESTful API**: Spring MVC

#### 3.1.3 Database
- **Database System**: MySQL
- **ORM**: Hibernate

#### 3.1.4 External Services
- None for MVP

#### 3.1.5 DevOps
- **Web Server**: Apache Tomcat
- **Proxy/CDN**: Cloudflare
- **Hosting**: In-house server

## 3. Detailed Design

### Module 1: User Management and Authentication

#### 1.1 User Registration
- **User Interface Design**
  - Registration form with fields for username, email, password, and password confirmation
  - Client-side validation for input fields
  - Success/error messaging system

- **Front-end component(s)**
  - **RegistrationForm Component**
    - Description: React component that collects and validates user registration data
    - Component type: React functional component with form handling
  - **RegistrationValidator**
    - Description: Utility class for client-side validation of registration fields
    - Component type: JavaScript validation module

- **Back-end component(s)**
  - **UserController**
    - Description: REST controller handling user operations
    - Component type: Spring Boot RestController
    - Endpoints:
      - `POST /api/users/register` - Register a new user
      - `GET /api/users/{id}` - Get user by ID
      - `PUT /api/users/{id}` - Update user details
      - `DELETE /api/users/{id}` - Delete user account
  - **UserService**
    - Description: Service layer handling user business logic
    - Component type: Spring Service component
  - **UserRepository**
    - Description: Data access interface for user records
    - Component type: Spring Data JPA repository

- **Object-Oriented Components**
  - **Class Diagram**: Describes the relationships between User, UserDTO, UserController, UserService, and UserRepository classes
  - **Sequence Diagram**: Illustrates the flow of a registration request from client to database

- **Data Design**
  - **User Entity Schema**:
    - id (PK): BIGINT
    - username: VARCHAR(50)
    - email: VARCHAR(100)
    - passwordHash: VARCHAR(255)
    - registrationDate: TIMESTAMP
    - lastLoginDate: TIMESTAMP
    - status: ENUM (ACTIVE, INACTIVE, SUSPENDED)

#### 1.2 User Login
- **User Interface Design**
  - Login form with fields for username/email and password
  - Remember me option
  - Forgot password link
  - Login status indicators

- **Front-end component(s)**
  - **LoginForm Component**
    - Description: React component that handles user authentication
    - Component type: React functional component with form handling
  - **AuthContext**
    - Description: React context for managing authentication state
    - Component type: React Context API implementation

- **Back-end component(s)**
  - **AuthController**
    - Description: Controller managing authentication
    - Component type: Spring Boot RestController
    - Endpoints:
      - `POST /api/auth/login` - Authenticate user
      - `POST /api/auth/logout` - End user session
      - `POST /api/auth/refresh` - Refresh JWT token
  - **AuthService**
    - Description: Service layer handling authentication logic
    - Component type: Spring Service component
  - **JWTProvider**
    - Description: Utility for generating and validating JWT tokens
    - Component type: Spring Security component

- **Object-Oriented Components**
  - **Class Diagram**: Describes authentication-related classes and their relationships
  - **Sequence Diagram**: Illustrates the login process and JWT token generation

- **Data Design**
  - **Authentication Token Schema**:
    - id (PK): BIGINT
    - userId (FK): BIGINT
    - token: VARCHAR(255)
    - issuedAt: TIMESTAMP
    - expiresAt: TIMESTAMP
    - revoked: BOOLEAN

#### 1.3 User Profile Management
- **User Interface Design**
  - Profile page with user information display
  - Edit profile form
  - Avatar selection/upload functionality
  - Account settings section

- **Front-end component(s)**
  - **ProfilePage Component**
    - Description: React component for displaying and editing user profile
    - Component type: React functional component with state management
  - **AvatarSelector Component**
    - Description: Component for managing user avatar images
    - Component type: React component with file upload capability

- **Back-end component(s)**
  - **ProfileController**
    - Description: REST controller handling profile operations
    - Component type: Spring Boot RestController
    - Endpoints:
      - `GET /api/profiles/{userId}` - Get profile by user ID
      - `PUT /api/profiles/{userId}` - Update user profile
      - `POST /api/profiles/{userId}/avatar` - Upload profile avatar
  - **ProfileService**
    - Description: Service layer handling profile business logic
    - Component type: Spring Service component
  - **FileStorageService**
    - Description: Service for managing file uploads (avatars)
    - Component type: Spring Service component

- **Object-Oriented Components**
  - **Class Diagram**: Shows profile management class relationships
  - **Sequence Diagram**: Illustrates profile update process

- **Data Design**
  - **User Profile Schema** (extension of User entity):
    - profileId (PK): BIGINT
    - userId (FK): BIGINT
    - displayName: VARCHAR(50)
    - avatarUrl: VARCHAR(255)
    - bio: TEXT
    - preferences: JSON

### Module 2: Game Lobby System

#### 2.1 Lobby Creation
- **User Interface Design**
  - Lobby creation form with game settings options
  - Private/public lobby toggle
  - Player limit selection
  - Game mode options

- **Front-end component(s)**
  - **LobbyCreationForm Component**
    - Description: React component for creating new game lobbies
    - Component type: React functional component with form handling
  - **LobbySettings Component**
    - Description: Component for configuring lobby parameters
    - Component type: React component with form controls

- **Back-end component(s)**
  - **LobbyController**
    - Description: REST controller handling lobby operations
    - Component type: Spring Boot RestController
    - Endpoints:
      - `POST /api/lobbies` - Create a new lobby
      - `GET /api/lobbies` - Get list of available public lobbies
      - `GET /api/lobbies/{id}` - Get lobby by ID
      - `PUT /api/lobbies/{id}` - Update lobby settings
      - `DELETE /api/lobbies/{id}` - Delete a lobby
      - `POST /api/lobbies/join/{code}` - Join a private lobby by code
      - `POST /api/lobbies/{id}/start` - Start the game (host only)
  - **LobbyService**
    - Description: Service layer handling lobby business logic
    - Component type: Spring Service component
  - **LobbyRepository**
    - Description: Data access interface for lobby records
    - Component type: Spring Data JPA repository

- **Object-Oriented Components**
  - **Class Diagram**: Illustrates lobby management classes
  - **Sequence Diagram**: Shows the lobby creation process

- **Data Design**
  - **Lobby Schema**:
    - id (PK): BIGINT
    - name: VARCHAR(50)
    - hostId (FK): BIGINT
    - isPrivate: BOOLEAN
    - lobbyCode: VARCHAR(20)
    - playerLimit: INT
    - status: ENUM (WAITING, IN_PROGRESS, COMPLETED)
    - createdAt: TIMESTAMP

#### 2.2 Lobby Joining
- **User Interface Design**
  - Lobby browser with list of available public lobbies
  - Private lobby code entry field
  - Lobby details display
  - Join button with status indicators

- **Front-end component(s)**
  - **LobbyBrowser Component**
    - Description: React component for browsing available lobbies
    - Component type: React component with list rendering
  - **LobbyCard Component**
    - Description: Component displaying individual lobby information
    - Component type: React component for UI display
  - **PrivateLobbyJoin Component**
    - Description: Component for joining private lobbies via code
    - Component type: React component with form input

- **Back-end component(s)**
  - **LobbyController**
    - Description: REST controller with endpoints for listing and joining lobbies
    - Component type: Spring Boot RestController
  - **LobbyService**
    - Description: Service handling lobby joining logic
    - Component type: Spring Service component
  - **PlayerLobbyRepository**
    - Description: Data access interface for player-lobby relationships
    - Component type: Spring Data JPA repository

- **Object-Oriented Components**
  - **Class Diagram**: Shows relationships between lobby and player entities
  - **Sequence Diagram**: Illustrates the lobby joining process

- **Data Design**
  - **LobbyMembership Schema**:
    - id (PK): BIGINT
    - lobbyId (FK): BIGINT
    - userId (FK): BIGINT
    - joinTime: TIMESTAMP
    - role: ENUM (HOST, PLAYER)
    - team: ENUM (RED_TEAM, BLUE_TEAM)
    - status: ENUM (WAITING, READY, PLAYING)

### Module 3: Real-time Multiplayer Communication

#### 3.1 State Synchronization
- **User Interface Design**
  - Connection status indicator
  - Synchronization progress indicator
  - Game state visualization components

- **Front-end component(s)**
  - **GameStateManager**
    - Description: Service for managing game state on the client
    - Component type: JavaScript state management service
  - **WebSocketService**
    - Description: Service handling WebSocket connections and messages
    - Component type: JavaScript service with STOMP.js integration

- **Back-end component(s)**
  - **GameSocketHandler**
    - Description: WebSocket handler for game-related messages
    - Component type: Spring WebSocket handler
    - Endpoints:
      - `ws://{server}/game` - Main game socket connection
      - Message Types:
        - `CONNECT` - Initial connection handshake
        - `GAME_STATE` - Full or partial game state updates
        - `PLAYER_ACTION` - Actions performed by players
        - `TURN_UPDATE` - Turn change notifications
        - `CARD_PLAY` - Card played notification
        - `GAME_RESULT` - Game end and results
  - **GameStateService**
    - Description: Service managing the authoritative game state
    - Component type: Spring Service component
  - **MessageBroker**
    - Description: Component for distributing messages to connected clients
    - Component type: Spring messaging component

- **Object-Oriented Components**
  - **Class Diagram**: Shows classes involved in state synchronization
  - **Sequence Diagram**: Illustrates the state update and synchronization process

- **Data Design**
  - **GameState Schema**:
    - gameId (PK): BIGINT
    - lobbyId (FK): BIGINT
    - currentTurn: INT
    - currentPlayer: BIGINT (userId)
    - actionPointsRemaining: INT
    - gamePhase: ENUM
    - lastUpdateTime: TIMESTAMP
    - serializedState: JSON

#### 3.2 Disconnection Handling
- **User Interface Design**
  - Disconnection alert dialog
  - Reconnection progress indicator
  - Player status indicators in game UI

- **Front-end component(s)**
  - **ConnectionMonitor**
    - Description: Service that monitors connection status
    - Component type: JavaScript service with event listeners
  - **ReconnectionDialog**
    - Description: UI component for displaying reconnection status
    - Component type: React modal component

- **Back-end component(s)**
  - **DisconnectionHandler**
    - Description: Service for managing player disconnections
    - Component type: Spring Service component
  - **GamePauseService**
    - Description: Service for pausing games during disconnections
    - Component type: Spring Service component
  - **PlayerSessionRegistry**
    - Description: Registry tracking active player sessions
    - Component type: Spring bean with session tracking

- **Object-Oriented Components**
  - **Class Diagram**: Shows disconnection handling class structure
  - **Sequence Diagram**: Illustrates disconnection detection and handling process

- **Data Design**
  - **PlayerSession Schema**:
    - sessionId (PK): VARCHAR(255)
    - userId (FK): BIGINT
    - gameId (FK): BIGINT
    - connectionStatus: ENUM (CONNECTED, DISCONNECTED, RECONNECTING)
    - lastHeartbeat: TIMESTAMP
    - disconnectionTime: TIMESTAMP
    - reconnectionAttempts: INT

### Module 4: Core Game Engine

#### 4.1 Turn Management
- **User Interface Design**
  - Turn indicator showing current player
  - Action point display
  - Turn phase indicators (Draw, Action, End)
  - Timer for turn duration (if applicable)

- **Front-end component(s)**
  - **TurnIndicator Component**
    - Description: Component displaying current turn information
    - Component type: React component with visual indicators
  - **ActionPointDisplay**
    - Description: Component showing available action points
    - Component type: React component with dynamic updates

- **Back-end component(s)**
  - **TurnManager**
    - Description: Service controlling turn progression
    - Component type: Spring Service component
    - Endpoints/Methods:
      - WebSocket Message: `TURN_START` - Indicates start of a turn
      - WebSocket Message: `TURN_END` - Indicates end of a turn
      - `POST /api/games/{gameId}/turns/end` - Manual ending of turn
  - **ActionPointService**
    - Description: Service managing action point allocation and usage
    - Component type: Spring Service component
  - **PhaseController**
    - Description: Controller managing game phases within turns
    - Component type: Spring component with game logic

- **Object-Oriented Components**
  - **Class Diagram**: Shows turn management class relationships
  - **Sequence Diagram**: Illustrates the turn progression process

- **Data Design**
  - **TurnRecord Schema**:
    - id (PK): BIGINT
    - gameId (FK): BIGINT
    - turnNumber: INT
    - playerId (FK): BIGINT
    - startTime: TIMESTAMP
    - endTime: TIMESTAMP
    - actionPointsUsed: INT
    - cardsPlayed: INT
    - actionsSummary: JSON

#### 4.2 Game Rules Enforcement
- **User Interface Design**
  - Valid/invalid action indicators
  - Error messages for rule violations
  - Card highlight for playable/unplayable cards

- **Front-end component(s)**
  - **ActionValidator**
    - Description: Client-side utility for pre-validating actions
    - Component type: JavaScript validation service
  - **RuleViolationAlert**
    - Description: Component for displaying rule violation messages
    - Component type: React alert component

- **Back-end component(s)**
  - **RuleEngine**
    - Description: Core component enforcing game rules
    - Component type: Spring Service component
  - **ActionValidator**
    - Description: Service validating player actions against rules
    - Component type: Spring validation service
  - **RuleRepository**
    - Description: Repository of game rules and constraints
    - Component type: Spring configuration bean

- **Object-Oriented Components**
  - **Class Diagram**: Shows the rule enforcement class structure
  - **Sequence Diagram**: Illustrates the action validation process

- **Data Design**
  - **GameRule Schema**:
    - id (PK): BIGINT
    - ruleType: ENUM
    - description: TEXT
    - validationLogic: JSON
    - errorMessage: TEXT
    - severity: ENUM (WARNING, ERROR)

#### 4.3 Win Condition Monitoring
- **User Interface Design**
  - Security points display for both players
  - Infrastructure control visualization
  - Win progress indicators
  - Round counter/limit display

- **Front-end component(s)**
  - **ScoreboardComponent**
    - Description: Component showing current security points
    - Component type: React component with real-time updates
  - **WinConditionTracker**
    - Description: Component visualizing progress toward win conditions
    - Component type: React component with progress indicators

- **Back-end component(s)**
  - **WinConditionService**
    - Description: Service evaluating win conditions
    - Component type: Spring Service component
  - **ScoreCalculator**
    - Description: Service calculating security points
    - Component type: Spring calculation service
  - **GameEndHandler**
    - Description: Service handling game completion
    - Component type: Spring event handling service

- **Object-Oriented Components**
  - **Class Diagram**: Shows win condition monitoring class structure
  - **Sequence Diagram**: Illustrates the win condition checking process

- **Data Design**
  - **GameResult Schema**:
    - id (PK): BIGINT
    - gameId (FK): BIGINT
    - winnerId (FK): BIGINT
    - loserId (FK): BIGINT
    - winCondition: ENUM
    - finalRedTeamPoints: INT
    - finalBlueTeamPoints: INT
    - totalRounds: INT
    - gameStartTime: TIMESTAMP
    - gameEndTime: TIMESTAMP

### Module 5: Card System and Infrastructure Management

#### 5.1 Card Action Processing
- **User Interface Design**
  - Card display with visual design elements
  - Card selection and targeting interface
  - Card action animation and effects
  - Card information tooltip/detail view

- **Front-end component(s)**
  - **CardComponent**
    - Description: Component rendering individual cards
    - Component type: React component with styling
  - **CardActionHandler**
    - Description: Service managing card selection and play
    - Component type: JavaScript service with event handling
  - **CardEffectAnimator**
    - Description: Service for card play animations
    - Component type: JavaScript animation service

- **Back-end component(s)**
  - **CardController**
    - Description: Controller handling card play requests
    - Component type: Spring WebSocket controller
    - Endpoints/Methods:
      - WebSocket Message: `PLAY_CARD` - Request to play a card
      - WebSocket Message: `CARD_PLAYED` - Notification that a card was played
      - WebSocket Message: `CARD_EFFECT_APPLIED` - Notification about card effect
      - `GET /api/cards` - Get all available cards
      - `GET /api/cards/{id}` - Get card details by ID
  - **CardEffectService**
    - Description: Service implementing card effects
    - Component type: Spring Service component
  - **CardRepository**
    - Description: Repository of card definitions
    - Component type: Spring Data repository

- **Object-Oriented Components**
  - **Class Diagram**: Shows card system class relationships
  - **Sequence Diagram**: Illustrates the card play and resolution process

- **Data Design**
  - **Card Schema**:
    - id (PK): BIGINT
    - name: VARCHAR(50)
    - type: ENUM (EXPLOIT, ATTACK, DEFENSE, RESPONSE, INFRASTRUCTURE)
    - category: ENUM (NETWORK, SOCIAL, MALWARE, WEB)
    - actionPointCost: INT
    - description: TEXT
    - effects: JSON
    - imageUrl: VARCHAR(255)
    - isReactive: BOOLEAN

#### 5.2 Infrastructure State Tracking
- **User Interface Design**
  - Infrastructure card display with state indicators
  - Visual effects for state transitions
  - Security status icons and overlays
  - Control indicators (attacker/defender)

- **Front-end component(s)**
  - **InfrastructureComponent**
    - Description: Component rendering infrastructure cards
    - Component type: React component with state visualization
  - **StateTransitionAnimator**
    - Description: Service for state change animations
    - Component type: JavaScript animation service

- **Back-end component(s)**
  - **InfrastructureController**
    - Description: Controller handling infrastructure state changes
    - Component type: Spring WebSocket controller
  - **StateManager**
    - Description: Service managing infrastructure states
    - Component type: Spring Service component
  - **InfrastructureRepository**
    - Description: Repository for infrastructure data
    - Component type: Spring Data repository

- **Object-Oriented Components**
  - **Class Diagram**: Shows infrastructure state management classes
  - **Sequence Diagram**: Illustrates the state transition process

- **Data Design**
  - **Infrastructure Schema**:
    - id (PK): BIGINT
    - gameId (FK): BIGINT
    - cardId (FK): BIGINT
    - state: ENUM (SECURE, VULNERABLE, COMPROMISED, FORTIFIED)
    - controllingPlayer: BIGINT (userId)
    - securityPoints: INT
    - appliedExploits: JSON Array
    - appliedDefenses: JSON Array

#### 5.3 Game State Visualization
- **User Interface Design**
  - Complete game board layout
  - Player hands display
  - Card arrangement and positioning
  - Visual indicators for game state elements

- **Front-end component(s)**
  - **GameBoardComponent**
    - Description: Main component rendering the game board
    - Component type: React component with layout management
  - **PlayerHandComponent**
    - Description: Component rendering player's hand of cards
    - Component type: React component with drag-drop functionality
  - **GameStateRenderer**
    - Description: Service organizing visual elements based on game state
    - Component type: JavaScript rendering service

- **Back-end component(s)**
  - **GameStateController**
    - Description: Controller providing game state data
    - Component type: Spring WebSocket controller
    - Endpoints/Methods:
      - `GET /api/games/{gameId}` - Get current game state
      - WebSocket Message: `GAME_STATE_UPDATE` - Real-time game state update
      - WebSocket Message: `GAME_STATE_REQUEST` - Client request for full state
  - **ViewModelService**
    - Description: Service preparing game state for UI consumption
    - Component type: Spring Service component

- **Object-Oriented Components**
  - **Class Diagram**: Shows game visualization component relationships
  - **Sequence Diagram**: Illustrates the rendering update process

- **Data Design**
  - **GameViewModel Schema**:
    - gameId (PK): BIGINT
    - redTeamPlayer: UserDTO
    - blueTeamPlayer: UserDTO
    - currentTurn: INT
    - phase: ENUM
    - redTeamHand: Array of CardDTO (client-specific)
    - blueTeamHand: Array of CardDTO (client-specific)
    - infrastructureCards: Array of InfrastructureDTO
    - securityPoints: Object {redTeam: INT, blueTeam: INT}

### Module 6: Game Statistics and Result Tracking

#### 6.1 Match Result Display
- **User Interface Design**
  - Victory/defeat screens with animations
  - Win condition explanation
  - Final score display
  - Key statistics highlights

- **Front-end component(s)**
  - **GameResultScreen**
    - Description: Component displaying match results
    - Component type: React component with animations
  - **WinConditionExplainer**
    - Description: Component explaining how the game was won
    - Component type: React text component

- **Back-end component(s)**
  - **ResultController**
    - Description: Controller providing match result data
    - Component type: Spring RestController
    - Endpoints:
      - `GET /api/results/{gameId}` - Get result of a specific game
      - `GET /api/results/games/{gameId}/details` - Get detailed game result information
      - `POST /api/results/{gameId}/feedback` - Submit player feedback for a game
  - **GameResultService**
    - Description: Service generating game result information
    - Component type: Spring Service component

- **Object-Oriented Components**
  - **Class Diagram**: Shows result handling class relationships
  - **Sequence Diagram**: Illustrates the result generation process

- **Data Design**
  - **DetailedGameResult Schema** (extends GameResult):
    - keyEvents: JSON Array
    - mvpCard: BIGINT (cardId)
    - turnByTurnScores: JSON Array
    - gameLength: INT
    - infraControlHistory: JSON

#### 6.2 Game Performance Statistics
- **User Interface Design**
  - Statistics dashboard with charts and graphs
  - Performance metrics display
  - Comparative statistics
  - Filterable data views

- **Front-end component(s)**
  - **StatisticsDashboard**
    - Description: Component displaying player statistics
    - Component type: React component with chart visualization
  - **PerformanceGraph**
    - Description: Component rendering performance metrics
    - Component type: React component with D3.js integration

- **Back-end component(s)**
  - **HistoryController**
    - Description: Controller providing match history data
    - Component type: Spring RestController
    - Endpoints:
      - `GET /api/history/players/{userId}` - Get match history for a player
      - `GET /api/history/players/{userId}/statistics` - Get player performance statistics
      - `GET /api/history/players/{userId}/cards` - Get card usage statistics for a player
  - **AnalyticsService**
    - Description: Service calculating performance metrics
    - Component type: Spring Service component
  - **StatisticsRepository**
    - Description: Repository for statistics data
    - Component type: Spring Data repository

- **Object-Oriented Components**
  - **Class Diagram**: Shows statistics system class structure
  - **Sequence Diagram**: Illustrates the statistics calculation process

- **Data Design**
  - **PlayerStatistics Schema**:
    - id (PK): BIGINT
    - userId (FK): BIGINT
    - gamesPlayed: INT
    - gamesWon: INT
    - winRate: FLOAT
    - averageGameLength: INT
    - favoriteCards: JSON
    - effectivenessRating: FLOAT
    - cardsPlayedStats: JSON
    - preferredRole: ENUM (ATTACKER, DEFENDER, BALANCED)

#### 6.3 Match History Storage
- **User Interface Design**
  - Match history list with filtering options
  - Individual match detail view
  - Replay functionality (if applicable)
  - Export options for match data

- **Front-end component(s)**
  - **MatchHistoryBrowser**
    - Description: Component for browsing match history
    - Component type: React component with filtering
  - **MatchDetailViewer**
    - Description: Component showing detailed match information
    - Component type: React component with expandable sections

- **Back-end component(s)**
  - **HistoryController**
    - Description: Controller providing match history data
    - Component type: Spring RestController
  - **MatchHistoryService**
    - Description: Service retrieving and formatting match history
    - Component type: Spring Service component
  - **GameLogRepository**
    - Description: Repository for detailed game logs
    - Component type: Spring Data repository

- **Object-Oriented Components**
  - **Class Diagram**: Shows match history storage class relationships
  - **Sequence Diagram**: Illustrates the match history retrieval process

- **Data Design**
  - **MatchHistory Schema**:
    - id (PK): BIGINT
    - userId (FK): BIGINT
    - gameId (FK): BIGINT
    - opponent: UserDTO
    - result: ENUM (WIN, LOSS)
    - role: ENUM (ATTACKER, DEFENDER)
    - timestamp: TIMESTAMP
    - duration: INT
    - winCondition: TEXT
    - finalScore: Object {player: INT, opponent: INT}
