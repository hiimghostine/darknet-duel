# Software Requirements Specification (SRS)
## for
## Darknet Duel Web-Based Card Game

---

### Change History

| Version | Date       | Description         | Author           |
|---------|------------|---------------------|------------------|
| 2.0     | 2024-06-XX | Major update to match Node.js/React/boardgame.io architecture | Development Team |

---

## Table of Contents

1. Introduction  
   1.1 Purpose  
   1.2 Scope  
   1.3 Definitions, Acronyms and Abbreviations  
   1.4 References  
2. Overall Description  
   2.1 Product Perspective  
   2.2 User Characteristics  
   2.3 Constraints  
   2.4 Assumptions and Dependencies  
3. Specific Requirements  
   3.1 External Interface Requirements  
   3.2 Functional Requirements  
   3.3 Non-Functional Requirements  
4. Appendix

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) describes the requirements for the Darknet Duel web-based card game. The document is intended to guide the development team, quality assurance testers, project stakeholders, and game designers in understanding the goals, features, and constraints of the system. The SRS aims to provide a clear and comprehensive description of the system’s intended functionality, architecture, and user experience, ensuring that all parties share a common understanding of the project’s direction and deliverables.

### 1.2 Scope
Darknet Duel is a web-based, real-time, turn-based card game with the following features:
- Core game engine (boardgame.io) for card mechanics and turn logic
- REST API backend for authentication, user management, persistence, and admin tools
- React-based frontend for all user interactions
- Lobby and matchmaking system
- Real-time multiplayer gameplay via WebSockets
- Game state management and result tracking
- In-game currency, store, and profile management
- Admin and moderator dashboards

### 1.3 Definitions, Acronyms and Abbreviations
- AP: Action Points
- JWT: JSON Web Token
- REST: Representational State Transfer
- API: Application Programming Interface
- WebSocket: Real-time communication protocol
- Red Team: Attacker role
- Blue Team: Defender role
- Infrastructure: Cards representing assets
- ELO: Rating system for player skill
- Creds/Crypts: In-game currencies

### 1.4 References

The following documents and resources are referenced in this SRS:

| Title                                         | Report Number | Date        | Publishing Organization         | Source/Location                                      |
|-----------------------------------------------|--------------|-------------|-------------------------------|------------------------------------------------------|
| boardgame.io Documentation                    | N/A          | 2024        | boardgame.io Project           | https://boardgame.io/documentation/                  |
| React.js Documentation                        | N/A          | 2024        | Meta Platforms, Inc.           | https://react.dev/                                   |
| Express.js Documentation                      | N/A          | 2024        | OpenJS Foundation              | https://expressjs.com/en/5x/api.html                               |
| MySQL Documentation                           | N/A          | 2024        | Oracle Corporation             | https://dev.mysql.com/doc/                           |
| Socket.IO Documentation                       | N/A          | 2024        | Socket.IO Project              | https://socket.io/docs/                              |
| Swagger/OpenAPI 3.0 Specification             | N/A          | 2024        | OpenAPI Initiative             | https://swagger.io/specification/                    |

---

## 2. Overall Description

### 2.1 Product Perspective

The system is composed of three main parts:

1. **Backend Server (Node.js/Express/MySQL)**
   - User authentication (JWT)
   - User management (profile, stats, currency)
   - Game result and history persistence
   - Store, purchases, and decoration management
   - Admin/moderator tools
   - REST API and WebSocket endpoints

2. **Game Server (Node.js/boardgame.io)**
   - Implements all game logic, state, and turn management
   - Handles real-time multiplayer via WebSockets
   - Synchronizes results with backend server
   - Manages lobbies, player actions, and game phases

3. **Frontend (React/TypeScript)**
   - User interface for all features (auth, lobby, game, store, admin)
   - Real-time updates via WebSockets
   - Responsive, cyberpunk-themed design
   - Role-based access (player, admin, moderator)

The system consists of the following major modules:

- **Module 1: User Management and Authentication (Backend + Frontend)**
  - Transaction 1.1: User registration (username, email, password, validation, password hashing)
  - Transaction 1.2: User login (JWT issuance, session management)
  - Transaction 1.3: Profile management (view/edit profile, avatar upload, stats)
  - Transaction 1.4: Role-based access (admin, moderator, player)

- **Module 2: Lobby and Matchmaking (Game Server + Frontend)**
  - Transaction 2.1: Lobby browser
  - Transaction 2.2: Create/join/leave lobbies
  - Transaction 2.3: Real-time lobby updates
  - Transaction 2.4: Lobby chat

- **Module 3: Real-Time Multiplayer Game (Game Server + Frontend)**
  - Transaction 3.1: Game creation and initialization
  - Transaction 3.2: Turn-based gameplay, AP allocation, card play, targeting
  - Transaction 3.3: Real-time state synchronization (boardgame.io, Socket.IO)
  - Transaction 3.4: Disconnection/reconnection handling
  - Transaction 3.5: Game state persistence and recovery

- **Module 4: Card System and Game Logic (Game Server)**
  - Transaction 4.1: Card play, targeting, and effect resolution
  - Transaction 4.2: Infrastructure state tracking (secure, vulnerable, compromised, fortified)
  - Transaction 4.3: Game rules enforcement (AP, hand size, win conditions)
  - Transaction 4.4: Game state visualization (frontend)

- **Module 5: Game Statistics and Result Tracking (Backend + Frontend)**
  - Transaction 5.1: Match result display (victory/defeat, win condition)
  - Transaction 5.2: Player performance statistics (ELO, win/loss, charts)
  - Transaction 5.3: Match history storage and browsing

- **Module 6: Store and Currency (Backend + Frontend)**
  - Transaction 6.1: In-game currency management (Creds, Crypts)
  - Transaction 6.2: Store browsing, item purchase, and application of decoration
  - Transaction 6.3: Payment integration (for top-up)

- **Module 7: Admin and Moderation Tools (Backend + Frontend)**
  - Transaction 7.1: User search, ban, and moderation
  - Transaction 7.2: Report management (submit, review, resolve)
  - Transaction 7.3: System logs and audit trails
  - Transaction 7.4: User modification (Modify username, email, password)

### 2.2 User Characteristics

**Player**
- **Role:**
  - Access game features and participate in matches
- **Privileges:**
  - Access all standard game features
  - Create and join lobbies
  - Play games as attacker or defender
  - View and edit own profile
  - View match history
  - Purchase and apply in-game items/decoration
- **Actions:**
  - Register and log in
  - Manage profile and avatar
  - Find, create, join, and leave lobbies
  - Play matches (turn-based actions, card play, etc.)
  - View statistics and match history
  - Purchase in-game currency and items

**Moderator**
- **Role:**
  - Moderates the game for unwanted behavior
- **Privileges:**
  - All player privileges
  - Access moderation tools
  - View and manage user reports
  - View system logs and audit trails
- **Actions:**
  - Search for users
  - Review and resolve reports
  - Moderate user behavior (warnings, temporary bans)
  - View and filter logs

**Admin**
- **Role:**
  - Maintains the game and watches over all activity
- **Privileges:**
  - All moderator and player privileges
  - Access admin dashboard
  - Manage user roles (promote/demote users)
  - Ban/unban users
  - Modify user accounts
- **Actions:**
  - All moderator and player actions
  - Assign or revoke roles
  - Ban or unban users
  - Edit user details

### 2.3 Constraints

**Technical Constraints**
- Web-based, responsive design (min 1280x720, primary device is Desktops and Laptops)
- Tech stack: Node.js, TypeScript, Express, MySQL, React, boardgame.io, Socket.IO
- JWT for authentication, REST for API, WebSocket for real-time communication
- Pre-defined card set (no custom/trading)
- Secure, scalable, and performant (see Non-Functional Requirements)

**Game Design Constraints**
- Maximum of 7 cards in hand
- 3 AP per turn for Defender (Blue Team), 2 AP per turn for Attacker (Red Team)
- 15 rounds maximum per game
- 5 infrastructure cards in play
- No custom card creation or trading

**Performance Constraints**
- Card action resolution < 1 second
- Game initialization < 3 seconds
- Maximum 2 seconds latency for real-time actions
- Support for 1000+ concurrent users
- Database queries < 500ms

### 2.4 Assumptions and Dependencies

- Users have modern browsers (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Web hosting and database availability
- Node.js and MySQL server environments
- Cross-browser compatibility

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 Hardware Interfaces
- Standard web browser, keyboard/mouse/touch, audio output

#### 3.1.2 Software Interfaces
- Modern browsers (Chrome 100+, Firefox 100+, Safari 14+, Edge 100+)
- REST API (Express.js)
- WebSocket (Socket.IO)
- MySQL database
- JWT authentication

#### 3.1.3 Communications Interfaces
- HTTPS for all communications
- REST API for user management, store, history, etc.
- WebSocket for real-time game state and chat

---

### 3.2 Functional Requirements

- **Module 1: User Management and Authentication (Backend + Frontend)**
  - Transaction 1.1: User registration (username, email, password, validation, password hashing)
  - Transaction 1.2: User login (JWT issuance, session management)
  - Transaction 1.3: Profile management (view/edit profile, avatar upload, stats)
  - Transaction 1.4: Role-based access (admin, moderator, player)

- **Module 2: Lobby and Matchmaking (Game Server + Frontend)**
  - Transaction 2.1: Lobby browser
  - Transaction 2.2: Create/join/leave lobbies
  - Transaction 2.3: Real-time lobby updates
  - Transaction 2.4: Lobby chat

- **Module 3: Real-Time Multiplayer Game (Game Server + Frontend)**
  - Transaction 3.1: Game creation and initialization
  - Transaction 3.2: Turn-based gameplay, AP allocation, card play, targeting
  - Transaction 3.3: Real-time state synchronization (boardgame.io, Socket.IO)
  - Transaction 3.4: Disconnection/reconnection handling
  - Transaction 3.5: Game state persistence and recovery

- **Module 4: Card System and Game Logic (Game Server)**
  - Transaction 4.1: Card play, targeting, and effect resolution
  - Transaction 4.2: Infrastructure state tracking (secure, vulnerable, compromised, fortified)
  - Transaction 4.3: Game rules enforcement (AP, hand size, win conditions)
  - Transaction 4.4: Game state visualization (frontend)

- **Module 5: Game Statistics and Result Tracking (Backend + Frontend)**
  - Transaction 5.1: Match result display (victory/defeat, win condition)
  - Transaction 5.2: Player performance statistics (ELO, win/loss, charts)
  - Transaction 5.3: Match history storage and browsing

- **Module 6: Store and Currency (Backend + Frontend)**
  - Transaction 6.1: In-game currency management (Creds, Crypts)
  - Transaction 6.2: Store browsing, item purchase, and application of decoration
  - Transaction 6.3: Payment integration (for top-up)

- **Module 7: Admin and Moderation Tools (Backend + Frontend)**
  - Transaction 7.1: User search, ban, and moderation
  - Transaction 7.2: Report management (submit, review, resolve)
  - Transaction 7.3: System logs and audit trails
  - Transaction 7.4: User modification (Modify username, email, password)

---

### 3.3 Non-Functional Requirements

**Performance**
- Card action resolution < 1s
- Game initialization < 3s
- Max 2s latency for real-time actions
- Support for 1000+ concurrent users
- Database queries < 500ms

**Security**
- JWT authentication, HTTPS everywhere
- Input validation, XSS/CSRF/SQLi protection
- Server-side validation of all game actions
- Rate limiting and abuse prevention
- Secure WebSocket connections

**Reliability**
- 99.9% uptime
- Automatic reconnection for disconnects
- Game state persistence on refresh
- Regular database backups
- Graceful error handling

---

## 4. Appendix

- For detailed API endpoints, see backend-server’s Swagger docs and API_DOCUMENTATION.md
- For game logic, see game-server’s file-by-file documentation
- For UI/UX, see frontend’s per-page markdown docs

---

**This SRS now accurately reflects the current architecture, technology, and features of the Darknet Duel project.** 