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
4. Game Mechanics
   4.1 Core Mechanics
   4.2 Player Roles
   4.3 Infrastructure System
   4.4 Card Types & Mechanics
   4.5 Advanced Mechanics
   4.6 Win Conditions & Strategy
5. Appendix
   5.1 Card Statistics
   5.2 Complete Card Lists
   5.3 Quick Reference Tables
   5.4 Additional Resources

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
| OWASP ZAP (Zed Attack Proxy)                  | N/A          | 2024        | OWASP Foundation               | https://www.zaproxy.org/                             |
| OWASP ASVS                                    | N/A          | 2024        | OWASP Foundation               | https://owasp.org/www-project-application-security-verification-standard/ |

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
   - API documentation with Swagger/OpenAPI for 100% of REST endpoints
   - Rate limiting policies to prevent abuse
   - Audit logging for administrative actions
   - Security headers (Helmet) and configured CORS policies
   - Input validation/sanitization for all inbound data
   - GDPR features (data export and deletion)
   - Session timeout and automatic logout

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
   - Global error boundaries and user-friendly error messaging
   - Toast notifications for user actions and errors
   - Offline detection and in-game handling (20s grace period)
   - First-time user lore video and interactive tutorial flow

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

- **Module 8: First-Time Experience (Frontend)**
  - Transaction 8.1: Lore video playback for first-time users
  - Transaction 8.2: Interactive tutorial flow following lore video completion

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
It is assumed that users have access to modern web browsers and stable internet connections. The system
relies on the availability of web hosting services, a MySQL database server, and the Node.js runtime
environment. The backend and game server must be able to communicate securely and reliably, and the
system must be compatible with a range of devices and screen sizes. It is also assumed that users possess a
basic understanding of card game mechanics and, ideally, some familiarity with cybersecurity concepts,
although the game is designed to be accessible to newcomers.

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

- **Module 8: First-Time Experience (Frontend)**
  - Transaction 8.1: Lore video playback for first-time users on initial login (detect first login)
  - Transaction 8.2: Interactive tutorial guiding new players through core mechanics; grants access to main game after completion

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
 - Audit logging for administrative actions
 - Security headers (Helmet) and strict CORS policies
 - GDPR features (export/deletion)
 - Session timeout and enforced automatic logout
 - CI/CD security gate: fail builds on detected vulnerabilities (e.g., ZAP)

**Reliability**
- 99.9% uptime
- Automatic reconnection for disconnects
- Game state persistence on refresh
- Regular database backups
- Graceful error handling
 - In-game offline handling with 20s grace period before stopping session

---

## 4. Game Mechanics

This section provides comprehensive documentation of the gameplay mechanics, card systems, and strategic elements of Darknet Duel.

### 4.1 Core Mechanics

#### 4.1.1 Action Points (AP)

Action Points determine how many actions a player can take per turn.

- **Attacker:** Gains **2 AP per turn** (max 10 AP)
- **Defender:** Gains **3 AP per turn** (max 10 AP)
- Most cards cost **1 AP** to play
- Wildcard cards cost **2 AP** to play
- Some special cards have variable costs

#### 4.1.2 Turn Structure

Each turn follows this sequence:

1. **Turn Start Phase**
   - Current player gains Action Points
   - Draw 2 cards (up to max hand size of 7)

2. **Action Phase**
   - Play cards by spending AP
   - Target infrastructure or opponent cards
   - Resolve card effects

3. **Reaction Phase** (if applicable)
   - Opponent can play reactive cards
   - Resolve reaction effects

4. **Turn End Phase**
   - Pass turn to opponent
   - Check win conditions

#### 4.1.3 Hand Management

- **Starting Hand:** 5 cards
- **Maximum Hand Size:** 7 cards
- **Cards Drawn Per Turn:** 2 cards
- **Free Card Cycles:** 1 per turn (discard and redraw without AP cost)

#### 4.1.4 Game Rounds

- **Maximum Rounds:** 15 rounds (30 turns total)
- **Turn Limit Win:** If max rounds reached, player controlling the most infrastructure wins
- **Immediate Win:** Control all 5 infrastructure cards

---

### 4.2 Player Roles

#### 4.2.1 Attacker (Red Team / Phoenix Net)

**Objective:** Compromise digital infrastructure through exploits and attacks.

**Advantages:**
- Goes first in most scenarios
- Offensive card variety (exploits, attacks, counter-attacks)
- Can create vulnerabilities and exploit them

**Strategy:**
- Use **Exploit** cards to create vulnerabilities
- Follow up with **Attack** cards to compromise
- Deploy **Counter-Attack** cards to disrupt defender strategies
- Leverage **Wildcard** cards for tactical flexibility

**Deck Composition (32 unique cards, duplicated to 70-card playing deck):**
- 36 Exploit cards (9 each × 4 attack vectors)
- 20 Attack cards (5 each × 4 attack vectors)
- 8 Counter-Attack cards (2 each × 4 attack vectors)
- 6 Wildcard cards
- **Total Playing Deck: 70 cards**

#### 4.2.2 Defender (Blue Team / Ghost Corp)

**Objective:** Protect infrastructure from attacker intrusions.

**Advantages:**
- Gains 3 AP per turn (vs Attacker's 2 AP)
- Larger deck (76 vs 70 cards)
- Wins ties when infrastructure control is equal
- Reactive capabilities

**Strategy:**
- Apply **Shield** cards to protect infrastructure
- Strengthen defenses with **Fortify** cards
- Recover compromised systems with **Response** cards
- Counter attacks instantly with **Reaction** cards
- Use **Wildcard** cards for ultimate flexibility

**Deck Composition (32 unique cards, duplicated to 76-card playing deck):**
- 32 Shield cards (8 each × 4 attack vectors)
- 20 Fortify cards (5 each × 4 attack vectors)
- 8 Response cards (2 each × 4 attack vectors)
- 10 Reaction cards (2 each × 4 attack vectors + 2 wildcard reactions)
- 6 Wildcard cards
- **Total Playing Deck: 76 cards**

---

### 4.3 Infrastructure System

#### 4.3.1 Infrastructure Cards

5 infrastructure cards represent the digital assets being contested:

1. **Enterprise Firewall (I001)**
   - Type: Network
   - Vulnerabilities: Network, Web
   - Critical infrastructure point

2. **Corporate Website (I003)**
   - Type: Web
   - Vulnerabilities: Web, Social
   - Public-facing system

3. **Main Database Cluster (I005)**
   - Type: Data
   - Vulnerabilities: Network, Malware
   - Core data storage

4. **Employee Workstations (I002)**
   - Type: User
   - Vulnerabilities: Social, Malware
   - User endpoint systems

5. **Financial System (I004)**
   - Type: Critical
   - Vulnerabilities: Network, Web, Social, Malware
   - High-value target

#### 4.3.2 Infrastructure States

Infrastructure cards transition through different states based on gameplay:

**Defender Path (Increasing Protection)**
```
secure → shielded → fortified 
```

**Attacker Path (Increasing Compromise)**
```
secure or fortified weaken → vulnerable → compromised
```

**State Descriptions:**
- **Secure** (Green) - Default state, no protection or vulnerabilities
- **Vulnerable** (Yellow) - Has exploits applied, ready to be attacked
- **Compromised** (Red) - Fully controlled by Attacker
- **Shielded** (Blue) - Protected by shield cards
- **Fortified** (Dark Blue) - Enhanced protection, harder to break
- **Fortified Weaken** - Fortification degrading back to secure

#### 4.3.3 Attack Vectors

Cards and infrastructure interact based on **Attack Vectors**:

- **Network** - Firewall, router, server vulnerabilities
- **Web** - Web application, API vulnerabilities
- **Social** - Phishing, social engineering attacks
- **Malware** - Virus, ransomware, trojan attacks

**Matching Rule:** A card can only target infrastructure if their attack vectors align with the infrastructure's vulnerabilities.

---

### 4.4 Card Types & Mechanics

#### 4.4.1 Attacker Card Types

**1. Exploit Cards (9 cards, 1 AP)**

*Purpose:* Create vulnerabilities in secure infrastructure, can also take-over fortified infrastructure.

*Mechanics:*
- Targets **secure** infrastructure
- Changes state from `secure` → `vulnerable`
- Must match attack vector with infrastructure vulnerabilities
- Sets up infrastructure for Attack cards
- Breaks fortification

*Examples:* Port Scanner, Packet Sniffer, Log4Shell, SQL Injection Scanner, Cross-Site Scripting, Phishing Campaign, Pretexting Call, Trojan Dropper, Macro Virus

**2. Attack Cards (8 cards, 1 AP)**

*Purpose:* Compromise vulnerable infrastructure.

*Mechanics:*
- Targets **vulnerable** infrastructure only
- Changes state from `vulnerable` → `compromised`
- Must match attack vector with infrastructure vulnerabilities
- Grants control to Attacker

*Examples:* DDoS Attack, Man-in-the-Middle, SQL Injection Attack, Credential Stuffing, Spear Phishing Attack, Baiting Attack, Ransomware Deployment, Keylogger Installation

**3. Counter-Attack Cards (8 cards, 1 AP)**

*Purpose:* Disrupt Defender strategies.

*Mechanics:*
- Can be played reactively during Defender's turn
- Cancels or reverses Defender card effects
- Some prevent reactions or responses
- Tactical disruption tools

*Examples:* Security Service Terminator, Anti-Forensics Toolkit, WAF Bypasser, Supply Chain Compromise, Social Engineer, Deepfake Caller, Polymorphic Code, Zero-Day Exploit

**4. Attacker Wildcard Cards (7 cards, 2 AP)**

*Purpose:* Ultimate tactical flexibility.

*Mechanics:*
- Can be played as any Attacker card type
- Costs 2 AP (double normal cost)
- Changes state depending on the infrastructure state (Exploit or Attack)
- Some have special effects

*Examples:* Advanced Persistent Threat, Living Off The Land, Lateral Movement, Privilege Escalation, Multi-Stage Malware, AI-Powered Attack, Memory Corruption Attack

#### 4.4.2 Defender Card Types

**1. Shield Cards (4 cards, 1 AP)**

*Purpose:* Protect infrastructure from specific attack vectors.

*Mechanics:*
- Targets **secure** or **vulnerable** infrastructure
- Changes state to `shielded`
- Protects against specific attack vectors
- Can stack multiple shields on same infrastructure
- Blocks matching exploits and attacks

*Examples:* Firewall, Network Monitoring, WAF Implementation, Security Awareness, Antivirus Protection

**2. Fortify Cards (8 cards, 1 AP)**

*Purpose:* Strengthen shielded infrastructure.

*Mechanics:*
- Targets **shielded** infrastructure only
- Changes state from `shielded` → `fortified`
- Provides enhanced protection
- Must match defense vector with existing shields
- Makes infrastructure harder to compromise

*Examples:* DMZ Implementation, Network Segmentation, HTTPS Everywhere, API Gateway, Access Control Policy, Security Culture, Application Whitelisting, System Hardening

**3. Response Cards (8 cards, 1 AP)**

*Purpose:* Recover compromised infrastructure.

*Mechanics:*
- Targets **compromised** infrastructure only
- Changes state from `compromised` → `secure`
- Restoration and recovery mechanism
- Must match vector with infrastructure type
- Returns control to neutral state

*Examples:* Incident Response Team, Digital Forensics, Vulnerability Patching, Content Security Policy, Password Reset, Security Audit, System Restore, Malware Removal

**4. Reaction Cards (5 cards, 1 AP)**

*Purpose:* Instant responses during Attacker's turn.

*Mechanics:*
- Can be played out of turn (reactive)
- Interrupts Attacker actions
- Protects vulnerable infrastructure instantly
- Some counter specific attack types
- Defender's trump cards

*Examples:* Intrusion Detection, Input Validation, Phishing Defense, Endpoint Detection

**5. Defender Wildcard Cards (7 cards, 2-4 AP)**

*Purpose:* Ultimate defensive flexibility.

*Mechanics:*
- Can be played as any Defender card type
- Costs 2 AP (double normal cost)
- Changes state depending on the infrastructure state (Shield or Fortify)
- Some have special effects

*Examples:* Advanced Threat Defense, Threat Intelligence Network, Emergency Response Team (3 AP), Security Automation Suite, Defensive Hardening Protocol, Honeypot Network, Incident Containment Protocol (4 AP, reactive)

---

### 4.5 Advanced Mechanics

#### 4.5.1 Wildcard System

**Wildcard cards** provide maximum flexibility but cost double AP.

**Playing Wildcards:**
1. Select wildcard card from hand
2. Choose target infrastructure
5. Card automatically resolves as chosen type or have a specific type

**Wildcard Types:**
- **"any"** - Can become any card type (Exploit or Attack and Shield or Fortify)
#### 4.5.2 Chain Effects

Some cards create **chain effects** that affect multiple infrastructure cards.

**Chain Mechanics:**
1. Play chain effect card
2. Primary target is affected
3. Player chooses additional targets from available options
4. Effect spreads to connected infrastructure
5. Creates cascading state changes

**Example Cards:** Lateral Movement
#### 4.5.3 Hand Disruption

Certain cards allow players to see and disrupt opponent's hand.

**Disruption Mechanics:**
- Reveal opponent's hand
- Force discards
- Gain tactical information
- Prevent specific plays

**Example Cards:** Honeypot Network

#### 4.5.4 Temporary Effects

Some cards create **temporary effects** that persist for multiple turns.

**Effect Types:**
- Prevent Reactions - Opponent cannot play reactive cards
- Cost Reduction - Cards cost less AP
- Temporary Tax - Additional costs for actions
**Duration:** Typically 1-3 turns or until specific condition met

#### 4.5.5 Persistent Effects

**Persistent effects** watch for state changes and trigger automatically.

**Trigger Conditions:**
- On infrastructure compromise

**Rewards:**
- Gain Action Points
- Gain resources

---

### 4.6 Win Conditions & Strategy

#### 4.6.1 Win Conditions

**Immediate Victory**
- **Control All Infrastructure:** Compromise all 5 infrastructure cards
- Attacker achieves this by compromising all infrastructure or Defender fortifying all infrastructure
- Game ends immediately

**Turn Limit Victory**
- **After 15 Rounds (30 turns):** Player controlling the most infrastructure wins
- **Control Calculation:**
  - Attacker Controls: Compromised infrastructure
  - Defender Controls: Secure, Shielded, or Fortified infrastructure
  - Contested: Vulnerable infrastructure (neither player controls)
- **Tiebreaker:** If infrastructure control is equal, **Defender wins**

#### 4.6.2 Victory Strategies

**Attacker Victory Paths:**
1. **Aggressive Rush** - Quick exploits and attacks early game
2. **Resource Denial** - Disrupt Defender's AP and cards
4. **Wildcard Dominance** - Use flexible cards for unpredictable plays

**Defender Victory Paths:**
1. **Fortification Wall** - Build strong defenses early
2. **Reactive Defense** - Save reactions for key attacks
3. **Resource Advantage** - Leverage 3 AP per turn efficiently
4. **Recovery Focus** - Quickly restore compromised systems

#### 4.6.3 Game Balance

**Asymmetric Balance**

The game is intentionally asymmetric with different advantages:

*Attacker Advantages:*
- Goes first
- Initiates actions
- Can choose targets
- Surprise factor

*Defender Advantages:*
- More Action Points (3 vs 2)
- Larger deck (76 vs 70)
- Wins ties
- Reactive capabilities

**Resource Management**

Efficient AP usage is critical:
- Don't waste AP - Plan full turns
- Save for reactions - Keep 1-2 AP for defense
- Wildcard timing - Use 2 AP cards wisely
- Card cycling - Use free cycles strategically

**Information Warfare**

Managing hidden information:
- Hand contents - Hidden from opponent
- Deck composition - Predictable but uncertain
- Bluffing - Holding reactive cards as deterrents
- Tempo - Controlling game pace

---

## 5. Appendix

### 5.1 Card Statistics

#### 5.1.1 Card Distribution Summary

| Card Type | Attacker (Unique) | Attacker (Playing Deck) | Defender (Unique) | Defender (Playing Deck) | Cost (AP) | Reactive |
|-----------|-------------------|-------------------------|-------------------|-------------------------|-----------|----------|
| Exploit | 9 | 36 | - | - | 1 | No |
| Attack | 8 | 20 | - | - | 1 | No |
| Counter-Attack | 8 | 8 | - | - | 1 | Yes |
| Shield | - | - | 4 | 32 | 1 | No |
| Fortify | - | - | 8 | 20 | 1 | No |
| Response | - | - | 8 | 8 | 1 | No |
| Reaction | - | - | 5 | 10 | 1 | Yes |
| Wildcard | 7 | 6 | 7 | 6 | 2-4 | Varies |
| **Total** | **32** | **70** | **32** | **76** | - | - |

#### 5.1.2 Attack Vector Distribution

**Network Vector Cards**
- **Attacker:** Port Scanner (A001), Packet Sniffer (A002), Log4Shell (A003), DDoS Attack (A101), Man-in-the-Middle (A102), Security Service Terminator (A201), Anti-Forensics Toolkit (A202)
- **Defender:** Firewall (D001), Intrusion Detection (D002), Network Monitoring (D003), DMZ Implementation (D101), Network Segmentation (D102), Incident Response Team (D201), Digital Forensics (D202)

**Web Vector Cards**
- **Attacker:** SQL Injection Scanner (A004), Cross-Site Scripting (A005), SQL Injection Attack (A103), Credential Stuffing (A104), WAF Bypasser (A203), Supply Chain Compromise (A204)
- **Defender:** WAF Implementation (D004), Input Validation (D005), HTTPS Everywhere (D103), API Gateway (D104), Vulnerability Patching (D203), Content Security Policy (D204)

**Social Vector Cards**
- **Attacker:** Phishing Campaign (A006), Pretexting Call (A007), Spear Phishing Attack (A105), Baiting Attack (A106), Social Engineer (A205), Deepfake Caller (A206)
- **Defender:** Security Awareness (D006), Phishing Defense (D007), Access Control Policy (D105), Security Culture (D106), Password Reset (D205), Security Audit (D206)

**Malware Vector Cards**
- **Attacker:** Trojan Dropper (A008), Macro Virus (A009), Ransomware Deployment (A107), Keylogger Installation (A108), Polymorphic Code (A207), Zero-Day Exploit (A208)
- **Defender:** Antivirus Protection (D008), Endpoint Detection (D009), Application Whitelisting (D107), System Hardening (D108), System Restore (D207), Malware Removal (D208)

---

### 5.2 Complete Card Lists

#### 5.2.1 Attacker Deck (32 Cards)

**Exploit Cards (9)**
- **A001** - Port Scanner (Network): Identifies open network services
- **A002** - Packet Sniffer (Network): Captures and analyzes network traffic
- **A003** - Log4Shell (Network): Remote code execution in Java logging
- **A004** - SQL Injection Scanner (Web): Exploits cross-site scripting vulnerabilities
- **A005** - Cross-Site Scripting (Web): Injects malicious scripts into websites
- **A006** - Phishing Campaign (Social): Creates fake login pages to steal credentials
- **A007** - Pretexting Call (Social): Gains access through help desk social engineering
- **A008** - Trojan Dropper (Malware): Delivers malicious payload disguised as legitimate software
- **A009** - Macro Virus (Malware): Delivers malware through email attachments

**Attack Cards (8)**
- **A101** - DDoS Attack (Network): Floods target with traffic to disrupt service
- **A102** - Man-in-the-Middle (Network): Intercepts and alters communications
- **A103** - SQL Injection Attack (Web): Executes unauthorized database commands
- **A104** - Credential Stuffing (Web): Uses stolen credentials to gain unauthorized access
- **A105** - Spear Phishing Attack (Social): Targeted phishing against specific individuals
- **A106** - Baiting Attack (Social): Uses physical media to spread malware
- **A107** - Ransomware Deployment (Malware): Encrypts data and demands payment
- **A108** - Keylogger Installation (Malware): Records keystrokes to steal credentials

**Counter-Attack Cards (8)**
- **A201** - Security Service Terminator (Network): Kills security processes and services
- **A202** - Anti-Forensics Toolkit (Network): Removes evidence of intrusion
- **A203** - WAF Bypasser (Web): Circumvents web application firewalls
- **A204** - Supply Chain Compromise (Web): Attacks through trusted third-party connections
- **A205** - Social Engineer (Social): Manipulates security personnel
- **A206** - Deepfake Caller (Social): Uses AI-generated voice to impersonate executives
- **A207** - Polymorphic Code (Malware): Changes signature to avoid detection
- **A208** - Zero-Day Exploit (Malware): Uses unknown vulnerability

**Wildcard Cards (7)**
- **A301** - Advanced Persistent Threat (2 AP): Can be played as any Exploit or Attack, prevents reactions for 1 turn
- **A302** - Living Off The Land (2 AP): Can be played as any card type, FREE when targeting User Systems
- **A303** - Lateral Movement (2 AP): After compromising infrastructure, immediately make another vulnerable
- **A304** - Privilege Escalation (2 AP): Can be played as Attack, prevents restore for 1 turn
- **A305** - Multi-Stage Malware (2 AP): Can be played as Exploit, gain 1 AP on compromise
- **A306** - AI-Powered Attack (2 AP): Can be played as any type, look at top 3 cards and draw 1
- **A307** - Memory Corruption Attack (2 AP): Opponent discards entire hand and redraws

#### 5.2.2 Defender Deck (32 Cards)

**Shield Cards (4)**
- **D001** - Firewall (Network): Blocks unauthorized network access
- **D003** - Network Monitoring (Network): Continuous traffic analysis
- **D004** - WAF Implementation (Web): Web Application Firewall protection
- **D006** - Security Awareness (Social): Staff training against social engineering
- **D008** - Antivirus Protection (Malware): Detects and removes malicious software

**Reaction Cards (5)**
- **D002** - Intrusion Detection (Network): Monitors network for suspicious activity (Reactive)
- **D005** - Input Validation (Web): Ensures data meets expected formats (Reactive)
- **D007** - Phishing Defense (Social): Email filtering and user education (Reactive)
- **D009** - Endpoint Detection (Malware): Real-time device monitoring (Reactive)

**Fortify Cards (8)**
- **D101** - DMZ Implementation (Network): Creates secure network boundary
- **D102** - Network Segmentation (Network): Divides network into isolated sections
- **D103** - HTTPS Everywhere (Web): Enforces encrypted connections
- **D104** - API Gateway (Web): Centralized API management and security
- **D105** - Access Control Policy (Social): Enforces principle of least privilege
- **D106** - Security Culture (Social): Creates organization-wide security mindset
- **D107** - Application Whitelisting (Malware): Only allows approved software to run
- **D108** - System Hardening (Malware): Removes unnecessary services and features

**Response Cards (8)**
- **D201** - Incident Response Team (Network): Specialized security breach handlers
- **D202** - Digital Forensics (Network): Technical investigation of breaches
- **D203** - Vulnerability Patching (Web): Fixes security flaws in applications
- **D204** - Content Security Policy (Web): Restricts allowed content sources
- **D205** - Password Reset (Social): Forces new credentials after breach
- **D206** - Security Audit (Social): Comprehensive security assessment
- **D207** - System Restore (Malware): Reverts system to known good state
- **D208** - Malware Removal (Malware): Eliminates malicious code

**Wildcard Cards (7)**
- **D301** - Advanced Threat Defense (2 AP): Can be played as Shield or Fortify, prevents reactive attacks for 1 turn
- **D302** - Threat Intelligence Network (2 AP): Can be played as any type, view attacker hand and force discard 2, draw 1
- **D303** - Emergency Response Team (3 AP): Restore ALL compromised infrastructure, once per game
- **D304** - Security Automation Suite (2 AP): After shielding/fortifying, immediately shield another
- **D305** - Defensive Hardening Protocol (2 AP): Can be played as Shield or Fortify, prevents exploits for 1 turn
- **D306** - Honeypot Network (2 AP): Can be played as any type, attacker must discard 1 extra card when exploiting for 2 turns
- **D307** - Incident Containment Protocol (4 AP, Reactive): Can be played as Response, immediately restore and shield

---

### 5.3 Quick Reference Tables

#### 5.3.1 Card Play Sequence
1. Select card from hand
2. Check AP cost and availability
3. Enter target mode
4. Select valid target (infrastructure)
5. Confirm action
6. Opponent reaction window (if applicable)
7. Resolve card effects
8. Update game state

#### 5.3.2 Common Card Interactions

| Attacker Action | Defender Response | Result |
|-----------------|-------------------|--------|
| Exploit Secure Infrastructure | No response | Infrastructure becomes Vulnerable |
| Exploit Secure Infrastructure | Play Reaction card | Exploit cancelled, infrastructure stays Secure |
| Attack Vulnerable Infrastructure | No response | Infrastructure becomes Compromised |
| Play Counter-Attack on Shielded | Remove shield | Infrastructure returns to Secure |
| - | Shield Secure Infrastructure | Infrastructure becomes Shielded |
| - | Fortify Shielded Infrastructure | Infrastructure becomes Fortified |
| - | Response Compromised Infrastructure | Infrastructure returns to Secure |

#### 5.3.3 State Transition Table

| Current State | Attacker Cards | Defender Cards | Result State |
|---------------|----------------|----------------|--------------|
| Secure | Exploit | Shield | Vulnerable or Shielded |
| Vulnerable | Attack | Reaction | Compromised or stays Vulnerable |
| Vulnerable | - | Response | Secure |
| Compromised | - | Response | Secure |
| Shielded | Counter-Attack | Fortify | Secure or Fortified |
| Fortified | Counter-Attack (strong) | - | Shielded or Vulnerable |

---

### 5.4 Additional Resources

- For detailed API endpoints, see backend-server's Swagger docs and API_DOCUMENTATION.md
- For game logic, see game-server's file-by-file documentation
- For UI/UX, see frontend's per-page markdown docs
- For WebSocket protocols, see game-server's connection protocol documentation
- Swagger/OpenAPI setup is located at backend-server/src/config/swagger.ts (with route/controller annotations)
- **Tutorial Scripts:** See darknet-duel-frontend/src/data/tutorialScripts.ts
- **Card Type Definitions:** See shared-types/card.types.ts
- **Game State Types:** See shared-types/game.types.ts

---
