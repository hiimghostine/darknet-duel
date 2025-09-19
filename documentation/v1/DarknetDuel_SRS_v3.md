CEBU INSTITUTE OF TECHNOLOGY
UNIVERSITY

COLLEGE OF COMPUTER STUDIES


Software Requirements Specifications
for
Darknet Duel Web-Based Card Game


Change History

Version | Date | Description | Author
--------|------|-------------|--------
1.0 | 2025-03-11 | Initial version | Development Team


Table of Contents

1. Introduction
   1.1. Purpose
   1.2. Scope
   1.3. Definitions, Acronyms and Abbreviations
   1.4. References
2. Overall Description
   2.1. Product perspective
   2.2. User characteristics
   2.4. Constraints
   2.5. Assumptions and dependencies
3. Specific Requirements
   3.1. External interface requirements
   3.2. Functional requirements
   3.4. Non-functional requirements

1. Introduction

1.1. Purpose
- This Software Requirements Specification (SRS) document outlines the requirements for developing the Darknet Duel web-based card game
- The intended audience includes:
  * Development team members
  * Quality assurance testers
  * Project stakeholders
  * Game designers and balancing team
  * Web infrastructure specialists

1.2. Scope
- The Darknet Duel system will be a web-based card game that simulates cybersecurity battles
- The system will include:
  * Core game engine implementing card mechanics
  * Web-based user interface for card interactions
  * Lobby system for matchmaking
  * Online multiplayer functionality
  * Game state management
  * Turn-based gameplay system
  * Fixed card set (pre-defined game cards)
- The system will not include:
  * Custom card creation tools
  * Card trading or marketplace features

1.3. Definitions, Acronyms and Abbreviations
- AP: Action Points
- GUI: Graphical User Interface
- JSON: JavaScript Object Notation
- SRS: Software Requirements Specification
- API: Application Programming Interface
- Red Team: Attacker player role within a game
- Blue Team: Defender player role within a game
- Infrastructure: Game cards representing company assets
- Exploit: Card type used to create vulnerabilities
- Attack: Card type used to compromise infrastructure
- Defense: Card type used to protect infrastructure
- Response: Card type used to recover compromised infrastructure
- Lobby: Virtual waiting room where players can find matches

1.4. References
- IEEE Std 830-1998
- Darknet Duel Game Rules (readmev4.md)
- Web Socket Protocol RFC 6455
- React.js Documentation
- Spring Boot Documentation
- Java EE Documentation

2. Overall Description

2.1. Product perspective

The Darknet Duel web-based system consists of the following major modules:

Module 1: User Management and Authentication
- Transaction 1.1: User Registration
- Transaction 1.2: User Login
- Transaction 1.3: User Profile Management

Module 2: Game Lobby System
- Transaction 2.1: Lobby Creation
- Transaction 2.2: Lobby Joining

Module 3: Real-time Multiplayer Communication
- Transaction 3.1: State Synchronization
- Transaction 3.2: Disconnection Handling

Module 4: Core Game Engine
- Transaction 4.1: Turn Management
- Transaction 4.2: Game Rules Enforcement
- Transaction 4.3: Win Condition Monitoring

Module 5: Card System and Infrastructure Management
- Transaction 5.1: Card Action Processing
- Transaction 5.2: Infrastructure State Tracking
- Transaction 5.3: Game State Visualization

Module 6: Game Statistics and Result Tracking
- Transaction 6.1: Match Result Display
- Transaction 6.2: Game Performance Statistics 
- Transaction 6.3: Match History Storage

2.2. User characteristics

1. User Types:
   - Player
     * Role: Access game features, participate in matches, and manage lobbies
     * Privileges: Create/join lobbies, play games, view match history, control lobby settings, invite players
     * Actions: Register, login, find matches, create private lobbies, invite friends, manage lobby settings, play as either attacker or defender (randomly assigned)
     * Note: During gameplay, players are randomly assigned either the attacker (Red Team) or defender (Blue Team) role

2.4. Constraints

1. Technical Constraints:
   - Web-based implementation
   - React.js for frontend
   - Spring Boot for backend
   - WebSocket for real-time communication
   - Responsive design for multiple screen sizes

2. Game Design Constraints:
   - Maximum 7 cards in hand
   - 3 Action Points per turn
   - 15-round maximum game length
   - 5 infrastructure cards in play
   - Pre-defined card set (no custom cards)

3. Performance Constraints:
   - Maximum 1-second response time for card actions
   - Maximum 3-second initial load time
   - Support for minimum 1280x720 resolution
   - Maximum 2-second latency for multiplayer actions

2.5. Assumptions and dependencies

1. Assumptions:
   - Users have modern web browsers (Chrome, Firefox, Safari, Edge)
   - Users have stable internet connections
   - Users understand basic card game mechanics
   - Users understand basic cybersecurity concepts

2. Dependencies:
   - Web hosting service availability
   - WebSocket protocol support
   - Java Virtual Machine
   - Spring Boot framework
   - Database management system
   - User authentication system
   - Cross-browser compatibility

3. Specific Requirements

3.1. External interface requirements

3.1.1. Hardware interfaces
- Standard web browser rendering capabilities
- Minimum display resolution: 1280x720
- Mouse/keyboard/touch input support
- Standard audio output capability

3.1.2. Software interfaces
- Modern web browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Spring Boot REST API
- JPA/Hibernate for database interactions
- Authentication service
- Database management system

3.1.3. Communications interfaces
- RESTful API for non-real-time operations
- WebSocket protocol for real-time game state updates
- HTTPS for secure communication
- User authentication protocol

3.2. Functional requirements

Module 1: User Management and Authentication

1.1 User Registration
* Use Case Diagram: [Player] ---> [Register Account]
* Use Case Description: Allows new users to create an account with username, email, and password
* Activity Diagram:
  - User enters registration details
  - System validates input data
  - System checks for existing accounts
  - System encrypts password
  - System creates new user record
  - System generates authentication token
  - System notifies user of successful registration
* Wireframe: Registration form with fields for username, email, password, and confirmation

1.2 User Login
* Use Case Diagram: [Player] ---> [Login to Account]
* Use Case Description: Authenticates existing users to access the game platform
* Activity Diagram:
  - User enters login credentials
  - System validates credentials
  - System verifies account status
  - System generates session token
  - System redirects to main menu
* Wireframe: Login screen with username/email and password fields

1.3 User Profile Management
* Use Case Diagram: [Player] ---> [Manage Profile]
* Use Case Description: Allows users to view and edit their profile information
* Activity Diagram:
  - User requests profile view
  - System retrieves user data
  - User selects edit option
  - User modifies profile information
  - System validates changes
  - System updates user record
* Wireframe: Profile management screen with editable fields and save button

Module 2: Game Lobby System

2.1 Lobby Creation
* Use Case Diagram: [Player] ---> [Create Game Lobby]
* Use Case Description: Enables players to create a new game session for others to join
* Activity Diagram:
  - Player selects "Create Lobby" option
  - System initializes new lobby
  - System generates unique lobby identifier
  - System adds player as host
  - System displays lobby information
* Wireframe: Lobby creation screen with options for game settings

2.2 Lobby Joining
* Use Case Diagram: [Player] ---> [Join Game Lobby]
* Use Case Description: Allows players to join existing game lobbies
* Activity Diagram:
  - Player views available lobbies
  - Player selects a lobby to join
  - System verifies lobby capacity
  - System adds player to lobby
  - System notifies host and other players
* Wireframe: Lobby browser showing available game sessions with join buttons

Module 3: Real-time Multiplayer Communication

3.1 State Synchronization
* Use Case Diagram: [System] ---> [Synchronize Game States]
* Use Case Description: Ensures all players have consistent view of the game state
* Activity Diagram:
  - System receives state change from player action
  - System validates state change
  - System broadcasts update to all players
  - Client systems apply change to local game state
  - System confirms synchronization
* Wireframe: Connection status indicator showing sync state

3.2 Disconnection Handling
* Use Case Diagram: [System] ---> [Handle Player Disconnection]
* Use Case Description: Manages unexpected player disconnections to maintain game integrity
* Activity Diagram:
  - System detects connection loss
  - System pauses game state updates
  - System attempts reconnection
  - If successful, system resynchronizes game state
  - If unsuccessful, system handles forfeit/timeout
* Wireframe: Reconnection dialog with status information

Module 4: Core Game Engine

4.1 Turn Management
* Use Case Diagram: [System] ---> [Manage Turn Sequence]
* Use Case Description: Controls the flow of turns between players
* Activity Diagram:
  - System determines current player
  - System allocates action points
  - System enables player actions
  - Player performs actions or passes
  - System processes end of turn
  - System transitions to next player
* Wireframe: Turn indicator showing current player and action points

4.2 Game Rules Enforcement
* Use Case Diagram: [System] ---> [Enforce Game Rules]
* Use Case Description: Validates player actions against game rules
* Activity Diagram:
  - Player attempts action
  - System checks action validity
  - System verifies action point cost
  - System applies rule constraints
  - System either allows or rejects action
  - System updates game state accordingly
* Wireframe: Action feedback indicators showing valid/invalid moves

4.3 Win Condition Monitoring
* Use Case Diagram: [System] ---> [Check Win Conditions]
* Use Case Description: Evaluates game state to determine if win conditions are met
* Activity Diagram:
  - System calculates security points for each player
  - System checks for 10+ security points threshold
  - System compares controlled infrastructure
  - System checks turn limit (15 rounds)
  - System declares winner if conditions met
* Wireframe: Game status panel showing progress toward win conditions

Module 5: Card System and Infrastructure Management

5.1 Card Action Processing
* Use Case Diagram: [Player] ---> [Play Card]
* Use Case Description: Handles the selection and resolution of card effects
* Activity Diagram:
  - Player selects card from hand
  - Player designates target if required
  - System validates card requirements
  - System deducts action points
  - System resolves card effects
  - System updates board state
* Wireframe: Card selection interface with targeting options

5.2 Infrastructure State Tracking
* Use Case Diagram: [System] ---> [Update Infrastructure Status]
* Use Case Description: Manages the state changes of infrastructure cards
* Activity Diagram:
  - System receives infrastructure-affecting action
  - System determines new infrastructure state
  - System applies state change (secure, vulnerable, compromised, fortified)
  - System updates visual indicators
  - System recalculates security points
* Wireframe: Infrastructure cards with visual state indicators

5.3 Game State Visualization
* Use Case Diagram: [System] ---> [Render Game Board]
* Use Case Description: Provides visual representation of current game state
* Activity Diagram:
  - System processes current game state
  - System organizes visual elements
  - System renders player hands
  - System renders infrastructure cards
  - System renders UI elements (points, turn indicator)
* Wireframe: Complete game board layout showing all game elements

Module 6: Game Statistics and Result Tracking

6.1 Match Result Display
* Use Case Diagram: [System] ---> [Display Match Results]
* Use Case Description: Shows final game outcome and win condition details
* Activity Diagram:
  - System determines final game state
  - System calculates winner based on conditions
  - System generates result screen
  - System displays victory/defeat message
  - System shows specific win condition that was met
* Wireframe: Victory/defeat screen with condition explanation

6.2 Game Performance Statistics
* Use Case Diagram: [System] ---> [Generate Performance Metrics]
* Use Case Description: Calculates and displays player performance metrics
* Activity Diagram:
  - System analyzes game action history
  - System calculates key performance indicators
  - System generates visual charts and graphs
  - System displays statistics to player
* Wireframe: Statistics screen with performance charts

6.3 Match History Storage
* Use Case Diagram: [System] ---> [Store Match History]
* Use Case Description: Saves completed game data for future reference
* Activity Diagram:
  - System compiles game results and statistics
  - System formats data for storage
  - System saves to player history
  - System provides access to historical matches
  - System enables filtering and sorting options
* Wireframe: Match history browser with filtering controls

3.4 Non-functional requirements

Performance
- Card action resolution within 1 second
- Game initialization within 3 seconds
- Smooth animations (minimum 30 FPS)
- Maximum network latency of 2 seconds for real-time actions
- Support for at least 1000 concurrent users
- Database queries completed within 500ms

Security
- Secure user authentication and authorization
- HTTPS for all communications
- Protection against common web vulnerabilities (XSS, CSRF, SQL Injection)
- Validation of all game actions server-side
- Rate limiting to prevent abuse
- Secure WebSocket connections

Reliability
- 99.9% system uptime
- Automatic reconnection for temporary disconnects
- Game state persistence in case of browser refresh
- Regular database backups
- Graceful error handling
- Consistent rule enforcement
