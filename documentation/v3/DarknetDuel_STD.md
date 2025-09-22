# Software Test Definition (STD) – Darknet Duel

## 1. Introduction

### 1.1 System Overview

The Darknet Duel system is a cybersecurity-themed web-based card game that supports real-time multiplayer gameplay. The system consists of three main components:

- **Frontend Application**: React/TypeScript-based single-page application providing the user interface
- **Backend Server**: Node.js/Express REST API handling authentication, user management, store, and admin functions
- **Game Server**: boardgame.io-powered server managing real-time multiplayer game logic

The testing scope focuses on the frontend application as it is the primary interface through which testers will interact with the system. The frontend provides all user-facing functionality including authentication, lobby management, gameplay, store operations, and administrative tools.

### 1.2 Test Approach

This test plan follows a **manual testing approach** using black-box testing techniques. The testing strategy includes:

- **Functional Testing**: Verification that each module's transactions work as specified in the SRS
- **User Interface Testing**: Validation of UI components, navigation, and user experience
- **Integration Testing**: Testing the interaction between frontend and backend services
- **Boundary Value Analysis (BVA)**: Testing edge cases and boundary conditions
- **Equivalence Partitioning**: Testing representative values from different input classes
- **Error Handling Testing**: Verification of error messages and recovery mechanisms

**Test Management**: All test cases will be tracked using Trello boards, with each module having its own test case file for detailed tracking and documentation.

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|------------|
| STD | Software Test Definition – this document |
| SRS | Software Requirements Specification |
| SDD | Software Design Description |
| BVA | Boundary Value Analysis – testing technique focusing on boundary conditions |
| UI | User Interface |
| API | Application Programming Interface |
| JWT | JSON Web Token – authentication mechanism |
| WebSocket | Real-time communication protocol |
| E2E | End-to-End testing |
| Tester | Person executing the test cases |
| DUT | Device Under Test – the frontend application |
| Pass/Fail | Test result indicating whether the test case passed or failed |

## 2. Test Plan

### 2.1 Features to be Tested

The following modules and their transactions will be tested:

**Module 1: User Management and Authentication**
- Transaction 1.1: User Registration
- Transaction 1.2: User Login
- Transaction 1.3: Profile Management
- Transaction 1.4: Role-based Access

**Module 2: Lobby and Matchmaking**
- Transaction 2.1: Lobby Browser
- Transaction 2.2: Create/Join/Leave Lobbies
- Transaction 2.3: Real-Time Lobby Updates
- Transaction 2.4: Lobby Chat

**Module 3: Real-Time Multiplayer Game**
- Transaction 3.1: Game Creation and Initialization
- Transaction 3.2: Turn-Based Gameplay, AP Allocation, Card Play, and Targeting
- Transaction 3.3: Real-Time State Synchronization
- Transaction 3.4: Disconnection/Reconnection Handling
- Transaction 3.5: Game State Persistence and Recovery

**Module 4: Card System and Game Logic**
- Transaction 4.1: Card Play, Targeting, and Effect Resolution
- Transaction 4.2: Infrastructure State Tracking
- Transaction 4.3: Game Rules Enforcement
- Transaction 4.4: Game State Visualization

**Module 5: Game Statistics and Result Tracking**
- Transaction 5.1: Match Result Display
- Transaction 5.2: Player Performance Statistics
- Transaction 5.3: Match History Storage and Browsing

**Module 6: Store and Currency**
- Transaction 6.1: In-Game Currency Management
- Transaction 6.2: Store Browsing, Item Purchase, and Application of Decoration
- Transaction 6.3: Payment Integration

**Module 7: Admin and Moderation Tools**
- Transaction 7.1: User Search, Ban, and Moderation
- Transaction 7.2: Report Management
- Transaction 7.3: System Logs and Audit Trails
- Transaction 7.4: User Modification

**Module 8: First-Time Experience**
- Transaction 8.1: Lore Video Playback
- Transaction 8.2: Interactive Tutorial

### 2.2 Features not to be Tested

The following are explicitly out of scope for this testing phase:

- Backend server internal logic and database operations
- Game server internal game logic and state management
- Network infrastructure and server configuration
- Performance testing and load testing
- Security penetration testing (beyond basic input validation)
- Cross-browser compatibility testing
- Mobile device testing
- Third-party service integration testing (payment processing, external APIs)
- Code-level unit testing and integration testing
- Automated test script development

### 2.3 Testing Tools and Environment

**Testing Environment:**
- **Browser**: Chrome (latest stable version)
- **Operating System**: Windows 10/11
- **Screen Resolution**: 1920x1080 (minimum)
- **Network**: Stable internet connection
- **Test Data**: Pre-configured test accounts with different user roles

**Testing Tools:**
- **Trello**: Test case tracking and management
- **Browser Developer Tools**: For debugging and inspection
- **Screenshot Tool**: For capturing test evidence
- **Test Data Management**: Pre-created test accounts and game data

**Test Environment Setup:**
1. Access the Darknet Duel frontend application
2. Ensure backend and game servers are running
3. Clear browser cache and cookies before each test session
4. Use incognito/private browsing mode for clean test sessions

## 3. Test Cases

Detailed test cases for each module are documented in separate files:

- [Module 1 Test Cases](DarknetDuel_STD_Module1.md) - User Management and Authentication
- [Module 2 Test Cases](DarknetDuel_STD_Module2.md) - Lobby and Matchmaking
- [Module 3 Test Cases](DarknetDuel_STD_Module3.md) - Real-Time Multiplayer Game
- [Module 4 Test Cases](DarknetDuel_STD_Module4.md) - Card System and Game Logic
- [Module 5 Test Cases](DarknetDuel_STD_Module5.md) - Game Statistics and Result Tracking
- [Module 6 Test Cases](DarknetDuel_STD_Module6.md) - Store and Currency
- [Module 7 Test Cases](DarknetDuel_STD_Module7.md) - Admin and Moderation Tools
- [Module 8 Test Cases](DarknetDuel_STD_Module8.md) - First-Time Experience

Each test case file contains:
- Detailed step-by-step procedures
- Input specifications using BVA and equivalence partitioning
- Expected outputs and pass/fail criteria
- Test data requirements
- Screenshot capture points

## Appendix

### A.1 Test Logs

Test execution logs will be maintained in Trello cards for each test case, including:
- Test execution date and time
- Tester name
- Test environment details
- Actual results vs expected results
- Screenshots and evidence
- Issues and observations

### A.2 Test Results

Overall test results will be summarized in a master Trello board showing:
- Total test cases executed
- Pass/fail statistics
- Critical issues found
- Test coverage analysis
- Recommendations for fixes

### A.3 Incident Report

Any defects or issues found during testing will be documented in Trello with:
- Issue description and severity
- Steps to reproduce
- Expected vs actual behavior
- Screenshots and evidence
- Priority for fixing
- Status tracking

