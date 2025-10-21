# Darknet Duel - Gameplay Mechanics & Card Appendix

## Table of Contents
1. [Game Overview](#game-overview)
2. [Core Mechanics](#core-mechanics)
3. [Player Roles](#player-roles)
4. [Infrastructure System](#infrastructure-system)
5. [Cards Reference](#cards-reference)
6. [Win Conditions & Strategy](#win-conditions--strategy)

---

## Game Overview

**Darknet Duel** is a turn-based, cybersecurity-themed card game where two players compete to control digital infrastructure. One player assumes the role of the **Attacker (Red Team)**, attempting to compromise systems, while the other plays as the **Defender (Blue Team)**, protecting infrastructure from digital threats.

### Key Features
- **Turn-based gameplay** with Action Point (AP) system
- **5 Infrastructure cards** as the central battlefield
- **146 total cards** (70 Attacker, 76 Defender)
- **Real-time multiplayer** via WebSockets
- **Strategic depth** with wildcards, chain effects, and special abilities

---

## Core Mechanics

### Action Points (AP)

Action Points determine how many actions a player can take per turn.

- **Attacker:** Gains **2 AP per turn** (max 10 AP)
- **Defender:** Gains **3 AP per turn** (max 10 AP)
- Most cards cost **1 AP** to play
- Wildcard cards cost **2 AP** to play
- Some special cards have variable costs

### Turn Structure

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

### Hand Management

- **Starting Hand:** 5 cards
- **Maximum Hand Size:** 7 cards
- **Cards Drawn Per Turn:** 2 cards
- **Free Card Cycles:** 1 per turn (discard and redraw without AP cost)

### Game Rounds

- **Maximum Rounds:** 15 rounds (30 turns total)
- **Turn Limit Win:** If max rounds reached, player controlling the most infrastructure wins
- **Immediate Win:** Control all 5 infrastructure cards

---

## Player Roles

### Attacker (Red Team / Phoenix Net)

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

**Deck Composition:**
- 36 Exploit cards
- 20 Attack cards
- 8 Counter-Attack cards
- 6 Wildcard cards
- **Total: 70 cards**

### Defender (Blue Team / Ghost Corp)

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

**Deck Composition:**
- 32 Shield cards
- 20 Fortify cards
- 8 Response cards
- 10 Reaction cards
- 6 Wildcard cards
- **Total: 76 cards**

---

## Infrastructure System

### Infrastructure Cards

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

### Infrastructure States

Infrastructure cards transition through different states based on gameplay:

#### Defender Path (Increasing Protection)
```
secure → shielded → fortified → fortified_weaken → secure
```

#### Attacker Path (Increasing Compromise)
```
secure → vulnerable → compromised
```

#### State Descriptions

- **Secure** (Green) - Default state, no protection or vulnerabilities
- **Vulnerable** (Yellow) - Has exploits applied, ready to be attacked
- **Compromised** (Red) - Fully controlled by Attacker
- **Shielded** (Blue) - Protected by shield cards
- **Fortified** (Dark Blue) - Enhanced protection, harder to break
- **Fortified Weaken** - Fortification degrading back to secure

### Attack Vectors

Cards and infrastructure interact based on **Attack Vectors**:

- **Network** - Firewall, router, server vulnerabilities
- **Web** - Web application, API vulnerabilities
- **Social** - Phishing, social engineering attacks
- **Malware** - Virus, ransomware, trojan attacks

**Matching Rule:** A card can only target infrastructure if their attack vectors align with the infrastructure's vulnerabilities.

---

## Cards Reference

This section covers all card types, mechanics, statistics, and advanced systems.

### Card Types & Mechanics

### Attacker Card Types

#### 1. Exploit Cards (36 cards, 1 AP)

**Purpose:** Create vulnerabilities in secure infrastructure.

**Mechanics:**
- Targets **secure** infrastructure
- Changes state from `secure` → `vulnerable`
- Must match attack vector with infrastructure vulnerabilities
- Sets up infrastructure for Attack cards

**Examples:**
- **SQL Injection** (Network) - Exploits database vulnerabilities
- **Log4Shell** (Network) - Critical logging vulnerability
- **Buffer Overflow** (Network) - Memory corruption exploit
- **XSS Attack** (Web) - Cross-site scripting
- **Phishing Campaign** (Social) - Social engineering
- **Zero-Day Exploit** (Malware) - Unknown vulnerability

#### 2. Attack Cards (20 cards, 1 AP)

**Purpose:** Compromise vulnerable infrastructure.

**Mechanics:**
- Targets **vulnerable** infrastructure only
- Changes state from `vulnerable` → `compromised`
- Must match attack vector with infrastructure vulnerabilities
- Grants control to Attacker

**Examples:**
- **DDoS Attack** (Network) - Distributed denial of service
- **Ransomware** (Malware) - Data encryption attack
- **Directory Traversal** (Web) - File system access
- **Credential Stuffing** (Social) - Stolen credential attack

#### 3. Counter-Attack Cards (8 cards, 1 AP)

**Purpose:** Disrupt Defender strategies.

**Mechanics:**
- Can be played reactively during Defender's turn
- Cancels or reverses Defender card effects
- Some prevent reactions or responses
- Tactical disruption tools

**Examples:**
- **Shield Breaker** - Removes shields from infrastructure
- **Fortification Bypass** - Negates fortification
- **Reaction Jammer** - Prevents reactive plays
- **Social Engineer** - Breaks through social defenses

#### 4. Attacker Wildcard Cards (6 cards, 2 AP)

**Purpose:** Ultimate tactical flexibility.

**Mechanics:**
- Can be played as any Attacker card type
- Costs 2 AP (double normal cost)
- Player chooses card type when playing
- Some have special effects

**Examples:**
- **Zero-Day Toolkit** - Any exploit or attack
- **APT Suite** - Advanced persistent threat tools
- **Polymorphic Malware** - Adaptive attack capability

---

### Defender Card Types

#### 1. Shield Cards (32 cards, 1 AP)

**Purpose:** Protect infrastructure from specific attack vectors.

**Mechanics:**
- Targets **secure** or **vulnerable** infrastructure
- Changes state to `shielded`
- Protects against specific attack vectors
- Can stack multiple shields on same infrastructure
- Blocks matching exploits and attacks

**Examples:**
- **Firewall** (Network) - Blocks network attacks
- **Antivirus** (Malware) - Prevents malware infections
- **WAF (Web Application Firewall)** (Web) - Protects web apps
- **Security Training** (Social) - Prevents social engineering
- **IDS/IPS** (Network) - Intrusion detection/prevention
- **Access Control** (Network) - Authentication barriers

#### 2. Fortify Cards (20 cards, 1 AP)

**Purpose:** Strengthen shielded infrastructure.

**Mechanics:**
- Targets **shielded** infrastructure only
- Changes state from `shielded` → `fortified`
- Provides enhanced protection
- Must match defense vector with existing shields
- Makes infrastructure harder to compromise

**Examples:**
- **Network Segmentation** (Network) - Isolates critical systems
- **Multi-Factor Authentication** (Social) - Adds authentication layer
- **Backup Systems** (Network) - Redundancy protection
- **DMZ Implementation** (Network) - Demilitarized zone
- **Security Audit** (Any) - Comprehensive security review

#### 3. Response Cards (8 cards, 1 AP)

**Purpose:** Recover compromised infrastructure.

**Mechanics:**
- Targets **compromised** infrastructure only
- Changes state from `compromised` → `secure`
- Restoration and recovery mechanism
- Must match vector with infrastructure type
- Returns control to neutral state

**Examples:**
- **Incident Response Team** (Network) - Emergency response
- **System Restore** (Any) - Rollback to clean state
- **Forensic Analysis** (Any) - Investigation and cleanup
- **Emergency Protocol** (Critical) - Crisis management

#### 4. Reaction Cards (10 cards, 1 AP)

**Purpose:** Instant responses during Attacker's turn.

**Mechanics:**
- Can be played out of turn (reactive)
- Interrupts Attacker actions
- Protects vulnerable infrastructure instantly
- Some counter specific attack types
- Defender's trump cards

**Examples:**
- **Threat Detection** - Identifies attacks in progress
- **Real-time Blocking** - Immediate attack prevention
- **Emergency Shutdown** - Isolates threatened systems
- **Phishing Defense** (Social) - Counters social attacks
- **Alert Systems** - Automated threat response

#### 5. Defender Wildcard Cards (6 cards, 2 AP)

**Purpose:** Ultimate defensive flexibility.

**Mechanics:**
- Can be played as any Defender card type
- Costs 2 AP (double normal cost)
- Player chooses card type when playing
- Some have special effects

**Examples:**
- **Security Operations Center** - Any defense type
- **Quantum Encryption** - Unbreakable protection
- **AI Security System** - Adaptive defense

### Card Statistics Summary

| Card Type | Attacker Count | Defender Count | Cost (AP) | Reactive |
|-----------|----------------|----------------|-----------|----------|
| Exploit | 36 | - | 1 | No |
| Attack | 20 | - | 1 | No |
| Counter-Attack | 8 | - | 1 | Yes |
| Shield | - | 32 | 1 | No |
| Fortify | - | 20 | 1 | No |
| Response | - | 8 | 1 | No |
| Reaction | - | 10 | 1 | Yes |
| Wildcard | 6 | 6 | 2 | Varies |
| **Total** | **70** | **76** | - | - |

### Attack Vector Distribution

#### Network Vector Cards
- **Attacker:** SQL Injection, Buffer Overflow, Port Scanning, Privilege Escalation, Man-in-the-Middle, DNS Poisoning, ARP Spoofing, Session Hijacking, Packet Sniffing, DDoS Attack
- **Defender:** Firewall, IDS/IPS, Network Segmentation, DMZ Implementation, VPN Protection, SIEM System

#### Web Vector Cards
- **Attacker:** XSS Attack, CSRF Attack, Directory Traversal, SQL Injection (Web), Command Injection, File Upload Exploit, API Abuse
- **Defender:** WAF, Input Validation, Content Security Policy, Rate Limiting, API Gateway

#### Social Vector Cards
- **Attacker:** Phishing Campaign, Spear Phishing, Pretexting, Baiting, Quid Pro Quo, Tailgating, Credential Stuffing
- **Defender:** Security Training, Email Filtering, Phishing Defense, User Awareness, Access Control

#### Malware Vector Cards
- **Attacker:** Ransomware, Trojan, Rootkit, Keylogger, Worm, Botnet, Spyware, Adware
- **Defender:** Antivirus, Anti-Malware, Sandbox, Patch Management, Application Whitelisting

### Advanced Mechanics

#### Wildcard System

**Wildcard cards** provide maximum flexibility but cost double AP.

**Playing Wildcards:**
1. Select wildcard card from hand
2. Choose target infrastructure
3. Game presents available card type options
4. Player selects desired card type
5. Card resolves as chosen type

**Wildcard Types:**
- **"any"** - Can become any card type
- **"exploit-attack"** - Can become Exploit or Attack
- **"shield_or_fortify"** - Can become Shield or Fortify
- **Special wildcards** - Have unique abilities

#### Chain Effects

Some cards create **chain effects** that affect multiple infrastructure cards.

**Chain Mechanics:**
1. Play chain effect card
2. Primary target is affected
3. Player chooses additional targets from available options
4. Effect spreads to connected infrastructure
5. Creates cascading state changes

**Example Cards:**
- **Lateral Movement** - Spreads vulnerabilities to adjacent infrastructure
- **Zero-Day Worm** - Propagates malware across network
- **Security Cascade** - Extends shields to multiple systems

#### Hand Disruption

Certain cards allow players to see and disrupt opponent's hand.

**Disruption Mechanics:**
- Reveal opponent's hand
- Force discards
- Gain tactical information
- Prevent specific plays

**Example Cards:**
- **Information Warfare** - View opponent hand and force discard
- **Honeypot Network** - Tax opponent for playing cards
- **Crypto Mining Malware** - Disrupt opponent resources

#### Temporary Effects

Some cards create **temporary effects** that persist for multiple turns.

**Effect Types:**
- **Prevent Reactions** - Opponent cannot play reactive cards
- **Cost Reduction** - Cards cost less AP
- **Restrict Targeting** - Limit valid targets
- **Quantum Protection** - Immune to specific attacks
- **Temporary Tax** - Additional costs for actions
- **Maintenance Cost** - Ongoing AP drain

**Duration:** Typically 1-3 turns or until specific condition met

#### Persistent Effects

**Persistent effects** watch for state changes and trigger automatically.

**Trigger Conditions:**
- On infrastructure compromise
- On infrastructure vulnerability
- On infrastructure restore
- On shield application
- On fortification

**Rewards:**
- Gain Action Points
- Draw cards
- Gain resources
- Trigger secondary effects

**Example:**
- Card with "on_compromise" effect grants +1 AP when any infrastructure is compromised

#### Special Abilities

**Prerequisites**
Some cards require specific conditions to be met:
- Infrastructure in specific state
- Other cards in play
- Resource thresholds
- Turn number requirements

**Card Synergies**
Cards can combo with each other:
- **Exploit + Attack chains** - Exploit then immediately attack
- **Shield + Fortify combos** - Progressive defense building
- **Counter chains** - Multiple disruptions in sequence

**Draw Effects**
Cards that let you draw additional cards:
- `draw: 2` - Draw 2 cards when played
- `lookAt: 3` - Look at top 3 cards of deck

### Complete Card Lists

#### Attacker Deck (70 Cards)

**Exploit Cards (36)**
- **Network Exploits (12):** SQL Injection, Buffer Overflow, Port Scanning, Privilege Escalation, Man-in-the-Middle, DNS Poisoning, ARP Spoofing, Session Hijacking, Packet Sniffing, Log4Shell, Network Reconnaissance, Protocol Exploit
- **Web Exploits (10):** XSS Attack, CSRF Attack, Directory Traversal, Command Injection, File Upload Exploit, API Abuse, Deserialization, Cookie Manipulation, Path Traversal, Broken Authentication
- **Social Exploits (8):** Phishing Campaign, Spear Phishing, Pretexting, Baiting, Quid Pro Quo, Tailgating, Vishing, Smishing
- **Malware Exploits (6):** Zero-Day Exploit, Backdoor Installation, Logic Bomb, Time Bomb, Easter Egg Exploit, Firmware Exploit

**Attack Cards (20)**
- **Network Attacks (6):** DDoS Attack, Smurf Attack, Fragmentation Attack, SYN Flood, Ping of Death, Land Attack
- **Web Attacks (5):** Drive-by Download, Clickjacking, Frame Injection, Request Smuggling, Cache Poisoning
- **Social Attacks (4):** Credential Stuffing, Password Spraying, Brute Force, Dictionary Attack
- **Malware Attacks (5):** Ransomware, Trojan, Rootkit, Keylogger, Worm

**Counter-Attack Cards (8)**
Shield Breaker, Fortification Bypass, Reaction Jammer, Social Engineer, Defense Disruptor, Information Warfare, Resource Drain, Chaos Injection

**Wildcard Cards (6)**
Zero-Day Toolkit, APT Suite, Polymorphic Malware, Hybrid Threat, Adaptive Exploit, Universal Backdoor

#### Defender Deck (76 Cards)

**Shield Cards (32)**
- **Network Shields (12):** Firewall, IDS/IPS, Network Monitor, Packet Filter, Port Security, VLAN Segmentation, Access List, Border Gateway Protection, Network Tap, Baseline Security, Honeypot, DMZ Layer
- **Web Shields (8):** WAF, Input Validation, Output Encoding, Content Security Policy, CORS Protection, Rate Limiting, API Gateway, Session Management
- **Social Shields (8):** Security Training, Email Filter, Phishing Defense, User Awareness, MFA Prompt, Access Verification, Badge System, Background Checks
- **Malware Shields (4):** Antivirus, Anti-Malware, EDR (Endpoint Detection), Application Control

**Fortify Cards (20)**
- **Network Fortify (8):** Network Segmentation, DMZ Implementation, VPN Protection, Zero Trust Architecture, Microsegmentation, Air Gap, Network Redundancy, Secure Routing
- **Web Fortify (4):** API Hardening, Certificate Pinning, HSTS Implementation, Secure Cookie Config
- **Social Fortify (4):** Multi-Factor Authentication, Privilege Management, Least Privilege, Role-Based Access
- **System Fortify (4):** Backup Systems, Disaster Recovery, Business Continuity, Failover Systems

**Response Cards (8)**
Incident Response Team, System Restore, Forensic Analysis, Emergency Protocol, Containment Procedure, Eradication Process, Recovery Operation, Post-Incident Review

**Reaction Cards (10)**
Threat Detection, Real-time Blocking, Emergency Shutdown, Alert System, Automated Response, Threat Intelligence, Behavioral Analysis, Anomaly Detection, Signature Match, Heuristic Analysis

**Wildcard Cards (6)**
Security Operations Center, Quantum Encryption, AI Security System, Adaptive Defense, Universal Shield, Comprehensive Protection

---

## Win Conditions & Strategy

### Win Conditions

#### Immediate Victory

**Control All Infrastructure:** Compromise all 5 infrastructure cards
- Attacker achieves this by compromising all infrastructure
- Extremely rare but possible
- Game ends immediately

#### Turn Limit Victory

**After 15 Rounds (30 turns):** Player controlling the most infrastructure wins

**Control Calculation:**
- **Attacker Controls:** Compromised infrastructure
- **Defender Controls:** Secure, Shielded, or Fortified infrastructure
- **Contested:** Vulnerable infrastructure (neither player controls)

**Tiebreaker:**
- If infrastructure control is equal, **Defender wins**
- This balances Attacker's first-turn advantage

#### Abandonment

**Player Disconnect:** If a player disconnects for >20 seconds
- Opponent wins by abandonment
- Game records result with abandonment reason
- No rating changes for abandonment wins

### Victory Strategies

**Attacker Victory Paths**
1. **Aggressive Rush** - Quick exploits and attacks early game
2. **Resource Denial** - Disrupt Defender's AP and cards
3. **Critical Focus** - Target high-value infrastructure first
4. **Wildcard Dominance** - Use flexible cards for unpredictable plays

**Defender Victory Paths**
1. **Fortification Wall** - Build strong defenses early
2. **Reactive Defense** - Save reactions for key attacks
3. **Resource Advantage** - Leverage 3 AP per turn efficiently
4. **Recovery Focus** - Quickly restore compromised systems

### Game Balance

#### Asymmetric Balance

The game is intentionally asymmetric with different advantages:

**Attacker Advantages:**
- Goes first
- Initiates actions
- Can choose targets
- Surprise factor

**Defender Advantages:**
- More Action Points (3 vs 2)
- Larger deck (76 vs 70)
- Wins ties
- Reactive capabilities

#### Resource Management

Efficient AP usage is critical:
- **Don't waste AP** - Plan full turns
- **Save for reactions** - Keep 1-2 AP for defense
- **Wildcard timing** - Use 2 AP cards wisely
- **Card cycling** - Use free cycles strategically

#### Information Warfare

Managing hidden information:
- **Hand contents** - Hidden from opponent
- **Deck composition** - Predictable but uncertain
- **Bluffing** - Holding reactive cards as deterrents
- **Tempo** - Controlling game pace

---

### Quick Reference

#### Card Play Sequence
1. Select card from hand
2. Check AP cost and availability
3. Enter target mode
4. Select valid target (infrastructure)
5. Confirm action
6. Opponent reaction window (if applicable)
7. Resolve card effects
8. Update game state

#### Common Card Interactions

| Attacker Action | Defender Response | Result |
|-----------------|-------------------|--------|
| Exploit Secure Infrastructure | No response | Infrastructure becomes Vulnerable |
| Attack Vulnerable Infrastructure | Play Reaction card | Attack cancelled, infrastructure stays Vulnerable |
| Attack Vulnerable Infrastructure | No response | Infrastructure becomes Compromised |
| Play Counter-Attack on Shielded | Remove shield | Infrastructure returns to Secure or Vulnerable |
| - | Shield Secure Infrastructure | Infrastructure becomes Shielded |
| - | Fortify Shielded Infrastructure | Infrastructure becomes Fortified |
| - | Response Compromised Infrastructure | Infrastructure returns to Secure |

#### State Transition Table

| Current State | Attacker Cards | Defender Cards | Result State |
|---------------|----------------|----------------|--------------|
| Secure | Exploit | Shield | Vulnerable or Shielded |
| Vulnerable | Attack | Reaction | Compromised or stays Vulnerable |
| Vulnerable | - | Response | Secure |
| Compromised | - | Response | Secure |
| Shielded | Counter-Attack | Fortify | Secure or Fortified |
| Fortified | Counter-Attack (strong) | - | Shielded or Vulnerable |


---

## Additional Resources

- **Tutorial Scripts:** See [`darknet-duel-frontend/src/data/tutorialScripts.ts`](darknet-duel-frontend/src/data/tutorialScripts.ts)
- **Card Type Definitions:** See [`shared-types/card.types.ts`](shared-types/card.types.ts)
- **Game State Types:** See [`shared-types/game.types.ts`](shared-types/game.types.ts)
- **SRS Documentation:** See [`documentation/v3/DarknetDuel_SRS.md`](documentation/v3/DarknetDuel_SRS.md)

---

*Last Updated: 2025-10-21*
*Game Version: 2.0*
*Documentation Status: Complete*