# CEBU INSTITUTE OF TECHNOLOGY

## UNIVERSITY

## COLLEGE OF COMPUTER STUDIES

## Software Design Description

## for

## Darknet Duel


## Signature


## Change History

```
Version Date Description Author
1.0 21 March, 2025 Initial version Team 27 of Capstone 1
2.0 14 June, 2025 Shift from Spring Boot as
Backend to Express.js
with boardgame.io.
Reworked all modules
```
```
Team 27 of Capstone 1
```

## Preface

```
This Software Design Description (SDD) document outlines the detailed design for the Darknet Duel web
based card game. It follows the IEEE Std. 1016-2009 standard and provides comprehensive information about
the architectural and detailed design of the system. This document is intended for software developers, testers,
and project stakeholders who need to understand the inner workings of the Darknet Duel system.
```

## Table of Contents

- 1. INTRODUCTION
   - 1.1. PURPOSE
   - 1.2. SCOPE
   - 1.3. DEFINITIONS AND ACRONYMS
   - 1.4. REFERENCES
- 2. ARCHITECTURAL DESIGN
- 3. DETAILED DESIGN
      - Module 1: User Management and Authentication
      - Module 2: Lobby and Matchmaking
      - Module 3: Real-Time Multiplayer Game
      - Module 4: Card System and Game Logic
      - Module 5: Game Statistics and Result Tracking
      - Module 6: Store and Currency...................................................................................................................................................................
      - Module 7: Admin and Moderation Tools


_Darknet Duel
Published Date: 14 June, 2025_

## 1. INTRODUCTION

### 1.1. PURPOSE

```
The purpose of this Software Design Description (SDD) document is to provide a comprehensive description of
the software design for the Darknet Duel web-based card game. This document describes the architecture,
components, interfaces, and data design that will be used to implement the system requirements specified in
the Software Requirements Specification (SRS). This document serves as a blueprint for developers to
understand the system structure, component interactions, and implementation details.
```
```
The target audience for this document includes:
```
- Software developers responsible for implementing the system
- Quality assurance testers who need to understand the system architecture
- Project managers overseeing development progress
- Game designers who need to understand how game mechanics are implemented
- Stakeholders evaluating technical aspects of the project

### 1.2. SCOPE

The scope of this Software Design Description (SDD) encompasses the complete software architecture and

design for the Darknet Duel web-based card game. This document details the structure and interaction of all

major system components, including the frontend (user interface), backend server (REST API, database, admin

tools), and game server (real-time game logic and multiplayer engine). The SDD covers:

- The overall architectural approach, including system decomposition and component boundaries
- The design and responsibilities of each major module and transaction, as defined in the SRS
- The interfaces and communication protocols between frontend, backend, and game server
- The data models, database schema, and entity relationships
- The design of user-facing features (authentication, lobby, gameplay, store, admin tools, etc.)
- Security, scalability, and maintainability considerations in the design
- The mapping of requirements from the SRS to concrete design artifacts (class diagrams, sequence
    diagrams, ERDs)

This document is intended to guide the implementation of all software components required to deliver the full

functionality of Darknet Duel, as well as to serve as a reference for future maintenance and enhancements.


_Darknet Duel
Published Date: 14 June, 2025_

### 1.3. DEFINITIONS AND ACRONYMS

- SDD: Software Design Description – this document, describing the system’s architecture and design
- SRS: Software Requirements Specification – the requirements document for Darknet Duel
- API: Application Programming Interface – a set of endpoints for communication between components
- REST: Representational State Transfer – a web service architectural style used for backend APIs
- WebSocket: A protocol providing full-duplex communication channels over a single TCP connection
- JWT: JSON Web Token – a compact, URL-safe means of representing claims for authentication
- AP: Action Points – a resource used by players to perform actions in the game
- ELO: A rating system for calculating the relative skill levels of players
- Creds: Standard in-game currency earned through gameplay
- Crypts: Premium in-game currency purchased via payment integration
- Frontend: The client-side application (React/TypeScript) used by players and admins
- Backend Server: The Node.js/Express server handling authentication, persistence, admin tools, and
    REST APIs
- Game Server: The Node.js/boardgame.io server handling real-time multiplayer game logic
- Entity: A data model or table representing a real-world object in the database
- ERD: Entity-Relationship Diagram – a diagram showing data entities and their relationships
- Class Diagram: A UML diagram showing the static structure of system classes and their relationships
- Sequence Diagram: A UML diagram showing the order of interactions between system components
- Admin: A user with the highest privileges, able to manage users, content, and system settings
- Moderator: A user with privileges to moderate player behavior and manage reports
- Player: A standard user of the game, able to play matches and use standard features
- CRUD: Create, Read, Update, Delete – basic operations for data management
- DTO: Data Transfer Object – an object used to transfer data between processes
- UUID: Universally Unique Identifier – a 128-bit identifier used for unique keys

### 1.4. REFERENCES

- boardgame.io Documentation (boardgame.io Project, https://boardgame.io/documentation)
- React.js Documentation (Meta Platforms, Inc., https://react.dev)
- Express.js Documentation (OpenJS Foundation, https://expressjs.com/en/5x/api.html)
- MySQL Documentation (Oracle Corporation, https://dev.mysql.com/doc/)
- Socket.IO Documentation (Socket.IO Project, https://socket.io/docs/)
- Swagger/OpenAPI 3.0 (OpenAPI Initiative, https://swagger.io/specification/)


_Darknet Duel
Published Date: 14 June, 2025_

## 2. ARCHITECTURAL DESIGN


_Darknet Duel
Published Date: 14 June, 2025_

## 3. DETAILED DESIGN

#### Module 1: User Management and Authentication

#### 1.1 User registration

-^ User Interface^ Design^
    o Presents a registration form with fields for username, email, password, and confirm
       password.
    o Real-time validation for all fields (username length, email format, password strength,
       password match).
    o Displays error messages for invalid input or backend errors (e.g., email/username already
       exists).
    o Shows a success message and auto-login/redirects on successful registration.
    o Provides a link/button to switch to the login form for existing users.
    o Visual feedback (animations, loading indicators) during registration process.
-^ Front-end component(s)^
    o RegisterForm.tsx (React Functional Component)

```
▪ Renders the registration form UI and handles form state/validation using react-hook-
form and zod.
▪ Calls the registration API via the auth store and displays success/error messages.
▪ Triggers audio/visual feedback on success or error.
o auth.store.ts (Zustand Store)
```
```
▪ Manages authentication state, loading, and error messages.
▪ Implements the register action, which calls the backend and handles auto-login on
success.
o auth.service.ts (Service Class)
```
```
▪ Handles API requests for registration, login, and profile retrieval.
▪ Implements the register method to POST registration data to /api/auth/register.
```
-^ Back-end component(s)^
    o auth.routes.ts (Express Router)
       ▪ Defines the registration endpoint: POST /api/auth/register.
    o AuthController (Controller Class)

```
▪ Method: register(req, res)
```
-^ Validates input (email, username, password).^
-^ Checks for existing user (by email or username).^
-^ Hashes password and creates new user via AuthService.^
-^ Returns user data (without password) on success, or error messages on
    failure.


_Darknet Duel
Published Date: 14 June, 2025_

```
o AuthService (Service Class)
```
```
▪ Methods:
```
-^ createUser(userData) —^ Persists new user to the database.^
-^ findByEmailOrUsername(email, username) —^ Checks for existing users.^
o Account Entity (TypeORM Entity)
▪ Represents the accounts table in the database, including fields for id, email,
username, password, etc.
o Validation Utils
▪ validateEmail(email) — Checks email format.
▪ validatePassword(password) — Checks password strength.
-^ Object-Oriented Components^
o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 1.2 User Login

-^ User Interface Design^
    o Presents a login form with fields for email and password.
    o Real-time validation for email format and required password.
    o Displays error messages for invalid input or backend errors (e.g., invalid credentials, inactive
       account).
    o Shows a loading indicator during authentication.
    o Provides a link/button to switch to the registration form for new users.
    o Visual feedback (animations, error flashes) on authentication failure.
-^ Front-end component(s)^
    o LoginForm.tsx (React Functional Component)

```
▪ Renders the login form UI and handles form state/validation using react-hook-form
and zod.
▪ Calls the login API via the auth store and displays success/error messages.
▪ Triggers audio/visual feedback on success or error.
o auth.store.ts (Zustand Store)
```
```
▪ Manages authentication state, loading, and error messages.
▪ Implements the login action, which calls the backend and updates authentication
state.
o auth.service.ts (Service Class)
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Handles API requests for login, registration, and profile retrieval.
▪ Implements the login method to POST login data to /api/auth/login.
```
-^ Back-end component(s)^
    o auth.routes.ts (Express Router)

```
▪ Defines the login endpoint: POST /api/auth/login.
o AuthController (Controller Class)
```
```
▪ Method: login(req, res)
```
-^ Validates input (email, password).^
-^ Checks for user existence and account status.^
-^ Verifies password and issues JWT token on success.^
-^ Returns user data (without password) and token on success, or error
    messages on failure.
o AuthService (Service Class)

```
▪ Methods:
```
-^ findByEmail(email) —^ Retrieves user by email.^
-^ updateLastLogin(id) —^ Updates last login timestamp.^
-^ logUserLogin(userId, username) —^ Logs successful login.^
-^ logFailedLogin(email, reason) —^ Logs failed login attempts.^
o Account Entity (TypeORM Entity)

```
▪ Represents the accounts table in the database, including fields for id, email,
username, password, etc.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 1.3 Profile Management

-^ User Interface Design^
    o Displays a profile page with user information, avatar, bio, stats, and recent activity.
    o Allows users to edit their profile (email, username, bio, password, avatar) via a modal dialog.
    o Provides real-time validation for all editable fields (email, username, password, bio, avatar
       file type/size).
    o Shows error messages for invalid input or backend errors.
    o Displays a loading indicator while fetching or updating profile data.
    o Allows users to view other users' profiles and stats (read-only, with report option).
    o Avatar upload supports image preview, resizing, and validation.
    o Visual feedback (animations, toasts, modals) for actions and errors.
-^ Front-end component(s)^
    o ProfilePage.tsx (React Functional Component)

```
▪ Displays the user's profile, stats, and recent activity.
▪ Handles navigation, loading, and error states.
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Integrates EditProfileModal and ReportModal for editing/reporting.
o EditProfileModal.tsx (React Functional Component)
```
```
▪ Modal dialog for editing profile fields and uploading avatar.
▪ Handles form state, validation, and submission.
▪ Provides image preview and resizing for avatar uploads.
o UserProfilePopup.tsx (React Functional Component)
```
```
▪ Displays a popup with summary info and stats for any user.
▪ Used for quick profile viewing in other parts of the app.
o account.service.ts (Service Class)
```
```
▪ Handles API requests for getting/updating account data and avatar upload.
o info.service.ts (Service Class)
```
```
▪ Handles API requests for fetching profile stats and recent activity.
```
-^ Back-end component(s)^
    o account.routes.ts (Express Router)
       ▪ Defines endpoints for getting/updating own account, getting account by UUID, and
          searching users.
    o AccountController (Controller Class)

```
▪ Methods:
```
-^ getMyAccount(req, res) —^ Retrieves the authenticated user's account
    details.
-^ updateMyAccount(req, res) —^ Updates the authenticated user's account
    (email, username, password, bio, avatar).
-^ getAccountByUuid(req, res) —^ Retrieves public account info for any user by
    UUID.
-^ searchAccountByUsername(req, res) —^ Searches for users by username.^
o InfoController (Controller Class)

```
▪ Methods:
▪ getProfile(req, res) — Retrieves profile info, stats, and recent activity for the
authenticated user.
▪ getProfileByUserId(req, res) — Retrieves profile info, stats, and recent activity for
any user by UUID.
▪ getProfileStats(req, res) — Retrieves only the statistical info for the authenticated
user.
▪ getRecentActivity(req, res) — Retrieves only the recent activity for the authenticated
user.
o FilesController (Controller Class)
```
```
▪ Method: getAvatar(req, res) — Retrieves avatar image for a user by UUID.
o AccountService (Service Class)
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Methods:
```
-^ updateAccount(id, updateData) —^ Updates user account data in the
    database.
-^ getAvatarById(id) —^ Retrieves avatar image data for a user.^
o Validation Utils
▪ Used for validating email, password, and bio fields.
o Avatar Upload Middleware

```
▪ Handles file upload and validation for avatar images.
o Account Entity (TypeORM Entity)
```
```
▪ Represents the accounts table in the database, including fields for id, email,
username, password, bio, avatar, etc.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 1.4 Role-based Access

-^ User Interface Design^
    o Displays user roles visually (e.g., badges/tags for admin and moderator) throughout the UI
       (profile, dashboard, user lists).
    o Restricts access to admin/moderator-only pages and actions (e.g., admin dashboard, user
       management, moderation tools).
    o Hides or disables UI elements for actions not permitted by the user's role.
    o Shows error messages or redirects if a user attempts to access a forbidden page or action.
    o Allows admins to promote/demote users and assign roles via the admin dashboard.
    o Provides clear feedback when role-based actions succeed or fail.
-^ Front-end component(s)^
    o UserTypeTag.tsx (React Functional Component)
       ▪ Renders a visual tag for user roles (admin, moderator) in the UI.
       ▪ Used in profile pages, user lists, and admin/moderator dashboards.
    o Admin/Moderator UI Components (e.g., AdminPage, UserManagement, BanUserModal)


_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Rendered conditionally based on user role.
▪ Provide interfaces for user management, banning, role assignment, and moderation
actions.
o auth.store.ts (Zustand Store)
```
```
▪ Stores the current user's role/type and exposes it for conditional rendering.
o Route Guards/ProtectedRoute
```
```
▪ Restrict access to certain routes/pages based on user role.
```
-^ Back-end component(s)^
    o admin-auth.middleware.ts (Express Middleware)

```
▪ Ensures the authenticated user is an admin before allowing access to admin-only
endpoints.
o moderator-auth.middleware.ts (Express Middleware)
```
```
▪ Ensures the authenticated user is a moderator or admin before allowing access to
moderator-only endpoints.
o auth.middleware.ts (Express Middleware)
```
```
▪ Ensures the user is authenticated and attaches user info (including role/type) to the
request.
o AdminController (Controller Class)
```
```
▪ Handles admin-only endpoints for user management, banning, role assignment, etc.
o Account Entity (TypeORM Entity)
```
```
▪ Includes the type field (enum: user, mod, admin) to represent user roles.
o AccountService/AdminService (Service Classes)
```
```
▪ Methods for updating user roles, filtering users by type, and enforcing role-based
logic.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### Module 2: Lobby and Matchmaking

#### 2.1 Lobby Browser

-^ User Interface Design^
    o Displays a list of active game lobbies (matches) with status, player info, and capacity.
    o Allows users to refresh the lobby list, join public lobbies, or enter a private lobby ID to join a
       private lobby.
    o Shows lobby state (waiting, ready, in progress, abandoned) with visual badges and icons.
    o Provides feedback for loading, errors, and empty states (no lobbies found).
    o Disables join buttons for full, in-progress, or abandoned lobbies.
    o Allows users to create a new lobby via a dedicated button.
    o Visual feedback (animations, loading spinners, toasts) for actions and errors.
-^ Front-end component(s)^
    o LobbyBrowser.tsx (React Functional Component)
       ▪ Displays the lobby list, handles refresh, join, and private lobby entry.


_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Shows lobby state, player info, and join/create actions.
▪ Handles polling for lobby updates and error/loading states.
o lobby.service.ts (Service Class)
```
```
▪ Handles API requests for listing, joining, creating, and leaving lobbies.
▪ Provides methods for joining private lobbies and updating player status.
o auth.store.ts (Zustand Store)
```
```
▪ Provides current user info for lobby actions.
```
-^ Back-end component(s)^
    o boardgame.io server (index.ts)

```
▪ Hosts the game server and exposes lobby endpoints via boardgame.io and Koa.
▪ Handles lobby creation, listing, joining, leaving, and player metadata.
▪ Custom endpoints for health check, leave, and lobby config.
o LobbyCleanupService (Service Class)
```
```
▪ Periodically removes abandoned or inactive lobbies from the server.
▪ Configurable grace periods and TTLs for abandoned/inactive games.
o Lobby Database (boardgame.io internal)
```
```
▪ Stores match/lobby metadata, player info, and connection status.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 2.2 Create/Join/Leave Lobbies

-^ User Interface Design^
    o Allows users to create a new lobby with options for name, privacy, and game mode.
    o Provides a form for lobby creation with feedback for errors and loading state.
    o Lets users join public lobbies from the browser or enter a private lobby ID to join a private
       lobby.
    o Shows join/leave status and disables actions as appropriate (e.g., joining, full, in-progress).
    o Allows users to leave a lobby at any time, updating the lobby state and player list.
    o Displays lobby chat for communication between players in the same lobby.
    o Visual feedback (animations, loading spinners, toasts) for actions and errors.
-^ Front-end component(s)^
    o CreateLobby.tsx (React Functional Component)
       ▪ Renders the lobby creation form and handles creation logic.
       ▪ Submits lobby settings and joins the created lobby as host.
    o LobbyBrowser.tsx (React Functional Component)
       ▪ Handles joining public or private lobbies.
    o LobbyChat.tsx (React Functional Component)


_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Provides real-time chat for users in the same lobby.
o lobby.service.ts (Service Class)
```
```
▪ Handles API requests for creating, joining, and leaving lobbies.
▪ Provides methods for joining private lobbies and updating player status.
o auth.store.ts (Zustand Store)
▪ Provides current user info for lobby actions.
```
-^ Back-end component(s)^
    o boardgame.io server (index.ts)
       ▪ Hosts the game server and exposes endpoints for creating, joining, and leaving
          lobbies.
       ▪ Handles player metadata, lobby state, and custom join/leave logic.
    o LobbyCleanupService (Service Class)

```
▪ Periodically removes abandoned or inactive lobbies from the server.
o Lobby Database (boardgame.io internal)
▪ Stores match/lobby metadata, player info, and connection status.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 2.3 Real-Time Lobby Updates

-^ User Interface Design^
    o Lobby browser and lobby views update automatically to reflect changes (new lobbies, player
       joins/leaves, lobby state changes).
    o Users see real-time updates to player lists, lobby status, and game state without manual
       refresh.
    o Visual feedback for lobby state transitions (waiting, ready, in progress, abandoned).
    o Error and loading states are handled gracefully during updates.
    o Lobby chat updates in real-time as messages are sent/received.
-^ Front-end component(s)^
    o LobbyBrowser.tsx (React Functional Component)

```
▪ Polls the server for lobby updates at regular intervals (e.g., every 5 seconds).
▪ Updates the UI in real-time as lobbies are created, joined, or abandoned.
o LobbyChat.tsx (React Functional Component)
```
```
▪ Uses WebSockets (Socket.IO) for real-time chat updates in the lobby.
o lobby.service.ts (Service Class)
```
```
▪ Provides methods for fetching lobby state and details.
▪ Handles polling and state management for lobby updates.
o auth.store.ts (Zustand Store)
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Provides current user info for lobby actions.
```
-^ Back-end component(s)^
    o boardgame.io server (index.ts)

```
▪ Exposes endpoints for listing, joining, and leaving lobbies.
▪ Updates lobby metadata and player state in real-time as users join/leave.
▪ Handles polling requests from frontend for lobby state.
▪ Optionally, could use WebSockets for push updates (future enhancement).
o LobbyCleanupService (Service Class)
▪ Periodically removes abandoned or inactive lobbies from the server.
o Lobby Database (boardgame.io internal)
```
```
▪ Stores match/lobby metadata, player info, and connection status.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 2.4 Lobby Chat

-^ User Interface Design^
    o Provides a real-time chat interface within each lobby for players to communicate.
    o Displays chat messages with timestamps, sender names, and roles
       (attacker/defender/system).
    o Allows users to send and receive messages instantly while in a lobby.
    o Shows system messages for game events (e.g., player joined, surrendered, rematch
       requested).
    o Handles error and connection states gracefully.
    o Visual feedback for sending/receiving messages (animations, sound, toasts).
-^ Front-end component(s)^
    o LobbyChat.tsx (React Functional Component)
       ▪ Renders the chat UI, message list, and input box.
       ▪ Connects to the backend via WebSockets (Socket.IO) for real-time updates.
       ▪ Handles sending, receiving, and displaying chat messages.
       ▪ Integrates with user profile popups and reporting features.
    o lobby.service.ts (Service Class)

```
▪ Provides methods for joining/leaving lobbies and managing chat state.
o auth.store.ts (Zustand Store)
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Provides current user info for chat actions.
```
-^ Back-end component(s)^
    o boardgame.io server (index.ts)

```
▪ Handles chat messages as part of the game state using boardgame.io moves.
▪ Updates the game state with new chat messages and system messages.
▪ Exposes moves like sendChatMessage in all phases (setup, playing, game over,
reaction).
o Game Logic (DarknetDuel.ts, gamePhases.ts, chatMoveHandler.ts, actionStageMoves.ts,
reactionStageMoves.ts)
▪ Defines the sendChatMessage move and chat message handling logic.
▪ Stores chat messages in the game state (G.chat.messages).
▪ Handles both player and system messages.
o Lobby Database (boardgame.io internal)
```
```
▪ Stores match/game state, including chat history.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### Module 3: Real-Time Multiplayer Game

#### 3.1 Game Creation and Initialization

-^ User Interface Design^
    o Allows users to create or join a game lobby (match) via the lobby browser or direct invite.


_Darknet Duel
Published Date: 14 June, 2025_

```
o Shows a waiting room/lobby interface until both players are present and ready.
o Displays game configuration (mode, player roles, initial resources, etc.) before starting.
o Provides feedback for lobby state (waiting, ready, in game, abandoned).
o On game start, transitions to the main game board UI.
o Main game board displays player hands, infrastructure grid, turn/round info, and action
controls.
o Visual feedback for loading, errors, and connection status.
```
-^ Front-end component(s)^
    o LobbyBrowser.tsx (React Functional Component)

```
▪ Lists available lobbies, allows joining/creating matches, and shows lobby state.
o CreateLobby.tsx (React Functional Component)
```
```
▪ UI for creating a new lobby with game options.
o LobbyService.ts (Service)
```
```
▪ Handles API calls for creating, joining, and starting matches (boardgame.io
integration).
o BalatroGameBoard.tsx (React Functional Component)
```
```
▪ Main game board UI; renders player hands, infrastructure, turn controls, and game
state.
o GameControls.tsx (React Functional Component)
```
```
▪ Provides controls for leaving the game, showing debug info, and connection status.
o useGameState.ts (Custom Hook)
▪ Manages derived game state, player roles, and connection status for the board.
```
-^ Back-end component(s)^
    o Game Server (boardgame.io)
       ▪ Handles match creation, player joining, and game state management.
       ▪ Exposes endpoints for match creation, joining, and state polling via
          WebSocket/REST.
       ▪ Main logic in DarknetDuel.ts, core/gameState.ts, core/gamePhases.ts,
          core/playerManager.ts.
       ▪ Endpoints:
          -^ POST /games/darknet-duel (create match)^
          -^ POST /games/darknet-duel/:matchID/join (join match)^
          -^ GET /games/darknet-duel/:matchID (get match state)^
    o LobbyCleanupService.ts (Service)

```
▪ Cleans up abandoned or stale lobbies on the game server.
o Backend Server (Express)
```
```
▪ Receives game results and history for persistence (not direct game creation).
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Endpoints:
```
-^ POST /api/server/games/results (save game results)^
-^ POST /api/server/games/history (save game history)^
-^ Object-Oriented Components^
o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```
-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 3.2 Turn-Based Gameplay, AP Allocation, Card Play, and Targeting

-^ User Interface Design^
    o Displays turn indicator showing whose turn it is (attacker/defender).
    o Shows current action points (AP) for each player, updating at the start of each turn.
    o Highlights playable cards in the player's hand based on AP and game rules.
    o Allows player to select and play a card; if the card requires a target, prompts for valid target
       selection (infrastructure, opponent, etc.).
    o Provides visual feedback for valid/invalid actions (e.g., disabled cards, error toasts).
    o Shows reaction phase indicator when the opponent can respond to a card play.
    o Displays end turn button, cycle card button, and surrender option.
    o Updates game state and notifies all players after each action.
-^ Front-end component(s)^
    o BalatroGameBoard.tsx (React Functional Component)
       ▪ Main game board UI; manages turn state, card play, targeting, and AP display.
    o PlayerHand.tsx (React Functional Component)

```
▪ Renders the player's hand, highlights playable cards, and handles card selection.
o GameControls.tsx (React Functional Component)
```
```
▪ Provides controls for ending turn, cycling cards, surrendering, and shows turn/AP
info.
```

_Darknet Duel
Published Date: 14 June, 2025_

```
o useCardActions.ts (Custom Hook)
```
```
▪ Handles card play logic, targeting, and move validation.
o useTurnActions.ts (Custom Hook)
```
```
▪ Manages end turn, skip reaction, and related turn-based actions.
```
-^ Back-end component(s)^
    o Game Server (boardgame.io)

```
▪ Handles turn order, AP allocation, card play, targeting, and reaction phase.
▪ Main logic in core/gamePhases.ts, core/turnManager.ts, core/playerManager.ts,
actions/playCardMove.ts, actions/throwCardMove/throwCardMove.ts,
actions/cycleCardMove.ts.
▪ Endpoints:
```
-^ WebSocket API for real-time game state updates and moves (playCard,
    throwCard, endTurn, cycleCard, etc.).
o TurnManager (Utility)
▪ Handles start of turn (draw card, allocate AP) and end of turn logic.
o ActionStageMoves (Phase Logic)

```
▪ Defines available moves during the action stage (playCard, throwCard, cycleCard,
endTurn, etc.).
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 3. 3 Real-Time State Synchronization

-^ User Interface Design^
    o Game board and all player UIs update in real time as game state changes (turns, card
       plays, AP, infrastructure, etc.).
    o Visual feedback for connection status (connected/disconnected) only as it relates to state
       updates (not reconnection logic).


_Darknet Duel
Published Date: 14 June, 2025_

```
o Loading indicators and error messages for sync or connection issues.
o Notifies players of game end or abandonment as part of state updates.
```
-^ Front-end component(s)^
    o GameClient.tsx (React Component)

```
▪ Connects to the boardgame.io server using Socket.IO, manages real-time state
updates, and renders the game board.
o BalatroGameBoard.tsx (React Functional Component)
```
```
▪ Renders the game state and updates UI in response to state changes.
o useGameState.ts (Custom Hook)
```
```
▪ Handles derived state, player roles, and state update logic for the board.
```
-^ Back-end component(s)^
    o Game Server (boardgame.io + Socket.IO)
    o Manages authoritative game state, synchronizes state to all connected clients in real time.

```
▪ Main logic in server/index.ts, game/DarknetDuel.ts, core/playerView.ts.
▪ Endpoints:
```
-^ WebSocket API for real-time game state updates and events.^
-^ REST endpoints for match state polling and recovery.^
o LobbyCleanupService.ts (Service)

```
▪ Cleans up abandoned or stale lobbies and handles disconnection logic.
o Backend Server (Express)
```
```
▪ Receives game results and history for persistence after game end.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 3.4 Disconnection/Reconnection Handling

-^ User Interface Design^
    o Disconnection and reconnection are handled in the background; the user interface does not
       display explicit notifications for these events.
    o The game continues to function seamlessly as long as the connection is restored; if a player
       leaves or the game is abandoned, standard game end or lobby removal flows apply.
-^ Front-end component(s)^
    o useGameConnection.ts (Custom Hook)
       ▪ Manages connection status, automatic reconnection logic, and leave notifications
          for the game server in the background.
    o GameClient.tsx (React Component)
       ▪ Integrates connection management into the main game client, ensuring seamless
          gameplay during network interruptions.
    o LobbyDetail.tsx (React Component)
       ▪ Handles player leave/disconnect and updates lobby/game state accordingly.
-^ Back-end component(s)^
    o Game Server (boardgame.io + Socket.IO)
       ▪ Tracks player connections/disconnections, manages reconnection, and updates
          game/lobby state accordingly.
       ▪ Handles player leave events and marks games as abandoned if all players
          disconnect.


_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Main logic in server/index.ts, LobbyCleanupService.ts.
▪ Endpoints:
```
-^ WebSocket API for connection and disconnection events.^
-^ REST endpoint for explicit leave notifications (POST
    /games/:name/:id/leave).
o LobbyCleanupService.ts (Service)

```
▪ Cleans up abandoned or stale lobbies and handles disconnection logic.
o Backend Server (Express)
▪ Receives game results and history for persistence after game end.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 3. 5 Game State Persistence and Recovery

-^ User Interface Design^
    o Game state is automatically persisted on the server; users do not interact directly with
       save/load features.
    o If a player disconnects and reconnects, the game state is recovered seamlessly and the
       player resumes from the latest state.
    o If a game is abandoned or completed, it is removed from the lobby and no longer
       accessible.
    o No explicit UI for manual save/load; all persistence and recovery is transparent to the user.


_Darknet Duel
Published Date: 14 June, 2025_

-^ Front-end component(s)^
    o GameClient.tsx (React Component)

```
▪ Connects to the game server and automatically receives the latest game state on
reconnect or page reload.
o useGameConnection.ts (Custom Hook)
▪ Handles reconnection and ensures the client receives the current state from the
server.
o LobbyDetail.tsx (React Component)
▪ Handles lobby/game removal if the game is abandoned or completed.
```
-^ Back-end component(s)^
    o Game Server (boardgame.io + Socket.IO)

```
▪ Persists game state in memory or database for each match.
▪ On client reconnect, serves the latest game state to the reconnecting client.
▪ Removes completed or abandoned games from storage (via
LobbyCleanupService.ts).
▪ Main logic in server/index.ts, LobbyCleanupService.ts, game/DarknetDuel.ts.
▪ Endpoints:
```
-^ WebSocket API for state sync and recovery.^
-^ REST endpoints for match state polling and removal.^
o LobbyCleanupService.ts (Service)

```
▪ Removes completed or abandoned games from storage.
o Backend Server (Express)
```
```
▪ Receives final game results and history for persistence after game end.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### Module 4: Card System and Game Logic

#### 4. 1 Card Play, Targeting, and Effect Resolution

-^ User Interface Design^
    o Players can select cards from their hand to play or throw at targets.
    o Cards that require targeting prompt the user to select an infrastructure card as the target.
    o Wildcard and special cards may prompt for additional choices (e.g., type selection, chain
       effect, hand disruption).
    o Visual feedback is provided for valid/invalid targets, targeting mode, and card play
       animations.
    o The result of card effects (e.g., state changes, persistent effects, hand disruption) is
       reflected immediately on the game board.
    o Pending choices (wildcard type, chain effect, hand disruption) are shown in overlay UIs.
-^ Front-end component(s)^
    o BalatroGameBoard.tsx (React Component)

```
▪ Main game board UI; handles rendering player hands, infrastructure, and card play
interactions.
o PlayerHand.tsx (React Component)
```
```
▪ Displays the player's hand and handles card selection and play logic.
o useCardActions.ts (Custom Hook)
```
```
▪ Manages card play, targeting, throw actions, and pending choices.
o PendingChoicesOverlay.tsx (React Component)
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Renders overlays for wildcard type selection, chain effect, and hand disruption
choices.
o InfrastructureCardDisplay.tsx (React Component)
```
```
▪ Displays infrastructure cards and handles target selection.
o CardDisplay.tsx (React Component)
▪ Renders individual cards with playability, selection, and targeting feedback.
```
-^ Back-end component(s)^
    o playCardMove.ts (Move Handler)
       ▪ Handles playing a card from hand, including wildcards, cost reductions, and effect
          application.
    o throwCardMove.ts (Move Handler)

```
▪ Handles throwing a card at a target infrastructure, including validation and effect
resolution.
o cardEffects/index.ts (Effect Router)
▪ Centralizes effect application for all card types, including wildcards and special
effects.
o wildcardResolver.ts (Wildcard Logic)
```
```
▪ Handles wildcard card logic, type selection, and special effect application.
o temporaryEffectsManager.ts (Effect Manager)
```
```
▪ Manages temporary and persistent effects applied by cards.
o cardUtils.ts (Utility)
▪ Validates card playability and targeting.
o actionStageMoves.ts (Phase Move Set)
```
```
▪ Exposes playCard and throwCard moves to the game phases.
o Backend Server (Express, boardgame.io)
```
```
▪ Exposes WebSocket endpoints for card play and effect resolution via boardgame.io
protocol.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 4 .2 Infrastructure State Tracking

-^ User Interface Design^
    o The game board displays all infrastructure cards with their current state (secure, vulnerable,
       compromised, shielded, fortified, etc.).
    o State changes are visually indicated with color, icons, and animations (e.g., pulsing for
       vulnerable/compromised, shield glow for shielded/fortified).
    o Players can see vulnerabilities, shields, and effects applied to each infrastructure card.
    o State indicators and tooltips provide additional information about each state.
    o Infrastructure state changes are updated in real time as a result of card effects or game
       events.
    o The UI provides a summary of infrastructure status (e.g., number compromised, number
       fortified) in the sidebar or status panel.
-^ Front-end component(s)^
    o BalatroGameBoard.tsx (React Component)

```
▪ Renders the infrastructure grid, applies state-based classes, and displays state
indicators and effects.
o InfrastructureArea.tsx (React Component)
```
```
▪ Organizes and displays all infrastructure cards in play.
o InfrastructureCardDisplay.tsx (React Component)
```
```
▪ Renders individual infrastructure cards, state indicators, vulnerabilities, shields, and
effects.
o game.types.ts (Type Definitions)
```
```
▪ Defines InfrastructureCard, InfrastructureState, and related types for state tracking.
o Stylesheets (gameboard-v2.css, infrastructure-card.css, infrastructure.css, game-layout-
fix.css)
▪ Provide visual feedback and animations for each infrastructure state.
```
-^ Back-end component(s)^
    o InfrastructureCard (Type Definition)

```
▪ Defines the structure and state of infrastructure cards (secure, vulnerable,
compromised, shielded, fortified, etc.).
o infrastructureCardLoader.ts (Loader)
```
```
▪ Initializes the set of infrastructure cards and their starting states.
o exploitEffect.ts, attackEffect.ts, fortifyEffect.ts, reactionEffect.ts (Effect Handlers)
▪ Apply state transitions to infrastructure cards based on card effects.
o throwCardMove/cardEffects/index.ts (Effect Router)
```
```
▪ Centralizes effect application and processes persistent effects on state change.
o temporaryEffectsManager.ts (Effect Manager)
```
```
▪ Handles temporary and persistent effects that may alter infrastructure state.
```

_Darknet Duel
Published Date: 14 June, 2025_

```
o gameState.ts, phaseUtils.ts (Game State/Win Logic)
```
```
▪ Track infrastructure state for win conditions and scoring.
o Validators/Utils
```
```
▪ Validate card targeting and state transitions.
o Backend Server (Express, boardgame.io)
▪ Exposes WebSocket endpoints for state updates and synchronization.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 4.3 Game Rules Enforcement

-^ User Interface Design^
    o The UI displays each player's current Action Points (AP), hand size, and maximum allowed
       hand size.
    o Players are prevented from playing cards if they lack sufficient AP or if their hand is full.
    o The UI provides feedback when a move is blocked due to AP, hand size, or rule violations
       (e.g., error toasts, disabled buttons).
    o End turn, cycle card, and surrender buttons are available and context-sensitive.
    o The game board displays the current round, turn, and phase, as well as win/loss/draw
       messages when the game ends.
    o Score and infrastructure status are shown in side panels or overlays.
-^ Front-end component(s)^
    o BalatroGameBoard.tsx (React Component)

```
▪ Displays AP, hand size, round, phase, and win/loss messages; disables actions
when rules are violated.
o PlayerHand.tsx (React Component)
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Renders the player's hand and disables card play when hand is full or AP is
insufficient.
o PlayerInfo.tsx (React Component)
```
```
▪ Shows AP, hand size, and maintenance costs.
o GameControls.tsx (React Component)
▪ Provides end turn, cycle card, and surrender buttons; disables them as appropriate.
o GameStatus.tsx (React Component)
```
```
▪ Displays current phase, turn, and game over messages.
o useTurnActions.ts (Custom Hook)
```
```
▪ Handles end turn, cycle card, and surrender logic.
o game.types.ts (Type Definitions)
```
```
▪ Defines AP, hand size, and win condition properties in the game state.
o Stylesheets
```
```
▪ Style AP, hand size, and win/loss/draw overlays and feedback.
```
-^ Back-end component(s)^
    o gameState.ts (Game State)

```
▪ Defines initial AP, hand size, max turns, and win condition logic.
o playerManager.ts (Player Management)
```
```
▪ Initializes players, updates AP, draws cards, and enforces hand size.
o gamePhases.ts (Phase Logic)
```
```
▪ Handles AP allocation, hand size enforcement, turn/round progression, and win
condition checks.
o actionStageMoves.ts (Move Set)
```
```
▪ Exposes playCard, cycleCard, endTurn, and surrender moves; checks for rule
violations.
o phaseUtils.ts (Rule Utilities)
```
```
▪ Checks end conditions, win conditions, and enforces rule compliance.
o cardUtils.ts (Validation)
```
```
▪ Validates card playability based on AP, hand size, and turn.
o Backend Server (Express, boardgame.io)
▪ Exposes WebSocket endpoints for all moves and state updates.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 4. 4 Game State Visualization

-^ User Interface Design^
    o The game board visually displays all infrastructure cards, player hands, scores, and current
       game state (turn, phase, round, AP, etc.).
    o Infrastructure cards show their state (secure, vulnerable, compromised, etc.), vulnerabilities,
       shields, and effects with color, icons, and animations.
    o Player hands are rendered with card art, playability indicators, and overlays for targeting or
       pending choices.
    o Overlays and modals are used for wildcard type selection, chain effects, hand disruption,
       and post-game chat.
    o The UI updates in real time as the game state changes, with smooth transitions and
       feedback for all actions.
    o Spectator and player views are supported, with sensitive information hidden as appropriate.
    o Side panels and overlays display scores, infrastructure status, and game messages.
-^ Front-end component(s)^
    o BalatroGameBoard.tsx (React Component)

```
▪ Main game board UI; renders infrastructure, player hands, overlays, and all state
visualizations.
o GameBoardLayout.tsx (React Component)
```
```
▪ Organizes the board into player, opponent, and infrastructure areas.
o InfrastructureArea.tsx (React Component)
```
```
▪ Displays all infrastructure cards in play.
o PlayerHand.tsx (React Component)
```
```
▪ Renders the player's hand with playability and targeting overlays.
o PendingChoicesOverlay.tsx (React Component)
```
```
▪ Shows overlays for wildcard, chain, and hand disruption choices.
o PowerBar.tsx, PlayerInfo.tsx, GameStatus.tsx (React Components)
▪ Display scores, AP, hand size, round, phase, and win/loss messages.
o Stylesheets (gameboard-v2.css, infrastructure-card.css, etc.)
```
```
▪ Provide layout, color, animation, and responsive design for all visual elements.
o useGameBoardData.ts, useGameState.ts (Custom Hooks)
```
```
▪ Process and memoize game state for efficient rendering.
```
-^ Back-end component(s)^
    o playerView.ts (Player View Logic)

```
▪ Filters and prepares the game state for each player or spectator, hiding sensitive
info and marking playability.
o gameState.ts (Game State)
```

_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Defines the structure of the game state and all visualized properties.
o DarknetDuel.ts (Game Definition)
```
```
▪ Integrates playerView and state logic for boardgame.io.
o stateUpdates.ts (State Update Utilities)
```
```
▪ Updates and synchronizes game state after actions.
o Backend Server (Express, boardgame.io)
```
```
▪ Exposes WebSocket endpoints for real-time state updates and synchronization.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### Module 5: Game Statistics and Result Tracking

#### 5 .1 Match Result Display

-^ User Interface Design^
    o At the end of a match, the UI displays a result screen showing victory, defeat, or draw, along
       with the win condition (e.g., "Attacker controlled 3 infrastructure cards").
    o The result screen includes:

```
▪ Winner/loser announcement (with team color and icon)
▪ Win reason (e.g., "Maximum rounds reached - defender wins by default", "Attacker
```

_Darknet Duel
Published Date: 14 June, 2025_

```
controlled 3 infrastructure cards")
▪ Game statistics (duration, cards played, infrastructure changed)
▪ Option to request a rematch or return to lobby
▪ Post-game chat panel for both players
o The UI updates in real time as soon as the backend determines the game is over.
o Spectators see the same result screen, but without rematch controls.
```
-^ Front-end component(s)^
    o BalatroGameBoard.tsx (React Component)
       ▪ Detects game over state and triggers result display.
    o GameStatus.tsx (React Component)

```
▪ Displays victory/defeat/draw message and win reason.
o WinnerLobby.tsx (React Component)
```
```
▪ Shows the result screen, statistics, and rematch/return options.
o PostGameChat.tsx (React Component)
▪ Enables chat between players after the match ends.
o PowerBar.tsx, PlayerInfo.tsx (React Components)
```
```
▪ Show final scores and infrastructure status.
o Stylesheets
```
```
▪ Style the result screen, overlays, and feedback.
```
-^ Back-end component(s)^
    o gamePhases.ts (Phase Logic)
       ▪ Handles transition to game over, determines winner, win reason, and triggers result
          state.
    o gameState.ts (Game State)
       ▪ Stores winner, win reason, and game statistics.
    o phaseUtils.ts (Rule Utilities)

```
▪ Calculates win conditions and reasons.
o server/index.ts (Game Server)
```
```
▪ Monitors for game over, processes results, and sends to backend API if needed.
o serverAuth.ts (Backend API Communication)
▪ Sends game results, history, and rating updates to backend server.
o Backend Server (Express, boardgame.io)
```
```
▪ Exposes WebSocket endpoints for game over notification, result data, rematch, and
post-game chat.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 5 .2 Player Performance Statistics

-^ User Interface Design^
    o The UI displays player performance statistics, including:
    o ELO rating (current, change after match)
    o Win/loss record (total, recent)
    o Match history (recent games, opponents, results)


_Darknet Duel
Published Date: 14 June, 2025_

```
o Visual charts (ELO over time)
o Statistics are updated in real time after each match and are visible on the profile page and
post-game result screen.
o Players can view detailed match history and statistics for themselves and (optionally) for
other players.
```
-^ Front-end component(s)^
    o ProfilePage.tsx (React Component)

```
▪ Displays player statistics, ELO, win/loss, and charts.
o StatsChart.tsx (React Component)
```
```
▪ Renders ELO and win/loss charts.
o MatchHistory.tsx (React Component)
```
```
▪ Shows recent matches, opponents, and results.
o GameStatus.tsx, WinnerLobby.tsx (React Components)
```
```
▪ Show ELO changes and updated stats after a match.
o Services/api.ts, stats.service.ts (API Services)
```
```
▪ Fetch and update statistics from backend via REST API.
o Stylesheets
```
```
▪ Style statistics panels, charts, and feedback.
```
-^ Back-end component(s)^
    o serverAuth.ts (Backend API Communication)

```
▪ Sends game results, records history, and updates ELO ratings via REST API.
o index.ts (Game Server)
```
```
▪ Triggers statistics update after match ends.
o Backend Server (Express)
▪ Exposes REST API endpoints for statistics, history, and ELO updates.
o Database
```
```
▪ Stores player statistics, match history, and ELO ratings.
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 5.3 Match History Storage and Browsing

-^ User Interface Design^
    o Players can view a paginated list of their past matches (match history)
    o Each match entry displays result (win/loss), opponent, role, mode, time, duration, turns, and
       rating change
    o Players can expand a match entry to view detailed information (players, stats, outcome,
       timestamps)
    o Supports loading more records (pagination)
    o Handles loading, error, and empty states
    o Cyberpunk-themed, responsive UI
-^ Front-end component(s)^
    o GameHistoryPage (React Page Component)
       ▪ Displays the user's match history, handles pagination, loading, and error states
       ▪ File: src/pages/GameHistoryPage.tsx
    o gameService (Service Module)


_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Fetches match history and details from backend
▪ File: src/services/game.service.ts
o useAuthStore (Zustand Store)
```
```
▪ Provides authentication and user info
▪ File: src/store/auth.store.ts
```
-^ Back-end component(s)^
    o GamesController (Express Controller)

```
▪ Handles REST API requests for match history
▪ Endpoints:
```
-^ GET /games/history —^ Get paginated match history for authenticated user^
o GameService (Service Class)

```
▪ Retrieves and formats match history from the database
▪ Methods:
```
-^ getPlayerGames(accountId, limit, offset) —^ Fetches games for a player^
-^ getPlayerGameCount(accountId) —^ Gets total count for pagination^
o GameHistory Entity

```
▪ Represents stored game history records
▪ File: src/entities/game-history.entity.ts
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### Module 6: Store and Currency...................................................................................................................................................................

#### 6. 1 In-Game Currency Management

-^ User Interface Design^
    o Players can view their current balances of Creds and Crypts on the dashboard and top-up
       pages
    o Creds are earned by playing matches (10 for a win, 5 for a loss)
    o Crypts are obtained via payment/top-up
    o Players can spend currency on store purchases and in-game actions
    o Players can transfer currency to other users
    o UI displays currency with distinct icons/colors ( for Creds, for Crypts)

```
o Handles loading, error, and insufficient funds states
```
-^ Front-end component(s)^
    o DashboardPage (React Page Component)

```
▪ Displays current balances of Creds and Crypts
▪ File: src/pages/DashboardPage.tsx
o TopUpPage (React Page Component)
```
```
▪ Shows current balance and allows top-up of Crypts
▪ File: src/pages/TopUpPage.tsx
o currencyService (Service Module)
```
```
▪ Fetches balances, handles transfers, and formats currency display
▪ File: src/services/currency.service.ts
o useAuthStore (Zustand Store)
```
```
▪ Provides authentication and user info, including currency balances
▪ File: src/store/auth.store.ts
```
-^ Back-end component(s)^
    o CurrencyController (Express Controller)

```
▪ Handles REST API requests for currency management
▪ Endpoints:
```
-^ GET /api/currency/balance —^ Get authenticated user's currency balance^
-^ POST /api/currency/add —^ Add currency (admin only)^
-^ POST /api/currency/subtract —^ Subtract currency (admin only)^
-^ POST /api/currency/transfer —^ Transfer currency between users^
o CurrencyService (Service Class)
▪ Manages currency logic: get, add, subtract, transfer, set
▪ Methods: getBalance, addCurrency, subtractCurrency, transferCurrency,


_Darknet Duel
Published Date: 14 June, 2025_

```
setCurrency
o Account Entity
```
```
▪ Stores creds and crypts fields for each user
▪ File: src/entities/account.entity.ts
o StoreService (Service Class)
▪ Handles purchases, checks/updates balances
▪ File: src/services/store.service.ts
o PaymentService (Service Class)
▪ Handles payment processing and crypts top-up
▪ File: src/services/payment.service.ts
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^


_Darknet Duel
Published Date: 14 June, 2025_

```
o ERD or schema
```
#### 6 .2 Store Browsing, Item Purchase, and Application of Decoration

-^ User Interface Design^
    o Players can browse store categories and items (decorations, etc.)
    o Each item displays preview, name, description, price, and purchase/apply button
    o User balance (creds, crypts) is shown and updated in real time
    o Owned items are marked and can be applied to the profile
    o Purchase and application actions provide success/error feedback
    o Handles loading, error, and insufficient funds states
    o Responsive, cyberpunk-themed UI
-^ Front-end component(s)^
    o StorePage (React Page Component)

```
▪ Displays store categories, items, user balance, and handles purchase/application
▪ File: src/pages/StorePage.tsx
o storeService (Service Module)
```
```
▪ Fetches store data, user purchases, handles purchase and apply actions
▪ File: src/services/store.service.ts
o currencyService (Service Module)
```
```
▪ Fetches user balance for display
▪ File: src/services/currency.service.ts
o useAuthStore (Zustand Store)
```
```
▪ Provides authentication, user info, and current decoration
▪ File: src/store/auth.store.ts
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Back-end component(s)^
    o StoreController (Express Controller)

```
▪ Handles REST API requests for store browsing, purchase, and decoration
application
▪ Endpoints:
```
-^ GET /api/store —^ Get all store categories and items^
-^ GET /api/store/purchases —^ Get user's purchased items^
-^ POST /api/purchase/{itemId} —^ Purchase an item^
-^ POST /api/account/apply/decoration/{decorationId} —^ Apply a decoration^
o StoreService (Service Class)

```
▪ Handles store logic: get store data, check ownership, purchase item, apply
decoration
▪ Methods: getStoreData, userOwnsItem, purchaseItem, applyDecoration
o Purchase Entity
▪ Stores purchases made by users (itemId, accountId, price, currency, etc.)
▪ File: src/entities/purchase.entity.ts
o Account Entity
```
```
▪ Stores ties/account.entity.ts
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 6.3 Payment Integration

-^ User Interface Design^
    o Players can initiate a top-up and select a crypts package
    o Payment modal or new window opens for payment provider (e.g., Xendit)
    o UI shows payment status (pending, paid, failed, expired)
    o On successful payment, crypts are credited to the user's account and balance is updated
    o Handles errors, timeouts, and payment failures with clear feedback
    o Responsive, cyberpunk-themed UI
-^ Front-end component(s)^
    o TopUpPage (React Page Component)
       ▪ Allows users to select a package and initiate payment
       ▪ File: src/pages/TopUpPage.tsx
    o PaymentModal (React Modal Component)


_Darknet Duel
Published Date: 14 June, 2025_

```
▪ Handles the complete payment flow and status updates
▪ File: src/components/PaymentModal.tsx
o paymentService (Service Module)
```
```
▪ Manages payment API calls, opens payment window, polls status, and processes
payment
▪ File: src/services/payment.service.ts
o useAuthStore (Zustand Store)
```
```
▪ Provides authentication and user info, including crypts balance
▪ File: src/store/auth.store.ts
```
-^ Back-end component(s)^
    o PaymentController (Express Controller)

```
▪ Handles REST API requests for payment creation, status, and processing
▪ Endpoints:
```
-^ POST /api/payment/create —^ Create payment invoice for crypts top-up^
-^ GET /api/payment/status/{invoiceId} —^ Check payment status^
-^ POST /api/payment/process —^ Process successful payment and credit
    crypts
o PaymentService (Service Class)

```
▪ Integrates with payment provider (Xendit), creates invoices, checks status,
processes payment
▪ Methods: createPayment, checkPaymentStatus, processSuccessfulPayment
o CurrencyService (Service Class)
```
```
▪ Adds crypts to user account after successful payment
▪ File: src/services/currency.service.ts
o Account Entity
```
```
▪ Stores crypts balance for each user
▪ File: src/entities/account.entity.ts
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### Module 7: Admin and Moderation Tools

#### 7 .1 User Search, Ban, and Moderation

-^ User Interface Design^
    o Admins and moderators can search for users by username, email, or filters (role, status)
    o User list displays key info: username, email, status (active/banned), role, creds, crypts,
       created date
    o Actions available: view profile, edit user, ban/unban user, issue warnings
    o Ban/unban actions require confirmation and a reason (for bans)
    o UI provides feedback for all moderation actions (success/error)
    o Pagination and filtering for large user lists
    o Responsive, admin-themed UI
-^ Front-end component(s)^
    o UserManagement (React Component)
       ▪ Displays user list, search/filter controls, and moderation actions
       ▪ File: src/components/admin/UserManagement.tsx
    o BanUserModal (Modal Component)

```
▪ Handles ban confirmation and reason input
▪ File: src/components/admin/BanUserModal.tsx
o UserEditModal (Modal Component)
```
```
▪ Allows editing user details
▪ File: src/components/admin/UserEditModal.tsx
o adminService (Service Module)
▪ Handles API calls for user search, ban, unban, and updates
▪ File: src/services/admin.service.ts
o useAuthStore (Zustand Store)
```
```
▪ Provides authentication and user info, including role/type
▪ File: src/store/auth.store.ts
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Back-end component(s)^
    o AdminController (Express Controller)

```
▪ Handles REST API requests for user search, ban, unban, and updates
▪ Endpoints:
```
-^ GET /api/admin/users —^ Paginated user search/filter^
-^ GET /api/admin/users/{id} —^ Get user details^
-^ PUT /api/admin/users/{id} —^ Update user details^
-^ POST /api/admin/users/{id}/ban —^ Ban user^
-^ POST /api/admin/users/{id}/unban —^ Unban user^
o AdminService (Service Class)

```
▪ Implements moderation logic: search, ban, unban, update, log actions
▪ Methods: getUsers, getUserById, updateUser, banUser, unbanUser
o Account Entity
```
```
▪ Stores user info, status, role/type, ban reason, etc.
▪ File: src/entities/account.entity.ts
o LogService (Service Class)
```
```
▪ Logs moderation actions for audit trail
▪ File: src/services/log.service.ts
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema

#### 7 .2 Report Management

-^ User Interface Design^
    o Players can submit reports about inappropriate behavior or issues (profile or chat)
    o Admins/moderators can review, filter, and search reports
    o Reports display reporter, reportee, reason, type, status, and timestamps
    o Admins/moderators can update report status (reviewed, resolved, dismissed), delete
       reports, and ban users from reports
    o UI provides feedback for all actions (success/error)
    o Pagination and filtering for large report lists
    o Responsive, admin-themed UI
-^ Front-end component(s)^


_Darknet Duel
Published Date: 14 June, 2025_

```
o ReportModal (Modal Component)
```
```
▪ Allows players to submit a report with reason and details
▪ File: src/components/ReportModal.tsx
o ReportManagementPage (React Page Component)
```
```
▪ Admin/moderator page for reviewing, updating, and deleting reports, and banning
users
▪ File: src/pages/ReportManagementPage.tsx
o reportService (Service Module)
▪ Handles API calls for submitting, fetching, updating, and deleting reports
▪ File: src/services/report.service.ts
o adminService (Service Module)
```
```
▪ Used for banning users from reports
▪ File: src/services/admin.service.ts
o useAuthStore (Zustand Store)
▪ Provides authentication and user info, including role/type
▪ File: src/store/auth.store.ts
```
-^ Back-end component(s)^
    o ReportController (Express Controller)

```
▪ Handles REST API requests for report submission, review, update, and deletion
▪ Endpoints:
```
-^ POST /api/reports —^ Submit a report^
-^ GET /api/admin/reports —^ Get reports for admin review^
-^ GET /api/admin/reports/{id} —^ Get detailed report info^
-^ PUT /api/admin/reports/{id}/status —^ Update report status^
-^ DELETE /api/admin/reports/{id} —^ Delete a report^
-^ GET /api/admin/reports/stats —^ Get report statistics^
o ReportService (Service Class)

```
▪ Implements report logic: create, fetch, update, delete, log actions
▪ Methods: createReport, getReports, getReportById, updateReportStatus,
deleteReport, getReportStats
o Report Entity
```
```
▪ Stores report data (reporter, reportee, reason, type, status, etc.)
▪ File: src/entities/report.entity.ts
o LogService (Service Class)
```
```
▪ Logs report status changes and actions
▪ File: src/services/log.service.ts
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```
-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 7.3 System Logs and Audit Trails

-^ User Interface Design^
    o Admins and moderators can view, filter, and search system logs and audit trails
    o Logs display user, action, timestamp, and details
    o UI supports pagination, filtering by user, and searching by text
    o Log details can be viewed in a modal or detail view
    o Responsive, admin-themed UI
-^ Front-end component(s)^


_Darknet Duel
Published Date: 14 June, 2025_

```
o SecurityOverviewPage (React Page Component)
```
```
▪ Displays logs, filtering/search controls, and pagination
▪ File: src/pages/SecurityOverviewPage.tsx
o logService (Service Module)
```
```
▪ Handles API calls for fetching logs and log details
▪ File: src/services/log.service.ts
o useAuthStore (Zustand Store)
```
```
▪ Provides authentication and user info, including role/type
▪ File: src/store/auth.store.ts
```
-^ Back-end component(s)^
    o LogController (Express Controller)

```
▪ Handles REST API requests for log retrieval
▪ Endpoints:
```
-^ GET /api/logs —^ Get logs with pagination and filtering^
-^ GET /api/logs/{id} —^ Get specific log by ID^
o LogService (Service Class)

```
▪ Implements log logic: create, fetch, filter, and search logs
▪ Methods: createLog, getLogs, getLogById, logUserLogin, logFailedLogin, etc.
o Log Entity
```
```
▪ Stores log data (userId, text, createdAt)
▪ File: src/entities/log.entity.ts
o Account Entity
```
```
▪ Stores user info for log relations
▪ File: src/entities/account.entity.ts
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```
-^ Data Design^
    o ERD or schema


_Darknet Duel
Published Date: 14 June, 2025_

#### 7.4 User Modification

-^ User Interface Design^
    o Admins and moderators can search for and select a user account
    o User details (username, email, type, status, bio, creds, crypts) are displayed in an editable
       form
    o Admins/mods can modify username, email, password, and other fields
    o Form validates input and checks for conflicts (duplicate email/username, invalid format)
    o UI provides feedback for all actions (success/error)
    o Responsive, admin-themed UI
-^ Front-end component(s)^
    o UserManagement (React Component)

```
▪ Displays user list and provides access to edit actions
▪ File: src/components/admin/UserManagement.tsx
o UserEditModal (Modal Component)
```
```
▪ Allows editing user details (username, email, password, etc.)
▪ File: src/components/admin/UserEditModal.tsx
o adminService (Service Module)
```
```
▪ Handles API calls for updating user details
▪ File: src/services/admin.service.ts
o useAuthStore (Zustand Store)
```
```
▪ Provides authentication and user info, including role/type
▪ File: src/store/auth.store.ts
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Back-end component(s)^
    o AdminController (Express Controller)

```
▪ Handles REST API requests for updating user details
▪ Endpoints:
```
-^ PUT /api/admin/users/{id} —^ Update user details (username, email,
    password, etc.)
o AdminService (Service Class)

```
▪ Implements logic for updating user details, validation, and logging
▪ Methods: updateUser
o Account Entity
```
```
▪ Stores user info, including username, email, password (hashed), etc.
▪ File: src/entities/account.entity.ts
o LogService (Service Class)
```
```
▪ Logs user modifications for audit trail
▪ File: src/services/log.service.ts
```
-^ Object-Oriented Components^
    o Class Diagram


_Darknet Duel
Published Date: 14 June, 2025_


_Darknet Duel
Published Date: 14 June, 2025_

```
o Sequence Diagram
```

_Darknet Duel
Published Date: 14 June, 2025_

-^ Data Design^
    o ERD or schema


