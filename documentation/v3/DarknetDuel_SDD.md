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
| 2.0     | 2025-06-14 | Shift from Spring Boot as Backend to Express.js with boardgame.io. Reworked all modules | Team 27 of Capstone 1 |

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
   - [Module 2: Lobby and Matchmaking](#module-2-lobby-and-matchmaking)
   - [Module 3: Real-Time Multiplayer Game](#module-3-real-time-multiplayer-game)
   - [Module 4: Card System and Game Logic](#module-4-card-system-and-game-logic)
   - [Module 5: Game Statistics and Result Tracking](#module-5-game-statistics-and-result-tracking)
   - [Module 6: Store and Currency](#module-6-store-and-currency)
   - [Module 7: Admin and Moderation Tools](#module-7-admin-and-moderation-tools)
   - [Module 8: First-Time Experience](#module-8-first-time-experience)

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

The scope of this Software Design Description (SDD) encompasses the complete software architecture and design for the Darknet Duel web-based card game. This document details the structure and interaction of all major system components, including the frontend (user interface), backend server (REST API, database, admin tools), and game server (real-time game logic and multiplayer engine). The SDD covers:

- The overall architectural approach, including system decomposition and component boundaries
- The design and responsibilities of each major module and transaction, as defined in the SRS
- The interfaces and communication protocols between frontend, backend, and game server
- The data models, database schema, and entity relationships
- The design of user-facing features (authentication, lobby, gameplay, store, admin tools, etc.)
- Security, scalability, and maintainability considerations in the design
- The mapping of requirements from the SRS to concrete design artifacts (class diagrams, sequence diagrams, ERDs)

This document is intended to guide the implementation of all software components required to deliver the full functionality of Darknet Duel, as well as to serve as a reference for future maintenance and enhancements.

### 1.3. Definitions and Acronyms

| Term | Definition |
|------|------------|
| SDD | Software Design Description – this document, describing the system's architecture and design |
| SRS | Software Requirements Specification – the requirements document for Darknet Duel |
| API | Application Programming Interface – a set of endpoints for communication between components |
| REST | Representational State Transfer – a web service architectural style used for backend APIs |
| WebSocket | A protocol providing full-duplex communication channels over a single TCP connection |
| JWT | JSON Web Token – a compact, URL-safe means of representing claims for authentication |
| AP | Action Points – a resource used by players to perform actions in the game |
| ELO | A rating system for calculating the relative skill levels of players |
| Creds | Standard in-game currency earned through gameplay |
| Crypts | Premium in-game currency purchased via payment integration |
| Frontend | The client-side application (React/TypeScript) used by players and admins |
| Backend Server | The Node.js/Express server handling authentication, persistence, admin tools, and REST APIs |
| Game Server | The Node.js/boardgame.io server handling real-time multiplayer game logic |
| Entity | A data model or table representing a real-world object in the database |
| ERD | Entity-Relationship Diagram – a diagram showing data entities and their relationships |
| Class Diagram | A UML diagram showing the static structure of system classes and their relationships |
| Sequence Diagram | A UML diagram showing the order of interactions between system components |
| Admin | A user with the highest privileges, able to manage users, content, and system settings |
| Moderator | A user with privileges to moderate player behavior and manage reports |
| Player | A standard user of the game, able to play matches and use standard features |
| CRUD | Create, Read, Update, Delete – basic operations for data management |
| DTO | Data Transfer Object – an object used to transfer data between processes |
| UUID | Universally Unique Identifier – a 128-bit identifier used for unique keys |

### 1.4. References

1. IEEE Std 1016-2009, IEEE Standard for Information Technology—Systems Design—Software Design Descriptions
2. Darknet Duel System Requirements Specification (SRS) document v3.0
3. Darknet Duel Software Project Proposal
4. boardgame.io Documentation (boardgame.io Project, https://boardgame.io/documentation)
5. React.js Documentation (Meta Platforms, Inc., https://react.dev)
6. Express.js Documentation (OpenJS Foundation, https://expressjs.com/en/5x/api.html)
7. MySQL Documentation (Oracle Corporation, https://dev.mysql.com/doc/)
8. Socket.IO Documentation (Socket.IO Project, https://socket.io/docs/)
9. Swagger/OpenAPI 3.0 (OpenAPI Initiative, https://swagger.io/specification/)

## 2. Architectural Design

The Darknet Duel system follows a modern web application architecture based on the client-server model with a clear separation of concerns. The system is designed to support real-time multiplayer interactions while maintaining responsive user experiences and robust security.

The high-level architecture consists of the following components:

1. **Client Application (Frontend)**
   - Single Page Application built with React.js and TypeScript
   - Material UI component library for consistent styling
   - Socket.IO for real-time communication
   - Responsive design for desktop support

2. **Backend Server (Express.js)**
   - Node.js/Express application serving as the core backend
   - RESTful API for standard HTTP requests
   - JWT-based authentication system
   - Business logic implementation for user management, store, and admin tools

3. **Game Server (boardgame.io)**
   - Node.js/boardgame.io server handling real-time multiplayer game logic
   - WebSocket connections for real-time game state updates
   - Game state management and synchronization

4. **Database Layer**
   - MySQL relational database for persistent storage
   - TypeORM for database access and entity management

5. **External Services**
   - Payment integration (Xendit) for premium currency purchases
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

- The client application communicates with the backend server through RESTful HTTP requests for non-real-time operations (user authentication, lobby management, store, admin tools, etc.)
- WebSocket connections are established with the game server for real-time game state updates during active gameplay
- The game server maintains game state and enforces game rules, sending updates to connected clients
- Database transactions occur for persistent operations like user profile updates and match history
- The backend server receives game results and statistics from the game server for persistence

### Technology Stack

#### Frontend
- **Primary Framework**: React.js with TypeScript
- **UI Component Library**: Material-UI
- **WebSocket Client**: Socket.IO
- **State Management**: Zustand
- **Target Platform**: Desktop (primary focus for MVP)

#### Backend Server
- **Framework**: Express.js
- **Authentication**: JWT-based authentication
- **RESTful API**: Express.js with TypeScript
- **Database ORM**: TypeORM
 - **Security & Policies**: Helmet (security headers), CORS configuration, express-rate-limit (rate limiting), request validation/sanitization middleware
 - **API Documentation**: Swagger/OpenAPI with annotations and generated UI
 - **Audit Logging**: Central LogService writing to Log/AuditLog entity
 - **GDPR Features**: Endpoints and services for data export/deletion
 - **Session Management**: Token expiry and idle timeout strategy

#### Game Server
- **Framework**: boardgame.io
- **WebSocket**: Socket.IO integration
- **Game Logic**: Custom game implementation with boardgame.io

#### Database
- **Database System**: MySQL
- **ORM**: TypeORM

#### External Services
- **Payment Processing**: Xendit integration
- **CDN/Proxy**: Cloudflare
 - **CI/CD**: GitHub Actions with build/test/coverage and ZAP security scanning gate

## 3. Detailed Design

### Module 1: User Management and Authentication

#### 1.1 User Registration

- **User Interface Design**
  - Presents a registration form with fields for username, email, password, and confirm password
  - Real-time validation for all fields (username length, email format, password strength, password match)
  - Displays error messages for invalid input or backend errors (e.g., email/username already exists)
  - Shows a success message and auto-login/redirects on successful registration
  - Provides a link/button to switch to the login form for existing users
  - Visual feedback (animations, loading indicators) during registration process

- **Front-end component(s)**
  - **RegisterForm.tsx (React Functional Component)**
    - Renders the registration form UI and handles form state/validation using react-hook-form and zod
    - Calls the registration API via the auth store and displays success/error messages
    - Triggers audio/visual feedback on success or error
  - **auth.store.ts (Zustand Store)**
    - Manages authentication state, loading, and error messages
    - Implements the register action, which calls the backend and handles auto-login on success
  - **auth.service.ts (Service Class)**
    - Handles API requests for registration, login, and profile retrieval
    - Implements the register method to POST registration data to /api/auth/register

- **Back-end component(s)**
  - **auth.routes.ts (Express Router)**
    - Defines the registration endpoint: POST /api/auth/register
  - **AuthController (Controller Class)**
    - Method: register(req, res)
    - Validates input (email, username, password)
    - Checks for existing user (by email or username)
    - Hashes password and creates new user via AuthService
    - Returns user data (without password) on success, or error messages on failure
  - **AuthService (Service Class)**
    - Methods:
    - createUser(userData) — Persists new user to the database
    - findByEmailOrUsername(email, username) — Checks for existing users
  - **Account Entity (TypeORM Entity)**
  - **Security/Policy Additions**
    - Swagger annotations on auth endpoints; rate limiting for login attempts; audit logging for successful/failed admin logins; session timeout configuration.
    - Represents the accounts table in the database, including fields for id, email, username, password, etc.
  - **Validation Utils**
    - validateEmail(email) — Checks email format
    - validatePassword(password) — Checks password strength

- **Object-Oriented Components**
  - **Class Diagram**: Describes the relationships between User, UserDTO, AuthController, AuthService, and Account Entity classes
  - **Sequence Diagram**: Illustrates the flow of a registration request from client to database

- **Data Design**
  - **Account Entity Schema**:
    - id (PK): BIGINT
    - email: VARCHAR(100)
    - username: VARCHAR(50)
    - password: VARCHAR(255) (hashed)
    - type: ENUM (user, mod, admin)
    - status: ENUM (active, inactive, banned)
    - creds: INT (default 0)
    - crypts: INT (default 0)
    - bio: TEXT
    - avatar: VARCHAR(255)
    - decoration: VARCHAR(255)
    - createdAt: TIMESTAMP
    - updatedAt: TIMESTAMP

#### 1.2 User Login

- **User Interface Design**
  - Presents a login form with fields for email and password
  - Real-time validation for email format and required password
  - Displays error messages for invalid input or backend errors (e.g., invalid credentials, inactive account)
  - Shows a loading indicator during authentication
  - Provides a link/button to switch to the registration form for new users
  - Visual feedback (animations, error flashes) on authentication failure

- **Front-end component(s)**
  - **LoginForm.tsx (React Functional Component)**
    - Renders the login form UI and handles form state/validation using react-hook-form and zod
    - Calls the login API via the auth store and displays success/error messages
    - Triggers audio/visual feedback on success or error
  - **auth.store.ts (Zustand Store)**
    - Manages authentication state, loading, and error messages
    - Implements the login action, which calls the backend and updates authentication state
  - **auth.service.ts (Service Class)**
    - Handles API requests for login, registration, and profile retrieval
    - Implements the login method to POST login data to /api/auth/login

- **Back-end component(s)**
  - **auth.routes.ts (Express Router)**
    - Defines the login endpoint: POST /api/auth/login
  - **AuthController (Controller Class)**
    - Method: login(req, res)
    - Validates input (email, password)
    - Checks for user existence and account status
    - Verifies password and issues JWT token on success
    - Returns user data (without password) and token on success, or error messages on failure
  - **AuthService (Service Class)**
    - Methods:
    - findByEmail(email) — Retrieves user by email
    - updateLastLogin(id) — Updates last login timestamp
    - logUserLogin(userId, username) — Logs successful login
    - logFailedLogin(email, reason) — Logs failed login attempts
  - **Account Entity (TypeORM Entity)**
    - Represents the accounts table in the database, including fields for id, email, username, password, etc.

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

#### 1.3 Profile Management

- **User Interface Design**
  - Displays a profile page with user information, avatar, bio, stats, and recent activity
  - Allows users to edit their profile (email, username, bio, password, avatar) via a modal dialog
  - Provides real-time validation for all editable fields (email, username, password, bio, avatar file type/size)
  - Shows error messages for invalid input or backend errors
  - Displays a loading indicator while fetching or updating profile data
  - Allows users to view other users' profiles and stats (read-only, with report option)
  - Avatar upload supports image preview, resizing, and validation
  - Visual feedback (animations, toasts, modals) for actions and errors

- **Front-end component(s)**
  - **ProfilePage.tsx (React Functional Component)**
    - Displays the user's profile, stats, and recent activity
    - Handles navigation, loading, and error states
    - Integrates EditProfileModal and ReportModal for editing/reporting
  - **EditProfileModal.tsx (React Functional Component)**
    - Modal dialog for editing profile fields and uploading avatar
    - Handles form state, validation, and submission
    - Provides image preview and resizing for avatar uploads
  - **UserProfilePopup.tsx (React Functional Component)**
    - Displays a popup with summary info and stats for any user
    - Used for quick profile viewing in other parts of the app
  - **account.service.ts (Service Class)**
    - Handles API requests for getting/updating account data and avatar upload
  - **info.service.ts (Service Class)**
    - Handles API requests for fetching profile stats and recent activity

- **Back-end component(s)**
  - **account.routes.ts (Express Router)**
    - Defines endpoints for getting/updating own account, getting account by UUID, and searching users
  - **AccountController (Controller Class)**
    - Methods:
    - getMyAccount(req, res) — Retrieves the authenticated user's account details
    - updateMyAccount(req, res) — Updates the authenticated user's account (email, username, password, bio, avatar)
    - getAccountByUuid(req, res) — Retrieves public account info for any user by UUID
    - searchAccountByUsername(req, res) — Searches for users by username
  - **InfoController (Controller Class)**
    - Methods:
    - getProfile(req, res) — Retrieves profile info, stats, and recent activity for the authenticated user
    - getProfileByUserId(req, res) — Retrieves profile info, stats, and recent activity for any user by UUID
    - getProfileStats(req, res) — Retrieves only the statistical info for the authenticated user
    - getRecentActivity(req, res) — Retrieves only the recent activity for the authenticated user
  - **FilesController (Controller Class)**
    - Method: getAvatar(req, res) — Retrieves avatar image for a user by UUID
  - **AccountService (Service Class)**
    - Methods:
    - updateAccount(id, updateData) — Updates user account data in the database
    - getAvatarById(id) — Retrieves avatar image data for a user
  - **Validation Utils**
    - Used for validating email, password, and bio fields
  - **Avatar Upload Middleware**
    - Handles file upload and validation for avatar images
  - **Account Entity (TypeORM Entity)**
    - Represents the accounts table in the database, including fields for id, email, username, password, bio, avatar, etc.

- **Object-Oriented Components**
  - **Class Diagram**: Shows profile management class relationships
  - **Sequence Diagram**: Illustrates the profile update process

- **Data Design**
  - **User Profile Schema** (extension of Account entity):
    - profileId (PK): BIGINT
    - userId (FK): BIGINT
    - displayName: VARCHAR(50)
    - avatarUrl: VARCHAR(255)
    - bio: TEXT
    - preferences: JSON

#### 1.4 Role-based Access

- **User Interface Design**
  - Displays user roles visually (e.g., badges/tags for admin and moderator) throughout the UI (profile, dashboard, user lists)
  - Restricts access to admin/moderator-only pages and actions (e.g., admin dashboard, user management, moderation tools)
  - Hides or disables UI elements for actions not permitted by the user's role
  - Shows error messages or redirects if a user attempts to access a forbidden page or action
  - Allows admins to promote/demote users and assign roles via the admin dashboard
  - Provides clear feedback when role-based actions succeed or fail

- **Front-end component(s)**
  - **UserTypeTag.tsx (React Functional Component)**
    - Renders a visual tag for user roles (admin, moderator) in the UI
    - Used in profile pages, user lists, and admin/moderator dashboards
  - **Admin/Moderator UI Components** (e.g., AdminPage, UserManagement, BanUserModal)
    - Rendered conditionally based on user role
    - Provide interfaces for user management, banning, role assignment, and moderation actions
  - **auth.store.ts (Zustand Store)**
    - Stores the current user's role/type and exposes it for conditional rendering
  - **Route Guards/ProtectedRoute**
    - Restrict access to certain routes/pages based on user role

- **Back-end component(s)**
  - **admin-auth.middleware.ts (Express Middleware)**
    - Ensures the authenticated user is an admin before allowing access to admin-only endpoints
  - **moderator-auth.middleware.ts (Express Middleware)**
    - Ensures the authenticated user is a moderator or admin before allowing access to moderator-only endpoints
  - **auth.middleware.ts (Express Middleware)**
    - Ensures the user is authenticated and attaches user info (including role/type) to the request
  - **AdminController (Controller Class)**
    - Handles admin-only endpoints for user management, banning, role assignment, etc.
  - **Account Entity (TypeORM Entity)**
    - Includes the type field (enum: user, mod, admin) to represent user roles
  - **AccountService/AdminService (Service Classes)**
    - Methods for updating user roles, filtering users by type, and enforcing role-based logic

- **Object-Oriented Components**
  - **Class Diagram**: Shows role-based access control class structure
  - **Sequence Diagram**: Illustrates the role verification process

- **Data Design**
  - **Role-based Access Schema**:
    - userId (PK): BIGINT
    - role: ENUM (user, moderator, admin)
    - permissions: JSON
    - assignedBy: BIGINT (admin user ID)
    - assignedAt: TIMESTAMP

### Module 2: Lobby and Matchmaking

#### 2.1 Lobby Browser

- **User Interface Design**
  - Displays a list of active game lobbies (matches) with status, player info, and capacity
  - Allows users to refresh the lobby list, join public lobbies, or enter a private lobby ID to join a private lobby
  - Shows lobby state (waiting, ready, in progress, abandoned) with visual badges and icons
  - Provides feedback for loading, errors, and empty states (no lobbies found)
  - Disables join buttons for full, in-progress, or abandoned lobbies
  - Allows users to create a new lobby via a dedicated button
  - Visual feedback (animations, loading spinners, toasts) for actions and errors

- **Front-end component(s)**
  - **LobbyBrowser.tsx (React Functional Component)**
    - Displays the lobby list, handles refresh, join, and private lobby entry
    - Shows lobby state, player info, and join/create actions
    - Handles polling for lobby updates and error/loading states
  - **lobby.service.ts (Service Class)**
    - Handles API requests for listing, joining, creating, and leaving lobbies
    - Provides methods for joining private lobbies and updating player status
  - **auth.store.ts (Zustand Store)**
    - Provides current user info for lobby actions

- **Back-end component(s)**
  - **boardgame.io server (index.ts)**
    - Hosts the game server and exposes lobby endpoints via boardgame.io and Koa
    - Handles lobby creation, listing, joining, leaving, and player metadata
    - Custom endpoints for health check, leave, and lobby config
  - **LobbyCleanupService (Service Class)**
    - Periodically removes abandoned or inactive lobbies from the server
    - Configurable grace periods and TTLs for abandoned/inactive games
  - **Lobby Database (boardgame.io internal)**
    - Stores match/lobby metadata, player info, and connection status

- **Object-Oriented Components**
  - **Class Diagram**: Illustrates lobby management classes
  - **Sequence Diagram**: Shows the lobby browsing process

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

#### 2.2 Create/Join/Leave Lobbies

- **User Interface Design**
  - Allows users to create a new lobby with options for name, privacy, and game mode
  - Provides a form for lobby creation with feedback for errors and loading state
  - Lets users join public lobbies from the browser or enter a private lobby ID to join a private lobby
  - Shows join/leave status and disables actions as appropriate (e.g., joining, full, in-progress)
  - Allows users to leave a lobby at any time, updating the lobby state and player list
  - Displays lobby chat for communication between players in the same lobby
  - Visual feedback (animations, loading spinners, toasts) for actions and errors

- **Front-end component(s)**
  - **CreateLobby.tsx (React Functional Component)**
    - Renders the lobby creation form and handles creation logic
    - Submits lobby settings and joins the created lobby as host
  - **LobbyBrowser.tsx (React Functional Component)**
    - Handles joining public or private lobbies
  - **LobbyChat.tsx (React Functional Component)**
    - Provides real-time chat for users in the same lobby
  - **lobby.service.ts (Service Class)**
    - Handles API requests for creating, joining, and leaving lobbies
    - Provides methods for joining private lobbies and updating player status
  - **auth.store.ts (Zustand Store)**
    - Provides current user info for lobby actions

- **Back-end component(s)**
  - **boardgame.io server (index.ts)**
    - Hosts the game server and exposes endpoints for creating, joining, and leaving lobbies
    - Handles player metadata, lobby state, and custom join/leave logic
  - **LobbyCleanupService (Service Class)**
    - Periodically removes abandoned or inactive lobbies from the server
  - **Lobby Database (boardgame.io internal)**
    - Stores match/lobby metadata, player info, and connection status

- **Object-Oriented Components**
  - **Class Diagram**: Shows relationships between lobby and player entities
  - **Sequence Diagram**: Illustrates the lobby creation and joining process

- **Data Design**
  - **LobbyMembership Schema**:
    - id (PK): BIGINT
    - lobbyId (FK): BIGINT
    - userId (FK): BIGINT
    - joinTime: TIMESTAMP
    - role: ENUM (HOST, PLAYER)
    - team: ENUM (RED_TEAM, BLUE_TEAM)
    - status: ENUM (WAITING, READY, PLAYING)

#### 2.3 Real-Time Lobby Updates

- **User Interface Design**
  - Lobby browser and lobby views update automatically to reflect changes (new lobbies, player joins/leaves, lobby state changes)
  - Users see real-time updates to player lists, lobby status, and game state without manual refresh
  - Visual feedback for lobby state transitions (waiting, ready, in progress, abandoned)
  - Error and loading states are handled gracefully during updates
  - Lobby chat updates in real-time as messages are sent/received

- **Front-end component(s)**
  - **LobbyBrowser.tsx (React Functional Component)**
    - Polls the server for lobby updates at regular intervals (e.g., every 5 seconds)
    - Updates the UI in real-time as lobbies are created, joined, or abandoned
  - **LobbyChat.tsx (React Functional Component)**
    - Uses WebSockets (Socket.IO) for real-time chat updates in the lobby
  - **lobby.service.ts (Service Class)**
    - Provides methods for fetching lobby state and details
    - Handles polling and state management for lobby updates
  - **auth.store.ts (Zustand Store)**
    - Provides current user info for lobby actions

- **Back-end component(s)**
  - **boardgame.io server (index.ts)**
    - Exposes endpoints for listing, joining, and leaving lobbies
    - Updates lobby metadata and player state in real-time as users join/leave
    - Handles polling requests from frontend for lobby state
    - Optionally, could use WebSockets for push updates (future enhancement)
  - **LobbyCleanupService (Service Class)**
    - Periodically removes abandoned or inactive lobbies from the server
  - **Lobby Database (boardgame.io internal)**
    - Stores match/lobby metadata, player info, and connection status

- **Object-Oriented Components**
  - **Class Diagram**: Shows real-time update class structure
  - **Sequence Diagram**: Illustrates the real-time lobby update process

- **Data Design**
  - **LobbyUpdate Schema**:
    - lobbyId (PK): BIGINT
    - updateType: ENUM (JOIN, LEAVE, STATUS_CHANGE, CHAT_MESSAGE)
    - playerId: BIGINT
    - timestamp: TIMESTAMP
    - data: JSON

#### 2.4 Lobby Chat

- **User Interface Design**
  - Provides a real-time chat interface within each lobby for players to communicate
  - Displays chat messages with timestamps, sender names, and roles (attacker/defender/system)
  - Allows users to send and receive messages instantly while in a lobby
  - Shows system messages for game events (e.g., player joined, surrendered, rematch requested)
  - Handles error and connection states gracefully
  - Visual feedback for sending/receiving messages (animations, sound, toasts)

- **Front-end component(s)**
  - **LobbyChat.tsx (React Functional Component)**
    - Renders the chat UI, message list, and input box
    - Connects to the backend via WebSockets (Socket.IO) for real-time updates
    - Handles sending, receiving, and displaying chat messages
    - Integrates with user profile popups and reporting features
  - **lobby.service.ts (Service Class)**
    - Provides methods for joining/leaving lobbies and managing chat state
  - **auth.store.ts (Zustand Store)**
    - Provides current user info for chat actions

- **Back-end component(s)**
  - **boardgame.io server (index.ts)**
    - Handles chat messages as part of the game state using boardgame.io moves
    - Updates the game state with new chat messages and system messages
    - Exposes moves like sendChatMessage in all phases (setup, playing, game over, reaction)
  - **Game Logic (DarknetDuel.ts, gamePhases.ts, chatMoveHandler.ts, actionStageMoves.ts, reactionStageMoves.ts)**
    - Defines the sendChatMessage move and chat message handling logic
    - Stores chat messages in the game state (G.chat.messages)
    - Handles both player and system messages
  - **Lobby Database (boardgame.io internal)**
    - Stores match/game state, including chat history

- **Object-Oriented Components**
  - **Class Diagram**: Shows chat system class relationships
  - **Sequence Diagram**: Illustrates the chat message flow

- **Data Design**
  - **ChatMessage Schema**:
    - id (PK): BIGINT
    - lobbyId (FK): BIGINT
    - userId (FK): BIGINT
    - message: TEXT
    - timestamp: TIMESTAMP
    - messageType: ENUM (PLAYER, SYSTEM)

### Module 3: Real-Time Multiplayer Game

#### 3.1 Game Creation and Initialization

- **User Interface Design**
  - Allows users to create or join a game lobby (match) via the lobby browser or direct invite
  - Shows a waiting room/lobby interface until both players are present and ready
  - Displays game configuration (mode, player roles, initial resources, etc.) before starting
  - Provides feedback for lobby state (waiting, ready, in game, abandoned)
  - On game start, transitions to the main game board UI
  - Main game board displays player hands, infrastructure grid, turn/round info, and action controls
  - Visual feedback for loading, errors, and connection status

- **Front-end component(s)**
  - **LobbyBrowser.tsx (React Functional Component)**
    - Lists available lobbies, allows joining/creating matches, and shows lobby state
  - **CreateLobby.tsx (React Functional Component)**
    - UI for creating a new lobby with game options
  - **LobbyService.ts (Service)**
    - Handles API calls for creating, joining, and starting matches (boardgame.io integration)
  - **BalatroGameBoard.tsx (React Functional Component)**
    - Main game board UI; renders player hands, infrastructure, turn controls, and game state
  - **GameControls.tsx (React Functional Component)**
    - Provides controls for leaving the game, showing debug info, and connection status
  - **useGameState.ts (Custom Hook)**
    - Manages derived game state, player roles, and connection status for the board

- **Back-end component(s)**
  - **Game Server (boardgame.io)**
    - Handles match creation, player joining, and game state management
    - Exposes endpoints for match creation, joining, and state polling via WebSocket/REST
    - Main logic in DarknetDuel.ts, core/gameState.ts, core/gamePhases.ts, core/playerManager.ts
    - Endpoints:
      - POST /games/darknet-duel (create match)
      - POST /games/darknet-duel/:matchID/join (join match)
      - GET /games/darknet-duel/:matchID (get match state)
  - **LobbyCleanupService.ts (Service)**
    - Cleans up abandoned or stale lobbies on the game server
  - **Backend Server (Express)**
    - Receives game results and history for persistence (not direct game creation)
    - Endpoints:
      - POST /api/server/games/results (save game results)
      - POST /api/server/games/history (save game history)

- **Object-Oriented Components**
  - **Class Diagram**: Shows game creation class relationships
  - **Sequence Diagram**: Illustrates the game creation and initialization process

- **Data Design**
  - **GameMatch Schema**:
    - id (PK): BIGINT
    - lobbyId (FK): BIGINT
    - status: ENUM (WAITING, IN_PROGRESS, COMPLETED, ABANDONED)
    - createdAt: TIMESTAMP
    - startedAt: TIMESTAMP
    - completedAt: TIMESTAMP

#### 3.2 Turn-Based Gameplay, AP Allocation, Card Play, and Targeting

- **User Interface Design**
  - Displays turn indicator showing whose turn it is (attacker/defender)
  - Shows current action points (AP) for each player, updating at the start of each turn
  - Highlights playable cards in the player's hand based on AP and game rules
  - Allows player to select and play a card; if the card requires a target, prompts for valid target selection (infrastructure, opponent, etc.)
  - Provides visual feedback for valid/invalid actions (e.g., disabled cards, error toasts)
  - Shows reaction phase indicator when the opponent can respond to a card play
  - Displays end turn button, cycle card button, and surrender option
  - Updates game state and notifies all players after each action

- **Front-end component(s)**
  - **BalatroGameBoard.tsx (React Functional Component)**
    - Main game board UI; manages turn state, card play, targeting, and AP display
  - **PlayerHand.tsx (React Functional Component)**
    - Renders the player's hand, highlights playable cards, and handles card selection
  - **GameControls.tsx (React Functional Component)**
    - Provides controls for ending turn, cycling cards, surrendering, and shows turn/AP info
  - **useCardActions.ts (Custom Hook)**
    - Handles card play logic, targeting, and move validation
  - **useTurnActions.ts (Custom Hook)**
    - Manages end turn, skip reaction, and related turn-based actions

- **Back-end component(s)**
  - **Game Server (boardgame.io)**
    - Handles turn order, AP allocation, card play, targeting, and reaction phase
    - Main logic in core/gamePhases.ts, core/turnManager.ts, core/playerManager.ts, actions/playCardMove.ts, actions/throwCardMove/throwCardMove.ts, actions/cycleCardMove.ts
    - Endpoints:
      - WebSocket API for real-time game state updates and moves (playCard, throwCard, endTurn, cycleCard, etc.)
  - **TurnManager (Utility)**
    - Handles start of turn (draw card, allocate AP) and end of turn logic
  - **ActionStageMoves (Phase Logic)**
    - Defines available moves during the action stage (playCard, throwCard, cycleCard, endTurn, etc.)

- **Object-Oriented Components**
  - **Class Diagram**: Shows turn management class relationships
  - **Sequence Diagram**: Illustrates the turn progression and card play process

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

#### 3.3 Real-Time State Synchronization

- **User Interface Design**
  - Game board and all player UIs update in real time as game state changes (turns, card plays, AP, infrastructure, etc.)
  - Visual feedback for connection status (connected/disconnected) only as it relates to state updates (not reconnection logic)
  - Loading indicators and error messages for sync or connection issues
  - Notifies players of game end or abandonment as part of state updates

- **Front-end component(s)**
  - **GameClient.tsx (React Component)**
    - Connects to the boardgame.io server using Socket.IO, manages real-time state updates, and renders the game board
  - **BalatroGameBoard.tsx (React Functional Component)**
    - Renders the game state and updates UI in response to state changes
  - **useGameState.ts (Custom Hook)**
    - Handles derived state, player roles, and state update logic for the board

- **Back-end component(s)**
  - **Game Server (boardgame.io + Socket.IO)**
    - Manages authoritative game state, synchronizes state to all connected clients in real time
    - Main logic in server/index.ts, game/DarknetDuel.ts, core/playerView.ts
    - Endpoints:
      - WebSocket API for real-time game state updates and events
      - REST endpoints for match state polling and recovery
  - **LobbyCleanupService.ts (Service)**
    - Cleans up abandoned or stale lobbies and handles disconnection logic
  - **Backend Server (Express)**
    - Receives game results and history for persistence after game end

- **Object-Oriented Components**
  - **Class Diagram**: Shows state synchronization class structure
  - **Sequence Diagram**: Illustrates the state update and synchronization process

- **Data Design**
  - **StateSyncEvent Schema**:
    - id (PK): BIGINT
    - gameId (FK): BIGINT
    - eventType: ENUM (FULL_STATE, PATCH, TURN_UPDATE, RESULT)
    - createdAt: TIMESTAMP
    - payload: JSON

#### 3.4 Disconnection/Reconnection Handling

- **User Interface Design**
  - Disconnection and reconnection are handled in the background; the user interface does not display explicit notifications for these events.
  - The game continues to function seamlessly as long as the connection is restored; if a player leaves or the game is abandoned, standard game end or lobby removal flows apply.

- **Front-end component(s)**
  - **useGameConnection.ts (Custom Hook)**
    - Manages connection status, automatic reconnection logic, and leave notifications for the game server in the background.
  - **GameClient.tsx (React Component)**
    - Integrates connection management into the main game client, ensuring seamless gameplay during network interruptions.
  - **LobbyDetail.tsx (React Component)**
    - Handles player leave/disconnect and updates lobby/game state accordingly.

- **Back-end component(s)**
  - **Game Server (boardgame.io + Socket.IO)**
    - Tracks player connections/disconnections, manages reconnection, and updates game/lobby state accordingly.
    - Handles player leave events and marks games as abandoned if all players disconnect.
  - Main logic in server/index.ts, LobbyCleanupService.ts.
  - Endpoints:
    - WebSocket API for connection and disconnection events.
    - REST endpoint for explicit leave notifications (POST /games/:name/:id/leave).
  - **LobbyCleanupService.ts (Service)**
    - Cleans up abandoned or stale lobbies and handles disconnection logic.
  - **Backend Server (Express)**
    - Receives game results and history for persistence after game end.

- **Object-Oriented Components**
  - **Class Diagram**
  - **Sequence Diagram**

- **Data Design**
  - ERD or schema

#### 3.5 Game State Persistence and Recovery

- **User Interface Design**
  - Game state is automatically persisted on the server; users do not interact directly with save/load features.
  - If a player disconnects and reconnects, the game state is recovered seamlessly and the player resumes from the latest state.
  - If a game is abandoned or completed, it is removed from the lobby and no longer accessible.
  - No explicit UI for manual save/load; all persistence and recovery is transparent to the user.

- **Front-end component(s)**
  - **GameClient.tsx (React Component)**
    - Connects to the game server and automatically receives the latest game state on reconnect or page reload.
  - **useGameConnection.ts (Custom Hook)**
    - Handles reconnection and ensures the client receives the current state from the server.
  - **LobbyDetail.tsx (React Component)**
    - Handles lobby/game removal if the game is abandoned or completed.

- **Back-end component(s)**
  - **Game Server (boardgame.io + Socket.IO)**
    - Persists game state in memory or database for each match.
    - On client reconnect, serves the latest game state to the reconnecting client.
    - Removes completed or abandoned games from storage (via LobbyCleanupService.ts).
    - Main logic in server/index.ts, LobbyCleanupService.ts, game/DarknetDuel.ts.
  - Endpoints:
    - WebSocket API for state sync and recovery.
    - REST endpoints for match state polling and removal.
  - **LobbyCleanupService.ts (Service)**
    - Removes completed or abandoned games from storage.
  - **Backend Server (Express)**
    - Receives final game results and history for persistence after game end.

- **Object-Oriented Components**
  - **Class Diagram**
  - **Sequence Diagram**

- **Data Design**
  - ERD or schema

### Module 4: Card System and Game Logic

#### 4.1 Card Play, Targeting, and Effect Resolution

- **User Interface Design**
  - Players can select cards from their hand to play or throw at targets.
  - Cards that require targeting prompt the user to select an infrastructure card as the target.
  - Wildcard and special cards may prompt for additional choices (e.g., type selection, chain effect, hand disruption).
  - Visual feedback is provided for valid/invalid targets, targeting mode, and card play animations.
  - The result of card effects (e.g., state changes, persistent effects, hand disruption) is reflected immediately on the game board.
  - Pending choices (wildcard type, chain effect, hand disruption) are shown in overlay UIs.

- **Front-end component(s)**
  - BalatroGameBoard.tsx (React Component)
    - Main game board UI; handles rendering player hands, infrastructure, and card play interactions.
  - PlayerHand.tsx (React Component)
    - Displays the player's hand and handles card selection and play logic.
  - useCardActions.ts (Custom Hook)
    - Manages card play, targeting, throw actions, and pending choices.
  - PendingChoicesOverlay.tsx (React Component)
    - Renders overlays for wildcard type selection, chain effect, and hand disruption choices.
  - InfrastructureCardDisplay.tsx (React Component)
    - Displays infrastructure cards and handles target selection.
  - CardDisplay.tsx (React Component)
    - Renders individual cards with playability, selection, and targeting feedback.

- **Back-end component(s)**
  - playCardMove.ts (Move Handler)
    - Handles playing a card from hand, including wildcards, cost reductions, and effect application.
  - throwCardMove.ts (Move Handler)
    - Handles throwing a card at a target infrastructure, including validation and effect resolution.
  - cardEffects/index.ts (Effect Router)
    - Centralizes effect application for all card types, including wildcards and special effects.
  - wildcardResolver.ts (Wildcard Logic)
    - Handles wildcard card logic, type selection, and special effect application.
  - temporaryEffectsManager.ts (Effect Manager)
    - Manages temporary and persistent effects applied by cards.
  - cardUtils.ts (Utility)
    - Validates card playability and targeting.
  - actionStageMoves.ts (Phase Move Set)
    - Exposes playCard and throwCard moves to the game phases.
  - Backend Server (Express, boardgame.io)
    - Exposes WebSocket endpoints for card play and effect resolution via boardgame.io protocol.

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 4.2 Infrastructure State Tracking

- **User Interface Design**
  - The game board displays all infrastructure cards with their current state (secure, vulnerable, compromised, shielded, fortified, etc.).
  - State changes are visually indicated with color, icons, and animations (e.g., pulsing for vulnerable/compromised, shield glow for shielded/fortified).
  - Players can see vulnerabilities, shields, and effects applied to each infrastructure card.
  - State indicators and tooltips provide additional information about each state.
  - Infrastructure state changes are updated in real time as a result of card effects or game events.
  - The UI provides a summary of infrastructure status (e.g., number compromised, number fortified) in the sidebar or status panel.

- **Front-end component(s)**
  - BalatroGameBoard.tsx (React Component)
    - Renders the infrastructure grid, applies state-based classes, and displays state indicators and effects.
  - InfrastructureArea.tsx (React Component)
    - Organizes and displays all infrastructure cards in play.
  - InfrastructureCardDisplay.tsx (React Component)
    - Renders individual infrastructure cards, state indicators, vulnerabilities, shields, and effects.
  - game.types.ts (Type Definitions)
    - Defines InfrastructureCard, InfrastructureState, and related types for state tracking.
  - Stylesheets (gameboard-v2.css, infrastructure-card.css, infrastructure.css, game-layout-fix.css)
    - Provide visual feedback and animations for each infrastructure state.

- **Back-end component(s)**
  - InfrastructureCard (Type Definition)
    - Defines the structure and state of infrastructure cards (secure, vulnerable, compromised, shielded, fortified, etc.).
  - infrastructureCardLoader.ts (Loader)
    - Initializes the set of infrastructure cards and their starting states.
  - exploitEffect.ts, attackEffect.ts, fortifyEffect.ts, reactionEffect.ts (Effect Handlers)
    - Apply state transitions to infrastructure cards based on card effects.
  - throwCardMove/cardEffects/index.ts (Effect Router)
    - Centralizes effect application and processes persistent effects on state change.
  - temporaryEffectsManager.ts (Effect Manager)
    - Handles temporary and persistent effects that may alter infrastructure state.
  - gameState.ts, phaseUtils.ts (Game State/Win Logic)
    - Track infrastructure state for win conditions and scoring.
  - Validators/Utils
    - Validate card targeting and state transitions.
  - Backend Server (Express, boardgame.io)
    - Exposes WebSocket endpoints for state updates and synchronization.

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 4.3 Game Rules Enforcement

- **User Interface Design**
  - The UI displays each player's current Action Points (AP), hand size, and maximum allowed hand size.
  - Players are prevented from playing cards if they lack sufficient AP or if their hand is full.
  - The UI provides feedback when a move is blocked due to AP, hand size, or rule violations (e.g., error toasts, disabled buttons).
  - End turn, cycle card, and surrender buttons are available and context-sensitive.
  - The game board displays the current round, turn, and phase, as well as win/loss/draw messages when the game ends.
  - Score and infrastructure status are shown in side panels or overlays.

- **Front-end component(s)**
  - BalatroGameBoard.tsx (React Component)
    - Displays AP, hand size, round, phase, and win/loss messages; disables actions when rules are violated.
  - PlayerHand.tsx (React Component)
    - Renders the player's hand and disables card play when hand is full or AP is insufficient.
  - PlayerInfo.tsx (React Component)
    - Shows AP, hand size, and maintenance costs.
  - GameControls.tsx (React Component)
    - Provides end turn, cycle card, and surrender buttons; disables them as appropriate.
  - GameStatus.tsx (React Component)
    - Displays current phase, turn, and game over messages.
  - useTurnActions.ts (Custom Hook)
    - Handles end turn, cycle card, and surrender logic.
  - game.types.ts (Type Definitions)
    - Defines AP, hand size, and win condition properties in the game state.
  - Stylesheets
    - Style AP, hand size, and win/loss/draw overlays and feedback.

- **Back-end component(s)**
  - gameState.ts (Game State)
    - Defines initial AP, hand size, max turns, and win condition logic.
  - playerManager.ts (Player Management)
    - Initializes players, updates AP, draws cards, and enforces hand size.
  - gamePhases.ts (Phase Logic)
    - Handles AP allocation, hand size enforcement, turn/round progression, and win condition checks.
  - actionStageMoves.ts (Move Set)
    - Exposes playCard, cycleCard, endTurn, and surrender moves; checks for rule violations.
  - phaseUtils.ts (Rule Utilities)
    - Checks end conditions, win conditions, and enforces rule compliance.
  - cardUtils.ts (Validation)
    - Validates card playability based on AP, hand size, and turn.
  - Backend Server (Express, boardgame.io)
    - Exposes WebSocket endpoints for all moves and state updates.

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 4.4 Game State Visualization

- **User Interface Design**
  - The game board visually displays all infrastructure cards, player hands, scores, and current game state (turn, phase, round, AP, etc.).
  - Infrastructure cards show their state (secure, vulnerable, compromised, etc.), vulnerabilities, shields, and effects with color, icons, and animations.
  - Player hands are rendered with card art, playability indicators, and overlays for targeting or pending choices.
  - Overlays and modals are used for wildcard type selection, chain effects, hand disruption, and post-game chat.
  - The UI updates in real time as the game state changes, with smooth transitions and feedback for all actions.
  - Spectator and player views are supported, with sensitive information hidden as appropriate.
  - Side panels and overlays display scores, infrastructure status, and game messages.

- **Front-end component(s)**
  - BalatroGameBoard.tsx (React Component)
    - Main game board UI; renders infrastructure, player hands, overlays, and all state visualizations.
  - GameBoardLayout.tsx (React Component)
    - Organizes the board into player, opponent, and infrastructure areas.
  - InfrastructureArea.tsx (React Component)
    - Displays all infrastructure cards in play.
  - PlayerHand.tsx (React Component)
    - Renders the player's hand with playability and targeting overlays.
  - PendingChoicesOverlay.tsx (React Component)
    - Shows overlays for wildcard, chain, and hand disruption choices.
  - PowerBar.tsx, PlayerInfo.tsx, GameStatus.tsx (React Components)
    - Display scores, AP, hand size, round, phase, and win/loss messages.
  - Stylesheets (gameboard-v2.css, infrastructure-card.css, etc.)
    - Provide layout, color, animation, and responsive design for all visual elements.
  - useGameBoardData.ts, useGameState.ts (Custom Hooks)
    - Process and memoize game state for efficient rendering.

- **Back-end component(s)**
  - playerView.ts (Player View Logic)
    - Filters and prepares the game state for each player or spectator, hiding sensitive info and marking playability.
  - gameState.ts (Game State)
    - Defines the structure of the game state and all visualized properties.
  - DarknetDuel.ts (Game Definition)
    - Integrates playerView and state logic for boardgame.io.
  - stateUpdates.ts (State Update Utilities)
    - Updates and synchronizes game state after actions.
  - Backend Server (Express, boardgame.io)
    - Exposes WebSocket endpoints for real-time state updates and synchronization.

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

### Module 5: Game Statistics and Result Tracking

#### 5.1 Match Result Display

- **User Interface Design**
  - At the end of a match, the UI displays a result screen showing victory, defeat, or draw, along with the win condition (e.g., "Attacker controlled 3 infrastructure cards").
  - The result screen includes:
    - Winner/loser announcement (with team color and icon)
    - Win reason (e.g., "Maximum rounds reached - defender wins by default", "Attacker controlled 3 infrastructure cards")
    - Game statistics (duration, cards played, infrastructure changed)
    - Option to request a rematch or return to lobby
    - Post-game chat panel for both players
  - The UI updates in real time as soon as the backend determines the game is over.
  - Spectators see the same result screen, but without rematch controls.

- **Front-end component(s)**
  - BalatroGameBoard.tsx (React Component)
    - Detects game over state and triggers result display.
  - GameStatus.tsx (React Component)
    - Displays victory/defeat/draw message and win reason.
  - WinnerLobby.tsx (React Component)
    - Shows the result screen, statistics, and rematch/return options.
  - PostGameChat.tsx (React Component)
    - Enables chat between players after the match ends.
  - PowerBar.tsx, PlayerInfo.tsx (React Components)
    - Show final scores and infrastructure status.
  - Stylesheets
    - Style the result screen, overlays, and feedback.

- **Back-end component(s)**
  - gamePhases.ts (Phase Logic)
    - Handles transition to game over, determines winner, win reason, and triggers result state.
  - gameState.ts (Game State)
    - Stores winner, win reason, and game statistics.
  - phaseUtils.ts (Rule Utilities)
    - Calculates win conditions and reasons.
  - server/index.ts (Game Server)
    - Monitors for game over, processes results, and sends to backend API if needed.
  - serverAuth.ts (Backend API Communication)
    - Sends game results, history, and rating updates to backend server.
  - Backend Server (Express, boardgame.io)
    - Exposes WebSocket endpoints for game over notification, result data, rematch, and post-game chat.

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 5.2 Player Performance Statistics

- **User Interface Design**
  - The UI displays player performance statistics, including:
  - ELO rating (current, change after match)
  - Win/loss record (total, recent)
  - Match history (recent games, opponents, results)
  - Visual charts (ELO over time)
  - Statistics are updated in real time after each match and are visible on the profile page and post-game result screen.
  - Players can view detailed match history and statistics for themselves and (optionally) for other players.

- **Front-end component(s)**
  - ProfilePage.tsx (React Component)
    - Displays player statistics, ELO, win/loss, and charts.
  - StatsChart.tsx (React Component)
    - Renders ELO and win/loss charts.
  - MatchHistory.tsx (React Component)
    - Shows recent matches, opponents, and results.
  - GameStatus.tsx, WinnerLobby.tsx (React Components)
    - Show ELO changes and updated stats after a match.
  - Services/api.ts, stats.service.ts (API Services)
    - Fetch and update statistics from backend via REST API.
  - Stylesheets
    - Style statistics panels, charts, and feedback.

- **Back-end component(s)**
  - serverAuth.ts (Backend API Communication)
    - Sends game results, records history, and updates ELO ratings via REST API.
  - index.ts (Game Server)
    - Triggers statistics update after match ends.
  - Backend Server (Express)
    - Exposes REST API endpoints for statistics, history, and ELO updates.
    - Swagger annotations present; rate limiting on history endpoints.
  - Database
    - Stores player statistics, match history, and ELO ratings.

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 5.3 Match History Storage and Browsing

- **User Interface Design**
  - Players can view a paginated list of their past matches (match history)
  - Each match entry displays result (win/loss), opponent, role, mode, time, duration, turns, and rating change
  - Players can expand a match entry to view detailed information (players, stats, outcome, timestamps)
  - Supports loading more records (pagination)
  - Handles loading, error, and empty states
  - Cyberpunk-themed, responsive UI

- **Front-end component(s)**
  - GameHistoryPage (React Page Component)
    - Displays the user's match history, handles pagination, loading, and error states
    - File: src/pages/GameHistoryPage.tsx
  - gameService (Service Module)
    - Fetches match history and details from backend
    - File: src/services/game.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication and user info
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - GamesController (Express Controller)
    - Handles REST API requests for match history
    - Endpoints:
      - GET /games/history — Get paginated match history for authenticated user
  - GameService (Service Class)
    - Retrieves and formats match history from the database
    - Methods:
      - getPlayerGames(accountId, limit, offset) — Fetches games for a player
      - getPlayerGameCount(accountId) — Gets total count for pagination
  - GameHistory Entity
    - Represents stored game history records
    - File: src/entities/game-history.entity.ts

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

### Module 6: Store and Currency

#### 6.1 In-Game Currency Management

- **User Interface Design**
  - Players can view their current balances of Creds and Crypts on the dashboard and top-up pages
  - Creds are earned by playing matches (10 for a win, 5 for a loss)
  - Crypts are obtained via payment/top-up
  - Players can spend currency on store purchases and in-game actions
  - Players can transfer currency to other users
  - UI displays currency with distinct icons/colors (for Creds, for Crypts)
  - Handles loading, error, and insufficient funds states

- **Front-end component(s)**
  - DashboardPage (React Page Component)
    - Displays current balances of Creds and Crypts
    - File: src/pages/DashboardPage.tsx
  - TopUpPage (React Page Component)
    - Shows current balance and allows top-up of Crypts
    - File: src/pages/TopUpPage.tsx
  - currencyService (Service Module)
    - Fetches balances, handles transfers, and formats currency display
    - File: src/services/currency.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication and user info, including currency balances
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - CurrencyController (Express Controller)
    - Handles REST API requests for currency management
    - Endpoints:
      - GET /api/currency/balance — Get authenticated user's currency balance
      - POST /api/currency/add — Add currency (admin only)
      - POST /api/currency/subtract — Subtract currency (admin only)
      - POST /api/currency/transfer — Transfer currency between users
  - CurrencyService (Service Class)
    - Manages currency logic: get, add, subtract, transfer, set
    - Methods: getBalance, addCurrency, subtractCurrency, transferCurrency, setCurrency
  - Account Entity
    - Stores creds and crypts fields for each user
    - File: src/entities/account.entity.ts
  - StoreService (Service Class)
    - Handles purchases, checks/updates balances
    - File: src/services/store.service.ts
  - PaymentService (Service Class)
    - Handles payment processing and crypts top-up
    - File: src/services/payment.service.ts

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 6.2 Store Browsing, Item Purchase, and Application of Decoration

- **User Interface Design**
  - Players can browse store categories and items (decorations, etc.)
  - Each item displays preview, name, description, price, and purchase/apply button
  - User balance (creds, crypts) is shown and updated in real time
  - Owned items are marked and can be applied to the profile
  - Purchase and application actions provide success/error feedback
  - Handles loading, error, and insufficient funds states
  - Responsive, cyberpunk-themed UI

- **Front-end component(s)**
  - StorePage (React Page Component)
    - Displays store categories, items, user balance, and handles purchase/application
    - File: src/pages/StorePage.tsx
  - storeService (Service Module)
    - Fetches store data, user purchases, handles purchase and apply actions
    - File: src/services/store.service.ts
  - currencyService (Service Module)
    - Fetches user balance for display
    - File: src/services/currency.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication, user info, and current decoration
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - StoreController (Express Controller)
    - Handles REST API requests for store browsing, purchase, and decoration application
    - Endpoints:
      - GET /api/store — Get all store categories and items
      - GET /api/store/purchases — Get user's purchased items
      - POST /api/purchase/{itemId} — Purchase an item
      - POST /api/account/apply/decoration/{decorationId} — Apply a decoration
  - StoreService (Service Class)
    - Handles store logic: get store data, check ownership, purchase item, apply decoration
    - Methods: getStoreData, userOwnsItem, purchaseItem, applyDecoration
  - Purchase Entity
    - Stores purchases made by users (itemId, accountId, price, currency, etc.)
    - File: src/entities/purchase.entity.ts
  - Account Entity
    - Stores account information
    - File: src/entities/account.entity.ts

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 6.3 Payment Integration

- **User Interface Design**
  - Players can initiate a top-up and select a crypts package
  - Payment modal or new window opens for payment provider (e.g., Xendit)
  - UI shows payment status (pending, paid, failed, expired)
  - On successful payment, crypts are credited to the user's account and balance is updated
  - Handles errors, timeouts, and payment failures with clear feedback
  - Responsive, cyberpunk-themed UI

- **Front-end component(s)**
  - TopUpPage (React Page Component)
    - Allows users to select a package and initiate payment
    - File: src/pages/TopUpPage.tsx
  - PaymentModal (React Modal Component)
    - Handles the complete payment flow and status updates
    - File: src/components/PaymentModal.tsx
  - paymentService (Service Module)
    - Manages payment API calls, opens payment window, polls status, and processes payment
    - File: src/services/payment.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication and user info, including crypts balance
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - PaymentController (Express Controller)
    - Handles REST API requests for payment creation, status, and processing
    - Endpoints:
      - POST /api/payment/create — Create payment invoice for crypts top-up
      - GET /api/payment/status/{invoiceId} — Check payment status
      - POST /api/payment/process — Process successful payment and credit crypts
  - PaymentService (Service Class)
    - Integrates with payment provider (Xendit), creates invoices, checks status, processes payment
    - Methods: createPayment, checkPaymentStatus, processSuccessfulPayment
  - CurrencyService (Service Class)
    - Adds crypts to user account after successful payment
    - File: src/services/currency.service.ts
  - Account Entity
    - Stores crypts balance for each user
    - File: src/entities/account.entity.ts

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

### Module 7: Admin and Moderation Tools

#### 7.1 User Search, Ban, and Moderation

- **User Interface Design**
  - Admins and moderators can search for users by username, email, or filters (role, status)
  - User list displays key info: username, email, status (active/banned), role, creds, crypts, created date
  - Actions available: view profile, edit user, ban/unban user, issue warnings
  - Ban/unban actions require confirmation and a reason (for bans)
  - UI provides feedback for all moderation actions (success/error)
  - Pagination and filtering for large user lists
  - Responsive, admin-themed UI

- **Front-end component(s)**
  - UserManagement (React Component)
    - Displays user list, search/filter controls, and moderation actions
    - File: src/components/admin/UserManagement.tsx
  - BanUserModal (Modal Component)
    - Handles ban confirmation and reason input
    - File: src/components/admin/BanUserModal.tsx
  - UserEditModal (Modal Component)
    - Allows editing user details
    - File: src/components/admin/UserEditModal.tsx
  - adminService (Service Module)
    - Handles API calls for user search, ban, unban, and updates
    - File: src/services/admin.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication and user info, including role/type
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - AdminController (Express Controller)
    - Handles REST API requests for user search, ban, unban, and updates
    - Endpoints:
      - GET /api/admin/users — Paginated user search/filter
      - GET /api/admin/users/{id} — Get user details
      - PUT /api/admin/users/{id} — Update user details
      - POST /api/admin/users/{id}/ban — Ban user
      - POST /api/admin/users/{id}/unban — Unban user
  - AdminService (Service Class)
    - Implements moderation logic: search, ban, unban, update, log actions
    - Methods: getUsers, getUserById, updateUser, banUser, unbanUser
  - Account Entity
    - Stores user info, status, role/type, ban reason, etc.
    - File: src/entities/account.entity.ts
  - LogService (Service Class)
    - Logs moderation actions for audit trail
    - File: src/services/log.service.ts
  - **Security/Policy Additions**
    - All admin endpoints produce audit logs; Swagger annotations; strict role middleware; rate limiting per admin action type.

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

### Module 8: First-Time Experience

#### 8.1 Lore Video Playback

- **User Interface Design**
  - On initial login, the app detects first-time status and displays a full-screen lore video with playback controls (play/pause, skip with confirmation).
  - Skipping or completion proceeds to the interactive tutorial.
  - Handles loading states, errors (fallback image/summary), and accessibility (captions, keyboard controls).

- **Front-end component(s)**
  - **LoreVideo.tsx (React Component)**
    - Renders the lore video with controls and completion/skip callbacks.
  - **FirstTimeFlow.ts (Controller/Flow)**
    - Orchestrates first-time detection, video playback, tutorial launch, and finalization.
  - **auth.store.ts (Zustand Store)**
    - Exposes user/profile with `isFirstLogin` (or preferences flag) and mutation to set completion.
  - **profile.service.ts (Service Class)**
    - Reads/updates profile preference indicating first-time flow completion.

- **Back-end component(s)**
  - **Account/Preferences (Entity/Field)**
    - Boolean or JSON preferences flag `firstTimeComplete` (default false).
  - **Profile/Account Controller**
    - Endpoint to mark first-time flow completion.

- **Object-Oriented Components**
  - Class Diagram: LoreVideo ↔ FirstTimeFlow ↔ auth.store/profile.service.
  - Sequence Diagram: Initial login → check flag → play/skip → mark complete → launch tutorial.

#### 8.2 Interactive Tutorial

- **User Interface Design**
  - Guides new players through core mechanics (AP, hand, targeting, infrastructure) using step-by-step overlays and gated interactions.
  - Provides clear progress, ability to replay steps, and finish to unlock the main app.
  - Error/edge handling: resume from last step on refresh; accessible controls.

- **Front-end component(s)**
  - **InteractiveTutorial.tsx (React Component)**
    - Renders tutorial steps, overlays, and captures user interactions to advance steps.
  - **tutorial.steps.ts (Config/Data)**
    - Declarative step definitions and UI copy.
  - **FirstTimeFlow.ts (Controller/Flow)**
    - Transitions from video to tutorial; persists progress locally if needed.

- **Back-end component(s)**
  - Optional: persist tutorial completion server-side via profile preferences.

- **Object-Oriented Components**
  - Class Diagram: FirstTimeFlow coordinates LoreVideo and InteractiveTutorial; ProfileService updates completion flag.
  - Sequence Diagram: Tutorial step progression and completion → main app unlock.

- **Data Design**
  - Preferences extension on Account entity (JSON): `{ firstTimeComplete: boolean, tutorialVersion: string, lastStep?: number }`.

#### 7.2 Report Management

- **User Interface Design**
  - Players can submit reports about inappropriate behavior or issues (profile or chat)
  - Admins/moderators can review, filter, and search reports
  - Reports display reporter, reportee, reason, type, status, and timestamps
  - Admins/moderators can update report status (reviewed, resolved, dismissed), delete reports, and ban users from reports
  - UI provides feedback for all actions (success/error)
  - Pagination and filtering for large report lists
  - Responsive, admin-themed UI

- **Front-end component(s)**
  - ReportModal (Modal Component)
    - Allows players to submit a report with reason and details
    - File: src/components/ReportModal.tsx
  - ReportManagementPage (React Page Component)
    - Admin/moderator page for reviewing, updating, and deleting reports, and banning users
    - File: src/pages/ReportManagementPage.tsx
  - reportService (Service Module)
    - Handles API calls for submitting, fetching, updating, and deleting reports
    - File: src/services/report.service.ts
  - adminService (Service Module)
    - Used for banning users from reports
    - File: src/services/admin.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication and user info, including role/type
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - ReportController (Express Controller)
    - Handles REST API requests for report submission, review, update, and deletion
    - Endpoints:
      - POST /api/reports — Submit a report
      - GET /api/admin/reports — Get reports for admin review
      - GET /api/admin/reports/{id} — Get detailed report info
      - PUT /api/admin/reports/{id}/status — Update report status
      - DELETE /api/admin/reports/{id} — Delete a report
      - GET /api/admin/reports/stats — Get report statistics
  - ReportService (Service Class)
    - Implements report logic: create, fetch, update, delete, log actions
    - Methods: createReport, getReports, getReportById, updateReportStatus, deleteReport, getReportStats
  - Report Entity
    - Stores report data (reporter, reportee, reason, type, status, etc.)
    - File: src/entities/report.entity.ts
  - LogService (Service Class)
    - Logs report status changes and actions
    - File: src/services/log.service.ts

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 7.3 System Logs and Audit Trails

- **User Interface Design**
  - Admins and moderators can view, filter, and search system logs and audit trails
  - Logs display user, action, timestamp, and details
  - UI supports pagination, filtering by user, and searching by text
  - Log details can be viewed in a modal or detail view
  - Responsive, admin-themed UI

- **Front-end component(s)**
  - SecurityOverviewPage (React Page Component)
    - Displays logs, filtering/search controls, and pagination
    - File: src/pages/SecurityOverviewPage.tsx
  - logService (Service Module)
    - Handles API calls for fetching logs and log details
    - File: src/services/log.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication and user info, including role/type
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - LogController (Express Controller)
    - Handles REST API requests for log retrieval
    - Endpoints:
      - GET /api/logs — Get logs with pagination and filtering
      - GET /api/logs/{id} — Get specific log by ID
  - LogService (Service Class)
    - Implements log logic: create, fetch, filter, and search logs
    - Methods: createLog, getLogs, getLogById, logUserLogin, logFailedLogin, etc.
  - Log Entity
    - Stores log data (userId, text, createdAt)
    - File: src/entities/log.entity.ts
  - Account Entity
    - Stores user info for log relations
    - File: src/entities/account.entity.ts

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema

#### 7.4 User Modification

- **User Interface Design**
  - Admins and moderators can search for and select a user account
  - User details (username, email, type, status, bio, creds, crypts) are displayed in an editable form
  - Admins/mods can modify username, email, password, and other fields
  - Form validates input and checks for conflicts (duplicate email/username, invalid format)
  - UI provides feedback for all actions (success/error)
  - Responsive, admin-themed UI

- **Front-end component(s)**
  - UserManagement (React Component)
    - Displays user list and provides access to edit actions
    - File: src/components/admin/UserManagement.tsx
  - UserEditModal (Modal Component)
    - Allows editing user details (username, email, password, etc.)
    - File: src/components/admin/UserEditModal.tsx
  - adminService (Service Module)
    - Handles API calls for updating user details
    - File: src/services/admin.service.ts
  - useAuthStore (Zustand Store)
    - Provides authentication and user info, including role/type
    - File: src/store/auth.store.ts

- **Back-end component(s)**
  - AdminController (Express Controller)
    - Handles REST API requests for updating user details
    - Endpoints:
      - PUT /api/admin/users/{id} — Update user details (username, email, password, etc.)
  - AdminService (Service Class)
    - Implements logic for updating user details, validation, and logging
    - Methods: updateUser
  - Account Entity
    - Stores user info, including username, email, password (hashed), etc.
    - File: src/entities/account.entity.ts
  - LogService (Service Class)
    - Logs user modifications for audit trail
    - File: src/services/log.service.ts

- **Object-Oriented Components**
  - Class Diagram
  - Sequence Diagram

- **Data Design**
  - ERD or schema
